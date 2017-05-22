/* @flow */
var assert = require("assert");
var control = require("../throw_return_control.js");
var List = require("immutable").List;

var flowListToStrings = (flowList) => (
  flowList.map(r =>
    r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
  )
);

/**
 * This should be able to analyse more complicated control flow patterns:
 *  - exceptions being thrown in a TryStatement
 *  - Return statements in a function
 *  - Throw statements in a function
 */
describe("throw/return control flow analysis", function() {

  it("should return flows for return in function block");

  it("should return flows for throw in function block");

  it("should return flows for try block");

});
