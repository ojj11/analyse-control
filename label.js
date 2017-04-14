var morphic = require("morphic");
var matchArray = require("./matchers.js").matchArray;
var List = require("immutable").List;

var generateLabels = new morphic();

generateLabels.with(
  morphic.Number("position"),
  morphic.Object("list"),
  {
    "type": morphic.String("type")
  }
).then(
    (r, _1, _2, input) => {
      var flatCopy = {};

      var pos = r.position + 1;
      var nodeList = r.list;

      Object.keys(input).forEach(key => {
        var out = generateLabels(pos, nodeList, input[key]);
        pos = out.pos;
        flatCopy[key] = out.copy;
        nodeList = out.nodeList;
      });

      nodeList = nodeList.set(r.position, flatCopy);

      return {
        pos: pos,
        copy: r.position,
        nodeList: nodeList
      };
  }
);

generateLabels.with(
  morphic.Number("position"),
  morphic.Object("list"),
  matchArray("array")
).then(
  r => {
    var pos = r.position;
    var nodeList = r.list;
    var nodes = r.array.map(element => {
      var out = generateLabels(pos, nodeList, element);
      pos = out.pos;
      nodeList = out.nodeList;
      return out.copy;
    });
    return {
      pos: pos,
      copy: nodes,
      nodeList: nodeList
    };
  }
);

// Return the node directly
generateLabels.otherwise().then((_, position, nodeList, node) => ({
    pos: position,
    copy: node,
    nodeList: nodeList
  })
);

module.exports = function label(ast) {
  return generateLabels(0, new List(), ast).nodeList;
};
