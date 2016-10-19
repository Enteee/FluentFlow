const path = require('path');
const MODULES_DIR = path.join(__dirname, 'core');


modul.exports = {
  Matcher: require(path.join(MODULES_DIR, 'matcher.js')),
  Builder: require(path.join(MODULES_DIR, 'builder.js')),
  Matchbox: require(path.join(MODULES_DIR, 'matchbox.js'))
};
