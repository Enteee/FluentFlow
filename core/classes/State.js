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
    if (!(_.isUndefined(rule) || rule instanceof Rule)) throw new Error('rule must be Rule');
    if (!(_.isUndefined(prevState) || prevState instanceof State)) throw new Error('prevState must be State');

    this.rule = rule;

    if (!_.isUndefined(obj)) {
      if (!_.isUndefined(prevState) && !_.isUndefined(prevState.prev)) {
        this.prev = [];
        prevState.prev.forEach((p) => this.prev.unshift(p));
        this.prev.unshift(obj);
        this.prev = make.immutable(this.prev);
      } else {
        this.prev = make.immutable([obj]);
      }
    } else {
      if (!_.isUndefined(prevState) && !_.isUndefined(prevState.prev)) {
        this.prev = prevState.prev;
      }
    }
    if (!_.isUndefined(prevState) && !_.isUndefined(prevState.context)) this.prevContext = make.immutable(prevState.context);
    this.context = {};
  }

};

