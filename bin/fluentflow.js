#!/usr/bin/node

const fs = require('fs');
const minimist = require('minimist');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const Matchbox = require('..').Matchbox;

const argv = minimist(
  process.argv.slice(2),
  {
    string: ['j'],
    boolean: ['t', 'h']
  }
);

var rulesRaw = '';

function showHelp (ret) {
  console.log(
    /* eslint-disable no-path-concat */
    'Usage: ' + __filename + ' [OPTIONS] rulesFile\n' +
    '\n' +
    'rulesFile          : path to the rules file\n' +
    'OPTIONS:\n' +
    '   -j JSONPath     : JSONPath expression\n' +
    '   -t              : test if rules are valid\n' +
    '   -h              : print this help\n'
    /* eslint-enable no-path-concat */
  );
  process.exit(ret);
}

// help
if (argv.h) { showHelp(0); }

try {
  var rulesFile = argv._[0];
  if (typeof rulesFile !== 'string') { throw new Error('rulesFile missing'); }
  if (!fs.statSync(rulesFile).isFile()) { throw new Error('rulesFile (' + rulesFile + ') not a file'); }
  rulesRaw = fs.readFileSync(argv._[0], { encoding: 'utf-8' });
  if (rulesRaw.length <= 0) { throw new Error('rulesFile empty'); }
} catch (e) {
  console.error(e);
  showHelp(1);
}

// Read jsonPath, default: don't split objects (true)
var jsonPath = true;
if (argv.j) { jsonPath = argv.j; }

var matchbox = null;
try {
  matchbox = new Matchbox(rulesRaw);
} catch (e) {
  console.error('Failed initializing matchbox');
  if (e.message && e.line) {
    console.error(e.message + ' at line: ' + e.line);
  } else {
    console.error(e);
  }
  process.exit(1);
}

if (argv.t) { process.exit(0); }

process.stdin
  .pipe(JSONStream.parse(jsonPath))
  .pipe(es.through(function (obj, cb) {
    this.pause();
    matchbox(obj, () => {
      this.resume();
    });
  }));
