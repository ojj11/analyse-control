var morphic = require("morphic");
var either = require("./matchers.js").either;
var matchArray = require("./matchers.js").matchArray;
var flatten = require("./utils.js").flatten;

function hoistNode(a, b) {
  if (a == undefined || b == undefined) {
    throw new Error("tried to create a hoisting flow between undefined points");
  }
  return {
    "type": "hoist",
    "start": a,
    "end": b
  };
}

var blockKeys = [
  "consequent",
  "alternate",
  "body",
  "test",
  "init",
  "left",
  "declarations"
];

var dispatcher = new morphic();
var enumerate = new morphic();
var getScopes = new morphic();

dispatcher.with(
  morphic.Object("list"),
  morphic.number("nodeId")
).then(r => enumerate(r.list, r.nodeId, r.list.get(r.nodeId)));

dispatcher.with(
  morphic.Object("list"),
  matchArray("nodes")
).then(r => flatten(r.nodes.map(id => enumerate(r.list, id, r.list.get(id)))));

enumerate.with(
  morphic.Object("list"),
  morphic.Number("id"),
  {
    "type": either([
      "IfStatement",
      "LabeledStatement",
      "BlockStatement",
      "WhileStatement",
      "DoWhileStatement",
      "ForStatement",
      "ForOfStatement",
      "ForInStatement",
      "Program",
      "VariableDeclaration"
    ])
  }
).then(
  (r, list, id, input) => flatten(blockKeys
    .filter(key => input[key] != undefined)
    .map(key => dispatcher(r.list, input[key])))
);

enumerate.with(
  morphic.Object("list"),
  morphic.Number("id"),
  {
    "type": either([
      "FunctionDeclaration",
      "VariableDeclarator"
    ])
  }
).then((r, list, id, obj) => [id]);

enumerate.otherwise().return([]);

getScopes.with(
  morphic.Number("id"),
  {
    "type": "Program"
  }
).then((r) => [r.id]);

getScopes.with(
  morphic.Number(),
  {
    "type": either([
      "FunctionDeclaration",
      "FunctionExpression",
      "ArrowExpression"
    ]),
    "body": morphic.Number("id")
  }
).then((r) => [r.id]);

getScopes.otherwise().return([]);

function hoistScope(entryNode, nodeList) {
  var flows = [];

  var declarations = dispatcher(nodeList, entryNode);

  var end = {
    node: entryNode,
    type: "hoist"
  };

  declarations.forEach(declaration => {
    var node = {node: declaration, type: "hoist"}
    flows.push(hoistNode(end, node));
    end = node;
  });

  flows.push(hoistNode(end, {
    node: entryNode,
    type: "start"
  }));

  return flows;
}

module.exports = function hoist(nodeList) {

  return nodeList.flatMap((node, i) => getScopes(i, node))
    .flatMap((entry) => (hoistScope(entry, nodeList)))
    .toJS();
}
