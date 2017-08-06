/* @flow */
var assert = require("assert");
var hoist = require("../hoist.js");
var List = require("immutable").List;

describe("hoisting", function() {

  it("should hoist a simple var declaration", function() {
    // labelled node list for `var x = 1;`
    var nodeList = new List([
      {
        "type": "Program",
        "body": [1]
      },
      {
        "type": "VariableDeclaration",
        "kind": "var",
        "declarations": [2]
      },
      {
        "type": "VariableDeclarator",
        "id": 3,
        "init": 4
      },
      {
        "type": "Identifier",
        "name": "x"
      },
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      }
    ]);

    var declarations = hoist(nodeList);

    assert.equal(2, declarations.length);
    var stringRepresentation = declarations.map(r =>
      r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
    );

    assert.ok(stringRepresentation.indexOf("0.startHoist -> 2.hoist") != -1);
    assert.ok(stringRepresentation.indexOf("2.hoist -> 0.start") != -1);
  });

  it("should hoist a var declaration in an if block", function() {
    // nodeList for `if (false) {var x = true}`
    var nodeList = new List([
      {
        "type": "Program",
        "body": [1]
      },
      {
        "type": "IfStatement",
        "test": 2,
        "consequent": 3,
        "alternate": null
      },
      {
        "type": "Literal",
        "value": false,
        "raw": "false"
      },
      {
        "type": "BlockStatement",
        "body": [4]
      },
      {
        "type": "VariableDeclaration",
        "declarations": [5],
        "kind": "var"
      },
      {
        "type": "VariableDeclarator",
        "id": 6,
        "init": 7
      },
      {
        "type": "Identifier",
        "name": "x"
      },
      {
        "type": "Literal",
        "value": true,
        "raw": "true"
      }
    ]);

    var declarations = hoist(nodeList);

    assert.equal(2, declarations.length);
    var stringRepresentation = declarations.map(r =>
      r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
    );

    assert.ok(stringRepresentation.indexOf("0.startHoist -> 5.hoist") != -1);
    assert.ok(stringRepresentation.indexOf("5.hoist -> 0.start") != -1);
  });

  it("should hoist a simple function declaration", function() {
    // nodeList for `function test() {}`
    var nodeList = new List([
      {
        "type": "Program",
        "body": [1],
        "sourceType": "script"
      },
      {
        "type": "FunctionDeclaration",
        "id": 2,
        "generator": false,
        "expression": false,
        "params": [],
        "body": 3
      },
      {
        "type": "Identifier",
        "name": "test"
      },
      {
        "type": "BlockStatement",
        "body": []
      }
    ]);

    var declarations = hoist(nodeList);

    assert.equal(2, declarations.length);
    var stringRepresentation = declarations.map(r =>
      r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
    );

    assert.ok(stringRepresentation.indexOf("0.startHoist -> 1.hoist") != -1);
    assert.ok(stringRepresentation.indexOf("1.hoist -> 0.start") != -1);
  });

  it("should hoist a simple function declaration in an if block", function() {
    // nodeList for `if (false) {function test() {}}`
    var nodeList = new List([
      {
        "type": "Program",
        "body": [1]
      },
      {
        "type": "IfStatement",
        "test": 2,
        "consequent": 3,
        "alternate": null
      },
      {
        "type": "Literal",
        "value": false,
        "raw": "false"
      },
      {
        "type": "BlockStatement",
        "body": [4]
      },
      {
        "type": "FunctionDeclaration",
        "id": 5,
        "generator": false,
        "expression": false,
        "params": [],
        "body": 6
      },
      {
        "type": "Identifier",
        "name": "test"
      },
      {
        "type": "BlockStatement",
        "body": []
      }
    ]);

    var declarations = hoist(nodeList);

    assert.equal(2, declarations.length);
    var stringRepresentation = declarations.map(r =>
      r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
    );

    assert.ok(stringRepresentation.indexOf("0.startHoist -> 4.hoist") != -1);
    assert.ok(stringRepresentation.indexOf("4.hoist -> 0.start") != -1);
  });

  it("should hoist in order", function() {
    // nodeList for `var x = 0; var y = 1;`
    var nodeList = new List([
      {
        "type": "Program",
        "body": [1,5]
      },
      {
        "type": "VariableDeclaration",
        "declarations": [2],
        "kind": "var"
      },
      {
        "type": "VariableDeclarator",
        "id": 3,
        "init": 4
      },
      {
        "type": "Identifier",
        "name": "x"
      },
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      },
      {
        "type": "VariableDeclaration",
        "declarations": [6],
        "kind": "var"
      },
      {
        "type": "VariableDeclarator",
        "id": 7,
        "init": 8
      },
      {
        "type": "Identifier",
        "name": "y"
      },
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      }
    ]);

    var declarations = hoist(nodeList);

    assert.equal(3, declarations.length);
    var stringRepresentation = declarations.map(r =>
      r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
    );

    assert.ok(stringRepresentation.indexOf("0.startHoist -> 2.hoist") != -1);
    assert.ok(stringRepresentation.indexOf("2.hoist -> 6.hoist") != -1);
    assert.ok(stringRepresentation.indexOf("6.hoist -> 0.start") != -1);
  });

  it("shouldn't hoist when there's no function or variable declaration", function() {
    // nodeList for `console.log('hello');`
    var nodeList = new List([
      {
        "type": "Program",
        "body": [1]
      },
      {
        "type": "ExpressionStatement",
        "expression": 2
      },
      {
        "type": "CallExpression",
        "callee": 3,
        "arguments": [6]
      },
      {
        "type": "MemberExpression",
        "object": 4,
        "property": 5,
        "computed": false
      },
      {
        "type": "Identifier",
        "name": "console"
      },
      {
        "type": "Identifier",
        "name": "log"
      },
      {
        "type": "Literal",
        "value": "hello",
        "raw": "'hello'"
      }
    ]);

    var declarations = hoist(nodeList);

    assert.equal(1, declarations.length);
    var stringRepresentation = declarations.map(r =>
      r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
    );

    assert.ok(stringRepresentation.indexOf("0.startHoist -> 0.start") != -1);
  });

  it("shouldn't hoist a var in a function body", function() {
    // nodeList for `function test() {var x = false;}`
    var nodeList = new List([
      {
        "type": "Program",
        "body": [1]
      },
      {
        "type": "FunctionDeclaration",
        "id": 2,
        "generator": false,
        "expression": false,
        "params": [],
        "body": 3
      },
      {
        "type": "Identifier",
        "name": "test"
      },
      {
        "type": "BlockStatement",
        "body": [4]
      },
      {
        "type": "VariableDeclaration",
        "declarations": [5],
        "kind": "var"
      },
      {
        "type": "VariableDeclarator",
        "id": 6,
        "init": 7
      },
      {
        "type": "Identifier",
        "name": "x"
      },
      {
        "type": "Literal",
        "value": false,
        "raw": "false"
      }
    ]);

    var declarations = hoist(nodeList);

    assert.equal(2, declarations.length);
    var stringRepresentation = declarations.map(r =>
      r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
    );

    assert.ok(stringRepresentation.indexOf("0.startHoist -> 1.hoist") != -1);
    assert.ok(stringRepresentation.indexOf("1.hoist -> 0.start") != -1);
  });

});
