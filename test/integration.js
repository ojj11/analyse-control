var analyse = require("../");
var acorn = require("acorn");
var immutable = require("immutable");
var assert = require("assert");

describe("integration", function() {

  it("should be able to get flow for a simple program", function() {

    var input = `
      while(true) {
        console.log("hello world");
      }
    `;

    var ast = acorn.parse(input);

    var flow = analyse(ast);

    // we'd expect a control flow (roughly) like:
    //  Program while true { ... } console... ...log()
    // 0    | ---> |
    // 1           | -> |
    // 2           | <- |
    // 3           | --------> |
    // 4                       | ----------> |
    // 5                               | <-- |
    // 6                               | --> |
    // 7                       | <---------- |
    // 8           | <-------- |
    //
    //                    ( back to step 3 again )
    //                    (     or terminate:    )
    //
    // 9   | <--- |

    var visitedNodes = immutable.List();

    // given that this should loop forever, we only evaluate 40 control flow
    // steps:
    var currentExecution = immutable.Set([flow.getStartOfFlow()]);

    for(var iteration = 0; iteration < 40; iteration += 1) {
      var currentExecution = immutable.Set(
        currentExecution.map((flow) => (
          immutable.List(flow.getForwardFlows()))).flatten());
      visitedNodes = visitedNodes.concat(
        currentExecution.filter((flow) => flow.isEnter())
          .map((flow) => flow.getNode().type))
      if (currentExecution.size == 0) {
        assert.fail("Shouldn't terminate - endless program");
      }
    }

    // we'd expect to visit the CallExpression more than once:
    assert.ok(visitedNodes.filter((type) => type == "CallExpression").size > 1);

  });

  it("should work for README example", function() {
    var ast = acorn.parse([
      "if (x) {",
      "  hello();",
      "} else {",
      " world();",
      "}"
    ].join("\n"));

    var flow = analyse(ast);

    function countBranches(node, visited) {
      var nodeId = node.getId();
      var outgoing = node.getForwardFlows();
      if (visited.indexOf(nodeId) != -1) {
        // we've visited this node before - we're in a loop
        return Infinity;
      }
      if (outgoing.length == 0) {
        // we've reached the termination of this control flow
        return 1;
      }
      return outgoing.reduce((counter, node) => (
        counter + countBranches(node, visited.concat(nodeId))
      ), 0);
    }

    assert.equal(2, countBranches(flow.getStartOfFlow(), []));
  });

  it("should print example output", function() {
    var ast = acorn.parse([
      "{",
      "  helloWorld();",
      "}"
    ].join("\n"));

    var flow = analyse(ast).getStartOfFlow();

    var nodes = [];

    while(flow != undefined) {
      var type = "";
      if (flow.isHoist()) {
        type = "hoist";
      }
      if (flow.isEnter()) {
        type = "enter";
      }
      if (flow.isExit()) {
        type = "exit";
      }
      nodes.push(flow.getNode().type + ": " + type);
      flow = flow.getForwardFlows()[0];
    }

    assert.deepEqual([
      "Program: hoist",
      "Program: enter",
      "BlockStatement: enter",
      "ExpressionStatement: enter",
      "CallExpression: enter",
      "Identifier: enter",
      "Identifier: exit",
      "CallExpression: exit",
      "ExpressionStatement: exit",
      "BlockStatement: exit",
      "Program: exit"
    ], nodes);
  });

});
