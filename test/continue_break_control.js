/* @flow */
var assert = require("assert");
var control = require("../continue_break_control.js");
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
describe("break/continue control flow analysis", function() {

  it("should return flows for continue in while loop", function() {

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
        "type": "WhileStatement",
        "test": 2,
        "body": 3
      },
      // node 2:
      {
        "type": "Literal",
        "value": false,
        "raw": "false"
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
        "type": "ContinueStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("4.start -> 2.start"));

  });

  it("should return flows for continue in for-in loop", function() {

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
        "type": "ForInStatement",
        "left": 2,
        "right": 3,
        "body": 4
      },
      // node :
      {
        "type": "Identifier",
        "name": "x"
      },
      // node 3:
      {
        "type": "Identifier",
        "name": "y"
      },
      // node 4:
      {
        "type": "BlockStatement",
        "body": [
          5
        ]
      },
      // node 5:
      {
        "type": "ContinueStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("5.start -> 4.start"));

  });

  it("should return flows for continue in for-of loop", function() {

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
        "type": "ForOfStatement",
        "left": 2,
        "right": 3,
        "body": 4
      },
      // node 2:
      {
        "type": "Identifier",
        "name": "x"
      },
      // node 3:
      {
        "type": "Identifier",
        "name": "y"
      },
      // node 4:
      {
        "type": "BlockStatement",
        "body": [
          5
        ]
      },
      // node 5:
      {
        "type": "ContinueStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("5.start -> 4.start"));

  });

  it("should return flows for continue in for loop", function() {

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
        "type": "ForStatement",
        "init": 2,
        "test": 6,
        "update": 9,
        "body": 12
      },
      // node 2:
      {
        "type": "VariableDeclaration",
        "declarations": [
          3
        ],
        "kind": "var"
      },
      // node 3:
      {
        "type": "VariableDeclarator",
        "id": 4,
        "init": 5
      },
      // node 4:
      {
        "type": "Identifier",
        "name": "i"
      },
      // node 5:
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      },
      // node 6:
      {
        "type": "BinaryExpression",
        "left": 7,
        "operator": "<",
        "right": 8
      },
      // node 7:
      {
        "type": "Identifier",
        "name": "i"
      },
      // node 8:
      {
        "type": "Literal",
        "value": 5,
        "raw": "5"
      },
      // node 9:
      {
        "type": "AssignmentExpression",
        "operator": "+=",
        "left": 10,
        "right": 11
      },
      // node 10:
      {
        "type": "Identifier",
        "name": "i"
      },
      // node 11:
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      },
      // node 12:
      {
        "type": "BlockStatement",
        "body": [
          13
        ]
      },
      // node 13:
      {
        "type": "ContinueStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("13.start -> 9.start"));

  });

  it("should return flows for continue in for loop without update", function() {

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
        "type": "ForStatement",
        "init": 2,
        "test": 6,
        "update": null,
        "body": 9
      },
      // node 2:
      {
        "type": "VariableDeclaration",
        "declarations": [
          3
        ],
        "kind": "var"
      },
      // node 3:
      {
        "type": "VariableDeclarator",
        "id": 4,
        "init": 5
      },
      // node 4:
      {
        "type": "Identifier",
        "name": "i"
      },
      // node 5:
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      },
      // node 6:
      {
        "type": "BinaryExpression",
        "left": 7,
        "operator": "<",
        "right": 8
      },
      // node 7:
      {
        "type": "Identifier",
        "name": "i"
      },
      // node 8:
      {
        "type": "Literal",
        "value": 5,
        "raw": "5"
      },
      // node 9:
      {
        "type": "BlockStatement",
        "body": [
          10
        ]
      },
      // node 10:
      {
        "type": "ContinueStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("10.start -> 6.start"));

  });

  it("should return flows for continue in for loop without update and test", function() {

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
        "type": "ForStatement",
        "init": null,
        "test": null,
        "update": null,
        "body": 2
      },
      // node 2:
      {
        "type": "BlockStatement",
        "body": [
          3
        ]
      },
      // node 3:
      {
        "type": "ContinueStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("3.start -> 2.start"));

  });

  it("should return flows for continue in do-while loop", function() {

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
        "type": "DoWhileStatement",
        "body": 2,
        "test": 4
      },
      // node 2:
      {
        "type": "BlockStatement",
        "body": [
          3
        ]
      },
      // node 3:
      {
        "type": "ContinueStatement",
        "label": null
      },
      // node 4:
      {
        "type": "BinaryExpression",
        "left": 5,
        "operator": "<",
        "right": 6
      },
      // node 5:
      {
        "type": "Identifier",
        "name": "x"
      },
      // node 6:
      {
        "type": "Literal",
        "value": 5,
        "raw": "5"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("3.start -> 4.start"));

  });

  it("should return flows for continue in named loop", function() {

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
            "type": "LabeledStatement",
            "body": 2,
            "label": 12
          },
          // node 2:
          {
            "type": "WhileStatement",
            "test": 3,
            "body": 4
          },
          // node 3:
          {
            "type": "Literal",
            "value": true,
            "raw": "true"
          },
          // node 4:
          {
            "type": "BlockStatement",
            "body": [
              5
            ]
          },
          // node 5:
          {
            "type": "LabeledStatement",
            "body": 6,
            "label": 11
          },
          // node 6:
          {
            "type": "WhileStatement",
            "test": 7,
            "body": 8
          },
          // node 7:
          {
            "type": "Literal",
            "value": true,
            "raw": "true"
          },
          // node 8:
          {
            "type": "BlockStatement",
            "body": [
              9
            ]
          },
          // node 9:
          {
            "type": "ContinueStatement",
            "label": 10
          },
          // node 10:
          {
            "type": "Identifier",
            "name": "label1"
          },
          // node 11:
          {
            "type": "Identifier",
            "name": "label2"
          },
          // node 12:
          {
            "type": "Identifier",
            "name": "label1"
          }
        ]);

        var stringRepresentation = flowListToStrings(control(nodeList));

        assert.equal(1, stringRepresentation.size);
        assert.ok(stringRepresentation.includes("9.start -> 3.start"));

  });

  it("should return flows for break in while loop", function() {

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
        "type": "WhileStatement",
        "test": 2,
        "body": 3
      },
      // node 2:
      {
        "type": "Literal",
        "value": true,
        "raw": "true"
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
        "type": "BreakStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("4.start -> 1.end"));

  });

  it("should return flows for break in for-in loop", function() {

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
        "type": "ForInStatement",
        "left": 2,
        "right": 5,
        "body": 6
      },
      // node 2:
      {
        "type": "VariableDeclaration",
        "declarations": [
          3
        ],
        "kind": "var"
      },
      // node 3:
      {
        "type": "VariableDeclarator",
        "id": 4,
        "init": null
      },
      // node 4:
      {
        "type": "Identifier",
        "name": "x"
      },
      // node 5:
      {
        "type": "Identifier",
        "name": "y"
      },
      // node 6:
      {
        "type": "BlockStatement",
        "body": [
          7
        ]
      },
      // node 7:
      {
        "type": "BreakStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("7.start -> 1.end"));

  });

  it("should return flows for break in for-of loop", function() {

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
        "type": "ForOfStatement",
        "left": 2,
        "right": 5,
        "body": 6
      },
      // node 2:
      {
        "type": "VariableDeclaration",
        "declarations": [
          3
        ],
        "kind": "var"
      },
      // node 3:
      {
        "type": "VariableDeclarator",
        "id": 4,
        "init": null
      },
      // node 4:
      {
        "type": "Identifier",
        "name": "x"
      },
      // node 5:
      {
        "type": "Identifier",
        "name": "y"
      },
      // node 6:
      {
        "type": "BlockStatement",
        "body": [
          7
        ]
      },
      // node 7:
      {
        "type": "BreakStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("7.start -> 1.end"));

  });

  it("should return flows for break in for loop", function() {

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
        "type": "ForStatement",
        "init": 2,
        "test": 6,
        "update": 9,
        "body": 12
      },
      // node 2:
      {
        "type": "VariableDeclaration",
        "declarations": [
          3
        ],
        "kind": "var"
      },
      // node 3:
      {
        "type": "VariableDeclarator",
        "id": 4,
        "init": 5
      },
      // node 4:
      {
        "type": "Identifier",
        "name": "i"
      },
      // node 5:
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      },
      // node 6:
      {
        "type": "BinaryExpression",
        "left": 7,
        "operator": "<",
        "right": 8
      },
      // node 7:
      {
        "type": "Identifier",
        "name": "i"
      },
      // node 8:
      {
        "type": "Literal",
        "value": 5,
        "raw": "5"
      },
      // node 9:
      {
        "type": "AssignmentExpression",
        "operator": "+=",
        "left": 10,
        "right": 11
      },
      // node 10:
      {
        "type": "Identifier",
        "name": "i"
      },
      // node 11:
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      },
      // node 12:
      {
        "type": "BlockStatement",
        "body": [
          13
        ]
      },
      // node 13:
      {
        "type": "BreakStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("13.start -> 1.end"));

  });

  it("should return flows for break in do-while loop", function() {

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
        "type": "DoWhileStatement",
        "body": 2,
        "test": 4
      },
      // node 2:
      {
        "type": "BlockStatement",
        "body": [
          3
        ]
      },
      // node 3:
      {
        "type": "BreakStatement",
        "label": null
      },
      // node 4:
      {
        "type": "Literal",
        "value": true,
        "raw": "true"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("3.start -> 1.end"));

  });

  it("should return flows for break in consequent of named if block", function() {

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
        "type": "LabeledStatement",
        "body": 2,
        "label": 12
      },
      // node 2:
      {
        "type": "IfStatement",
        "test": 3,
        "consequent": 4,
        "alternate": null
      },
      // node 3:
      {
        "type": "Literal",
        "value": true,
        "raw": "true"
      },
      // node 4:
      {
        "type": "BlockStatement",
        "body": [
          5
        ]
      },
      // node 5:
      {
        "type": "LabeledStatement",
        "body": 6,
        "label": 11
      },
      // node 6:
      {
        "type": "IfStatement",
        "test": 7,
        "consequent": 8,
        "alternate": null
      },
      // node 7:
      {
        "type": "Literal",
        "value": true,
        "raw": "true"
      },
      // node 8:
      {
        "type": "BlockStatement",
        "body": [
          9
        ]
      },
      // node 9:
      {
        "type": "BreakStatement",
        "label": 10
      },
      // node 10:
      {
        "type": "Identifier",
        "name": "label1"
      },
      // node 11:
      {
        "type": "Identifier",
        "name": "label2"
      },
      // node 12:
      {
        "type": "Identifier",
        "name": "label1"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("9.start -> 2.end"));

  });

  it("should return flows for break in alternate of named if block", function() {

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
        "type": "LabeledStatement",
        "body": 2,
        "label": 14
      },
      // node 2:
      {
        "type": "IfStatement",
        "test": 3,
        "consequent": 4,
        "alternate": 5
      },
      // node 3:
      {
        "type": "Literal",
        "value": false,
        "raw": "false"
      },
      // node 4:
      {
        "type": "BlockStatement",
        "body": []
      },
      // node 5:
      {
        "type": "BlockStatement",
        "body": [
          6
        ]
      },
      // node 6:
      {
        "type": "LabeledStatement",
        "body": 7,
        "label": 13
      },
      // node 7:
      {
        "type": "IfStatement",
        "test": 8,
        "consequent": 9,
        "alternate": 10
      },
      // node 8:
      {
        "type": "Literal",
        "value": false,
        "raw": "false"
      },
      // node 9:
      {
        "type": "BlockStatement",
        "body": []
      },
      // node 10:
      {
        "type": "BlockStatement",
        "body": [
          11
        ]
      },
      // node 11:
      {
        "type": "BreakStatement",
        "label": 12
      },
      // node 12:
      {
        "type": "Identifier",
        "name": "label1"
      },
      // node 13:
      {
        "type": "Identifier",
        "name": "label2"
      },
      // node 14:
      {
        "type": "Identifier",
        "name": "label1"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("11.start -> 2.end"));

  });

  it("should return flows for break in named with block", function() {

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
        "type": "LabeledStatement",
        "body": 2,
        "label": 7
      },
      // node 2:
      {
        "type": "WithStatement",
        "object": 3,
        "body": 4
      },
      // node 3:
      {
        "type": "Identifier",
        "name": "x"
      },
      // node 4:
      {
        "type": "BlockStatement",
        "body": [
          5
        ]
      },
      // node 5:
      {
        "type": "BreakStatement",
        "label": 6
      },
      // node 6:
      {
        "type": "Identifier",
        "name": "label"
      },
      // node 7:
      {
        "type": "Identifier",
        "name": "label"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("5.start -> 2.end"));

  });

  it("should return flows for break in named block", function() {

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
        "type": "LabeledStatement",
        "body": 2,
        "label": 5
      },
      // node 2:
      {
        "type": "BlockStatement",
        "body": [
          3
        ]
      },
      // node 3:
      {
        "type": "BreakStatement",
        "label": 4
      },
      // node 4:
      {
        "type": "Identifier",
        "name": "label"
      },
      // node 5:
      {
        "type": "Identifier",
        "name": "label"
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(1, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("3.start -> 2.end"));

  });

  it("should return flows for break in switch block", function() {

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
        "type": "SwitchStatement",
        "discriminant": 2,
        "cases": [
          3,
          6,
          9
        ]
      },
      // node 2:
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      },
      // node 3:
      {
        "type": "SwitchCase",
        "consequent": [
          4
        ],
        "test": 5
      },
      // node 4:
      {
        "type": "BreakStatement",
        "label": null
      },
      // node 5:
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      },
      // node 6:
      {
        "type": "SwitchCase",
        "consequent": [
          7
        ],
        "test": 8
      },
      // node 7:
      {
        "type": "BreakStatement",
        "label": null
      },
      // node 8:
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      },
      // node 9:
      {
        "type": "SwitchCase",
        "consequent": [
          10
        ],
        "test": null
      },
      // node 10:
      {
        "type": "BreakStatement",
        "label": null
      }
    ]);

    var stringRepresentation = flowListToStrings(control(nodeList));

    assert.equal(3, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("4.start -> 1.end"));
    assert.ok(stringRepresentation.includes("7.start -> 1.end"));
    assert.ok(stringRepresentation.includes("10.start -> 1.end"));

  });

});
