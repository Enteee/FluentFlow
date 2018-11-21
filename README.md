# FluentFlow

FluentFlow is matching engine which lets you easily define 'followed by'-relations in a flow of JSON objects. You can either use FluentFlow [from the command line](#command-line) or as a JavaScript [library](#library).

[![Travis](https://img.shields.io/travis/t-moe/FluentFlow.svg)](https://travis-ci.org/t-moe/FluentFlow)
[![Coverage Status](https://coveralls.io/repos/github/t-moe/FluentFlow/badge.svg)](https://coveralls.io/github/t-moe/FluentFlow)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/72b447b11ed140198b1d549680880e13)](https://www.codacy.com/app/timolang/FluentFlow)

## Library

### Installation

```shell
$ npm install --save fluentflow 
```

### Usage

```javascript
const ff = require('fluentflow');
const _ = require('lodash');

/**
 * Log all numbers greater than 9000.
 */
const ffm = ff.Matcher(
  ff.Builder(
    // Start matching after 9000
    (o, p, c, pc, cb) => cb(o === 9000)
  ).followedBy(
    // Is the next object (o) greater than the previous (p)?
    (o, p, c, pc, cb) => cb(o > p.get(0))
  ).then(
    (objs, cb) => cb(console.log(objs))
  )
);

_.range(9001).forEach((obj) => ffm(obj));
```

#### Sandbox (Matchbox)

FluentFlow can be used with string rules:

```javascript
const Matchbox = require('fluentflow').Matchbox;
const matchbox = new Matchbox('
[
  $(
    // Start matching after 9000
    (o, p, c, pc, cb) => cb(o === 9000)
  ).followedBy(
    // Is the next object (o) greater than the previous (p)?
    (o, p, c, pc, cb) => cb(o > p.get(0))
  ).then(
    (objs, cb) => cb(console.log(objs))
  )
]');
_.range(9001).forEach((obj) => matchbox.matchNext(obj));
```

* `new Matchbox()` will raise an exception if the chain contains syntax-errors.
* `matchbox.matchNext()` will run the chain inside a [vm2]-instance.
* runtime exceptions will be reported via the `matchbox.matchNext()` callback.

## Command line

### Installation

```shell
$ sudo npm install -g fluentflow 
```

### Usage

```
Usage: fluentflow.js [OPTIONS] rulesFile

rulesFile          : path to the rules file
OPTIONS:
   -j JSONPath     : JSONPath expression
   -t              : test if rules are valid
   -h              : print this help
```

### Getting started

Configure rules.js:

```javascript
[
  /**
   * Check if somebody forked this repository after submitting an issue.
   * Reverse order because the github api displays events in this order.
   */
  $(
    (o, p, c, pc, cb) => {
      cb(o.get('type') === 'ForkEvent');
    }
  ).followedBy(
    (o, p, c, pc, cb) => cb(
        o.get('type') === 'IssuesEvent' &&
        o.get('actor').get('login') === p.get(0).get('actor').get('login')
    )
  ).then((objs, cb) => cb(
    console.log('User: ' +
      objs.get(1).get('actor').get('login') +
      ' forked after writing issue: ' +
      objs.get(0).get('id')
    )
  ))
];
```

Run FluentFlow:

```shell
$ curl -s https://api.github.com/repos/t-moe/FluentFlow/events | fluentflow rules.js -j '*'
```

_Note:_ `-j '*'` splits an array into objects.


## Writing chains

## Unit tests

```shell
$ npm test
```


[vm2]:https://github.com/patriksimek/vm2
