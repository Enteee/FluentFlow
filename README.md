<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## FluentFlow

FluentFlow is a filter language which lets you easily define 'followed by'-relations in a flow of JavaScript objects. You can either use FluentFlow [from the command line][1] or as a [JavaScript library][2].

[![npm version][4]][3]
[![Travis][6]][5]
[![Coverage Status][8]][7]
[![js-semistandard-style][10]][9]
[#FluentFlow][11]


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
$ curl -s https://api.github.com/repos/Enteee/FluentFlow/events | fluentflow rules.js -j '*'
```

_Note:_ `-j '*'` splits an array into objects.


## Testing

```shell
$ npm test
```


## API

[Documentation on github-pages][12]


### ffm

Matching core. Built using the JavaScript API using a [Matcher][13]
or from a [String][14] in a [Matchbox][15].

#### Parameters

-   `obj` **[Object][16]** next [Object][17] to match
-   `cb` **[errorFirstCallback][18]?** callback after matching finishes

### Matcher

Generates the matcher ([ffm][19]) for the given [Rule][20](s).

#### Parameters

-   `rule` **...[Rule][21]** Rule(s) to match against.

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

Returns **[ffm][22]** a new matcher

### Matchbox

Generates the isolated matcher ([ffm][19]) for the given [Rule][20](s).

#### Parameters

-   `rulesRaw` **[string][23]** a string of rules
-   `vmoptions` **[Object][16]?** options to [vm2][24]

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

Returns **[ffm][22]** an isolated [ffm][19]

### Callback Types




#### checkerCallback

Checks if an [Object][17] matches.

Type: [Function][25]

##### Parameters

-   `o` **[Object][16]** the object to check
-   `p` **[Object][16]** the previous object
-   `c` **[Object][16]** the matching context
-   `pc` **[Object][16]** the matching context from the previous state
-   `match` **[match][26]** match callback, true if matches false otherwise
-   `forget` **[forget][27]** forget callback, forget all states including objects passed as arguments

#### thenCallback

Called each time a sequence of [Object][17]s matches a [Rule][20] in a [ffm][19]

Type: [Function][25]

##### Parameters

-   `objs` **[Array][28]** the matched objects
-   `next` **[next][29]** end of callback. Continue matching next object
-   `forget` **[forget][27]** forget objects.

#### errorFirstCallback

Standard node.js callback type.

Type: [Function][25]

##### Parameters

-   `Error` **[Object][16]** Truthy if an error occured
-   `data` **...[Object][16]** data

### Helper Classes




#### Rule

##### Parameters

-   `check` **[Function][25]** checker function
-   `next` **[Rule][21]** next rule

##### setThen

###### Parameters

-   `then` **[thenCallback][30]** match callback

#### RuleBuilder

Builds [Rule][20].

##### Parameters

-   `checker` **[checkerCallback][31]** first checker

##### Examples

```javascript
const rule = require('fluentflow').RuleBuilder(
 (o, p, c, pc, match, forget) => match(o === 42)
).followedBy(
 (o, p, c, pc, match, forget) => match(o === 9000)
).then(
 (objs, next) => next(
   console.log(objs)
 )
); // prints [42, 9000]
```

Returns **[RuleBuilder][32]** continue

##### followedBy

Add a new checker.

###### Parameters

-   `checker` **[checkerCallback][31]** next checker

Returns **[RuleBuilder][32]** continue

##### then

Finishes and builds the chain.

###### Parameters

-   `then` **[thenCallback][30]?** run if rule matches

Returns **[Rule][21]** finish

## next

Signal the end of a [thenCallback][33].

## forget

Signal the intent to forget an object. Must be called before [next][34].

### Parameters

-   `obj` **...[Object][16]** the object(s) to forget

## match

Signal the result of a matching operation.

### Parameters

-   `matched` **[Boolean][35]?** true if matched, false otherwise. Default if omitted: false.

[1]: #command-line

[2]: #library

[3]: https://badge.fury.io/js/fluentflow

[4]: https://badge.fury.io/js/fluentflow.svg

[5]: https://travis-ci.org/Enteee/FluentFlow

[6]: https://img.shields.io/travis/Enteee/FluentFlow.svg

[7]: https://coveralls.io/github/Enteee/FluentFlow

[8]: https://coveralls.io/repos/github/Enteee/FluentFlow/badge.svg

[9]: https://github.com/Flet/semistandard

[10]: https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square

[11]: https://twitter.com/hashtag/FluentFlow

[12]: https://enteee.github.io/FluentFlow/

[13]: #matcher

[14]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[15]: #matchbox

[16]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[17]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[18]: #errorfirstcallback

[19]: #ffm

[20]: #rule

[21]: #rule

[22]: #ffm

[23]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[24]: https://www.npmjs.com/package/vm2

[25]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[26]: #match

[27]: #forget

[28]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[29]: #next

[30]: #thencallback

[31]: #checkercallback

[32]: #rulebuilder

[33]: #thencallback

[34]: #next

[35]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean
