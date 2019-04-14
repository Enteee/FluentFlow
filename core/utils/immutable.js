/**
 * Helpers for mutability switching
 * @private
 */

const immutableJS = require('immutable');

/**
 * from: https://github.com/facebook/immutable-js/wiki/Converting-from-JS-objects
 * @private
 */
function fromJSGreedy (js) {
  return typeof js !== 'object' || js === null || js instanceof immutableJS.Collection
    ? js : Array.isArray(js)
      ? immutableJS.Seq(js).map(fromJSGreedy).toList()
      : immutableJS.Seq(js).map(fromJSGreedy).toMap();
}

module.exports.immutable = function immutable (v) { return fromJSGreedy(v); };
module.exports.mutable = function mutable (v) { return (v.toJS) ? v.toJS() : v; };
