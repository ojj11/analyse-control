// @flow

var morphic = require("morphic");
var either = require("./matchers.js").either;
var matchArray = require("./matchers.js").matchArray;
var flatten = require("./utils.js").flatten;

function flow(a, b) {
  if (a == undefined || b == undefined) {
    throw new Error("we tried to create a flow between undefined points");
  }
  return {
    "type": "flow",
    "start": a,
    "end": b
  };
}

function generateFlowsThroughArrayWithStartAndEnd(r) {
  var nodes = [r.startNode];
  r.array.forEach(element => {
    nodes.push(
      {node: element, type: "start"},
      {node: element, type: "end"});
  });
  nodes.push(r.endNode);
  var flows = [];
  for (var i = 0; i < nodes.length; i += 2) {
    flows.push(flow(nodes[i], nodes[i+1]));
  }
  return flows;
}

function generateFlowsThroughArray(r) {
  r.startNode = {node: r.nodeId, type: "start"};
  r.endNode = {node: r.nodeId, type: "end"};
  return generateFlowsThroughArrayWithStartAndEnd(r);
}

function generateFlowsThroughSingleElement(r) {
  return [
    flow({node: r.nodeId, type: "start"}, {node: r.element, type: "start"}),
    // r.element.start -> r.element.end will be calculated by that element
    flow({node: r.element, type: "end"}, {node: r.nodeId, type: "end"})
  ];
}

