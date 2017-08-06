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
 * Gets the type of incoming edge that came into this node, either "hoist" when
 * variable hoisting, or "flow" when an actual execution path
 */
Flow.prototype.getFlowType = function() {
  return this.type;
}

/**
 * Gets whether we are entering this node. For example:
 * > { statement1; }
 * We would first enter the BlockStatement, then enter statement1, then exit
 * statement1, then exit the BlockStatement. So we would visit both nodes twice
 * once in the entrance capacity and once in their exit capacity.
 * Will be either "enter" or "exit"
 */
Flow.prototype.isEnter = function() {
  return this.node.type == "start"
}

Flow.prototype.isExit = function() {
  return this.node.type == "end"
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
  });
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
  });
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
      out, flows, {node: 0, type: "startHoist"}, "terminal"
    )),
    getEndOfFlow: () => (new Flow(
      out, flows, {node: 0, type: "end"}, "terminal"
    )),
    getNode: (node) => (out.get(node)),
  }
}
