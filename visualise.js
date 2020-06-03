#!/usr/bin/env node

var analyse = require("./");
var acorn = require("acorn");
var fs = require("fs");
var visualiserCore = require("./visualiserCore");

var input = fs.readFileSync(process.argv[2]).toString();

try {
  var ast = acorn.parse(input, {
    ecmaVersion: 5,
    locations: true
  });

  console.log(visualiserCore(analyse(ast), input));
} catch(e) {
  console.error("Input is not a valid ECMAScript v5 file");
  throw e;
}
