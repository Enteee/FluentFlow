/**
 * Matching state
 * @author Enteee <ducksource@duckpond.ch>
 */

const path = require('path');
const _ = require('lodash');
const make = require(path.join(__dirname, '..', 'utils', 'immutable'));
const Rule = require(path.join(__dirname, 'Rule'));

module.exports = class State {
  /**
   *  @param {Rule} rule - The rule this state is bound to.
   *  @param {State} prevState - State this state originates from.
   */
  constructor (rule, obj, prevState) {
    prevState = prevState || {};
    if (!(rule instanceof Rule)) throw new Error('rule must be Rule');
    if (!(_.isEmpty(prevState) || prevState instanceof State)) throw new Error('prevState must be State');

    this.rule = rule;
    this.prev = make.immutable((obj) ? [obj].concat(prevState.prev) : (prevState.prev || []));
    this.prevContext = make.immutable(prevState.context || {});
    this.context = {};
  }
};

