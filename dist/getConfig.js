export var getConfig = function () {
    var path_dir = process.cwd() + '/package.json';
    var pjson = require(path_dir);
    var axlib = (pjson === null || pjson === void 0 ? void 0 : pjson.axlib) || {};
    axlib.objectType = axlib.objectType || 'interface';
    axlib.typePath = axlib.typePath || 'types';
    axlib.apiPath = axlib.apiPath || 'api';
    return axlib;
};
//# sourceMappingURL=getConfig.js.map