var flowProgram = new morphic();

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": either([
      "CallExpression",
      "NewExpression"
    ]),
    "callee": morphic.number("callee"),
    "arguments": matchArray("args")
  }
).then(
  r => {
    // function (a1, a2, ...) -> start -> callee -> a1 -> a2 -> end

    var flows = generateFlowsThroughArrayWithStartAndEnd({
      array: r.args,
      startNode: {node: r.callee, type: "end"},
      endNode: {node: r.nodeId, type: "end"}
    });

    flows.push(
      flow({node: r.nodeId, type: "start"}, {node: r.callee, type: "start"}));

    return flows;
  }
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": either([
      "Literal",
      "Identifier",
      "DebuggerStatement",
      "ThisExpression",
      "EmptyStatement",
      "BreakStatement",
      "ContinueStatement",
      "FunctionExpression",
      "FunctionDeclaration",
      "ArrowFunctionExpression"
    ])
  }
).then(
  r => [
    flow({node: r.nodeId, type: "start"}, {node: r.nodeId, type: "end"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "Program",
    "body": matchArray("array")
  }
).then(generateFlowsThroughArray);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "BlockStatement",
    "body": matchArray("array")
  }
).then(generateFlowsThroughArray);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ExpressionStatement",
    "expression": morphic.number("element")
  }
).then(generateFlowsThroughSingleElement);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": either([
      "UnaryExpression",
      "UpdateExpression",
    ]),
    "argument": morphic.number("element")
  }
).then(generateFlowsThroughSingleElement);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ReturnStatement",
    "argument": null
  }
).return([]);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": either([
      "ReturnStatement",
      "ThrowStatement"
    ]),
    "argument": morphic.number("element")
  }
).then(r => [
  flow({node: r.nodeId, type: "start"}, {node: r.element, type: "start"})
]);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "VariableDeclaration",
    "declarations": matchArray("array")
  }
).then(generateFlowsThroughArray);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "VariableDeclarator",
    "init": morphic.number("element")
  }
).then(generateFlowsThroughSingleElement);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "IfStatement",
    "test": morphic.number("test"),
    "consequent": morphic.number("consequent"),
    "alternate": morphic.number("alternate")
  }
).then(
  r => [
    flow({node: r.nodeId, type: "start"}, {node: r.test, type: "start"}),
    flow({node: r.test, type: "end"}, {node: r.consequent, type: "start"}),
    flow({node: r.test, type: "end"}, {node: r.alternate, type: "start"}),
    flow({node: r.consequent, type: "end"}, {node: r.nodeId, type: "end"}),
    flow({node: r.alternate, type: "end"}, {node: r.nodeId, type: "end"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "IfStatement",
    "test": morphic.number("test"),
    "consequent": morphic.number("consequent"),
    "alternate": null
  }
).then(
  r => [
    flow({node: r.nodeId, type: "start"}, {node: r.test, type: "start"}),
    flow({node: r.test, type: "end"}, {node: r.nodeId, type: "end"}),
    flow({node: r.test, type: "end"}, {node: r.consequent, type: "start"}),
    flow({node: r.consequent, type: "end"}, {node: r.nodeId, type: "end"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "WhileStatement",
    "test": morphic.number("test"),
    "body": morphic.number("body")
  }
).then(
  r => [
    flow({node: r.nodeId, type: "start"}, {node: r.test, type: "start"}),
    flow({node: r.test, type: "end"}, {node: r.nodeId, type: "end"}),
    flow({node: r.test, type: "end"}, {node: r.body, type: "start"}),
    flow({node: r.body, type: "end"}, {node: r.test, type: "start"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "DoWhileStatement",
    "test": morphic.number("test"),
    "body": morphic.number("body")
  }
).then(
  r => [
    flow({node: r.nodeId, type: "start"}, {node: r.body, type: "start"}),
    flow({node: r.body, type: "end"}, {node: r.test, type: "start"}),
    flow({node: r.test, type: "end"}, {node: r.body, type: "start"}),
    flow({node: r.test, type: "end"}, {node: r.nodeId, type: "end"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "WithStatement",
    "object": morphic.number("object"),
    "body": morphic.number("body")
  }
).then(
  r => [
    flow({node: r.nodeId, type: "start"}, {node: r.object, type: "start"}),
    flow({node: r.object, type: "end"}, {node: r.body, type: "start"}),
    flow({node: r.body, type: "end"}, {node: r.nodeId, type: "end"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ArrayExpression",
    "elements": matchArray("elements")
  }
).then(
  r => generateFlowsThroughArray({
    array: r.elements.filter(x => x != null),
    nodeId: r.nodeId
  })
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ObjectExpression",
    "properties": matchArray("array")
  }
).then(generateFlowsThroughArray);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "Property",
    "value": morphic.number("element")
  }
).then(generateFlowsThroughSingleElement);

flowProgram.otherwise().then(
  (_1, _2, input) => {
    console.log("no specific rules for ", input.type);
  }
);

module.exports = function controlFlow(nodeList) {
  return flatten(nodeList.map((element, id) => flowProgram(id, element)));
}


// END FLOW PROGRAM
//
// var start = Date.now();
//
// var tester = require("fs").readFileSync("components/Everything/test.js").toString().split(/===+/);
//
// console.log("read took " + (Date.now() - start));
// start = Date.now();
//
// var ast = acorn.parse(tester[0]);
//
// console.log("AST gen took " + (Date.now() - start));
// start = Date.now();
//
// var expected = tester[1].trim();
//
// generateLabels(ast);
//
// console.log("generating labels took " + (Date.now() - start));
// start = Date.now();
//
// console.log("hoisting took " + (Date.now() - start));
// start = Date.now();
//
// // console.log(ast);
//
// var flows = varFlows.concat(flowProgram(ast));
//
// console.log("flowing took " + (Date.now() - start));
// start = Date.now();

// var flows2 = flattenNodes.map((node, key) => {
//   node.flows = flows.filter(flow => flow.end.node == key || flow.start.node == key);
//   return node;
// });

// console.log(JSON.stringify(flows2, null, 2));

// console.log(flows);


//
// function output(flows, parsed, id) {
//   var toProcess = flows.filter(flow => flow.start == id);
//   return toProcess
//       .sort((a,b) => uuidToNode[b.end].node.start - uuidToNode[a.end].node.start)
//       .reduce(
//         (p,c) => (output(p.remaining, p.parsed, c.end)),
//         {
//           parsed: parsed.concat.apply(parsed, toProcess),
//           remaining: flows.filter(a => toProcess.indexOf(a) == -1)
//         });
// }
//
// var walk = output(flows, [], ast.labels.start).parsed.map(
//   flow => {
//     var start = uuidToNode[flow.start];
//     var end = uuidToNode[flow.end];
//     return start.node.type + ":" + start.type + " -> " + end.node.type + ":" + end.type;
//   }).join("\n");
//
// console.log("outputting took " + (Date.now() - start));
// start = Date.now();
//
// if(expected != walk) {
//   console.log("Got: ---");
//   console.log(walk);
//   console.log("Expected: ---");
//   console.log(expected);
// }
