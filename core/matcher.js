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
 *   queue obj if isMatching
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

    const matchObjQueue = [];

    return function (obj, cb) {
      obj = make.immutable((!_.isUndefined(obj)) ? obj : {});
      cb = cb || function () {};
      if (!_.isFunction(cb)) throw new Error('cb must be Function');

      // add to queue and abort if already matching
      matchObjQueue.push([obj, cb]);
      if (matchObjQueue.length > 1) return;

      (function matchObj(obj, cb){
        // we've to clone states because we might 'forget' states during runtime
        async.each(_(states).clone(), function (state, cb) {
          var asyncCbCalled = false;
          var matchCalled = false;
          function asyncCb () {
            if (asyncCbCalled) throw new Error('async callback called twice');
            asyncCbCalled = true;
            cb.apply(this, arguments);
          }
          // forget callback
          function forget () {
            if (asyncCbCalled) throw new Error('forget called after then-callback');
            const forgettables = Array.prototype.slice.call(arguments);
            _.remove(states,
              s => s.prev.some(
                o => _(forgettables).includes(o)
              )
            );
          }
          function match (matched) {
            if (matchCalled) return asyncCb(new Error('match callback already called'));
            matchCalled = true;
            if (!matched) return asyncCb();
            const newState = new State(
              state.rule.next, obj, state
            );
            // push to next rule
            if (state.rule.next) states.push(newState);
            try {
              state.rule.then(
                newState.prev, asyncCb, forget
              );
            } catch (e) {
              asyncCb(e);
            }
          }
          try {
            state.rule.check(
              obj, state.prev, state.context, state.prevContext,
              // callbacks
              match, forget
            );
          } catch (e) {
            asyncCb(e);
          }
        }, (err) => {
          if (err) return cb(err);
          cb();
          if (matchObjQueue.length > 0) match.apply(this, matchObjQueue.shift());
        });
      }).apply(this, matchObjQueue.shift());
    };
  };
};
