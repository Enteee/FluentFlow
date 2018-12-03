const _ = require('lodash');
const path = require('path');

const CLASS_DIR = 'classes';
const Rule = require(path.join(__dirname, CLASS_DIR, 'Rule'));

/**
 * Called each time a sequence of {@link Object}s matches a {@link Rule} in a {@link ffm}
 * @callback thenCallback
 * @param {Array} objs - the matched objects
 * @param {Function} cb - asynchronous callback
 */

/**
 * Builds {@link Rule}.
 * @class RuleBuilder
 * @param {checkerCallback} checker - first checker
 * @returns {RuleBuilder} continue
 * @example
 * const rule = require('fluentflow').RuleBuilder(
 *  (o, p, c, pc, cb, f) => cb(o == 42)
 * ).followedBy(
 *  (o, p, c, pc, cb, f) => cb(o == 9000)
 * ).then(
 *  (objs, cb) => cb(
 *    console.log(objs)
 *  )
 * ); // prints [42, 9000]
 */
module.exports = function () {
  const chain = [];

  function addToChain (checker) {
    if (!_.isFunction(checker)) throw new Error('checker is not a Function');
    chain.push(checker);

    return {
      /** @lends RuleBuilder.prototype */

      /**
       * Add a new checker.
       * @function
       * @param {checkerCallback} checker - next checker
       * @returns {RuleBuilder} continue
       */
      followedBy: addToChain,

      /**
       * Finishes and builds the chain.
       * @param {thenCallback} [then] - run if rule matches
       * @returns {Rule} finish
       */
      then: function (then) {
        then = then || function (objs, cb) { cb(); };
        if (!(_.isFunction(then))) throw new Error('then is not a function');
        if (chain.length <= 0) throw new Error('can not build empty chain');

        const rules = [];
        chain.reverse().forEach((checker) => {
          rules.unshift(new Rule(checker, rules[0]));
        });

        rules[rules.length - 1].setThen(then);
        return rules[0];
      }
    };
  }

  return addToChain.apply(this, arguments);
};
