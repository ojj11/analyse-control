var assert = require("assert");
var control = require("../basic_control.js");
var List = require("immutable").List;
var Set = require("immutable").Set;

var flowListToStrings = (flowList) => (
  flowList.map(r =>
    r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
  )
);

describe("simple control flow analysis", function() {

  it("should output flow for simple Program node", function() {

    // nodeList for a program with a couple of statements `1;2`
    var nodeList = new List([
      {
        "type": "Program",
        "body": [1,2]
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));

  });

  it("should output flow for an empty Program node", function() {

    // nodeList for a program with no body ``
    var nodeList = new List([
      {
        "type": "Program",
        "body": []
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for a simple BlockStatement node", function() {

    // nodeList for a block statement with no body `{1;2}`
    var nodeList = new List([
      {
        "type": "BlockStatement",
        "body": [1,2]
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));

  });

  it("should output flow for an empty BlockStatement node", function() {

    // nodeList for a block statement with no body `{}`
    var nodeList = new List([
      {
        "type": "BlockStatement",
        "body": []
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for an ExpressionStatement node", function() {

    // nodeList for an expression statement like `x`
    var nodeList = new List([
      {
        "type": "ExpressionStatement",
        "expression": 1
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));

  });

  it("should output flow for a UnaryExpression node", function() {

    // nodeList for an expression statement like `-x`
    var nodeList = new List([
      {
        "type": "UnaryExpression",
        "operator": "-",
        "prefix": true,
        "argument": 1
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));

  });

  it("should output flow for a UpdateExpression node", function() {

    // nodeList for an expression statement like `x++`
    var nodeList = new List([
      {
        "type": "UpdateExpression",
        "operator": "++",
        "prefix": false,
        "argument": 1
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));

  });

  it("should output flow for a VariableDeclaration node", function() {

    // nodeList for an expression statement like `var x;`
    var nodeList = new List([
      {
        "type": "VariableDeclaration",
        "declarations": [1],
        "kind": "var"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));

  });

  it("should output flow for a VariableDeclarator node", function() {

    // nodeList for an expression statement like `var x = y;`
    var nodeList = new List([
      {
        "type": "VariableDeclarator",
        "id": 2,
        "init": 1
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));

  });

  it("should output flow for an IfStatement node without alternative", function() {

    // nodeList for an expression statement like `if (true) {}`
    var nodeList = new List([
      {
        "type": "IfStatement",
        "test": 1,
        "consequent": 2,
        "alternate": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));

    // case where test is false:
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));

    // case where test is true:
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));

  });

  it("should output flow for an IfStatement node with alternative", function() {

    // nodeList for an expression statement like `if (true) {} else {}`
    var nodeList = new List([
      {
        "type": "IfStatement",
        "test": 1,
        "consequent": 2,
        "alternate": 3
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(5, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));

    // case where test is true:
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));

    // case where test is false:
    assert.ok(stringRepresentation.includes("1.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 0.end"));

  });

  it("should output flow for an EmptyStatement node", function() {

    // nodeList for an EmptyStatement `;`
    var nodeList = new List([
      {
        "type": "EmptyStatement"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for an Identifier node", function() {

    // nodeList for an Identifier `x`
    var nodeList = new List([
      {
        "type": "Identifier",
        "name": "x"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for a Literal node", function() {

    // nodeList for a Literal `1`
    var nodeList = new List([
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for a ThisExpression node", function() {

    // nodeList for an ThisExpression `this`
    var nodeList = new List([
      {
        "type": "ThisExpression"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for a BreakStatement node", function() {

    // nodeList for an BreakStatement `break`
    var nodeList = new List([
      {
        "type": "BreakStatement"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(0, stringRepresentation.size);

  });

  it("should output flow for a ContinueStatement node", function() {

    // nodeList for an ContinueStatement `continue`
    var nodeList = new List([
      {
        "type": "ContinueStatement"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(0, stringRepresentation.size);

  });

  it("should output flow for a DebuggerStatement node", function() {

    // nodeList for an DebuggerStatement `debugger`
    var nodeList = new List([
      {
        "type": "DebuggerStatement"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for a FunctionExpression node", function() {

    // nodeList for an FunctionExpression `(function() {})`
    var nodeList = new List([
      {
        "type": "FunctionExpression",
        "id": null,
        "generator": false,
        "expression": false,
        "params": [],
        "body": 3
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for a FunctionDeclaration node", function() {

    // nodeList for an FunctionDeclaration `function f() {}`
    var nodeList = new List([
      {
        "type": "FunctionDeclaration",
        "id": 1,
        "generator": false,
        "expression": false,
        "params": [],
        "body": 2
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for a ArrowFunctionExpression node", function() {

    // nodeList for an ArrowFunctionExpression `x => x`
    var nodeList = new List([
      {
        "type": "ArrowFunctionExpression",
        "id": null,
        "generator": false,
        "expression": true,
        "params": [1],
        "body": 2
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 0.end"));

  });

  it("should output flow for a NewExpression node", function() {

    // nodeList for an NewExpression `new Number(42)`
    var nodeList = new List([
      {
        "type": "NewExpression",
        "callee": 1,
        "arguments": [2,3]
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 0.end"));

  });

  it("should output flow for a CallExpression node", function() {

    // nodeList for an CallExpression `Number(42)`
    var nodeList = new List([
      {
        "type": "CallExpression",
        "callee": 1,
        "arguments": [2,3]
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 0.end"));

  });

  it("should output flow for a WhileStatement node", function() {

    // nodeList for an WhileStatement `while(true) {}`
    var nodeList = new List([
      {
        "type": "WhileStatement",
        "test": 1,
        "body": 2
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));

    // case where test is false:
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));

    // case where test is true:
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 1.start"));

  });

  it("should output flow for a DoWhileStatement node", function() {

    // nodeList for an DoWhileStatement `do {} while(true)`
    var nodeList = new List([
      {
        "type": "DoWhileStatement",
        "body": 1,
        "test": 2
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));

    // case where test is false:
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));

    // case where test is true:
    assert.ok(stringRepresentation.includes("2.end -> 1.start"));

  });

  it("should output flow for a WithStatement node", function() {

    // nodeList for an WithStatement ``
    var nodeList = new List([
      {
        "type": "WithStatement",
        "object": 1,
        "body": 2
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));

  });

  it("should output flow for a ArrayExpression node", function() {

    // nodeList for an ArrayExpression `[1,2,,4]`
    var nodeList = new List([
      {
        "type": "ArrayExpression",
        "elements": [1,2,null,3]
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 0.end"));

  });

  it("should output flow for a ObjectExpression node", function() {

    // nodeList for an ObjectExpression `({x:1, y:2})`
    var nodeList = new List([
      {
        "type": "ObjectExpression",
        "properties": [1,2]
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));

  });

  it("should output flow for a Property node", function() {

    // nodeList for an Property `x:1`
    var nodeList = new List([
      {
        "type": "Property",
        "method": false,
        "shorthand": false,
        "computed": false,
        "key": 1,
        "value": 2,
        "kind": "init"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));

  });

  it("should output flow for a ThrowStatement node", function() {

    // nodeList for an ThrowStatement `throw e;`
    var nodeList = new List([
      {
        "type": "ThrowStatement",
        "argument": 1
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    // Throw statement is the end of this control flow

  });

  it("should output flow for a ReturnStatement node with argument", function() {

    // nodeList for an ReturnStatement `return x;`
    var nodeList = new List([
      {
        "type": "ReturnStatement",
        "argument": 1
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    // Return statement is the end of this control flow

  });

  it("should output flow for a ReturnStatement node without argument", function() {

    // nodeList for an ReturnStatement `return;`
    var nodeList = new List([
      {
        "type": "ReturnStatement",
        "argument": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(0, stringRepresentation.size);

  });

  it("should output flow for a LogicalExpression node", function() {
    // nodeList for an LogicalExpression `x || y`
    var nodeList = new List([
      {
        "type": "LogicalExpression",
        "left": 1,
        "operator": "||",
        "right": 2
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));

    // case where first operand was enough to calculate result:
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));

    // case where second operand was needed:
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
  });

  it("should output flow for a SequenceExpression node", function() {
    // nodeList for an SequenceExpression `(1,2,3)`
    var nodeList = new List([
      {
        "type": "SequenceExpression",
        "expressions": [1,2,3]
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 0.end"));
  });

  it("should output flow for a LabeledStatement node", function() {
    // nodeList for an LabeledStatement `name: {}`
    var nodeList = new List([
      {
        "type": "LabeledStatement",
        "body": 1,
        "label": 2
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));
  });

  it("should output flow for a BinaryExpression node", function() {
    // nodeList for an BinaryExpression `x == x`
    var nodeList = new List([
      {
        "type": "BinaryExpression",
        "left": 1,
        "operator": "==",
        "right": 2
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
  });

  it("should output flow for a AssignmentExpression node", function() {
    // nodeList for an AssignmentExpression `x = 42`
    var nodeList = new List([
      {
        "type": "AssignmentExpression",
        "operator": "=",
        "left": 1,
        "right": 2
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
  });

  it("should output flow for a ConditionalExpression node", function() {
    // nodeList for an ConditionalExpression `x ? 1 : 2`
    var nodeList = new List([
      {
        "type": "ConditionalExpression",
        "test": 1,
        "consequent": 2,
        "alternate": 3
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(5, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));

    // case where test is true
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));

    // case where test is false
    assert.ok(stringRepresentation.includes("1.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 0.end"));
  });

  it("should output flow for a computed MemberExpression node", function() {
    // nodeList for an MemberExpression `x[y]`
    var nodeList = new List([
      {
        "type": "MemberExpression",
        "object": 1,
        "property": 2,
        "computed": true
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
  });

  it("should output flow for a non-computed MemberExpression node", function() {
    // nodeList for an MemberExpression `x.y`
    var nodeList = new List([
      {
        "type": "MemberExpression",
        "object": 1,
        "property": 2,
        "computed": false
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));
  });

  it("should output flow for a TryStatement node with catch and final block", function() {
    // nodeList for an TryStatement `try {} catch(e) {} finally {}`
    var nodeList = new List([
      {
        "type": "TryStatement",
        "block": 1,
        "handler": 2,
        "finalizer": 3
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 3.start"));
    assert.ok(stringRepresentation.includes("2.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 0.end"));
  });

  it("should output flow for a TryStatement node with catch block", function() {
    // nodeList for an TryStatement `try {} catch(e) {}`
    var nodeList = new List([
      {
        "type": "TryStatement",
        "block": 1,
        "handler": 2,
        "finalizer": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
  });

  it("should output flow for a TryStatement node with final block", function() {
    // nodeList for an TryStatement `try {} catch(e) {} finally {}`
    var nodeList = new List([
      {
        "type": "TryStatement",
        "block": 1,
        "handler": null,
        "finalizer": 3
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 0.end"));
  });

  it("should output flow for a ForStatement node", function() {
    // nodeList for a ForStatement `for (var i = 0; i < 5; i += 1) {}`
    var nodeList = new List([
      {
        "type": "ForStatement",
        "init": 1,
        "test": 2,
        "update": 3,
        "body": 4
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(6, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
    assert.ok(stringRepresentation.includes("2.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 2.start"));
  });

  it("should output flow for a ForStatement node without initialisation", function() {
    // nodeList for a ForStatement `for (; i < 5; i += 1) {}`
    var nodeList = new List([
      {
        "type": "ForStatement",
        "init": null,
        "test": 2,
        "update": 3,
        "body": 4
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(5, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
    assert.ok(stringRepresentation.includes("2.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 2.start"));
  });

  it("should output flow for a ForStatement node without test", function() {
    // nodeList for a ForStatement `for (var i = 0; ; i += 1) {}`
    var nodeList = new List([
      {
        "type": "ForStatement",
        "init": 1,
        "test": null,
        "update": 3,
        "body": 4
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 4.start"));
  });

  it("should output flow for a ForStatement node without update", function() {
    // nodeList for a ForStatement `for (var i = 0; i < 5; ) {}`
    var nodeList = new List([
      {
        "type": "ForStatement",
        "init": 1,
        "test": 2,
        "update": null,
        "body": 4
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(5, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
    assert.ok(stringRepresentation.includes("2.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 2.start"));
  });

  it("should output flow for a ForStatement node without update and test", function() {
    // nodeList for a ForStatement `for (var i = 0; ; ) {}`
    var nodeList = new List([
      {
        "type": "ForStatement",
        "init": 1,
        "test": null,
        "update": null,
        "body": 4
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 4.start"));
  });

  it("should output flow for a ForStatement node without update and initialisation", function() {
    // nodeList for a ForStatement `for ( ; i < 5; ) {}`
    var nodeList = new List([
      {
        "type": "ForStatement",
        "init": null,
        "test": 2,
        "update": null,
        "body": 4
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(4, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
    assert.ok(stringRepresentation.includes("2.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 2.start"));
  });

  it("should output flow for a ForStatement node without initialisation and test", function() {
    // nodeList for a ForStatement `for (; ; i += 1) {}`
    var nodeList = new List([
      {
        "type": "ForStatement",
        "init": null,
        "test": null,
        "update": 3,
        "body": 4
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 4.start"));
  });

  it("should output flow for a ForStatement node without initialisation, test and update", function() {
    // nodeList for a ForStatement `for (; ; ) {}`
    var nodeList = new List([
      {
        "type": "ForStatement",
        "init": null,
        "test": null,
        "update": null,
        "body": 4
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 4.start"));
  });

  it("should output flow for a CatchClause node", function() {
    // nodeList for a CatchClause node `catch(e) {...}`
    var nodeList = new List([
      {
        "type": "CatchClause",
        "param": {
          "type": "Identifier",
          "name": "e"
        },
        "body": 1
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(2, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));
  });

  it("should output flow for a ForInStatement node", function() {
    // nodeList for a ForInStatement node `for (x in y) {...}`
    var nodeList = new List([
      {
        "type": "ForInStatement",
        "left": 1,
        "right": 2,
        "body": 3
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(5, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 3.start"));
    assert.ok(stringRepresentation.includes("2.end -> 0.end"));
    assert.ok(stringRepresentation.includes("3.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 0.end"));
  });

  it("should output flows for multiple inputs", function() {
    var nodeList = new List([
      {
        "type": "Program",
        "body": [1]
      },
      {
        "type": "BlockStatement",
        "body": [2,3]
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(5, stringRepresentation.size);

    assert.ok(stringRepresentation.includes("0.start -> 1.start"));
    assert.ok(stringRepresentation.includes("1.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 3.start"));
    assert.ok(stringRepresentation.includes("3.end -> 1.end"));
    assert.ok(stringRepresentation.includes("1.end -> 0.end"));
  });

  it("shouldn't generate flows in and out of functions", function() {
    var nodeList = new List([
      // node 0:
      {
        "type": "Program",
        "body": [
          1
        ]
      },
      // node 1:
      {
        "type": "FunctionDeclaration",
        "id": 2,
        "generator": false,
        "expression": false,
        "params": [],
        "body": 3
      },
      // node 2:
      {
        "type": "Identifier",
        "name": "abc"
      },
      // node 3:
      {
        "type": "BlockStatement",
        "body": [
          4
        ]
      },
      // node 4:
      {
        "type": "ReturnStatement",
        "argument": null
      }
    ]);

    var flows = control(nodeList);

    // check that [0,1] never overlap with [3,4]
    var set1 = new Set([0,1]);
    assert.ok(flows.every(f => (
      set1.includes(f.start.node) == set1.includes(f.end.node)
    )));

    var set2 = new Set([3,4]);
    assert.ok(flows.every(f => (
      set2.includes(f.start.node) == set2.includes(f.end.node)
    )));

  });

  // ECMAScript6 node types are a WIP:
  // it("should output flow for a ForOfStatement node");
  // it("should output flow for a LetStatement node");
  // it("should output flow for a YieldExpression node");
  // it("should output flow for a ComprehensionExpression node");
  // it("should output flow for a GeneratorExpression node");
  // it("should output flow for a LetExpression node");
  // it("should output flow for a ComprehensionBlock node");
  // it("should output flow for a ComprehensionIf node");

});
