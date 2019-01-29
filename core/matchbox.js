require('harmony-reflect');
const fs = require('fs');
const path = require('path');
const NodeVM = require('vm2').NodeVM;
const esprima = require('esprima');

const MATCHBOX_ENV = path.join(__dirname, 'matchboxenv.js');
const MATCHBOX_ENV_BUILTINS = ['path'];

/**
 * Generates the isolated matcher ({@link ffm}) for the given {@link Rule}(s).
 * @function Matchbox
 * @param {string} rulesRaw - a string of rules
 * @param {Object} [vmoptions] - options to {@link https://www.npmjs.com/package/vm2|vm2}
 * @returns {ffm} - an isolated {@link ffm}
 * @example
 * const _ = require('lodash');
 * const ffm = require('fluentflow').Matchbox(`
 *  [
 *    $(
 *      (o, p, c, pc, match, forget) => match(o == 42)
 *    ).followedBy(
 *      (o, p, c, pc, match, forget) => match(o == 9000)
 *    ).then(
 *      (objs, next) => next(
 *        console.log(objs)
 *      )
 *    )
 *  ]
 * `);
 * // match some objects
 * _.range(9001).forEach((obj) => ffm(obj)); // prints [42, 9000]
 */
module.exports = function (rulesRaw, vmoptions) {
  rulesRaw = rulesRaw || '[]';
  vmoptions = vmoptions || {};
  vmoptions.require = vmoptions.require || {};
  vmoptions.require.external = true;
  vmoptions.require.root = vmoptions.require.root || __dirname;
  vmoptions.require.builtin = (vmoptions.require.builtin) ? vmoptions.require.builtin.concat(MATCHBOX_ENV_BUILTINS) : MATCHBOX_ENV_BUILTINS;
  // parse javascript code (check for errors)
  esprima.parse(rulesRaw);
  // start a vm
  const vm = new NodeVM(vmoptions);
  // register events
  if (vmoptions.events) {
    const events = vmoptions.events;
    for (var event in events) {
      if (events.hasOwnProperty(event)) {
        vm.on(event, events[event]);
      }
    }
  }
  const matchbox = vm.run(fs.readFileSync(MATCHBOX_ENV), __filename);
  return matchbox(rulesRaw);
};
