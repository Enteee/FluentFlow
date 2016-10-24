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
const path = require('path');
const make = require(path.join(__dirname, 'utils', 'immutable'));

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
      obj = make.immutable((!_.isUndefined(obj)) ? obj : {});
      cb = cb || function () {};
      if (!_.isFunction(cb)) throw new Error('cb must be Function');
      if (isMatching) throw new Error('matching is still in progress');

      isMatching = true;

      async.each(states, function (state, cb) {
        var matchCalled = false;

        // forget callback
        function forget () {
          const forgettables = Array.prototype.slice.call(arguments);
console.log('forgetting: ', forgettables);
          _(state).remove(o => _(forgettables).some(f => _(f).isEqual(o)));
        }

        state.rule.check(make.mutable(obj),
          state.prev,
          state.context,
          state.prevContext,
          // match callback
          function (matched) {
            if (matchCalled) cb('match callback already called');
            matchCalled = true;
            if (!matched) return cb();
            const newState = new State(
                state.rule.next, obj, state
            );
            // push to next rule
            if (state.rule.next) states.push(newState);
            state.rule.then(
              newState.prev, cb, forget
            );
          },
          forget
        );
      }, (err) => {
        if (err) return cb(err);
        isMatching = false;
        cb();
      });
    };
  };
};
