"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateType = void 0;
const tslib_1 = require("tslib");
const maketypes_1 = require("maketypes");
const fs = tslib_1.__importStar(require("fs"));
const getConfig_js_1 = require("./getConfig.js");
const generateType = (newTypeFile, data, typeName) => {
    let interfaceWriter = new maketypes_1.NopWriter();
    let proxyWriter = interfaceWriter;
    // get package.json
    const config = (0, getConfig_js_1.getConfig)();
    const path = config.typePath;
    if (newTypeFile) {
        const filePath = `./${path}/${newTypeFile}`;
        interfaceWriter = new maketypes_1.StreamWriter(fs.createWriteStream(filePath));
    }
    else {
        return;
    }
    const e = new maketypes_1.Emitter(interfaceWriter, proxyWriter, config?.objectType);
    e.emit(data, typeName);
};
exports.generateType = generateType;
//# sourceMappingURL=generateType.js.map