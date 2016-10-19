/**
 * Rule
 * @author Enteee <ducksource@duckpond.ch>
 */
const _ = require('lodash');

module.exports = class Rule {
  /**
   * @param {Function} check - checker function
   * @param {Rule} next - next rule
   */
  constructor (check, next) {
    if (!_.isFunction(check)) throw new Error('check must be Function');
    if (!(_.isUndefined(next) || next instanceof Rule)) throw new Error('next must be undefined or Rule');

    this.check = check;
    this.next = next;
  }
}
