var morphic = require("morphic");

module.exports = {
  either: function(alternatives, named) {
    var matcher = morphic.makeMatcher(function(obj) {
      return alternatives.indexOf(obj) != -1;
    });
    return new matcher(named);
  },

  matchArray: morphic.makeMatcher(function(obj) {
    return Boolean(obj && obj instanceof Array);
  }),

  named: morphic.makeMatcher(function(_) {
    return true;
  })
};
