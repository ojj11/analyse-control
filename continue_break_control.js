var morphic = require("morphic");
var either = require("./matchers.js").either;
var matchArray = require("./matchers.js").matchArray;
var flow = require("./utils.js").flow;
var List = require("immutable").List;
var Map = require("immutable").Map;

/**
 * dispatch is a helper which lets us dispatch a call to a node label or list of
 * node labels without having to look up the specific node within the
 * generateFlows method
 */
var dispatch = new morphic();

dispatch.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId")
).then(r => (
  generateFlows(r.list, r.state, r.nodeId, r.list.get(r.nodeId))
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

/**
 * generateFlows is the method that actually generates the flows for a specific
 * node. We start by outlining the things that can be break/continue-d to:
 */
var generateFlows = new morphic();

generateFlows.with(
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
    "break": {node: r.nodeId, type: "end"},
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.body)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": either(["ForInStatement", "ForOfStatement"]),
    "body": morphic.number("body")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "continue": {node: r.body, type: "start"},
    "break": {node: r.nodeId, type: "end"},
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.body)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "update": morphic.number("update"),
    "body": morphic.number("body")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "continue": {node: r.update, type: "start"},
    "break": {node: r.nodeId, type: "end"},
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.body)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "update": null,
    "test": morphic.number("test"),
    "body": morphic.number("body")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "continue": {node: r.test, type: "start"},
    "break": {node: r.nodeId, type: "end"},
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.body)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "ForStatement",
    "update": null,
    "test": null,
    "body": morphic.number("body")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "continue": {node: r.body, type: "start"},
    "break": {node: r.nodeId, type: "end"},
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.body)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "DoWhileStatement",
    "test": morphic.number("test"),
    "body": morphic.number("body")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "continue": {node: r.test, type: "start"},
    "break": {node: r.nodeId, type: "end"},
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.body)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "LabeledStatement",
    "label": morphic.number("label"),
    "body": morphic.number("body")
  }
).then((r) => {
  // this is the label:
  var identifier = r.list.get(r.label).name;
  // we mark this in our state stack - not perfect but it'll do
  return dispatch(r.list, r.state.unshift(new Map({
    "label": identifier
  })), r.body)
});

// the following implementations for generateFlows are for break statements only

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "IfStatement",
    "consequent": morphic.number("consequent"),
    "alternate": morphic.number("alternate")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "labeled-break": {node: r.nodeId, type: "end"}
  })), [r.consequent, r.alternate])
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "IfStatement",
    "consequent": morphic.number("consequent"),
    "alternate": null
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.consequent)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "WithStatement",
    "body": morphic.number("body")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.body)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "BlockStatement",
    "body": matchArray("body")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.body)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "SwitchStatement",
    "cases": matchArray("cases")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "break": {node: r.nodeId, type: "end"},
    "labeled-break": {node: r.nodeId, type: "end"}
  })), r.cases)
));

// remaining block objects that break/continue can exist within

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "SwitchCase",
    "consequent": matchArray("consequent")
  }
).then((r) => (
  dispatch(r.list, r.state, r.consequent)
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "TryStatement",
    "block": morphic.number("block"),
    "handler": morphic.number("handler"),
    "finalizer": null
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "exception": {node: r.handler, type: "start"}
  })), r.block).concat(dispatch(r.list, r.state, r.handler))
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "TryStatement",
    "block": morphic.number("block"),
    "handler": null,
    "finalizer": morphic.number("finalizer")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "exception": {node: r.finalizer, type: "start"}
  })), r.block).concat(dispatch(r.list, r.state, r.finalizer))
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "TryStatement",
    "block": morphic.number("block"),
    "handler": morphic.number("handler"),
    "finalizer": morphic.number("finalizer")
  }
).then((r) => (
  dispatch(r.list, r.state.unshift(new Map({
    "exception": {node: r.handler, type: "start"}
  })), r.block).concat(
    dispatch(r.list, r.state.unshift(new Map({
      "exception": {node: r.finalizer, type: "start"}
    })), r.handler)
  ).concat(dispatch(r.list, r.state, r.finalizer))
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "CatchClause",
    "body": morphic.number("body")
  }
).then((r) => (
  dispatch(r.list, r.state, r.body)
));

// things that cause the control to flow back to one of the statements coded
// above:

generateFlows.with(
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

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "ContinueStatement",
    "label": morphic.number("label")
  }
).then((r) => {
  // this is the label:
  var identifier = r.list.get(r.label).name;
  // get the position in the stack of this label, the node that was unshifted
  // after this (ie -1) will be the labeled statement
  var endNode = r.state.takeUntil((element) => (element.get("label") == identifier)).last();
  return [
    flow(
      {node: r.nodeId, type: "start"},
      endNode.get("continue"))
  ]
});

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "BreakStatement",
    "label": null
  }
).then((r) => (
  [
    flow(
      {node: r.nodeId, type: "start"},
      r.state.find((element) => (element.has("break"))).get("break"))
  ]
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "BreakStatement",
    "label": morphic.number("label")
  }
).then((r) => {
  // this is the label:
  var identifier = r.list.get(r.label).name;
  // get the position in the stack of this label, the node that was unshifted
  // after this (ie -1) will be the labeled statement
  var endNode = r.state.takeUntil((element) => (element.get("label") == identifier)).last();
  return [
    flow(
      {node: r.nodeId, type: "start"},
      endNode.get("labeled-break"))
  ]
});

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "ReturnStatement",
    "argument": null
  }
).then((r) => (
  [
    flow(
      {node: r.nodeId, type: "start"},
      r.state.find((element) => (element.has("return"))).get("return"))
  ]
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "ReturnStatement",
    "argument": morphic.number("argument")
  }
).then((r) => (
  [
    flow(
      {node: r.argument, type: "end"},
      r.state.find((element) => (element.has("return"))).get("return"))
  ]
));

generateFlows.with(
  morphic.Object("list"),
  morphic.Object("state"),
  morphic.number("nodeId"),
  {
    "type": "ThrowStatement",
    "argument": morphic.number("argument")
  }
).then((r) => (
  [
    flow(
      {node: r.argument, type: "end"},
      r.state.find((element) => (element.has("exception"))).get("exception"))
  ]
));

generateFlows.otherwise().return([]);

/**
 * Gets the node id to return/throw to - this is different depending on whether
 * the node being analysed is a function or a program node
 */
function getTopLevelEndNodeId(node) {
  if (node[1].type == "Program") {
    return node[0];
  } else {
    return node[1].body;
  }
}

module.exports = (list) => (
  // get list as [index, value] pairs
  list.entrySeq().filter((node) => (
    // we want to process all top level nodes seperately (ie a break in a
    // loop in a function, should not break to the loop that the function is
    // contained in (not that functions should be defined in loop statements))
    node[1].type == "Program" ||
      node[1].type == "FunctionDeclaration" ||
      node[1].type == "FunctionExpression" ||
      node[1].type == "ArrowFunctionExpression"
  )).flatMap((node) => (
    // dispatch our control flow program over the node indexes left
    dispatch(
      list,
      new List([
        new Map({
          "exception": {"node": getTopLevelEndNodeId(node), "type": "end"},
          "return": {"node": getTopLevelEndNodeId(node), "type": "end"}
        })]),
      node[1].body
    )
  )).toList()
)
