#!/usr/bin/env node

import { initialise } from "./initializer.js";
import { yargs } from "yargs";

var argv = yargs(process.argv.slice(2)).parse();

console.log({argv});

if (argv.init) {
  initialise();
}