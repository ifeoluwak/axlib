type Config = {
    "objectType": 'interface' | 'type';
    "typePath": string;
    "apiPath": string;
};

export const getConfig = (): Config => {
    const path_dir = process.cwd() + '/package.json';
    const pjson = require(path_dir);
    let axlib = pjson?.axlib || {};
    axlib.objectType = axlib.objectType || 'interface';
    axlib.typePath = axlib.typePath || 'types';
    axlib.apiPath = axlib.apiPath || 'api';
    return axlib;
};