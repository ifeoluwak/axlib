import { Project, SyntaxKind } from 'ts-morph';
import { makeType } from './makeTypes';
import { getConfig } from './getConfig';
// import path from 'node:path';

function relative(from: string, to: string) {
  if (!from || !to)
    throw new Error('Invalid or empty paths');
  if (from.startsWith('/') !== to.startsWith('/'))
    throw new Error('Mixed absolute and relative paths');
  let path = '';
  // make from point to the folder we're starting from
  // (only relevant if the path does not end in a slash)
  let current = from.substr(0, from.lastIndexOf('/') + 1);
  // If target is same as current directory...
  if (current === to) return './';
  while (!to.startsWith(current)) {
    const index = current.lastIndexOf('/', current.length - 2);
    if (index !== -1) path += '../';
    current = current.substr(0, index + 1);
    continue;
  }

  path += to.substr(current.length);
  return path;
}

type FunctionType<T> = (...args: any[]) => Promise<{ data: T }>;

type ObjectType<T> = {
  [key in keyof T]: FunctionType<T[key]>;
};

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

export const typedApiWrapper = <T>(obj: ObjectType<T>) => {
  let newObj: ObjectType<T> = {} as ObjectType<T>;
  for (const key in obj) {
    newObj[key] = typedApi(obj[key]);
  }
  return newObj;
};

export const typedApi = <T>(fn: FunctionType<T>) => {
  const config = getConfig();

    project.getSourceFile(`${config.apiPath}`);
    const directory = project.createDirectory(`${config.typePath}`);
    project.saveSync();
    console.log('Directory', directory);

  const sourceFiles = project.getSourceFiles(`${config.apiPath}/*.ts`);

  return async (args: Parameters<any>) => {
    const typeName = fn.name;
    console.log('I am here', typeName, args);

    try {
      const bodys = await fn(args);
      if (bodys?.data) {
        // check if type file exists
        const thisTypeSourceFile = project.getSourceFile(
          `${config.apiPath}/${typeName}.ts`
        );
        // only generate type file if it does not exist, so that we don't
        // make unnecessary multiple changes to the file
        if (!thisTypeSourceFile) {
          // generate type file
          makeType(`${typeName}.ts`, bodys?.data, `${typeName}`);
          // get the current working directory
          let cwd = relative(
            `${config.apiPath}/${typeName}.ts`,
            `${config.typePath}/${typeName}.ts`
          );
          // remove the .ts extension
          cwd = cwd.replace('.ts', '');
          console.log('CWD', cwd);

          // add import to index.ts
          // add type to function
          sourceFiles.forEach(sourceFile => {
            if (sourceFile.getImportDeclaration('../typed')) {
              console.log(sourceFile.getBaseName());
              const text = sourceFile.getText();
              if (text.includes('typedApiWrapper') && text.includes(fn.name)) {
                const fnDefinition = sourceFile.getDescendantsOfKind(
                  SyntaxKind.ObjectLiteralExpression
                );
                fnDefinition.forEach(fnDef => {
                  const prop = fnDef.getProperty(fn.name);
                  console.log('Prop', prop?.getText());
                  if (prop) {
                    const pp = prop.getDescendantsOfKind(
                      SyntaxKind.CallExpression
                    );
                    pp.forEach(p => {
                      p.getDescendantsOfKind(SyntaxKind.Identifier).forEach(
                        id => {
                          const idt = id.getText();
                          if (
                            ['get', 'post', 'put', 'delete', 'patch'].includes(
                              idt
                            )
                          ) {
                            p.setExpression(
                              `${p
                                .getExpression()
                                .getText()
                                .replace(idt, `${idt}<{ data: ${typeName} }>`)}`
                            );
                            sourceFile.addImportDeclaration({
                              moduleSpecifier: `${cwd}`,
                              namedImports: [typeName],
                            });
                            // sourceFile.saveSync();
                          }
                        }
                      );
                    });
                    sourceFile.saveSync();
                  }
                });
              }
            }
          });
        }
      }

      return bodys;
    } catch (error) {
      return error;
    }
  };
};
