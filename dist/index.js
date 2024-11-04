import { __awaiter, __generator } from "tslib";
export var typedApiWrapper = function (obj) {
    var newObj = {};
    for (var key in obj) {
        // @ts-ignore
        newObj[key] = typedApi(obj[key]);
    }
    return newObj;
};
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
export var typedApi = function (fn) {
    // @ts-ignore
    return function (args) { return __awaiter(void 0, void 0, void 0, function () {
        var typeName, bodys_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    typeName = fn.name;
                    console.log('I am here \n\n\n\n\n\n\n\n\n\n\n', typeName, args);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fn(args)];
                case 2:
                    bodys_1 = _a.sent();
                    if (bodys_1 === null || bodys_1 === void 0 ? void 0 : bodys_1.data) {
                        setTimeout(function () {
                            fetch("http://localhost:4000/", {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(bodys_1.data),
                            });
                        }, 1000);
                    }
                    return [2 /*return*/, bodys_1];
                case 3:
                    error_1 = _a.sent();
                    console.log('\n\n\nError\n\n\n\n', error_1);
                    return [2 /*return*/, error_1];
                case 4: return [2 /*return*/];
            }
        });
    }); };
};
//# sourceMappingURL=index.js.map