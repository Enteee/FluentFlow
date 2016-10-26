const _ = require('lodash');
const async = require('async');

const ff = require('..');

const N = _.range(100);

exports.testSimpleMatch = function (test) {
  var thenCalls = 0;
  var cbCalls = 0;

  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, pc, cb) => cb(o === 42)
    ).then(
      (objs, cb) => cb(thenCalls++)
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
    ff.Builder(
      (o, p, c, pc, cb) => cb()
    ).then(
      (objs, cb) => {
        test.ok(false);
        cb();
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
    ff.Builder(
      (o, p, c, pc, cb) => setTimeout(
        () => cb(o === 42),
        1
      )
    ).then(
      (objs, cb) => setTimeout(
        () => {
          thenCalls++;
          cb();
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
    }
  );
};

exports.testSimplAsyncNoMatch = function (test) {
  var cbCalls = 0;

  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, pc, cb) => setTimeout(
        () => cb(),
        1
      )
    ).then(
      (objs, cb) => setTimeout(
        () => {
          test.ok(false);
          cb();
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
    }
  );
};

exports.testFollowedBy = function (test) {
  var followedByCalls = 0;
  var thenCalls = 0;
  var cbCalls = 0;

  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, pc, cb) => cb(o === 42)
    ).followedBy(
      (o, p, c, pc, cb) => {
        followedByCalls++;
        test.equals(p.size, 1);
        test.equals(p.get(0), 42);
        test.ok(o > p.get(0));
        cb(o > p.get(0));
      }
    ).then(
      (objs, cb) => {
        thenCalls++;
        cb();
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
    ff.Builder(
      (o, p, c, pc, cb) => {
        if (!c.n) c.n = [];
        c.n = c.n.concat(o);
        cb(o === 42);
      }
    ).followedBy(
      (o, p, c, pc, cb) => {
        followedByCalls++;
        test.equal(pc.get('n').size, 43);
        pc.get('n').forEach((pc, i) => test.equal(pc, i));
        cb(true);
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
    ff.Builder(
      (o, p, c, pc, cb) => cb(o === 42)
    ).followedBy(
      (o, p, c, pc, cb, forget) => {
        followedByCalls++;
        forget(p.get(0));
        cb(true);
      }
    ).then(
      (objs, cb) => {
        thenCalls++;
        test.equals(objs.get(0), 43);
        cb();
      }
    )
  );

  N.forEach((obj) => ffm(obj));

  test.equals(followedByCalls, 1);
  test.equals(thenCalls, 1);
  test.done();
};

exports.testForgetAfterThenException = function (test) {
  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, pc, cb) => cb(o === 42)
    ).then(
      (objs, cb, forget) => {
        cb();
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
    ff.Builder(
      (o, p, c, pc, cb) => cb(o === 42)
    ).followedBy(
      (o, p, c, pc, cb) => cb(true)
    ).then(
      (objs, cb) => {
        thenCallsChain1++;
        test.equals(objs.get(0), 43);
        cb();
      }
    ),
    // forget 42 when 43 arrives
    ff.Builder(
      (o, p, c, pc, cb) => cb(o === 43)
    ).then(
      (objs, cb, forget) => {
        thenCallsChain2++;
        forget(42);
        cb();
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
    ff.Builder(
      (o, p, c, pc, cb) => cb(0())
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
    ff.Builder(
      (o, p, c, pc, cb) => cb(true)
    ).then(() => 0())
  );

  async.eachSeries(N, (obj, cb) => ffm(obj, cb),
    (err) => {
      test.ok(!!err);
      test.done();
    }
  );
};
