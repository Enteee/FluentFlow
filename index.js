const path = require('path');

const MODULES_DIR = path.join(__dirname, 'core');

module.exports = {
  Builder: require(path.join(MODULES_DIR, 'builder'))(),
  Matcher: require(path.join(MODULES_DIR, 'matcher'))(),
//  Matchbox: require(path.join(MODULES_DIR, 'matchbox'))(),
};
