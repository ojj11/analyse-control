// @flow

var morphic = require("morphic");
var either = require("./matchers.js").either;
var matchArray = require("./matchers.js").matchArray;
var flow = require("./utils.js").flow;

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

// this is the end of the flow for these statements, we revisit these in
// complex_control.js
flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": either([
      "BreakStatement",
      "ContinueStatement"
    ])
  }
).return([]);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": either([
      "Program",
      "BlockStatement"
    ]),
    "body": matchArray("array")
  }
).then(generateFlowsThroughArray);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "LabeledStatement",
    "body": morphic.number("element")
  }
).then(generateFlowsThroughSingleElement);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "BinaryExpression",
    "left": morphic.number("left"),
    "right": morphic.number("right")
  }
).then(r => generateFlowsThroughArray({
  nodeId: r.nodeId,
  array: [r.left, r.right]
}));

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
    "type": either([
      "IfStatement",
      "ConditionalExpression"
    ]),
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
    "type": "MemberExpression",
    "object": morphic.number("element"),
    "computed": false
  }
).then(generateFlowsThroughSingleElement);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "MemberExpression",
    "object": morphic.number("object"),
    "property": morphic.number("property"),
    "computed": true
  }
).then(
  r => generateFlowsThroughArray({
    array: [r.object, r.property],
    nodeId: r.nodeId
  })
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

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "AssignmentExpression",
    "right": morphic.number("element")
  }
).then(generateFlowsThroughSingleElement);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "LogicalExpression",
    "left": morphic.number("left"),
    "right": morphic.number("right")
  }
).then(r => [
  flow({node: r.nodeId, type: "start"}, {node: r.left, type: "start"}),
  flow({node: r.left, type: "end"}, {node: r.nodeId, type: "end"}),
  flow({node: r.left, type: "end"}, {node: r.right, type: "start"}),
  flow({node: r.right, type: "end"}, {node: r.nodeId, type: "end"})
]);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "SwitchStatement",
    "discriminant": morphic.number("discriminant"),
    "cases": matchArray("cases")
  }
).then(
  r => generateFlowsThroughArrayWithStartAndEnd({
    "array": r.cases,
    "startNode": {node: r.discriminant, type: "end"},
    "endNode": {node: r.nodeId, type: "end"}
  }).concat(
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.discriminant, type: "start"}))
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "TryStatement",
    "block": morphic.number("block"),
    "handler": morphic.number("handler"),
    "finalizer": morphic.number("finalizer")
  }
).then(r => generateFlowsThroughArray({
    "array": [r.block, r.finalizer],
    "nodeId": r.nodeId
}).concat(
  flow(
    {node: r.handler, type: "end"},
    {node: r.finalizer, type: "start"}))
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "TryStatement",
    "block": morphic.number("block"),
    "handler": null,
    "finalizer": morphic.number("finalizer")
  }
).then(r => generateFlowsThroughArray({
    "array": [r.block, r.finalizer],
    "nodeId": r.nodeId
}));

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "TryStatement",
    "block": morphic.number("block"),
    "handler": morphic.number("handler"),
    "finalizer": null
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.block, type: "start"}),
    flow(
      {node: r.block, type: "end"},
      {node: r.nodeId, type: "end"}),
    flow(
      {node: r.handler, type: "end"},
      {node: r.nodeId, type: "end"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "SequenceExpression",
    "expressions": matchArray("array")
  }
).then(generateFlowsThroughArray);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "init": morphic.number("init"),
    "test": morphic.number("test"),
    "update": morphic.number("update"),
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.init, type: "start"}),
    flow(
      {node: r.init, type: "end"},
      {node: r.test, type: "start"}),
    flow(
      {node: r.test, type: "end"},
      {node: r.nodeId, type: "end"}),
    flow(
      {node: r.test, type: "end"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.update, type: "start"}),
    flow(
      {node: r.update, type: "end"},
      {node: r.test, type: "start"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "init": null,
    "test": morphic.number("test"),
    "update": morphic.number("update"),
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.test, type: "start"}),
    flow(
      {node: r.test, type: "end"},
      {node: r.nodeId, type: "end"}),
    flow(
      {node: r.test, type: "end"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.update, type: "start"}),
    flow(
      {node: r.update, type: "end"},
      {node: r.test, type: "start"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "init": morphic.number("init"),
    "test": null,
    "update": morphic.number("update"),
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.init, type: "start"}),
    flow(
      {node: r.init, type: "end"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.update, type: "start"}),
    flow(
      {node: r.update, type: "end"},
      {node: r.body, type: "start"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "init": morphic.number("init"),
    "test": morphic.number("test"),
    "update": null,
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.init, type: "start"}),
    flow(
      {node: r.init, type: "end"},
      {node: r.test, type: "start"}),
    flow(
      {node: r.test, type: "end"},
      {node: r.nodeId, type: "end"}),
    flow(
      {node: r.test, type: "end"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.test, type: "start"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "init": morphic.number("init"),
    "test": null,
    "update": null,
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.init, type: "start"}),
    flow(
      {node: r.init, type: "end"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.body, type: "start"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "init": null,
    "test": null,
    "update": morphic.number("update"),
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.update, type: "start"}),
    flow(
      {node: r.update, type: "end"},
      {node: r.body, type: "start"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "init": null,
    "test": morphic.number("test"),
    "update": null,
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.test, type: "start"}),
    flow(
      {node: r.test, type: "end"},
      {node: r.nodeId, type: "end"}),
    flow(
      {node: r.test, type: "end"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.test, type: "start"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "init": null,
    "test": null,
    "update": null,
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.body, type: "start"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "SwitchCase",
    "test": morphic.number("test"),
    "consequent": matchArray("consequents")
  }
).then(
  r => generateFlowsThroughArrayWithStartAndEnd({
    "array": r.consequents,
    "startNode": {node: r.test, type: "end"},
    "endNode": {node: r.nodeId, type: "end"}
  }).concat(
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.test, type: "start"}))
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "CatchClause",
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.nodeId, type: "end"})
  ]
);

flowProgram.with(
  morphic.number("nodeId"),
  {
    "type": "ForInStatement",
    "right": morphic.number("object"),
    "body": morphic.number("body")
  }
).then(r => [
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.object, type: "start"}),
    flow(
      {node: r.object, type: "end"},
      {node: r.nodeId, type: "end"}),
    flow(
      {node: r.object, type: "end"},
      {node: r.body, type: "start"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.nodeId, type: "end"}),
    flow(
      {node: r.body, type: "end"},
      {node: r.body, type: "start"})
  ]
);

flowProgram.otherwise().then(
  (_1, _2, input) => {
    throw new Error("No specific rules for given " + input.type);
  }
);

module.exports = (nodeList) => (
  nodeList.flatMap((element, id) => flowProgram(id, element))
);
