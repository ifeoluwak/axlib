#!/usr/bin/env node

import { initialise } from "./initializer.js";

var argv = require('yargs/yargs')(process.argv.slice(2)).parse();


console.log({argv});

if (argv.init) {
  initialise();
}