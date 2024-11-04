var _a = require('maketypes'), NopWriter = _a.NopWriter, StreamWriter = _a.StreamWriter, Emitter = _a.Emitter;
import * as fs from 'fs';
import { getConfig } from './getConfig';
export var generateType = function (newTypeFile, data, typeName) {
    var interfaceWriter = new NopWriter();
    var proxyWriter = interfaceWriter;
    // get package.json
    var config = getConfig();
    var path = config.typePath;
    if (newTypeFile) {
        var filePath = "./".concat(path, "/").concat(newTypeFile);
        interfaceWriter = new StreamWriter(fs.createWriteStream(filePath));
    }
    else {
        return;
    }
    var e = new Emitter(interfaceWriter, proxyWriter, config === null || config === void 0 ? void 0 : config.objectType);
    e.emit(data, typeName);
};
//# sourceMappingURL=generateType.js.map