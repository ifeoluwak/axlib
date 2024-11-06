#!/usr/bin/env node

import yargs from 'yargs'
import { initialise } from "./initializer.js";

const argv = yargs(process.argv.slice(2)).parse()

console.log({argv});

if (argv.init) {
  console.log('got here... express app');
  initialise();
}