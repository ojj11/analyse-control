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

var colors = [
  chalk.bgGreen.whiteBright,
  chalk.bgMagenta.whiteBright,
  chalk.bgCyan.whiteBright,
  chalk.bgRed.whiteBright,
  chalk.bgBlue.whiteBright,
  chalk.bgYellow.whiteBright
];

renderCurrentFlow(immutable.Set([Flow.getStartOfFlow()]), 0);

function renderCurrentFlow(flows, steps) {
  clear();
  var ranges = flows
    .map((flow) => flow.getNode())
    .reduce((ranges, current) => (
      ranges.add(current.start, current.end)
    ), new RangeSet())
    .ranges
    .sort((r1, r2) => r2.high - r1.high);
  console.log(ranges
    .reduce((src, range, i) => {
      var startChunk = src.slice(0, range.low);
      var selectedChunk = src.slice(range.low, range.high);
      var endChunk = src.slice(range.high);
      return startChunk + colors[i % colors.length](selectedChunk) + endChunk;
    }, input));

  ranges.forEach((range, i) => {
    var flow = flows.find((flow) => (flow.getNode().start == range.low));
    var type = "hoist";
    if (flow.isEnter()) {
      type = "enter";
    }
    if (flow.isExit()) {
      type = "exit";
    }
    console.log(colors[i % colors.length](flow.getNode().type) + " : " + type);
  });

  // schedule the next wave:
  var terminals = immutable.Set(
    flows.map((flow) => immutable.List(flow.getForwardFlows())).flatten());
  if (terminals.size > 0) {
    setTimeout(renderCurrentFlow.bind(this, terminals, steps + 1), 200);
  }
}

function clear() {
  // clear our console:
  process.stdout.write("\x1B[2J\x1B[0f");
}
