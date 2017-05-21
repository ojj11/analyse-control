module.exports = {
  flatten: function flatten(array) {
    var out = [];
    array.forEach(array => out.push.apply(out, array));
    return out;
  },
  flow: function flow(a, b) {
    if (a == undefined || b == undefined) {
      throw new Error("we tried to create a flow between undefined points");
    }
    return {
      "type": "flow",
      "start": a,
      "end": b
    };
  }
}
