var analyse = require("./");

/**
 * Get the line number for this node
 */
function getLineNumber(node) {
  if (node.getNode().loc == undefined) {
    throw new Error("Run acorn with locations set to true");
  }
  if (node.isExit()) {
    return node.getNode().loc.end.line;
  } else {
    return node.getNode().loc.start.line;
  }
}

/**
 * Get all the flows from a given node onwards. Returns only flows that move
 * between lines, and are not hoisting flows.
 */
function getFlows(node, visited, executableLines) {
  var nodeId = node.getId();
  if (visited.indexOf(nodeId) != -1) {
    // we've visited this node before - we will have already included all flows
    return [];
  }

  // capture the lines which are executable for later consumption
  executableLines.push(node.getNode().loc.start.line);
  executableLines.push(node.getNode().loc.end.line);

  // BlockStatements tend to create misleading visualisations because egyptian
  // brackets actually start on the same line as the if-statement
  if (node.getNode().type == "BlockStatement") {
    return node.getForwardFlows().reduce((prev, outgoing) => (
      prev.concat(getFlows(outgoing, visited.concat(nodeId), executableLines))
    ), []);
  }

  // get the correct line number
  var startLine = getLineNumber(node);

  var forwardFlows = node.getForwardFlows();

  // again, unbox any BlockStatements
  forwardFlows = forwardFlows.map((node) => {
    if (node.getNode().type == "BlockStatement") {
      return node.getForwardFlows();
    } else {
      return node;
    }
  }).flat();

  // return all flows where this isn't a hoist and doesn't start and end on the
  // same line
  return forwardFlows.reduce((prev, outgoing) => {
    var endLine = getLineNumber(outgoing);

    if (!node.isHoist() && startLine != endLine) {
      return prev.concat(
        getFlows(outgoing, visited.concat(nodeId), executableLines).concat(
          [[startLine, endLine]]));
    } else {
      return prev.concat(
        getFlows(outgoing, visited.concat(nodeId), executableLines));
    }
  }, []);
}

/**
 * Remove any duplicates from the input
 */
function removeDuplicates(input) {
  return input.filter((e,i,a) => (
    a.slice(0, i).indexOf(e) == -1
  ));
}

/**
 * Remove any duplicates from the input
 */
function removeDuplicateFlows(input) {
  return input.filter((e,i,a) => (
    a.slice(0, i).findIndex((n) => n[0] == e[0] && n[1] == e[1]) == -1
  ));
}

/**
 * Filter our flows to include only those flows that are:
 * - branching
 * - go in the opposite direction
 * - jump over executable code
 */
function findInterestingFlows(flows, executableLines) {
  return flows.filter((node) => {
    var outgoing = flows.filter((n2) => node[0] == n2[0]).length > 1;
    return outgoing ||
      node[1] < node[0] ||
      node[1] > executableLines[executableLines.indexOf(node[0]) + 1];
  });
}

/**
 * Calculates the depth at which an arrow should be rendered, where there are
 * overlapping arrows, then the depth will be increased.
 * Lower depth values are preserved for the biggest overlapping jumps - render
 * the smallest depth value on the outside
 */
function calculateArrowDepth(flowsIn) {

  // duplicate our input:
  var flows = flowsIn.map((node) => ([node[0], node[1]]));

  // sort biggest jump to smallest jump, where there are two jumps of equal
  // length, sort the lowest line number to the top
  flows.sort((a,b) => {
    var s = Math.abs(a[0] - a[1]) - Math.abs(b[0] - b[1]);
    if (s == 0) {
      return a[0] - b[0];
    } else {
      return s;
    }
  });

  // calculate our depth by finding the last overlapping range and adding one
  // to it's depth:
  flows.forEach((node1, i) => {
    var start1 = Math.min(node1[0], node1[1]);
    var end1 = Math.max(node1[0], node1[1]);
    var previousArrows = flows.slice(0, i).reverse();
    var overlap = previousArrows.find((node2) => {
      var start2 = Math.min(node2[0], node2[1]);
      var end2 = Math.max(node2[0], node2[1]);
      // check if these overlap
      return end1 > start2 && end2 > start1
    });
    if (overlap != undefined) {
      // these overlap - take the last greatest depth and add one:
      node1.push(overlap[2] + 1);
    } else {
      // no overlap - this can be as shallow as we wish:
      node1.push(0);
    }
  });

  return flows;
}

/**
 * Get the depth from the previous function
 */
function getDepth(node) {
  return node[2];
}

