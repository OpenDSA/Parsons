const _Parser = require('./Parser');
const map = require('unist-util-map');
const _ = require('lodash');

 function treeParser(tree, options = {}) {
    return map(tree, function (node) {
      const omits = [];
      if (!options.position) omits.push('position');
      if (!options.blanklines) omits.push('blanklines');
      if (!options.indent) omits.push('indent');
      return _.omit(node, omits);
    });
  }

module.exports = function rstParse(text) {
    treeParser(_Parser.parse(text))
}

