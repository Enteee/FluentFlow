const path = require('path');

const ff = require('.');

const CLASS_DIR = 'classes';
const Rule = require(path.join(__dirname, CLASS_DIR, 'Rule'));

var m = false;

// somehow we can not ovewrite global.console might be node.js related
var console = global.console; // eslint-disable-line no-unused-vars

module.exports = {
  setConsole: function (newConsole) {
    console = newConsole;
  },

  load: function (rulesRaw) {
    rulesRaw = rulesRaw || '';

    const $ = ff.Builder; // eslint-disable-line no-unused-vars
    const chains = eval(rulesRaw); // eslint-disable-line no-eval
    if (!(chains instanceof Array)) throw new Error('chains not Array');
    if (!(chains.filter(r => !(r instanceof Rule)))) throw new Error('chain not a Rule');

    m = ff.Matcher.apply(this, chains);
  },

  matchNext: function (row, cb) {
    if (!m) return cb('no chains loaded');
    m.apply(m, arguments);
  }
};

