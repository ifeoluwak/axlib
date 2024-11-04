"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typedApi = exports.typedApiWrapper = void 0;
const typedApiWrapper = (obj) => {
    let newObj = {};
    for (const key in obj) {
        // @ts-ignore
        newObj[key] = (0, exports.typedApi)(obj[key]);
    }
    return newObj;
};
exports.typedApiWrapper = typedApiWrapper;
// export const old_typedApi = <T>(fn: FunctionType<T>) => {
//     const config = getConfig();
//     project.getSourceFile(`${config.apiPath}`);
//     const directory = project.createDirectory(`${config.typePath}`);
//     project.saveSync();
//     console.log('Directory', directory, config);
//   const sourceFiles = project.getSourceFiles(`${config.apiPath}/*.ts`);
//   console.log('SourceFiles', sourceFiles);
//   return async (args: any) => {
//     const typeName = fn.name;
//     console.log('I am here', typeName, args);
//     try {
//       const bodys = await fn(args);
//       if (bodys?.data) {
//         // check if type file exists
//         const thisTypeSourceFile = project.getSourceFile(
//           `${config.apiPath}/${typeName}.ts`
//         );
//         // only generate type file if it does not exist, so that we don't
//         // make unnecessary multiple changes to the file
//         if (!thisTypeSourceFile) {
//           // generate type file
//           makeType(`${typeName}.ts`, bodys?.data, `${typeName}`);
//           // get the current working directory
//           let cwd = relative(
//             `${config.apiPath}/${typeName}.ts`,
//             `${config.typePath}/${typeName}.ts`
//           );
//           // remove the .ts extension
//           cwd = cwd.replace('.ts', '');
//           console.log('CWD', cwd);
//           // add import to index.ts
//           // add type to function
//           sourceFiles.forEach(sourceFile => {
//             if (sourceFile.getImportDeclaration('../typed')) {
//               console.log(sourceFile.getBaseName());
//               const text = sourceFile.getText();
//               if (text.includes('typedApiWrapper') && text.includes(fn.name)) {
//                 const fnDefinition = sourceFile.getDescendantsOfKind(
//                   SyntaxKind.ObjectLiteralExpression
//                 );
//                 fnDefinition.forEach(fnDef => {
//                   const prop = fnDef.getProperty(fn.name);
//                   console.log('Prop', prop?.getText());
//                   if (prop) {
//                     const pp = prop.getDescendantsOfKind(
//                       SyntaxKind.CallExpression
//                     );
//                     pp.forEach(p => {
//                       p.getDescendantsOfKind(SyntaxKind.Identifier).forEach(
//                         id => {
//                           const idt = id.getText();
//                           if (
//                             ['get', 'post', 'put', 'delete', 'patch'].includes(
//                               idt
//                             )
//                           ) {
//                             p.setExpression(
//                               `${p
//                                 .getExpression()
//                                 .getText()
//                                 .replace(idt, `${idt}<{ data: ${typeName} }>`)}`
//                             );
//                             sourceFile.addImportDeclaration({
//                               moduleSpecifier: `${cwd}`,
//                               namedImports: [typeName],
//                             });
//                             // sourceFile.saveSync();
//                           }
//                         }
//                       );
//                     });
//                     sourceFile.saveSync();
//                   }
//                 });
//               }
//             }
//           });
//         }
//       }
//       return bodys;
//     } catch (error) {
//       return error;
//     }
//   };
// };
const typedApi = (fn) => {
    // @ts-ignore
    return async (args) => {
        const typeName = fn.name;
        console.log('I am here \n\n\n\n\n\n\n\n\n\n\n', typeName, args);
        try {
            const bodys = await fn(args);
            if (bodys?.data) {
                setTimeout(() => {
                    fetch(`http://localhost:4000/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: typeName,
                            data: bodys.data,
                        }),
                    });
                }, 1000);
            }
            return bodys;
        }
        catch (error) {
            console.log('\n\n\nError\n\n\n\n', error);
            return error;
        }
    };
};
exports.typedApi = typedApi;
//# sourceMappingURL=index.js.map