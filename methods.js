var morphic = require("morphic");
var either = require("./matchers.js").either;

var extractMethod = new morphic();

extractMethod.with(
  morphic.Number("method"),
  {
    "type": either([
      "FunctionDeclaration",
      "FunctionExpression",
      "ArrowExpression"
    ]),
    "body": morphic.Number("body")
  }
).then((r) => [{method: r.method, body: r.body}]);

extractMethod.otherwise().return([]);

module.exports = function getMethods(nodeList) {
  return nodeList.flatMap((node, i) => extractMethod(i, node)).toJS();
};
