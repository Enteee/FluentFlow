/**
 * Chain builder
 * @author Timo
 * @author Enteee  <ducksource@duckpond.ch>
 */
const _ = require('lodash');
const path = require('path');

const CLASS_DIR = 'classes';
const Rule = require(path.join(__dirname, CLASS_DIR, 'Rule'));

module.exports = function () {
  return (check) => {
    const chain = [];

    function build () {
      const rules = [];
      chain.reverse().forEach((checker) => {
        rules.unshift(new Rule(checker, rules[0]))
      });
      return rules[0];
    }

    function addToChain (check) {
      if (!_.isFunction(check)) throw new Error('checker is not a Function');
      chain.push(check);
      return { 
        followedBy: addToChain,
        build: build,
      }
    }

    return addToChain(check);
  }
}
