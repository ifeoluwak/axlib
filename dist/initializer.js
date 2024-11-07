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
const handleDataWrapper = () => {
    let isRunning = false;
    const pendingData = new Map();
    const project = new Project({
        tsConfigFilePath: 'tsconfig.json',
    });
    console.log("Initialising handleDataWrapper", pendingData, isRunning);
    // @ts-ignore
    const handleData = (data, typeName) => {
        if (isRunning) {
            console.log('Data is pending ---->', typeName);
            pendingData.set(typeName, data);
            return;
        }
        ;
        isRunning = true;
        console.log('Currently running ----->', typeName);
        const config = getConfig();
        project.getSourceFile(`${config.apiPath}`);
        const directory = project.createDirectory(`${config.typePath}`);
        // project.saveSync();
        console.log('Directory', directory, config);
        const sourceFiles = project.getSourceFiles(`${config.apiPath}/*.ts`);
        if (data) {
            // check if type file exists
            const thisTypeSourceFile = project.getSourceFile(`${config.apiPath}/${typeName}.ts`);
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
                // project.save().catch(e => {
                //   console.log('Error saving file', e);
                // });
            }
        }
        isRunning = false;
        if (pendingData.size) {
            const [typeName, data] = pendingData.entries().next().value;
            pendingData.delete(typeName);
            handleData(data, typeName);
        }
        else {
            console.log('No more pending data');
            // all pending data has been handled
            project.save().catch(e => {
                console.log('Error saving file', e);
            });
        }
    };
    return (data, typeName) => handleData(data, typeName);
};
// @ts-ignore
export const initialise = async () => {
    console.log('Initialising... express app');
    // const express = require('express')
    // const bodyParser = require('body-parser')
    // const cors = require('cors');
    const app = express();
    const port = 4000;
    const handler = handleDataWrapper();
    app.use(cors({
        origin: 'http://localhost:3000'
    }));
    app.use(bodyParser.json());
    app.use(function (_, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.options('*', cors()); // include before other routes
    app.post('/', (req, res) => {
        // get request data
        console.log('Inside express', Object.keys(req.body));
        //   console.log('I am here', { req, res });
        // ExerciseApi.getExercises();
        if (req.body.type && req.body.data) {
            handler(req.body.data, req.body.type);
            // handleData(req.body.data, req.body.type);
        }
        res.send(true);
    });
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};
