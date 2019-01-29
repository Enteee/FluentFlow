const path = require('path');

const ff = require('.');

const CLASS_DIR = 'classes';
const Rule = require(path.join(__dirname, CLASS_DIR, 'Rule'));

/**
 * Load rules.
 * @private
 * @param {string} rulesRaw - rules to load
 */
module.exports = function load (rulesRaw) {
  rulesRaw = rulesRaw || '';

  const $ = ff.RuleBuilder; // eslint-disable-line no-unused-vars
  const chains = eval(rulesRaw); // eslint-disable-line no-eval
  if (!(chains instanceof Array)) throw new Error('chains not Array');
  if (!(chains.filter(r => !(r instanceof Rule)))) throw new Error('chain not a Rule');

  return ff.Matcher.apply(null, chains);
};
