const _ = require('lodash');
const async = require('async');

const ff = require('..');
const $ = ff.RuleBuilder;

const N = _.range(100);

exports.testSimpleMatch = function (test) {
  var thenCalls = 0;
  var cbCalls = 0;

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => match(o === 42)
    ).then(
      (objs, next) => next(thenCalls++)
    )
  );

  N.forEach((obj) => ffm(obj, (err) => {
    test.ifError(err);
    cbCalls++;
  }));

  test.equals(thenCalls, 1);
  test.equals(cbCalls, N.length);
  test.done();
};

exports.testSimpleNoMatch = function (test) {
  var cbCalls = 0;

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => match()
    ).then(
      (objs, next) => {
        test.ok(false);
        next();
      }
    )
  );

  N.forEach((obj) => ffm(obj, (err) => {
    test.ifError(err);
    cbCalls++;
  }));

  test.equal(cbCalls, N.length);
  test.done();
};

exports.testSimplAsyncMatch = function (test) {
  var thenCalls = 0;
  var cbCalls = 0;

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => setTimeout(
        () => match(o === 42),
        1
      )
    ).then(
      (objs, next) => setTimeout(
        () => {
          thenCalls++;
          next();
        },
        1
      )
    )
  );

  async.eachSeries(N, (obj, cb) => ffm(obj,
    (err) => {
      test.ifError(err);
      cbCalls++;
      cb();
    }),
  () => {
    test.equals(thenCalls, 1);
    test.equals(cbCalls, N.length);
    test.done();
  });
};

exports.testSimplAsyncNoMatch = function (test) {
  var cbCalls = 0;

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => setTimeout(
        () => match(),
        1
      )
    ).then(
      (objs, next) => setTimeout(
        () => {
          test.ok(false);
          next();
        },
        1
      )
    )
  );

  async.eachSeries(N, (obj, cb) => ffm(obj,
    (err) => {
      test.ifError(err);
      cbCalls++;
      cb();
    }),
  () => {
    test.equals(cbCalls, N.length);
    test.done();
  });
};

exports.testSimplAsyncMatchQueue = function (test) {
  var thenObjs = [];
  var cbCalls = 0;
  var isMatching = false;

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => {
        test.ok(!isMatching);
        isMatching = true;
        setTimeout(
          () => match(true),
          1
        );
      }
    ).then(
      (objs, next) => setTimeout(
        () => {
          isMatching = false;
          thenObjs.push(objs.get(0));
          next();
        },
        1
      )
    )
  );

  async.each(N, (obj, cb) => {
    ffm(obj, (err) => {
      test.ifError(err);
      cbCalls++;
      cb();
    });
  }, () => {
    test.deepEqual(thenObjs, N);
    test.equals(cbCalls, N.length);
    test.done();
  });
};

exports.testFollowedBy = function (test) {
  var followedByCalls = 0;
  var thenCalls = 0;
  var cbCalls = 0;

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => match(o === 42)
    ).followedBy(
      (o, p, c, pc, match) => {
        followedByCalls++;
        test.equals(p.size, 1);
        test.equals(p.get(0), 42);
        test.ok(o > p.get(0));
        match(o > p.get(0));
      }
    ).then(
      (objs, next) => {
        thenCalls++;
        next();
      }
    )
  );

  N.forEach((obj) => ffm(obj, (err) => {
    test.ifError(err);
    cbCalls++;
  }));

  test.equals(followedByCalls, N.length - 42 - 1);
  test.equals(thenCalls, N.length - 42 - 1);
  test.equals(cbCalls, N.length);
  test.done();
};

exports.testContext = function (test) {
  var followedByCalls = 0;

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => {
        if (!c.n) c.n = [];
        c.n = c.n.concat(o);
        match(o === 42);
      }
    ).followedBy(
      (o, p, c, pc, match) => {
        followedByCalls++;
        test.equal(pc.get('n').size, 43);
        pc.get('n').forEach((pc, i) => test.equal(pc, i));
        match(true);
      }
    ).then()
  );

  N.forEach((obj) => ffm(obj));

  test.equals(followedByCalls, N.length - 42 - 1);
  test.done();
};

exports.testForget = function (test) {
  var followedByCalls = 0;
  var thenCalls = 0;

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => match(o === 42)
    ).followedBy(
      (o, p, c, pc, match, forget) => {
        followedByCalls++;
        forget(p.get(0));
        match(true);
      }
    ).then(
      (objs, next) => {
        thenCalls++;
        test.equals(objs.get(0), 43);
        next();
      }
    )
  );

  N.forEach((obj) => ffm(obj));

  test.equals(followedByCalls, 1);
  test.equals(thenCalls, 1);
  test.done();
};

exports.testForgetAfterNextException = function (test) {
  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => match(o === 42)
    ).then(
      (objs, next, forget) => {
        next();
        forget(42);
      }
    )
  );

  test.throws(() => N.forEach((obj) => ffm(obj)));

  test.done();
};

exports.testMultiChain = function (test) {
  var thenCallsChain1 = 0;
  var thenCallsChain2 = 0;

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => match(o === 42)
    ).followedBy(
      (o, p, c, pc, match) => match(true)
    ).then(
      (objs, next) => {
        thenCallsChain1++;
        test.equals(objs.get(0), 43);
        next();
      }
    ),
    // forget 42 when 43 arrives
    $(
      (o, p, c, pc, match) => match(o === 43)
    ).then(
      (objs, next, forget) => {
        thenCallsChain2++;
        forget(42);
        next();
      }
    )
  );

  N.forEach((obj) => ffm(obj));

  test.equals(thenCallsChain1, 1);
  test.equals(thenCallsChain2, 1);
  test.done();
};

exports.testRuleMatchRuntimException = function (test) {
  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => match(0())
    ).then()
  );

  async.eachSeries(N, (obj, cb) => ffm(obj, cb),
    (err) => {
      test.ok(!!err);
      test.done();
    }
  );
};

exports.testRuleThenRuntimException = function (test) {
  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => match(true)
    ).then(() => 0())
  );

  async.eachSeries(N, (obj, cb) => ffm(obj, cb),
    (err) => {
      test.ok(!!err);
      test.done();
    }
  );
};

exports.testPreviousInOrder = function (test) {
  const { List } = require('immutable');

  const ffm = ff.Matcher(
    $(
      (o, p, c, pc, match) => {
        match(true);
      }
    ).followedBy(
      (o, p, c, pc, match) => {
        match(o - 1 === p.get(0));
      }
    ).followedBy(
      (o, p, c, pc, match) => {
        const expected = List([p.get(0), p.get(0) - 1]);
        test.ok(
          p.equals(expected),
          p + ' !== ' + expected
        );
        match(o - 1 === p.get(0));
      }
    ).followedBy(
      (o, p, c, pc, match) => {
        const expected = List([p.get(0), p.get(0) - 1, p.get(0) - 2]);
        test.ok(
          p.equals(expected),
          p + ' !== ' + expected
        );
        match(o - 1 === p.get(0));
      }
    ).followedBy(
      (o, p, c, pc, match) => {
        const expected = List([p.get(0), p.get(0) - 1, p.get(0) - 2, p.get(0) - 3]);
        test.ok(
          p.equals(expected),
          p + ' !== ' + expected
        );
        match(o - 1 === p.get(0));
      }
    ).then()
  );

  N.forEach((obj) => ffm(obj));
  test.done();
};
