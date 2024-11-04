#!/usr/bin/env node

import { initialise } from "./initializer.js";
import { yargs } from "yargs";

const argv = yargs.usage('Usage: $0 [options] inputFile rootName')
  .alias('i', 'interface-file')
  .string('i')
  .describe('i', 'Specify output file for interfaces')
  .args

console.log({argv});

if (argv.init) {
  initialise();
}