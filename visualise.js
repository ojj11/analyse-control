var acorn = require("acorn");
var fs = require("fs");
var immutable = require("immutable");
var analyse = require("./lib.js");
var generateLabels = require("./label");

var input = fs.readFileSync(process.argv[2]).toString();

var ast = acorn.parse(input);

var Flow = analyse(ast);

renderCurrentFlow(immutable.Set([Flow.getStartOfFlow()]), 0);

function getBoxContent(node, flow) {
  var type = "";
  if (flow.isHoist()) {
    type = "hoist";
  }
  if (flow.isEnter()) {
    type = "enter";
  }
  if (flow.isExit()) {
    type = "exit";
  }
  var code = input.slice(node.start, node.end);
  if (code.split("\n", 2).length == 2) {
    code = code.split("\n", 2)[0] + "...";
  }
  var lines = ["", " " + node.type + " : " + type + " ", "", " " + code + " ", ""];
  lines = lines.map((line) => {
    if (line.length > 30) {
      line = line.slice(0,27) + "...";
    }
    return line;
  });
  var max = lines.reduce((a,b) => (Math.max(a,b.length)), 0);
  if (max < 32) {
    max = 32;
  }
  lines[0] = lines[4] = "+" + "-".repeat(max) + "+";
  lines[1] = "|" + lines[1] + " ".repeat(max - lines[1].length) + "|";
  lines[2] = "|" + lines[2] + " ".repeat(max - lines[2].length) + "|";
  lines[3] = "|" + lines[3] + " ".repeat(max - lines[3].length) + "|";
  return {
    txt: lines,
    width: max + 2,
    height: 5,
  };
}

function renderCurrentFlow(flows, steps) {
  clear();

  var boxes = [];
  flows.forEach((flow) => {

    var forward = flow.getForwardFlows();

    boxes.push({
      content: getBoxContent(flow.getNode(), flow),
      children: forward.map((flow) => ({
        content: getBoxContent(flow.getNode(), flow),
        children: [],
      })),
    });
  });

  var lines = [];

  lines.push("");

  boxes.forEach((box) => {
    if (box.children.length == 0) {
      lines.push(box.content.txt.map((a) => (" " + a)).join("\n"));
    }
    if (box.children.length == 1) {
      box.content.txt[0] += " ".repeat(10) + box.children[0].content.txt[0];
      box.content.txt[1] += " ".repeat(10) + box.children[0].content.txt[1];
      box.content.txt[2] += "-".repeat(9) + ">" + box.children[0].content.txt[2];
      box.content.txt[3] += " ".repeat(10) + box.children[0].content.txt[3];
      box.content.txt[4] += " ".repeat(10) + box.children[0].content.txt[4];
      lines.push(box.content.txt.map((a) => (" " + a)).join("\n"));
    }
    if (box.children.length > 1) {
      box.content.txt[0] += " ".repeat(10) + box.children[0].content.txt[0];
      box.content.txt[1] += " ".repeat(10) + box.children[0].content.txt[1];
      box.content.txt[2] += "----+---->" + box.children[0].content.txt[2];
      box.content.txt[3] += "    |     " + box.children[0].content.txt[3];
      box.content.txt[4] += "    |     " + box.children[0].content.txt[4];
      lines.push(box.content.txt.map((a) => (" " + a)).join("\n"));
      var last = box.children.length - 2;
      box.children.slice(1).forEach((box, i) => {
        var more = i == last ? " " : "|";
        lines.push(" ".repeat(box.content.width + 5) + "|");
        lines.push(" ".repeat(box.content.width + 5) + "|     " + box.content.txt[0]);
        lines.push(" ".repeat(box.content.width + 5) + "|     " + box.content.txt[1]);
        lines.push(" ".repeat(box.content.width + 5) + "+---->" + box.content.txt[2]);
        lines.push(" ".repeat(box.content.width + 5) + more + "     " + box.content.txt[3]);
        lines.push(" ".repeat(box.content.width + 5) + more + "     " + box.content.txt[4]);
      });
    }
    lines.push("");
  });

  lines = lines.join("\n").split("\n");

  clear();
  console.log(lines.join("\n"));

  // schedule the next wave:
  var terminals = immutable.Set(
    flows.map((flow) => immutable.List(flow.getForwardFlows())).flatten());
  if (boxes.length) {
    setTimeout(animate.bind(null, lines, boxes[0].content.width + 10, renderCurrentFlow.bind(this, terminals, steps + 1)), 1500)
  }
}

function animate(lines, width, next) {
  if (width == 0) {
    next();
    return;
  }
  lines = lines.map((line) => (line.slice(1)));
  clear();
  console.log(lines.join("\n"));
  var ease = (0.65**width);
  setTimeout(animate.bind(null, lines, width - 1, next), ease * 300);
}

function clear() {
  // clear our console:
  process.stdout.write("\x1B[2J\x1B[0f");
}
