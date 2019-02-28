#!/usr/bin/env node

// Transpile or run directly with "npm run example" (se package.json)

import fs from 'fs';
import log from "../src/log";
import config from "../src/config";
import Parser from "../src/parser";

const parser = new Parser(fs.readFileSync(__dirname + '/site.html').toString());
const conf = config.get(__dirname + '/site.js');
log.info(parser.data(conf.rules.foobar));
