var assert = require("assert");
var switchControl = require("../switch_control.js");
var List = require("immutable").List;
var Set = require("immutable").Set;

var flowListToStrings = (flowList) => (
  flowList.map(r =>
    r.start.node + "." + r.start.type + " -> " + r.end.node + "." + r.end.type
  )
);

/**
 * This should be able to analyse switch statements which are slightly more
 * complicated as they require traversal of the SwitchCases themselves
 */
describe("switch statement control flow analysis", function() {

  it("should return flows for single-case case statement", function() {

    // switch(3) {
    //   case 1:
    //     3;
    // }

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
          3
        ]
      },
      // node 2:
      {
        "type": "Literal",
        "value": 3,
        "raw": "3"
      },
      // node 3:
      {
        "type": "SwitchCase",
        "consequent": [
          4
        ],
        "test": 6
      },
      // node 4:
      {
        "type": "ExpressionStatement",
        "expression": 5
      },
      // node 5:
      {
        "type": "Literal",
        "value": 3,
        "raw": "3"
      },
      // node 6:
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      }
    ]);

    var stringRepresentation = flowListToStrings(switchControl(nodeList));

    assert.equal(5, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("1.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 6.start"));
    assert.ok(stringRepresentation.includes("6.end -> 4.start"));
    assert.ok(stringRepresentation.includes("6.end -> 1.end"));
    assert.ok(stringRepresentation.includes("4.end -> 1.end"));

  });

  it("should return flows for case-fall-through", function() {

    // switch(3) {
    //   case 0:
    //   case 1:
    //     3;
    // }

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
          5
        ]
      },
      // node 2:
      {
        "type": "Literal",
        "value": 3,
        "raw": "3"
      },
      // node 3:
      {
        "type": "SwitchCase",
        "consequent": [],
        "test": 4
      },
      // node 4:
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      },
      // node 5:
      {
        "type": "SwitchCase",
        "consequent": [
          6
        ],
        "test": 8
      },
      // node 6:
      {
        "type": "ExpressionStatement",
        "expression": 7
      },
      // node 7:
      {
        "type": "Literal",
        "value": 3,
        "raw": "3"
      },
      // node 8:
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      }
    ]);

    var stringRepresentation = flowListToStrings(switchControl(nodeList));

    assert.equal(7, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("1.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 6.start"));
    assert.ok(stringRepresentation.includes("4.end -> 8.start"));
    assert.ok(stringRepresentation.includes("8.end -> 6.start"));
    assert.ok(stringRepresentation.includes("8.end -> 1.end"));
    assert.ok(stringRepresentation.includes("6.end -> 1.end"));

  });

  it("should return flows for single empty case statement", function() {

    // switch(3) {
    //   case 0:
    // }

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
          3
        ]
      },
      // node 2:
      {
        "type": "Literal",
        "value": 3,
        "raw": "3"
      },
      // node 3:
      {
        "type": "SwitchCase",
        "consequent": [],
        "test": 4
      },
      // node 4:
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      }
    ]);

    var stringRepresentation = flowListToStrings(switchControl(nodeList));

    assert.equal(3, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("1.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 1.end"));

  });

  it("should return flows for cases and default statement", function() {

    // switch(3) {
    //   default:
    //   case 0:
    //     0;
    //   case 1:
    //     2;
    // }

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
          7,
          3,
          8
        ]
      },
      // node 2:
      {
        "type": "Literal",
        "value": 3,
        "raw": "3"
      },
      // node 3:
      {
        "type": "SwitchCase",
        "consequent": [
          4
        ],
        "test": 6
      },
      // node 4:
      {
        "type": "ExpressionStatement",
        "expression": 5
      },
      // node 5:
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      },
      // node 6:
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      },
      // node 7:
      {
        "type": "SwitchCase",
        "consequent": [],
        "test": null
      },
      // node 8:
      {
        "type": "SwitchCase",
        "consequent": [
          9
        ],
        "test": 11
      },
      // node 9:
      {
        "type": "ExpressionStatement",
        "expression": 10
      },
      // node 10:
      {
        "type": "Literal",
        "value": 2,
        "raw": "2"
      },
      // node 11:
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      }
    ]);

    var stringRepresentation = flowListToStrings(switchControl(nodeList));

    assert.equal(8, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("1.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 6.start"));
    assert.ok(stringRepresentation.includes("6.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 9.start"));
    assert.ok(stringRepresentation.includes("6.end -> 11.start"));
    assert.ok(stringRepresentation.includes("11.end -> 9.start"));
    assert.ok(stringRepresentation.includes("9.end -> 1.end"));
    assert.ok(stringRepresentation.includes("11.end -> 4.start"));

  });

  it("should return flows for single empty default statement", function() {

    // switch(3) {
    //   default:
    // }

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
          3
        ]
      },
      // node 2:
      {
        "type": "Literal",
        "value": 3,
        "raw": "3"
      },
      // node 3:
      {
        "type": "SwitchCase",
        "consequent": [],
        "test": null
      }
    ]);

    var stringRepresentation = flowListToStrings(switchControl(nodeList));

    assert.equal(2, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("1.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 1.end"));

  });

  it("should return flows for single default statement with consequents", function() {

    // switch(3) {
    //   default:
    //     0;
    // }

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
          3
        ]
      },
      // node 2:
      {
        "type": "Literal",
        "value": 3,
        "raw": "3"
      },
      // node 3:
      {
        "type": "SwitchCase",
        "consequent": [
          4,
          6
        ],
        "test": null
      },
      // node 4:
      {
        "type": "ExpressionStatement",
        "expression": 5
      },
      // node 5:
      {
        "type": "Literal",
        "value": 0,
        "raw": "0"
      },
      // node 6:
      {
        "type": "ExpressionStatement",
        "expression": 7
      },
      // node 7:
      {
        "type": "Literal",
        "value": 1,
        "raw": "1"
      }
    ]);

    var stringRepresentation = flowListToStrings(switchControl(nodeList));

    assert.equal(4, stringRepresentation.size);
    assert.ok(stringRepresentation.includes("1.start -> 2.start"));
    assert.ok(stringRepresentation.includes("2.end -> 4.start"));
    assert.ok(stringRepresentation.includes("4.end -> 6.start"));
    assert.ok(stringRepresentation.includes("6.end -> 1.end"));

  });

});
