const path = require('path');

module.exports = {
  Rule: require(path.join(__dirname, 'Rule')),
  State: require(path.join(__dirname, 'State')),
};
