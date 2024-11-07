import { generateType } from './generateType.js';
import { getConfig } from './getConfig.js';
import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import { Project, SyntaxKind } from 'ts-morph';
import camelcase from 'camelcase';
function relative(from, to) {
    if (!from || !to)
        throw new Error('Invalid or empty paths');
    if (from.startsWith('/') !== to.startsWith('/'))
        throw new Error('Mixed absolute and relative paths');
    let path = '';
    // make from point to the folder we're starting from
    // (only relevant if the path does not end in a slash)
    let current = from.substr(0, from.lastIndexOf('/') + 1);
    // If target is same as current directory...
    if (current === to)
        return './';
    while (!to.startsWith(current)) {
        const index = current.lastIndexOf('/', current.length - 2);
        if (index !== -1)
            path += '../';
        current = current.substr(0, index + 1);
        continue;
    }
    path += to.substr(current.length);
    return path;
}
class HandleDataWrapper {
    isRunning;
    pendingData;
    project;
    constructor() {
        this.isRunning = false;
        this.pendingData = new Map();
        this.project = new Project({
            tsConfigFilePath: 'tsconfig.json',
        });
        console.log("Initialising handleDataWrapper", this.pendingData, this.isRunning);
    }
    // @ts-ignore
    handleData(data, typeName) {
        if (this.isRunning) {
            console.log('Data is pending ---->', typeName);
            this.pendingData.set(typeName, data);
            return;
        }
        ;
        this.isRunning = true;
        console.log('Currently running ----->', typeName);
        const config = getConfig();
        this.project.getSourceFile(`${config.apiPath}`);
        const directory = this.project.createDirectory(`${config.typePath}`);
        // project.saveSync();
        console.log('Directory', directory, config);
        const sourceFiles = this.project.getSourceFiles(`${config.apiPath}/*.ts`);
        if (data) {
            // check if type file exists
            const thisTypeSourceFile = this.project.getSourceFile(`${config.apiPath}/${typeName}.ts`);
            console.log('ThisTypeSourceFile', thisTypeSourceFile);
            // only generate type file if it does not exist, so that we don't
            // make unnecessary multiple changes to the file
            if (!thisTypeSourceFile) {
                const formattedName = camelcase(typeName, { pascalCase: true });
                // generate type file
                generateType(`${typeName}.ts`, data, `${formattedName}`);
                // get the current working directory
                let cwd = relative(`${config.apiPath}/${typeName}.ts`, `${config.typePath}/${typeName}.ts`);
                // remove the .ts extension
                cwd = cwd.replace('.ts', '');
                console.log('CWD', cwd);
                // add import to index.ts
                // add type to function
                // @ts-ignore
                sourceFiles.forEach(sourceFile => {
                    if (sourceFile.getImportDeclaration('axlib')) {
                        console.log(sourceFile.getBaseName());
                        const text = sourceFile.getText();
                        if (text.includes('typedApiWrapper') && text.includes(typeName)) {
                            const fnDefinition = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
                            // @ts-ignore
                            fnDefinition.forEach(fnDef => {
                                const prop = fnDef.getProperty(typeName);
                                console.log('Prop', prop?.getText());
                                if (prop) {
                                    const pp = prop.getDescendantsOfKind(SyntaxKind.CallExpression);
                                    if (pp.length) {
                                        // @ts-ignore
                                        pp.forEach(p => {
                                            p.getDescendantsOfKind(SyntaxKind.Identifier).forEach(
                                            // @ts-ignore
                                            id => {
                                                const idt = id.getText();
                                                if (['get', 'post', 'put', 'delete', 'patch'].includes(idt)) {
                                                    p.setExpression(`${p
                                                        .getExpression()
                                                        .getText()
                                                        .replace(idt, `${idt}<{ data: ${formattedName} }>`)}`);
                                                    sourceFile.addImportDeclaration({
                                                        moduleSpecifier: `${cwd}`,
                                                        namedImports: [formattedName],
                                                    });
                                                    // sourceFile.saveSync();
                                                }
                                            });
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
        this.isRunning = false;
        if (this.pendingData.size) {
            const [typeName, data] = this.pendingData.entries().next().value;
            this.pendingData.delete(typeName);
            this.handleData(data, typeName);
        }
        else {
            console.log('No more pending data');
            // all pending data has been handled
            this.project.saveSync();
        }
    }
    ;
}
;
// @ts-ignore
export const initialise = async () => {
    console.log('Initialising... express app');
    ;
    const app = express();
    const port = 4000;
    const handler = new HandleDataWrapper();
    app.use(cors({
        origin: 'http://localhost:3000'
    }));
    app.use(bodyParser.json());
    app.use(function (_, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.options('*', cors());
    app.post('/', (req, res) => {
        console.log('Inside express', Object.keys(req.body));
        if (req.body.type && req.body.data) {
            handler.handleData(req.body.data, req.body.type);
        }
        res.send(true);
    });
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};
