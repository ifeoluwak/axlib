import { NopWriter, StreamWriter, Emitter } from 'maketypes';
import * as fs from 'fs';
import { getConfig } from './getConfig';

export const makeType = async (newTypeFile: string, data: unknown, typeName: string) => {
    let interfaceWriter = new NopWriter();
    let proxyWriter = interfaceWriter;

    // get package.json
    const config = getConfig();
    const path = config.typePath


    try {
        // check if directory exists
        fs.accessSync(path, fs.constants.F_OK);
    } catch (error) {
        // create directory if it does not exist
        const dir = fs.mkdirSync(path, { recursive: true });
        if (!dir) {
            return
        }
    }

    if (newTypeFile) {
        const filePath = `./${path}/${newTypeFile}`;
        interfaceWriter = new StreamWriter(fs.createWriteStream(filePath));
    } else {
        return
    }

    const e = new Emitter(interfaceWriter, proxyWriter, config?.objectType);
    e.emit(data, typeName);
}

