/**
 * Helpers for mutability switching
 */

const immutableJS = require('immutable');

/**
 * from: https://github.com/facebook/immutable-js/wiki/Converting-from-JS-objects
 */
function fromJSGreedy (js) {
  return typeof js !== 'object' || js === null
    ? js : Array.isArray(js)
      ? immutableJS.Seq(js).map(fromJSGreedy).toList()
      : immutableJS.Seq(js).map(fromJSGreedy).toMap();
}

/**
 * from: https://github.com/facebook/immutable-js/wiki/Converting-from-JS-objects
 */
/* eslint-disable no-unused-vars */
function fromJSOrdered (js) {
  return typeof js !== 'object' || js === null
    ? js : Array.isArray(js)
      ? immutableJS.Seq(js).map(fromJSOrdered).toList()
      : immutableJS.Seq(js).map(fromJSOrdered).toOrderedMap();
}
/* eslint-enable no-unused-vars */

module.exports.immutable = function immutable (v) { return fromJSGreedy(v); };
module.exports.mutable = function mutable (v) { return (v.toJS) ? v.toJS() : v; };
