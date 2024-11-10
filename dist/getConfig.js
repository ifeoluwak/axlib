import * as fs from 'fs';
export const getConfig = () => {
    // Read the content of package.json
    const packageJsonContent = fs.readFileSync('./package.json', 'utf8');
    // Parse the JSON data
    const pjson = JSON.parse(packageJsonContent);
    let axlib = pjson?.axlib || {};
    axlib.objectType = axlib.objectType || 'interface';
    axlib.typePath = axlib.typePath || 'src/types';
    axlib.apiPath = axlib.apiPath || 'src/api';
    axlib.fetchType = axlib.fetchType || 'fetch';
    return axlib;
};
