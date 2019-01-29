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
