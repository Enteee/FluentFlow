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
  return function () {
    const chain = [];

    function build (then) {
      then = then || function (cb) { cb(); };
      if (!(_.isFunction(then))) throw new Error('then is not a function');
      if (chain.length <= 0) throw new Error('can not build empty chain');

      const rules = [];
      chain.reverse().forEach((checker) => {
        rules.unshift(new Rule(checker, rules[0]));
      });

      rules[rules.length - 1].setThen(then);
      return rules[0];
    }

    function addToChain (checker) {
      if (!_.isFunction(checker)) throw new Error('checker is not a Function');
      chain.push(checker);
      return {
        followedBy: addToChain,
        then: build
      };
    }

    return addToChain.apply(this, arguments);
  };
};
