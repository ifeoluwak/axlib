import { __awaiter, __generator } from "tslib";
// ignore ts error
// @ts-ignore
import { generateType } from './generateType.js';
import { getConfig } from './getConfig.js';
function relative(from, to) {
    if (!from || !to)
        throw new Error('Invalid or empty paths');
    if (from.startsWith('/') !== to.startsWith('/'))
        throw new Error('Mixed absolute and relative paths');
    var path = '';
    // make from point to the folder we're starting from
    // (only relevant if the path does not end in a slash)
    var current = from.substr(0, from.lastIndexOf('/') + 1);
    // If target is same as current directory...
    if (current === to)
        return './';
    while (!to.startsWith(current)) {
        var index = current.lastIndexOf('/', current.length - 2);
        if (index !== -1)
            path += '../';
        current = current.substr(0, index + 1);
        continue;
    }
    path += to.substr(current.length);
    return path;
}
// @ts-ignore
var handleData = function (data, typeName) {
    var _a = require('ts-morph'), Project = _a.Project, SyntaxKind = _a.SyntaxKind;
    var project = new Project({
        tsConfigFilePath: 'tsconfig.json',
    });
    var config = getConfig();
    project.getSourceFile("".concat(config.apiPath));
    var directory = project.createDirectory("".concat(config.typePath));
    project.saveSync();
    console.log('Directory', directory, config);
    var sourceFiles = project.getSourceFiles("".concat(config.apiPath, "/*.ts"));
    if (data) {
        // check if type file exists
        var thisTypeSourceFile = project.getSourceFile("".concat(config.apiPath, "/").concat(typeName, ".ts"));
        // only generate type file if it does not exist, so that we don't
        // make unnecessary multiple changes to the file
        if (!thisTypeSourceFile) {
            // generate type file
            generateType("".concat(typeName, ".ts"), data, "".concat(typeName));
            // get the current working directory
            var cwd_1 = relative("".concat(config.apiPath, "/").concat(typeName, ".ts"), "".concat(config.typePath, "/").concat(typeName, ".ts"));
            // remove the .ts extension
            cwd_1 = cwd_1.replace('.ts', '');
            console.log('CWD', cwd_1);
            // add import to index.ts
            // add type to function
            // @ts-ignore
            sourceFiles.forEach(function (sourceFile) {
                if (sourceFile.getImportDeclaration('../typed')) {
                    console.log(sourceFile.getBaseName());
                    var text = sourceFile.getText();
                    if (text.includes('typedApiWrapper') && text.includes(typeName)) {
                        var fnDefinition = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
                        // @ts-ignore
                        fnDefinition.forEach(function (fnDef) {
                            var prop = fnDef.getProperty(typeName);
                            console.log('Prop', prop === null || prop === void 0 ? void 0 : prop.getText());
                            if (prop) {
                                var pp = prop.getDescendantsOfKind(SyntaxKind.CallExpression);
                                // @ts-ignore
                                pp.forEach(function (p) {
                                    p.getDescendantsOfKind(SyntaxKind.Identifier).forEach(
                                    // @ts-ignore
                                    function (id) {
                                        var idt = id.getText();
                                        if (['get', 'post', 'put', 'delete', 'patch'].includes(idt)) {
                                            p.setExpression("".concat(p
                                                .getExpression()
                                                .getText()
                                                .replace(idt, "".concat(idt, "<{ data: ").concat(typeName, " }>"))));
                                            sourceFile.addImportDeclaration({
                                                moduleSpecifier: "".concat(cwd_1),
                                                namedImports: [typeName],
                                            });
                                            // sourceFile.saveSync();
                                        }
                                    });
                                });
                                sourceFile.saveSync();
                            }
                        });
                    }
                }
            });
        }
    }
};
// @ts-ignore
export var initialise = function () { return __awaiter(void 0, void 0, void 0, function () {
    var express, bodyParser, app, port_1;
    return __generator(this, function (_a) {
        console.log('Initialising... express app');
        if (process.env.NODE_ENV === 'development') {
            express = require('express');
            bodyParser = require('body-parser');
            app = express();
            port_1 = 3000;
            app.use(bodyParser.json());
            app.post('/', function (req, res) {
                // get request data
                console.log('Inside express', req.body, req.params, req);
                //   console.log('I am here', { req, res });
                // ExerciseApi.getExercises();
                // handleData(req.body, typeName);
                res.send('Hello World!');
            });
            app.listen(port_1, function () {
                console.log("Example app listening on port ".concat(port_1));
            });
        }
        return [2 /*return*/];
    });
}); };
//# sourceMappingURL=initializer.js.map