const _ = require('lodash');
const async = require('async');
const path = require('path');
const make = require(path.join(__dirname, 'utils', 'immutable'));

const CLASS_DIR = 'classes';
const Rule = require(path.join(__dirname, CLASS_DIR, 'Rule'));
const State = require(path.join(__dirname, CLASS_DIR, 'State'));

/**
 * Checks if an {@link Object} matches.
 * @callback checkerCallback
 * @param {Object} o - the object to check
 * @param {Object} p - the previous object
 * @param {Object} c - the matching context
 * @param {Object} pc - the matching context from the previous state
 * @param {match} match - match callback, true if matches false otherwise
 * @param {forget} forget - forget callback, forget all states including objects passed as arguments
 */

/**
 * Standard node.js callback type.
 * @callback errorFirstCallback
 * @param {Object} Error - Truthy if an error occured
 * @param {...Object} data - data
 */

/**
 * Generates the matcher ({@link ffm}) for the given {@link Rule}(s).
 * @function Matcher
 * @param {...Rule} rule - Rule(s) to match against.
 * @returns {ffm} a new matcher
 * @example
 * const _ = require('lodash');
 * const ff = require('fluentflow');
 * const $ = ff.RuleBuilder;
 * const ffm = ff.Matcher(
 *  $(
 *     (o, p, c, pc, match, f) => match(o == 42)
 *   ).followedBy(
 *     (o, p, c, pc, match, f) => match(o == 9000)
 *   ).then(
 *     (objs, next) => next(
 *       console.log(objs)
 *     )
 *   )
 * );
 * // match some objects
 * _.range(9001).forEach((obj) => ffm(obj)); // prints [42, 9000]
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

  var isMatching = false;
  const matchObjQueue = [];

  /**
   * Matching core. Built using the JavaScript API using a {@link Matcher}
   * or from a {@link String} in a {@link Matchbox}.
   * @function
   * @param {Object} obj - next {@link Object} to match
   * @param {errorFirstCallback} [cb] - callback after matching finishes
   */
  return function ffm (obj, cb) {
    obj = make.immutable((!_.isUndefined(obj)) ? obj : {});
    cb = cb || function () {};
    if (!_.isFunction(cb)) throw new Error('cb must be Function');

    // add to queue and abort if matching in progress
    matchObjQueue.push([obj, cb]);
    if (isMatching) return;
    isMatching = true;

    function matchNextObj () {
      const [obj, cb] = matchObjQueue.shift();

      // we've to clone states because we might 'forget' states during runtime
      async.each(_(states).clone(), function (state, cb) {
        var nextCalled = false;
        /**
         * Signal the end of a {@link thenCallback.
         */
        function next () {
          if (nextCalled) throw new Error('next callback already called');
          nextCalled = true;
          cb();
        }

        /**
         * Signal the intent to forget an object. Must be called before {@link next}.
         * @param {...Object} obj - the object(s) to forget
         */
        function forget (obj) {
          if (nextCalled) throw new Error('can not forget after next was already called');
          const forgettables = Array.prototype.slice.call(arguments);
          _.remove(states,
            s => s.prev.some(
              o => _(forgettables).includes(o)
            )
          );
        }

        var matchCalled = false;
        /**
         * Signal the result of a matching operation.
         * @param {?Boolean} matched - true if matched, false otherwise. Default if omitted: false.
         */
        function match (matched) {
          if (matchCalled) return new Error('match callback already called');
          matchCalled = true;
          if (!matched) return next();
          const newState = new State(
            state.rule.next, obj, state
          );
          // push to next rule
          if (state.rule.next) states.push(newState);
          try {
            state.rule.then(
              newState.prev,
              // callbacks
              next, forget
            );
          } catch (e) {
            cb(e);
          }
        }

        try {
          state.rule.check(
            obj, state.prev, state.context, state.prevContext,
            // callbacks
            match, forget
          );
        } catch (e) {
          cb(e);
        }
      }, (err) => {
        if (err) cb(err);
        else cb();

        // empty queue -> bail out
        if (matchObjQueue.length <= 0) {
          isMatching = false;
          return;
        }

        // continue matching
        matchNextObj();
      });
    }
    matchNextObj();
  };
};
