import { generateType } from './generateType.js';
import { getConfig } from './getConfig.js';
import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import { Project, SyntaxKind } from 'ts-morph';
import camelcase from 'camelcase';
import throttle from 'throttleit';
import chalk from 'chalk';
import ora from 'ora';
const greenLog = chalk.green;
const spinner = ora({
    text: 'Loading',
});
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
    config;
    constructor() {
        this.isRunning = false;
        this.pendingData = new Map();
        this.project = new Project({
            tsConfigFilePath: 'tsconfig.json',
        });
        this.config = getConfig();
        console.log(chalk.green("Type Generation Service Started"));
    }
    // @ts-ignore
    handleData(data, typeName) {
        const project = new Project({
            tsConfigFilePath: 'tsconfig.json',
        });
        this.isRunning = true;
        // console.log('Currently running ----->', typeName, this.isRunning, Date());
        project.getDirectoryOrThrow(`${this.config.apiPath}`);
        project.getDirectoryOrThrow(`${this.config.typePath}`);
        const sourceFiles = project.getSourceFiles(`${this.config.apiPath}/*.ts`);
        if (data) {
            spinner.start(`Generating ${this.config.objectType} for ${typeName}`);
            // check if type file exists
            const thisTypeSourceFile = project.getSourceFile(`${this.config.typePath}/${typeName}.ts`);
            // only generate type file if it does not exist, so that we don't
            // make unnecessary multiple changes to the file
            if (!thisTypeSourceFile) {
                // console.log('file does not exisit - -- - - - >', thisTypeSourceFile);
                const formattedName = camelcase(typeName, { pascalCase: true });
                // generate type file
                generateType(`${typeName}.ts`, data, `${formattedName}`);
                spinner.succeed(greenLog(`${formattedName} type generated. `) + chalk.dim.underline(`See -> ${this.config.typePath}/${typeName}.ts`));
                spinner.start(`Adding ${this.config.objectType} to ${typeName} in ${this.config.apiPath}/${typeName}.ts`);
                // get the current working directory
                let cwd = relative(`${this.config.apiPath}/${typeName}.ts`, `${this.config.typePath}/${typeName}.ts`);
                // remove the .ts extension
                cwd = cwd.replace('.ts', '');
                // add import to index.ts
                // add type to function
                // @ts-ignore
                sourceFiles.forEach(sourceFile => {
                    if (sourceFile.getImportDeclaration('axlib')) {
                        // console.log(sourceFile.getBaseName());
                        const text = sourceFile.getText();
                        if (text.includes('typedApiWrapper') && text.includes(typeName)) {
                            const fnDefinition = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
                            // @ts-ignore
                            fnDefinition.forEach(fnDef => {
                                const prop = fnDef.getProperty(typeName);
                                // console.log('Prop', prop?.getText());
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
                                                    spinner.succeed(greenLog(`Type added to ${typeName} in -> `) + chalk.dim.underline(`${this.config.apiPath}/${typeName}.ts\n`));
                                                    sourceFile.saveSync();
                                                }
                                                else if (idt === 'fetch') {
                                                    if (prop.isKind(SyntaxKind.MethodDeclaration)) {
                                                        prop.setReturnType(`Promise<{ data: ${formattedName} }>`);
                                                    }
                                                    else {
                                                        prop.getDescendantsOfKind(SyntaxKind.ArrowFunction).forEach(z => {
                                                            z.setReturnType(`Promise<{ data: ${formattedName} }>`);
                                                        });
                                                    }
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
        spinner.stop();
        this.isRunning = false;
    }
}
;
// @ts-ignore
export const initialise = async () => {
    // console.log('Initialising... express app');;
    const app = express();
    const port = 4000;
    const handler = new HandleDataWrapper();
    const throttled = throttle((d, t) => handler.handleData(d, t), 1500);
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
        // console.log('Inside express', Object.keys(req.body));
        if (req.body.type && req.body.data) {
            throttled(req.body.data, req.body.type);
        }
        res.send(true);
    });
    app.listen(port, () => {
        // console.log(`Example app listening on port ${port}`)
    });
};
