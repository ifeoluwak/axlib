import { Project, SyntaxKind } from 'ts-morph';
import { makeType } from './makeTypes';
import { getConfig } from './getConfig';
import path from 'node:path';

type FunctionType<T> = () => Promise<{ data: T }>;

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
  const sourceFiles = project.getSourceFiles(`${config.apiPath}/*.ts`);
  return async () => {
    const typeName = fn.name;
    console.log('I am here', typeName);

    const bodys = await fn();
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
        const cwd = path.relative(
          `${config.apiPath}/${typeName}.ts`,
          `${config.typePath}/${typeName}.ts`
        );
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
                            moduleSpecifier: `${config.apiPath}/${typeName}`,
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
  };
};
