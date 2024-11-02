import { NopWriter, StreamWriter, Emitter } from 'maketypes';
import { getConfig } from './getConfig';

export const makeType = async (
  newTypeFile: string,
  data: unknown,
  typeName: string
) => {
  let interfaceWriter = new NopWriter();
  let proxyWriter = interfaceWriter;

  // get package.json
  const config = getConfig();
  const path = config.typePath;

  if (newTypeFile) {
    const fs = require('fs');
    const filePath = `./${path}/${newTypeFile}`;
    interfaceWriter = new StreamWriter(fs.createWriteStream(filePath));
  } else {
    return;
  }

  const e = new Emitter(interfaceWriter, proxyWriter, config?.objectType);
  e.emit(data, typeName);
};
