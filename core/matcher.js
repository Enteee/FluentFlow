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
        _.isArray(chains)
        && _.every(chains, (chain) => 
          (chain instanceof Rule)
        )
    )) throw new Error('chains must be array of Rules');

    // add a state per chain
    chains.forEach((chain) => states.push(new State(chain)));

    var isMatching = false;
    return function (obj, cb) {
      if (!_.isObject(obj)) throw new Error('obj must be Object');
      if (isMatching) throw new Error('matching is still in progress');

      isMatching = true;
      var stateRunning = 0;
      obj = immutable.Map(obj)
      var forgettables = [];
      
      async.each(states, (state, cb) => {
        var matchCalled = false;
        state.rule.check.apply({
            obj: obj,
            prev: state.prev,
            context: state.context,
          },
          // forget callback
          function (forgettables) {
            forgettables = [].concat(forgettables);
            if (!(_(forgettable).each(_.isObject))) cb('forgettables must be objects');
            _(state).remove( o => _(forgettables).some( f => _(f).isEqual(o)));
          },
          // match callback
          function (matched) {
            if (matchCalled) cb('match callback already called');
            matchCalled = true;
            if (matched) {
              states.push(new State(
                state.rule.next,
                state
              ));
            }
            cb();
          }
        );

      }, (err) => {
        if (err) return cb(err);
        isMatching = false;
        cb();
      });
    }
  }
}
