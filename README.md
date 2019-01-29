<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## FluentFlow

FluentFlow is a filter language which lets you easily define 'followed by'-relations in a flow of JavaScript objects. You can either use FluentFlow [from the command line][1] or as a [JavaScript library][2].

[![Travis][4]][3]
[![Coverage Status][6]][5]
[![Codacy Badge][8]][7]


## Library

### Installation

```shell
$ npm install --save fluentflow 
```

### Usage

```javascript
const ff = require('fluentflow');
const $ = ff.RuleBuilder
const _ = require('lodash');

/**
 * Log all numbers greater than 9000.
 */
const ffm = ff.Matcher(
  $(
    // Start matching after 9000
    (o, p, c, pc, match) => match(o === 9000)
  ).followedBy(
    // Is the next object (o) greater than the previous (p)?
    (o, p, c, pc, match) => match(o > p.get(0))
  ).then(
    (objs, next) => next(console.log(objs))
  )
);

_.range(9002).forEach((obj) => ffm(obj));
```

#### Sandbox (Matchbox)

FluentFlow supports evaluating string rules in an isolated environment:

```javascript
const _ = require('lodash');
const ffm = require('fluentflow').Matchbox(`
[
  $(
    // Start matching after 9000
    (o, p, c, pc, match) => match(o === 9000)
  ).followedBy(
    // Is the next object (o) greater than the previous (p)?
    (o, p, c, pc, match) => match(o > p.get(0))
  ).then(
    (objs, next) => next(console.log(objs))
  )
]`);
_.range(9002).forEach((obj) => ffm(obj));
```

-   `new Matchbox()` will raise an exception if the chain contains syntax-errors.
-   `ffm()` will run the chain inside a [vm2]-instance.
-   runtime exceptions will be reported via the `ffm()` callback: `ffm(obj, (err) => { console.log(err) } );`

[vm2]: https://github.com/patriksimek/vm2


## Command Line

### Installation

```shell
$ sudo npm install -g fluentflow 
```

### Usage

    Usage: fluentflow.js [OPTIONS] rulesFile

    rulesFile          : path to the rules file
    OPTIONS:
       -j JSONPath     : JSONPath expression
       -t              : test if rules are valid
       -h              : print this help

### Getting started

Configure rules.js:

```javascript
[
  /**
   * Check if somebody forked this repository after submitting an issue.
   * Reverse order because the github api displays events in this order.
   */
  $(
    (o, p, c, pc, match) => {
      match(o.get('type') === 'ForkEvent');
    }
  ).followedBy(
    (o, p, c, pc, match) => match(
        o.get('type') === 'IssuesEvent' &&
        o.get('actor').get('login') === p.get(0).get('actor').get('login')
    )
  ).then((objs, next) => next(
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


## Testing

```shell
$ npm test
```


## API

[Documentation on github-pages][9]


### ffm

Matching core. Built using the JavaScript API using a [Matcher][10]
or from a [String][11] in a [Matchbox][12].

#### Parameters

-   `obj` **[Object][13]** next [Object][14] to match
-   `cb` **[errorFirstCallback][15]?** callback after matching finishes

### Matcher

Generates the matcher ([ffm][16]) for the given [Rule][17](s).

#### Parameters

-   `rule` **...[Rule][18]** Rule(s) to match against.

#### Examples

```javascript
const _ = require('lodash');
const ff = require('fluentflow');
const $ = ff.RuleBuilder;
const ffm = ff.Matcher(
 $(
    (o, p, c, pc, match, f) => match(o == 42)
  ).followedBy(
    (o, p, c, pc, match, f) => match(o == 9000)
  ).then(
    (objs, next) => next(
      console.log(objs)
    )
  )
);
// match some objects
_.range(9001).forEach((obj) => ffm(obj)); // prints [42, 9000]
```

Returns **[ffm][19]** a new matcher

### Matchbox

Generates the isolated matcher ([ffm][16]) for the given [Rule][17](s).

#### Parameters

-   `rulesRaw` **[string][20]** a string of rules
-   `vmoptions` **[Object][13]?** options to [vm2][21]

#### Examples

```javascript
const _ = require('lodash');
const ffm = require('fluentflow').Matchbox(`
 [
   $(
     (o, p, c, pc, match, forget) => match(o == 42)
   ).followedBy(
     (o, p, c, pc, match, forget) => match(o == 9000)
   ).then(
     (objs, next) => next(
       console.log(objs)
     )
   )
 ]
`);
// match some objects
_.range(9001).forEach((obj) => ffm(obj)); // prints [42, 9000]
```

Returns **[ffm][19]** an isolated [ffm][16]

### Callbacks Types




#### checkerCallback

Checks if an [Object][14] matches.

Type: [Function][22]

##### Parameters

-   `o` **[Object][13]** the object to check
-   `p` **[Object][13]** the previous object
-   `c` **[Object][13]** the matching context
-   `pc` **[Object][13]** the matching context from the previous state
-   `match` **[Function][22]** match callback, true if matches false othrewise
-   `forget` **[Function][22]** forget callback, forget all states including objects passed as arguments

#### thenCallback

Called each time a sequence of [Object][14]s matches a [Rule][17] in a [ffm][16]

Type: [Function][22]

##### Parameters

-   `objs` **[Array][23]** the matched objects
-   `cb` **[Function][22]** asynchronous callback

#### errorFirstCallback

Standard node.js callback type.

Type: [Function][22]

##### Parameters

-   `Error` **[Object][13]** Truthy if an error occured
-   `data` **...[Object][13]** data

### Helper Classes




#### Rule

##### Parameters

-   `check` **[Function][22]** checker function
-   `next` **[Rule][18]** next rule

##### setThen

###### Parameters

-   `then` **[thenCallback][24]** match callback

#### RuleBuilder

Builds [Rule][17].

##### Parameters

-   `checker` **[checkerCallback][25]** first checker

##### Examples

```javascript
const rule = require('fluentflow').RuleBuilder(
 (o, p, c, pc, cb, f) => cb(o == 42)
).followedBy(
 (o, p, c, pc, cb, f) => cb(o == 9000)
).then(
 (objs, cb) => cb(
   console.log(objs)
 )
); // prints [42, 9000]
```

Returns **[RuleBuilder][26]** continue

##### followedBy

Add a new checker.

###### Parameters

-   `checker` **[checkerCallback][25]** next checker

Returns **[RuleBuilder][26]** continue

##### then

Finishes and builds the chain.

###### Parameters

-   `then` **[thenCallback][24]?** run if rule matches

Returns **[Rule][18]** finish

[1]: #command-line

[2]: #library

[3]: https://travis-ci.org/t-moe/FluentFlow

[4]: https://img.shields.io/travis/t-moe/FluentFlow.svg

[5]: https://coveralls.io/github/t-moe/FluentFlow

[6]: https://coveralls.io/repos/github/t-moe/FluentFlow/badge.svg

[7]: https://www.codacy.com/app/timolang/FluentFlow

[8]: https://api.codacy.com/project/badge/grade/72b447b11ed140198b1d549680880e13

[9]: https://enteee.github.io/FluentFlow/

[10]: #matcher

[11]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[12]: #matchbox

[13]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[14]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[15]: #errorfirstcallback

[16]: #ffm

[17]: #rule

[18]: #rule

[19]: #ffm

[20]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[21]: https://www.npmjs.com/package/vm2

[22]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[23]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[24]: #thencallback

[25]: #checkercallback

[26]: #rulebuilder
