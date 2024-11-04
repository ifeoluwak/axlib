"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const getConfig = () => {
    const path_dir = process.cwd() + '/package.json';
    const pjson = require(path_dir);
    let axlib = pjson?.axlib || {};
    axlib.objectType = axlib.objectType || 'interface';
    axlib.typePath = axlib.typePath || 'types';
    axlib.apiPath = axlib.apiPath || 'api';
    return axlib;
};
exports.getConfig = getConfig;
//# sourceMappingURL=getConfig.js.map