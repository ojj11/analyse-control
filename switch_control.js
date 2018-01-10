var morphic = require("morphic");
var either = require("./matchers.js").either;
var matchArray = require("./matchers.js").matchArray;
var flow = require("./utils.js").flow;
var List = require("immutable").List;
var Map = require("immutable").Map;

/**
 * flowProgram is the method that actually generates the flows for a specific
 * node. This code handles flows specific to switch statements:
 */
var flowProgram = new morphic();

flowProgram.with(
  morphic.Object("list"),
  morphic.number("nodeId"),
  {
    "type": "SwitchStatement",
    "discriminant": morphic.number("discriminant"),
    "cases": matchArray("cases")
  }
).then(r => {
  var cases = List(r.cases).map(n => r.list.get(n));
  var nonDefaultCases = cases.filter(option => option.test != null);
  // first we generate a flow for the test statement,
  // then we generate flows between the cases - the break statement handling
  // will sort out any case statements that don't flow between one another
  // then we generate the flows for each possible case including default (even
  // if there isn't a default statement)

  // switch(s1) {
  //   case s2: s3;
  //   case s4: s5;
  //   default: s6;
  // }

  // s1 -> s2 -> s4 -> s5 -> s6
  // s1 -> s2 -> s3 -> s5 -> s6
  // s1 -> s2 -> s4 -> s6

  var consequents = cases.flatMap(option => option.consequent);

  // 1. JOIN consequents
  var flows = List([
    flow(
      {node: r.nodeId, type: "start"},
      {node: r.discriminant, type: "start"})
  ]).concat(consequents.zip(consequents.rest()).map((consequents) => (
    flow(
      {node: consequents[0], type: "end"},
      {node: consequents[1], type: "start"})
  )));

  if (consequents.size) {
    // if there are cases then push the flow from consequents to the exit of
    // the switch statement:
    flows = flows.push(
      flow(
        {node: consequents.last(), type: "end"},
        {node: r.nodeId, type: "end"}));
  }

  // join our tests together
  flows = flows.concat(nonDefaultCases.zip(nonDefaultCases.rest()).map((cases) => (
    flow(
      {node: cases[0].test, type: "end"},
      {node: cases[1].test, type: "start"})
  )));

  var parsedCases = cases.map((option) => {
    var consequent = cases
      .skipWhile(option2 => option2 != option)
      .flatMap(option => option.consequent)
      .map(consequent => ({node: consequent, type: "start"}))
      .push({node: r.nodeId, type: "end"})
      .first();

    return {
      test: option.test,
      consequent: consequent,
    };
  });

  // join our tests to consequents:
  flows = flows.concat(
    parsedCases
      .filter((option) => option.test != null)
      .map((option) => (
        flow(
          {node: option.test, type: "end"},
          option.consequent)
      ))
  );

  var defaultCase = parsedCases.find(option => option.test == null);

  // if there's at least one test join it up:
  if (nonDefaultCases.size) {
    // there's at least one test - let's join it to our discriminant:
    flows = flows.push(
      flow(
        {node: r.discriminant, type: "end"},
        {node: nonDefaultCases.first().test, type: "start"}));
  } else if(defaultCase) {
    // otherwise because there's a default statement join it to that:
    flows = flows.push(
      flow(
        {node: r.discriminant, type: "end"},
        defaultCase.consequent));
  } else {
    // there's nothing just join it to the end:
    flows = flows.push(
      flow(
        {node: r.discriminant, type: "end"},
        {node: r.nodeId, type: "end"}));
  }

  // join the last test to either the default or to the end:
  if (nonDefaultCases.size) {
    if (defaultCase) {
      flows = flows.push(
        flow(
          {node: nonDefaultCases.last().test, type: "end"},
          defaultCase.consequent));
    } else {
      flows = flows.push(
        flow(
          {node: nonDefaultCases.last().test, type: "end"},
          {node: r.nodeId, type: "end"}));
    }
  }

  // remove duplicate flows before returning:
  return flows.filter((e1, i, a) => (
    a.slice(0, i).every((e2) => (
      e1.start.node != e2.start.node
        || e1.start.type != e2.start.type
        || e1.end.node != e2.end.node
        || e1.end.type != e2.end.type
    ))
  ));

});

flowProgram.otherwise().return([]);

module.exports = (nodeList) => (
  nodeList.flatMap((element, id) => flowProgram(nodeList, id, element))
);
