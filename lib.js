var generateLabels = require("./label");
var basic = require("./basic_control");
var continue_and_break = require("./continue_break_control");
var hoist = require("./hoist");
var switchControl = require("./switch_control");
var immutable = require("immutable");

/**
 * Creates a new flow given the node list, all the flows, and specifically which
 * flow this object should represent and the type of edge
 */
function Flow(nodeList, flows, node, type) {
  this.nodeList = nodeList;
  this.flows = flows;
  this.node = node;
  this.type = type;
}

/**
 * Gets the node, this is similar to an AST node, but with all inner nodes
 * replaced by numbers to make the structure easier to persist to disk
 */
Flow.prototype.getNode = function() {
  return this.nodeList.get(this.node.node);
}

/**
 * Gets a unique identifier for this flow, this will be an integer for quick
 * comparison where the number of AST nodes is small enough
 */
Flow.prototype.getId = function() {
  if (this.node.node > ((Number.MAX_SAFE_INTEGER - 2) / 3) - 1) {
    return this.node.node + "." + this.node.type;
  }
  var id = 3 * (this.node.node + 1);
  switch(this.node.type) {
    case "start":
      id += 0;
      break;
    case "end":
      id += 1;
      break;
    case "hoist":
      id += 2;
      break;
  }
  return id;
}

/**
 * Gets whether we are entering this node. For example:
 * > { statement1; }
 * We would first enter the BlockStatement, then enter statement1, then exit
 * statement1, then exit the BlockStatement. So we would visit both nodes twice
 * once in their entrance capacity and once in their exit capacity.
 */
Flow.prototype.isEnter = function() {
  return this.node.type == "start"
}

/**
 * Gets whether we are exiting this node. For example:
 * > { statement1; }
 * We would first enter the BlockStatement, then enter statement1, then exit
 * statement1, then exit the BlockStatement. So we would visit both nodes twice
 * once in their entrance capacity and once in their exit capacity.
 */
Flow.prototype.isExit = function() {
  return this.node.type == "end"
}

/**
 * Gets whether we are hoisting this node. For example:
 * > { var x; statement1; }
 * We would first hoist the variable declaration for "x", then we would enter
 * the BlockStatement, then enter the variable declaration, etc
 * There's more on this here: https://www.w3schools.com/js/js_hoisting.asp
 * Note that this implements Chrome/IE/Safari hoisting, not Firefox
 */
Flow.prototype.isHoist = function() {
  return this.node.type == "hoist"
}

/**
 * Get all the statements which flow into this one. I.e. given:
 *  > statement1; statement2; statement3;
 * If we call statement2.getBackwardsFlows, we'd get [statement1]. Note the
 * output is a list, as multiple edges can come into a statement
 */
Flow.prototype.getBackwardsFlows = function() {
  return this.flows.filter((value) => {
    return this.node.type == value.end.type && this.node.node == value.end.node;
  }).map((flow) => {
    return new Flow(this.nodeList, this.flows, flow.start, flow.type)
  }).toJS();
}

/**
 * Get all the statements which flow out of this one. I.e. given:
 *  > statement1; statement2; statement3;
 * If we call statement2.getForwardFlows, we'd get [statement3]. Note the
 * output is a list, as this node could go on to multiple statements
 */
Flow.prototype.getForwardFlows = function() {
  return this.flows.filter((value) => {
    return this.node.type == value.start.type && this.node.node == value.start.node;
  }).map((flow) => {
    return new Flow(this.nodeList, this.flows, flow.end, flow.type)
  }).toJS();
}

/**
 * Gets the flows from a given AST. Call .getStartOfFlow() or .getEndOfFlow() to
 * grab the start or end statements. Call .getNode(n) to get a node from a
 * specific index
 */
module.exports = function(ast) {
  var out = generateLabels(ast);

  var basic_control = basic(out);
  var continue_and_break_control = continue_and_break(out);
  var hoist_control = hoist(out);
  var switch_control = switchControl(out);

  var flows = immutable.List(hoist_control)
    .concat(basic_control)
    .concat(continue_and_break_control)
    .concat(switch_control);

  return {
    getStartOfFlow: () => (new Flow(
      out, flows, {node: 0, type: "hoist"}, "hoist"
    )),
    getEndOfFlow: () => (new Flow(
      out, flows, {node: 0, type: "end"}, "end"
    )),
    getNode: (node) => (out.get(node)),
  }
}
