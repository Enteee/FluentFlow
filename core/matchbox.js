require('harmony-reflect');
const fs = require('fs');
const path = require('path');
const NodeVM = require('vm2').NodeVM;
const esprima = require('esprima');

'use strict';

const MATCHBOX_ENV = path.join(__dirname, 'matchboxenv.js');
const MATCHBOX_ENV_HIDDEN_PROPERTIES = [ 'load', 'setConsole' ];
const MATCHBOX_ENV_BUILTINS = ['path'];

module.exports = function () {
  return function (rulesRaw, vmoptions) {
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
    matchbox.load(rulesRaw);
    // delte all hidden properties
    MATCHBOX_ENV_HIDDEN_PROPERTIES.forEach(function (p) {
      delete matchbox[p];
    });
    return new Proxy(matchbox, {
      apply: function (target, thisArg, argumentsList) {
        thisArg[target](argumentsList);
      }
    });
  };
};
