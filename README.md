# FluentFlow

FluentFlow is matching engine which lets you easily define 'followed by'-relations in a flow of [JSON] objects.

[![Travis](https://img.shields.io/travis/t-moe/FluentFlow.svg)](https://travis-ci.org/t-moe/FluentFlow)
[![Coverage Status](https://coveralls.io/repos/github/t-moe/FluentFlow/badge.svg)](https://coveralls.io/github/t-moe/FluentFlow)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/72b447b11ed140198b1d549680880e13)](https://www.codacy.com/app/timolang/FluentFlow)

## Command line interface

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

## Library

### Installation

```shell
$ npm install --save fluentflow 
```

### Usage

```javascript
const ff = require('fluentflow');
const _ = require('lodash');

const ffm = ff.Matcher(
  ff.Builder(
    (o, p, c, pc, cb) => cb(o === 9000)
  ).followedBy(
    (o, p, c, pc, cb) => cb(o > p.get(0))
  ).then(
    (objs, cb) => cb(console.log(objs))
  )
);

_.range(9001).forEach((obj) => ffm(obj));
```

#### Sandbox (Matchbox)

```javascript
const Matchbox = require('fluentflow').Matchbox;
const matchbox = new Matchbox('
[
  $(
    (o, p, c, pc, cb) => cb(o === 9000)
  ).followedBy(
    (o, p, c, pc, cb) => cb(o > p.get(0))
  ).then(
    (objs, cb) => cb(console.log(objs))
  )
]');
_.range(9001).forEach((obj) => matchbox.matchNext(obj));
```

## Writing chains

## Unit tests

```shell
$ npm test
```

[JSON]:https://de.wikipedia.org/wiki/JavaScript_Object_Notation
