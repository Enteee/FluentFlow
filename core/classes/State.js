
const path = require('path');
const _ = require('lodash');
const make = require(path.join(__dirname, '..', 'utils', 'immutable'));
const Rule = require(path.join(__dirname, 'Rule'));

/**
 * Matching state
 * @private
 * @param {Rule} rule - The rule this state is bound to.
 * @param {State} prevState - State this state originates from.
 */
module.exports = class State {
  constructor (rule, obj, prevState) {
    if (!(_.isUndefined(rule) || rule instanceof Rule)) throw new Error('rule must be Rule');
    if (!(_.isUndefined(prevState) || prevState instanceof State)) throw new Error('prevState must be State');

    this.rule = rule;

    this.prev = [];
    if (!_.isUndefined(prevState) && !_.isUndefined(prevState.prev)) {
      prevState.prev.forEach((p) => this.prev.unshift(p));
    }
    if (!_.isUndefined(obj)) {
      this.prev.unshift(obj);
    }
    this.prev = make.immutable(this.prev);

    if (!_.isUndefined(prevState) && !_.isUndefined(prevState.context)) this.prevContext = make.immutable(prevState.context);
    this.context = {};
  }
};
