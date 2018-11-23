const _ = require('lodash');
const async = require('async');
const path = require('path');
const make = require(path.join(__dirname, 'utils', 'immutable'));

const CLASS_DIR = 'classes';
const Rule = require(path.join(__dirname, CLASS_DIR, 'Rule'));
const State = require(path.join(__dirname, CLASS_DIR, 'State'));

/**
 * The callback used to check if an object matches.
 * @callback checkerCallback
 * @param {object} o - the object to check
 * @param {object} p - the previous object
 * @param {object} c - the matching context
 * @param {object} pc - the matching context from the previous state
 * @param {Function} cb - match callback, true if matches false othrewise
 * @param {Function} f - forget callback
 */

/**
 * The callback used to check if an object matches.
 * @callback thenCallback
 * @param {Array} objs - the matched objects
 * @param {Function} cb - callback
 */

/**
 * Generates matchers ({@link matchNext}) for the given {@link Rule}(s).
 * @function Matcher
 * @param {...Rule} rule - Rule(s) to match against.
 * @returns {matchNext} a new matcher
 * @example
 * const _ = require('lodash');
 * const ff = require('fluentflow');
 * const $ = ff.RuleBuilder;
 * const ffm = ff.Matcher(
 *  $(
 *     (o, p, c, pc, cb, f) => cb(o == 42)
 *   ).followedBy(
 *     (o, p, c, pc, cb, f) => cb(o == 9000)
 *   ).then(
 *     (objs, cb) => cb(
 *       console.log(objs)
 *     )
 *   )
 * );
 * // match some objects
 * _.range(9001).forEach((obj) => ffm(obj)); // prints [42, 9000]
 * @example
 */
module.exports = function () {
  const rules = Array.prototype.slice.call(arguments);
  const states = [];

  if (!(
    _.isArray(rules) &&
      _.every(rules, (rule) =>
        (rule instanceof Rule)
      )
  )) throw new Error('rules must be array of Rules');

  // add a state per rule
  rules.forEach((rule) => states.push(new State(rule)));

  const matchObjQueue = [];

  /**
   * Matching core.
   * @param {object} obj - next object
   * @param {Function} [cb] - callback after matching finishes
   */
  return function matchNext (obj, cb) {
    obj = make.immutable((!_.isUndefined(obj)) ? obj : {});
    cb = cb || function () {};
    if (!_.isFunction(cb)) throw new Error('cb must be Function');

    // add to queue and abort if already matching
    matchObjQueue.push([obj, cb]);
    if (matchObjQueue.length > 1) return;

    (function matchObj (obj, cb) {
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
