const _ = require('lodash');

/**
 * @class
 * @param {Function} check - checker function
 * @param {Rule} next - next rule
 */
module.exports = class Rule {
  constructor (check, next) {
    if (!_.isFunction(check)) throw new Error('check must be Function');
    if (!(_.isUndefined(next) || next instanceof Rule)) throw new Error('next must be undefined or Rule');

    this.check = check;
    this.next = next;
    this.then = function (objs, cb) { cb(); };
  }

  /**
   * @param {thenCallback} then - match callback
   */
  setThen (then) {
    if (!_.isFunction(then)) throw new Error('then must be Function');
    this.then = then;
  }
};
