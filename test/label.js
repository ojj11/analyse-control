/* @flow */
var assert = require("assert");
var label = require("../label.js");

describe("labelling", function() {

  var labels;

  beforeEach(function() {

    // super small AST for `var x = 1;`
    var ast = {
      "type": "Program",
      "body": [
        {
          "type": "VariableDeclaration",
          "kind": "var",
          "declarations": [
            {
              "type": "VariableDeclarator",
              "id": {
                "type": "Identifier",
                "name": "x"
              },
              "init": {
                "type": "Literal",
                "value": 1,
                "raw": "1"
              }
            }
          ]
        }
      ]
    };

    // make sure our input doesn't get altered by freezing all the things!
    Object.freeze(ast);
    Object.freeze(ast.body);
    Object.freeze(ast.body[0]);
    Object.freeze(ast.body[0].declarations);
    Object.freeze(ast.body[0].declarations[0]);
    Object.freeze(ast.body[0].declarations[0].id);
    Object.freeze(ast.body[0].declarations[0].init);

    labels = label(ast);
  });

  it("should have the first labelled node as Program", function() {
    // by convention the first node should be the program:
    assert.equal(labels.get(0).type, "Program");
  });

  it("should have the correct number of elements", function() {
    // there are 5 elements in this AST
    assert.equal(labels.size, 5);
  });

  it("should have labels pointing to the right elements", function() {
    var variableDecs = labels.get(0);
    var declarations = labels.get(variableDecs.body[0]);
    var variableDec = labels.get(declarations.declarations[0]);
    var varId = labels.get(variableDec.id);
    var varInit = labels.get(variableDec.init);

    // check the remaining 4 nodes are in the right structure:
    assert.equal(declarations.type, "VariableDeclaration");
    assert.equal(variableDec.type, "VariableDeclarator");
    assert.equal(varId.type, "Identifier");
    assert.equal(varInit.type, "Literal");
  });

});
