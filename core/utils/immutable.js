/**
 * Helpers for mutability switching
 */

const immutableJS = require('immutable');
module.exports.immutable = function immutable (v) { return immutableJS.fromJS(v); };
module.exports.mutable = function mutable (v) { return (v.toJS) ? v.toJS() : v; };

