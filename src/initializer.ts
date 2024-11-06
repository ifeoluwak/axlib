import { generateType } from './generateType.js';
import { getConfig } from './getConfig.js';

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

// @ts-ignore
const handleData = (data: any, typeName: string) => {
  const { Project, SyntaxKind } = require('ts-morph');

  const project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });

    const config = getConfig();
  
  project.getSourceFile(`${config.apiPath}`);
  const directory = project.createDirectory(`${config.typePath}`);
  project.saveSync();
  console.log('Directory', directory, config);
  
  const sourceFiles = project.getSourceFiles(`${config.apiPath}/*.ts`);

    if (data) {
        // check if type file exists
        const thisTypeSourceFile = project.getSourceFile(
          `${config.apiPath}/${typeName}.ts`
        );
        // only generate type file if it does not exist, so that we don't
        // make unnecessary multiple changes to the file
        if (!thisTypeSourceFile) {
          // generate type file
          generateType(`${typeName}.ts`, data, `${typeName}`);
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
          // @ts-ignore
          sourceFiles.forEach(sourceFile => {
            if (sourceFile.getImportDeclaration('../typed')) {
              console.log(sourceFile.getBaseName());
              const text = sourceFile.getText();
              if (text.includes('typedApiWrapper') && text.includes(typeName)) {
                const fnDefinition = sourceFile.getDescendantsOfKind(
                  SyntaxKind.ObjectLiteralExpression
                );
                // @ts-ignore
                fnDefinition.forEach(fnDef => {
                  const prop = fnDef.getProperty(typeName);
                  console.log('Prop', prop?.getText());
                  if (prop) {
                    const pp = prop.getDescendantsOfKind(
                      SyntaxKind.CallExpression
                    );
                    // @ts-ignore
                    pp.forEach(p => {
                      p.getDescendantsOfKind(SyntaxKind.Identifier).forEach(
                        // @ts-ignore
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
}

// @ts-ignore
export const initialise = async () => {
  console.log('Initialising... express app');
      const express = require('express')
      const bodyParser = require('body-parser')
      const cors = require('cors');
      const app = express()
      const port = 4000
  
      app.use(cors({
          origin: 'http://localhost:3000'
      })); 
      app.use(bodyParser.json())
      app.use(function(_, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });

      app.options('*', cors()) // include before other routes
  
      app.post('/', (req: any, res: any) => {
          // get request data
          console.log('Inside express', Object.keys(req.body));
      //   console.log('I am here', { req, res });
          // ExerciseApi.getExercises();
          // handleData(req.body, typeName);
          res.send('Hello World!')
      })
  
      app.listen(port, () => {
          console.log(`Example app listening on port ${port}`)
      })
};