/**
 * Will return a string representation of the control flow from analyse and
 * associated source code. Provide options to customise output. For example,
 * to print only the flow, and to provide a different flow style try:
 * {
 *   "printLines": true,
 *   "gutterSeperator": "┤ ",
 *   "defaultSpacer": "┄",
 *   "verticalLineCharacter": "│",
 *   "horizontalLineCharacter": "┄",
 *   "endArrowCharacter": "┄",
 *   "defaultVerticalConnector": "⚬",
 *   "upVerticalConnector": "↑",
 *   "downVerticalConnector": "↓"
 * }
 */
module.exports = function(flow, input, options) {

  options = options || {};
  options.printLines = options.printLines == undefined
    ? true
    : options.printLines;
  options.gutterSeparator = options.gutterSeparator == undefined
    ? "│ "
    : options.gutterSeparator;
  options.defaultSpacer = options.defaultSpacer || " ";
  options.verticalLineCharacter = options.verticalLineCharacter || "|";
  options.horizontalLineCharacter = options.horizontalLineCharacter || "-";
  options.endArrowCharacter = options.endArrowCharacter || ">";
  options.defaultVerticalConnector = options.defaultVerticalConnector || "+";
  options.upVerticalConnector = options.upVerticalConnector || "+";
  options.downVerticalConnector = options.downVerticalConnector || "+";

  var nodes = [flow.getStartOfFlow()];

  var executableLines = [];
  var flowsBetweenLines = getFlows(flow.getStartOfFlow(), [], executableLines);

  flowsBetweenLines = flow.getMethods().reduce((prev, method) => (
    prev.concat(getFlows(method.getStartOfFlow(), [], executableLines))
  ), flowsBetweenLines);

  executableLines = removeDuplicates(executableLines).sort((a,b) => (a-b));
  flowsBetweenLines = removeDuplicateFlows(flowsBetweenLines);

  flowsBetweenLines = findInterestingFlows(flowsBetweenLines, executableLines);

  flowsBetweenLines = calculateArrowDepth(flowsBetweenLines);

  // get the largest depth arrow to calculate our "gutter" size - i.e. the space
  // down the left of the code we should render in. Multiply by 2 to allow us to
  // space out arrows:
  var gutterWidth = (Math.max.apply(
    undefined, flowsBetweenLines.map((f) => f[2]).concat(0)) * 2) + 2;

  var lines = input.split("\n");

  var arrows = [];

  for (var line = 1; line <= lines.length; line += 1) {
    var lineArrows = [];

    var startDepth = Math.max.apply(
      undefined, flowsBetweenLines.filter((f) => (f[0] == line)).map(getDepth));
    var endDepth = Math.max.apply(
      undefined, flowsBetweenLines.filter((f) => (f[1] == line)).map(getDepth));
    var maxDepth = Math.max(startDepth, endDepth) * 2;

    if (maxDepth > -1) {
      for (var i = 0; i < maxDepth + 2; i += 1) {
        lineArrows[i] = options.horizontalLineCharacter;
      }
      flowsBetweenLines.filter((f) => (f[0] == line || f[1] == line))
        .map(getDepth)
        .forEach((indent) => {
          lineArrows[(indent * 2) + 2] = options.defaultVerticalConnector;
        });

      flowsBetweenLines.filter((f) => (f[1] == line && f[1] < f[0]))
        .map(getDepth)
        .forEach((indent) => {
          lineArrows[(indent * 2) + 2] = options.upVerticalConnector;
        });

      flowsBetweenLines.filter((f) => (f[1] == line && f[1] > f[0]))
        .map(getDepth)
        .forEach((indent) => {
          lineArrows[(indent * 2) + 2] = options.downVerticalConnector;
        });
    }

    if (endDepth > -1) {
      lineArrows[0] = options.endArrowCharacter;
    }

    flowsBetweenLines.filter((f) => (
      (f[0] < line && f[1] > line) ||
        (f[0] > line && f[1] < line)
    )).map((f) => f[2]).forEach((indent) => {
      lineArrows[(indent * 2) + 2] = options.verticalLineCharacter;
    });

    var str = options.defaultSpacer;
    for (var i = gutterWidth; i >= 0; i -= 1) {
      str += lineArrows[i] || options.defaultSpacer;
    }

    var code = ""
    if (options.printLines) {
      code = lines[line - 1];
    }

    arrows.push(str + options.gutterSeparator + code);
  }

  return arrows.join("\n");
}
