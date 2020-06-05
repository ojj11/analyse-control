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

var dispatcher = new morphic();
var enumerate = new morphic();

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
    "type": "Program",
    "body": morphic.Object("elements")
  }
).then(
  (r, list, id, input) => dispatcher(r.list, r.elements)
);

enumerate.with(
  morphic.Object("list"),
  morphic.Number("id"),
  {
    "type": "VariableDeclaration",
    "declarations": morphic.Object("elements")
  }
).then(
  (r, list, id, input) => dispatcher(r.list, r.elements)
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

module.exports = function hoist(nodeList) {

  var flows = [];

  var declarations = dispatcher(nodeList, 0);

  var end = {
    node: 0,
    type: "hoist"
  };

  declarations.forEach(declaration => {
    var node = {node: declaration, type: "hoist"}
    flows.push(hoistNode(end, node));
    end = node;
  });

  flows.push(hoistNode(end, {
    node: 0,
    type: "start"
  }));

  return flows;
}
