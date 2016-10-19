/**
 * Matching state
 * @author Enteee <ducksource@duckpond.ch>
 */

const path = require('path');
const _ = require('lodash');
const immutable = require('immutable');

const Rule = require(path.join(__dirname, 'Rule'));

module.exports = class State {
  /**
   *  @param {Rule} rule - The rule this state is bound to.
   *  @param {State} prevState - State this state originates from.
   */
  constructor (rule, prevState) {
    prevState = prevState || {};

    if (!(rule instanceof Rule)) throw new Error('rule must be Rule');
    if (!(_.isEmpty(prevState) || prevState instanceof State)) throw new Error('prevState must be State');
    this.rule = rule;
    this.prev = immutable.Map(prevState.prev || []);
    this.prevContext = immutable.Map(prevState.context || {});
    this.context = {};
  }
};

