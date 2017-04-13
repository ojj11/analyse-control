// @flow

var morphic = require("morphic");
var assert = require("assert");
var acorn = require("acorn");

var either = function(alternatives, named) {
  var matcher = morphic.makeMatcher(function(obj) {
    return alternatives.indexOf(obj) != -1;
  });
  return new matcher(named);
};

var matchArray = morphic.makeMatcher(function(obj) {
  return Boolean(obj && obj instanceof Array);
});

var named = morphic.makeMatcher(function(_) {
  return true;
});

function flow(a, b) {
  if (a == undefined || b == undefined) {
    throw new Error("we tried to create a flow between undefined points");
  }
  return {
    "type": "flow",
    "start": a,
    "end": b
  };
}

function hoist(a, b) {
  if (a == undefined || b == undefined) {
    throw new Error("we tried to create a hoisting flow between undefined points");
  }
  return {
    "type": "hoist",
    "start": a,
    "end": b
  };
}

function flatten(array) {
  var out = [];
  array.forEach(array => out.push.apply(out, array));
  return out;
}

function labels(id) {
  var labelsMap = {};
  for (var i = 1; i < arguments.length; i += 1) {
    labelsMap[arguments[i]] = {
      node: id,
      type: arguments[i]
    };
  }
  return labelsMap;
}

// START OF GENERATE LABELS

  var flattenNodes = [];

  var generateLabels = new morphic();

  generateLabels.with(
    {
      "type": morphic.String("type")
    }
  ).then(
      (r, input) => {
        var flatCopy = Object.assign({}, input);
        var flatID = flattenNodes.push(flatCopy) - 1;

        if (r.type == "Program") {
          input.labels = labels(flatID, "start", "endOfDeclarations", "end");
        } else if (r.type == "VariableDeclarator" || r.type == "FunctionDeclaration") {
          input.labels = labels(flatID, "start", "startHoist", "endHoist", "end");
        } else {
          input.labels = labels(flatID, "start", "end");
        }

        Object.keys(flatCopy).forEach(key => {
          flatCopy[key] = generateLabels(input[key]);
        });

        flatCopy.nodeID = flatID;

        return flatID;
    }
  );

  generateLabels.with(
    matchArray("array")
  ).then(
    r => r.array.map(generateLabels)
  );

  // Fail silently:
  generateLabels.otherwise().returnArgument(0);

// END OF GENERATE LABELS

// START OF HOIST DECLARATIONS

  // We have to hoist all the declarations
  // - var abc
  // - function abc() {...}

  var hoistDeclarations = new morphic();

  hoistDeclarations.with(
    {
      "type": either([
        "IfStatement",
        "LabeledStatement",
        "BlockStatement",
        "WhileStatement",
        "DoWhileStatement",
        "ForStatement",
        "ForOfStatement",
        "Program",
        "VariableDeclaration",
        "VariableDeclarator",
        "FunctionDeclaration"
      ], "type")
    }
  ).then(
    (r, input) => {
      if (r.type == "VariableDeclarator" || r.type == "FunctionDeclaration") {
        return [input];
      }
      var out = flatten(Object.keys(input).map(key => hoistDeclarations(input[key])))
      return out;
    }
  );

  hoistDeclarations.with(
    matchArray("array")
  ).then(
    (_, arr) => flatten(arr.map(element => hoistDeclarations(element)))
  )

  hoistDeclarations.otherwise().return([]);

// END OF HOISTING DECLARATIONS

