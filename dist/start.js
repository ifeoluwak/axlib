#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initializer_js_1 = require("./initializer.js");
var argv = require('yargs/yargs')(process.argv.slice(2)).parse();
console.log({ argv });
if (argv.init) {
    console.log('got here... express app');
    (0, initializer_js_1.initialise)();
}
//# sourceMappingURL=start.js.map