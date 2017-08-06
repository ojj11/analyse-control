var acorn = require("acorn");
var fs = require("fs");
var chalk = require("chalk");
var RangeSet = require("discontinuous-range");
var immutable = require("immutable");
var analyse = require("./lib.js");
var generateLabels = require("./label");

var input = fs.readFileSync(process.argv[2]).toString();

var ast = acorn.parse(input);

var Flow = analyse(ast);

// console.log(JSON.stringify(generateLabels(ast).map((node) => {
//   delete node.start;
//   delete node.end;
//   return node;
// }), null, "  "));
// process.exit(0);

renderCurrentFlow(immutable.Set([Flow.getStartOfFlow()]), 0);

function renderCurrentFlow(flows, steps) {
  clear();
  var isHoisting = flows.every((flow) => flow.getFlowType() == "hoist");
  var color = isHoisting
    ? chalk.bgGreen.whiteBright
    : chalk.bgCyan.whiteBright;
  console.log(flows
    // .filter((flow) => flow.isEnter())
    .map((flow) => flow.getNode())
    .reduce((ranges, current) => (
      ranges.add(current.start, current.end)
    ), new RangeSet())
    .ranges
    .sort((r1, r2) => r2.high - r1.high)
    .reduce((src, range) => {
      var startChunk = src.slice(0, range.low);
      var selectedChunk = src.slice(range.low, range.high);
      var endChunk = src.slice(range.high);
      return startChunk + color(selectedChunk) + endChunk;
    }, input));

  console.log(
    color(isHoisting ? "hoisting" : "control flow") +
    " - " +
    steps +
    " steps");

  // schedule the next wave:
  var terminals = immutable.Set(
    flows.map((flow) => flow.getForwardFlows()).flatten());
  if (terminals.size > 0) {
    setTimeout(renderCurrentFlow.bind(this, terminals, steps + 1), 150);
  }
}

function clear() {
  // clear our console:
  process.stdout.write("\x1B[2J\x1B[0f");
}
