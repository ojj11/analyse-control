module.exports = {
  flatten: function flatten(array) {
    var out = [];
    array.forEach(array => out.push.apply(out, array));
    return out;
  }
}
