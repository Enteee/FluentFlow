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
    (o, p, c, pc, cb) => cb(o === 9000)
  ).followedBy(
    // Is the next object (o) greater than the previous (p)?
    (o, p, c, pc, cb) => cb(o > p.get(0))
  ).then(
    (objs, cb) => cb(console.log(objs))
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
    (o, p, c, pc, cb) => cb(o === 9000)
  ).followedBy(
    // Is the next object (o) greater than the previous (p)?
    (o, p, c, pc, cb) => cb(o > p.get(0))
  ).then(
    (objs, cb) => cb(console.log(objs))
  )
]`);
_.range(9002).forEach((obj) => ffm(obj));
```

* `new Matchbox()` will raise an exception if the chain contains syntax-errors.
* `matchbox.matchNext()` will run the chain inside a [vm2]-instance.
* runtime exceptions will be reported via the `matchbox.matchNext()` callback.

[vm2]:https://github.com/patriksimek/vm2