// START FLOW PROGRAM

  // Generates a flow through an array, connecting it to the start and end
  // variables
  function generateFlowsThroughArray(flowResolver) {
    return (function(r) {
      var flows = [];
      var start = r.start;
      r.array.forEach(element => {
        flows.push.apply(flows, flowResolver(element));
        flows.push(flow(start, element.labels.start));
        start = element.labels.end;
      });
      flows.push(flow(start, r.end));
      return flows;
    });
  }

  function generateFlowsThroughSingleElement(flowResolver) {
    return (function(r) {
      var flows = [];
      flows.push.apply(flows, flowResolver(r.element));
      flows.push(flow(r.start, r.element.labels.start));
      flows.push(flow(r.element.labels.end, r.end));
      return flows;
    });
  }

  var flowProgram = new morphic();

  flowProgram.with(
    {
      "type": either([
        "CallExpression",
        "NewExpression"
      ]),
      "callee": morphic.Object("callee"),
      "arguments": morphic.Object("args"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    r => {
      var flows = [];
      flows.push.apply(flows, flowProgram(r.callee));
      flows.push.apply(flows, generateFlowsThroughArray(flowProgram)({
        array: r.args,
        start: r.callee.labels.end,
        end: r.end
      }));
      flows.push(
        flow(r.start, r.callee.labels.start)
      );
      return flows;
    }
  );

  flowProgram.with(
    {
      "type": either([
        "Literal",
        "Identifier",
        "DebuggerStatement",
        "ThisExpression"
      ]),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    r => {
      return [flow(r.start, r.end)];
    }
  );

  // console.log(require("util").inspect(flowProgram.introspect(), {depth:null, colors:true, showHidden: true}));

  flowProgram.with(
    {
      "type": "Program",
      "body": matchArray("array"),
      "labels": {
        "endOfDeclarations": named("start"),
        "end": named("end")
      }
    }
  ).then(
    generateFlowsThroughArray(flowProgram)
  );

  flowProgram.with(
    {
      "type": "BlockStatement",
      "body": matchArray("array"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    generateFlowsThroughArray(flowProgram)
  );

  flowProgram.with(
    {
      "type": "ExpressionStatement",
      "expression": morphic.Object("element"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    generateFlowsThroughSingleElement(flowProgram)
  );

  flowProgram.with(
    {
      "type": "VariableDeclaration",
      "declarations": matchArray("array"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    generateFlowsThroughArray(flowProgram)
  );

  flowProgram.with(
    {
      "type": "VariableDeclarator",
      "init": morphic.Object("element"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    generateFlowsThroughSingleElement(flowProgram)
  );

  flowProgram.with(
    {
      "type": "IfStatement",
      "test": morphic.Object("test"),
      "consequent": morphic.Object("consequent"),
      "alternate": morphic.Object("alternate"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    r => {
      var flows = [];
      flows.push.apply(flows, flowProgram(r.test));
      flows.push.apply(flows, flowProgram(r.consequent));
      flows.push.apply(flows, flowProgram(r.alternate));
      flows.push(
        flow(r.start, r.test.labels.start),
        flow(r.test.labels.end, r.consequent.labels.start),
        flow(r.test.labels.end, r.alternate.labels.start),
        flow(r.consequent.labels.end, r.end),
        flow(r.alternate.labels.end, r.end)
      );
      return flows;
    }
  );

  flowProgram.with(
    {
      "type": "IfStatement",
      "test": morphic.Object("test"),
      "consequent": morphic.Object("consequent"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    r => {
      var flows = [];
      flows.push.apply(flows, flowProgram(r.test));
      flows.push.apply(flows, flowProgram(r.consequent));
      flows.push(
        flow(r.start, r.test.labels.start),
        flow(r.test.labels.end, r.end),
        flow(r.test.labels.end, r.consequent.labels.start),
        flow(r.consequent.labels.end, r.end)
      );
      return flows;
    }
  );

  flowProgram.with(
    {
      "type": "WhileStatement",
      "test": morphic.Object("test"),
      "body": morphic.Object("body"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    r => {
      var flows = [];
      flows.push.apply(flows, flowProgram(r.test));
      flows.push.apply(flows, flowProgram(r.body));
      flows.push(
        flow(r.start, r.test.labels.start),
        flow(r.test.labels.end, r.end),
        flow(r.test.labels.end, r.body.labels.start),
        flow(r.body.labels.end, r.test.labels.start)
      );
      return flows;
    }
  );

  flowProgram.with(
    {
      "type": "DoWhileStatement",
      "test": morphic.Object("test"),
      "body": morphic.Object("body"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    r => {
      var flows = [];
      flows.push.apply(flows, flowProgram(r.test));
      flows.push.apply(flows, flowProgram(r.body));
      flows.push(
        flow(r.start, r.body.labels.start),
        flow(r.body.labels.end, r.test.labels.start),
        flow(r.test.labels.end, r.body.labels.start),
        flow(r.test.labels.end, r.end)
      );
      return flows;
    }
  );

  flowProgram.with(
    {
      "type": "WithStatement",
      "object": morphic.Object("object"),
      "body": morphic.Object("body"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    r => {
      var flows = [];
      flows.push.apply(flows, flowProgram(r.object));
      flows.push.apply(flows, flowProgram(r.body));
      flows.push(
        flow(r.start, r.object.labels.start),
        flow(r.object.labels.end, r.body.labels.start),
        flow(r.body.labels.end, r.end)
      );
      return flows;
    }
  );

  flowProgram.with(
    {
      "type": "ArrayExpression",
      "elements": matchArray("elements"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    r => generateFlowsThroughArray(flowProgram)({
      array: r.elements.filter((x) => x != null),
      start: r.start,
      end: r.end
    })
  );

  flowProgram.with(
    {
      "type": "ObjectExpression",
      "properties": morphic.Object("array"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    generateFlowsThroughArray(flowProgram)
  );

  flowProgram.with(
    {
      "type": "Property",
      "value": morphic.Object("element"),
      "labels": {
        "start": named("start"),
        "end": named("end")
      }
    }
  ).then(
    generateFlowsThroughSingleElement(flowProgram)
  );

  flowProgram.otherwise().then(
    (_, input) => {
      console.log("no specific rules for ", input.type);
      return [flow(input.labels.start, input.labels.end)];
    }
  );

// END FLOW PROGRAM

var start = Date.now();

var tester = require("fs").readFileSync("components/Everything/test.js").toString().split(/===+/);

console.log("read took " + (Date.now() - start));
start = Date.now();

var ast = acorn.parse(tester[0]);

console.log("AST gen took " + (Date.now() - start));
start = Date.now();

var expected = tester[1].trim();

generateLabels(ast);

console.log("generating labels took " + (Date.now() - start));
start = Date.now();

var declarations = hoistDeclarations(ast);
var varFlows = [];
var varEnd = ast.labels.start;
declarations.forEach(varDec => {
  varFlows.push(
    hoist(varEnd, varDec.labels.startHoist),
    hoist(varDec.labels.startHoist, varDec.labels.endHoist)
  );
  varEnd = varDec.labels.endHoist;
});

varFlows.push(hoist(varEnd, ast.labels.endOfDeclarations));

console.log("hoisting took " + (Date.now() - start));
start = Date.now();

// console.log(ast);

var flows = varFlows.concat(flowProgram(ast));

console.log("flowing took " + (Date.now() - start));
start = Date.now();

// var flows2 = flattenNodes.map((node, key) => {
//   node.flows = flows.filter(flow => flow.end.node == key || flow.start.node == key);
//   return node;
// });

// console.log(JSON.stringify(flows2, null, 2));

// console.log(flows);


//
// function output(flows, parsed, id) {
//   var toProcess = flows.filter(flow => flow.start == id);
//   return toProcess
//       .sort((a,b) => uuidToNode[b.end].node.start - uuidToNode[a.end].node.start)
//       .reduce(
//         (p,c) => (output(p.remaining, p.parsed, c.end)),
//         {
//           parsed: parsed.concat.apply(parsed, toProcess),
//           remaining: flows.filter(a => toProcess.indexOf(a) == -1)
//         });
// }
//
// var walk = output(flows, [], ast.labels.start).parsed.map(
//   flow => {
//     var start = uuidToNode[flow.start];
//     var end = uuidToNode[flow.end];
//     return start.node.type + ":" + start.type + " -> " + end.node.type + ":" + end.type;
//   }).join("\n");
//
// console.log("outputting took " + (Date.now() - start));
// start = Date.now();
//
// if(expected != walk) {
//   console.log("Got: ---");
//   console.log(walk);
//   console.log("Expected: ---");
//   console.log(expected);
// }
