var getMethods = require("../methods.js");
var List = require("immutable").List;
var assert = require("assert");

describe("methods", function() {

  it("should be able to get the method for a FunctionDeclaration", function() {

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

    var methods = getMethods(nodeList);

    assert.equal(1, methods.length);
    assert.equal(1, methods[0].method);
    assert.equal(3, methods[0].body);

  });

  it("should be able to get the method for a FunctionExpression", function() {

    var nodeList = new List([
      {
        "type": "Program",
        "body": [1],
        "sourceType": "script"
      },
      {
        "type": "FunctionExpression",
        "generator": false,
        "expression": false,
        "params": [],
        "body": 2
      },
      {
        "type": "BlockStatement",
        "body": []
      }
    ]);

    var methods = getMethods(nodeList);

    assert.equal(1, methods.length);
    assert.equal(1, methods[0].method);
    assert.equal(2, methods[0].body);

  });

  it("should be able to get the method for a ArrowExpression", function() {

    var nodeList = new List([
      {
        "type": "Program",
        "body": [1],
        "sourceType": "script"
      },
      {
        "type": "ArrowExpression",
        "generator": false,
        "expression": false,
        "params": [],
        "body": 2
      },
      {
        "type": "BlockStatement",
        "body": []
      }
    ]);

    var methods = getMethods(nodeList);

    assert.equal(1, methods.length);
    assert.equal(1, methods[0].method);
    assert.equal(2, methods[0].body);

  });
});
