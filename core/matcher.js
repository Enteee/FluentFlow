/**
 * FluentFlow matching core
 * @author Timo
 * @author Enteee  <ducksource@duckpond.ch>
 *
 * Constructor (chain1, chain2, ...)
 *   chains = [chain1, chain2, ...]
 *   states = [
 *              for each chain:
 *                add new State { rule: firstRuleOfChain, prev: [], context: {} }
 *   ]
 *
 * matchNext(obj, [1]):
 *   thorw error if isMatching
 *   obj = immutable(obj)
 *
 *   For each state (async):
 *     state.rule.check.apply({
 *         obj: obj,
 *         prev: state.prev,
 *         context: state.context,
 *       },
 *       // callbacks
 *       forget,
 *       match
 *     )
 *
 * Callbacks:
 *   match(match):
 *     if match:
 *       states.push(new State {
 *         state.rule.next,
 *         state
 *       });
 *
 *   forget(forgettables):
 *     For each state if state.prev contains one of forgettables:
 *       states.remove(state)
 *
 */
const _ = require('lodash');
const async = require('async');
const immutable = require('immutable');
const path = require('path');

const CLASS_DIR = 'classes';
const Rule = require(path.join(__dirname, CLASS_DIR, 'Rule'));
const State = require(path.join(__dirname, CLASS_DIR, 'State'));

module.exports = function () {
  return function () {
    const chains = Array.prototype.slice.call(arguments);
    const states = [];

    if (!(
        _.isArray(chains) &&
        _.every(chains, (chain) =>
          (chain instanceof Rule)
        )
    )) throw new Error('chains must be array of Rules');

    // add a state per chain
    chains.forEach((chain) => states.push(new State(chain)));

    var isMatching = false;
    return function (obj, cb) {
      cb = cb || function () {};
      if (!_.isObject(obj)) throw new Error('obj must be Object');
      if (!_.isFunction(cb)) throw new Error('cb must be Function');
      if (isMatching) throw new Error('matching is still in progress');

      isMatching = true;
      obj = immutable.Map(obj);

      async.each(states, function (state, cb) {
        (function () {
          var matchCalled = false;

          state.rule.check.call(
            this,
            // match callback
            function (matched) {
              if (matchCalled) cb('match callback already called');
              matchCalled = true;
              if (!matched) return cb();
              states.push(new State(
                state.rule.next,
                state
              ));
              state.rule.then.apply(
                immutable.Map(this),
                cb
              );
            },
            // forget callback
            function (forgettables) {
              forgettables = [].concat(forgettables);
              if (!(_(forgettables).each(_.isObject))) cb('forgettables must be objects');
              _(state).remove(o => _(forgettables).some(f => _(f).isEqual(o)));
            }
          );
        }).apply({
          // this
          obj: obj,
          objs: [obj].concat(state.prev),
          prev: state.prev,
          context: state.context
        });
      }, (err) => {
        if (err) return cb(err);
        isMatching = false;
        cb();
      });
    };
  };
};
