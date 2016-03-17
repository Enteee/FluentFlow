const MODULES_DIR = __dirname + '/core/';

module.exports = {
    Fluent: require(MODULES_DIR + '/fluent.js'),
    Matcher: require(MODULES_DIR + '/matcher.js'),
    Matchbox: require(MODULES_DIR + '/matchbox.js'),
}

