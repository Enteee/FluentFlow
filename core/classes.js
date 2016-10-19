const _ = require('lodash');

/**
 * Rule
 */
module.exports.Rule = class Rule {
  /**
   * @param {Function} check - checker function
   * @param {Rule} next - next rule
   */
  constructor (check, next) {
    if (!_.isFunction(check)) throw new Error('check must be function');
    if (!(!next || next instanceof Rule)) throw new Error('next must be Rule');

    this.check = check;
    this.next = next || function(){};
  }
}

/**
 * Matching state
 */
module.exports.State = class State {
  /**
   *  @param {Rule} rule - The rule this state is bound to.
   *  @param {State} prevState - State this state originates from.
   */
  constructor (rule, prevState) {
    if (!(rule instanceof Rule)) throw new Error('rule must be Rule');
    if (!(!prevState || prevState instanceof State)) throw new Error('prevState must be State');

    this.rule = rule;
    this.prev = immutable.Map(prevState.prev || []);
    this.prevContext = immutable.Map(prevState.context || {});
    this.context = {};
  }
}

