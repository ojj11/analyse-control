/* @flow */
var assert = require("assert");
var control = require("../complex_control.js");
var List = require("immutable").List;

var flowListToStrings = (flowList) => (
  flowList.map(r =>
    r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
  )
);

/**
 * This should be able to analyse more complicated control flow patterns:
 *  - continue from the last block
 *  - break from the last block
 *  - continue from a named block
 *  - break from a named block
 *  - exceptions being thrown in a TryStatement
 *  - Return statements in a function
 *  - Throw statements in a function
 */
describe("complex control flow analysis", function() {

  it("should return flows for continue in while loop", function() {

    var nodeList = new List([
      // node 0
      {
        "type": "Program",
        "body": [
          1
        ],
        "sourceType": "script"
      },
      // node 1
      {
        "type": "WhileStatement",
        "test": 2,
        "body": 3
      },
      // node 2
      {
        "type": "Literal",
        "value": false,
        "raw": "false"
      },
      // node 3
      {
        "type": "BlockStatement",
        "body": [
          4
        ]
      },
      // node 4
      {
        "type": "ContinueStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("4.start -> 2.start"));

  });
  it("should return flows for continue in for-in loop");
  it("should return flows for continue in for loop");
  it("should return flows for continue in do-while loop");
  it("should return flows for continue in named loop");

  it("should return flows for break in while loop");
  it("should return flows for break in for-in loop");
  it("should return flows for break in for loop");
  it("should return flows for break in do-while loop");
  it("should return flows for break in named block");
  it("should return flows for break in if block");
  it("should return flows for break in switch block");
  it("should return flows for break in switch block");

  it("should return flows for return in function block");
  it("should return flows for throw in function block");

  it("should return flows for try block");

});
