// @flow

var morphic = require("morphic");
var either = require("./matchers.js").either;
var matchArray = require("./matchers.js").matchArray;
var flow = require("./utils.js").flow;
var List = require("immutable").List;
var Map = require("immutable").Map;

var blockKeys = new List([
  "consequent",
  "alternate",
  "body",
  "test",
  "init",
  "left",
  "declarations"
]);

/**
 * dispatch is a helper which lets us dispatch a call to a node label or list of
 * node labels without having to look up the specific node within the
 * flowProrgam
 */
var dispatch = new morphic();

dispatch.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId")
).then(r => (
  flowProgram(r.list, r.state, r.nodeId, r.list.get(r.nodeId))
));

dispatch.with(
  morphic.Object("list"),
  morphic.Object("state"),
  matchArray("array")
).then(r => (
  List(r.array).flatMap((id) => (
    dispatch(r.list, r.state, id)
  ))
));

var flowProgram = new morphic();

flowProgram.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "WhileStatement",
    "test": morphic.number("test"),
    "body": morphic.number("body")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "continue": {node: r.test, type: "start"},
    "break": {node: r.nodeId, type: "end"}
  })), r.body)
));

flowProgram.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "ContinueStatement",
    "label": null
  }
).then((r) => (
  [
    flow(
      {node: r.nodeId, type: "start"},
      r.state.find((element) => (element.has("continue"))).get("continue"))
  ]
));

flowProgram.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": either([
      "Program",
      "IfStatement",
      "LabeledStatement",
      "BlockStatement",
      // "WhileStatement",
      "DoWhileStatement",
      "ForStatement",
      "ForOfStatement",
      "SwitchStatement",
      "WithStatement",
      "ForOfStatement"
    ])
  }
).then((r, list, state, id, input) => (
  blockKeys.filter(key => input[key] != undefined)
    .flatMap(key => dispatch(r.list, r.state, input[key]))
));

flowProgram.otherwise().return([]);

module.exports = (list) => (
  // get list as [index, value] pairs
  list.entrySeq().filter((element) => (
    // filter out non-top-level value types
    element[1].type == "Program" ||
      element[1].type == "FunctionDeclaration" ||
      element[1].type == "FunctionExpression"
  )).flatMap((element) => (
    // dispatch our control flow program over the node indexes left
    dispatch(
      list,
      new List([]),
      element[0]
    )
  )).toList()
)
