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

  N.forEach((obj) => ffm(obj, () => cbCalls++));
  test.equals(thenCalls, 1);
  test.equals(cbCalls, N.length);
  test.done();
};

exports.testSimpleNoMatch = function (test) {
  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, pc, cb) => cb()
    ).then(
      (objs, cb) => cb(test.ok(false))
    )
  );

  N.forEach((obj) => ffm(obj));
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
        () => cb(thenCalls++),
        1
      )
    )
  );

  async.eachSeries(N, (obj, cb) => ffm(obj,
    () => {
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
  var thenCalls = 0;
  var cbCalls = 0;

  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, pc, cb) => setTimeout(
        () => cb(),
        1
      )
    ).then(
      (objs, cb) => setTimeout(
        () => cb(thenCalls++),
        1
      )
    )
  );

  async.eachSeries(N, (obj, cb) => ffm(obj,
    () => {
      cbCalls++;
      cb();
    }),
    () => {
      test.equals(thenCalls, 0);
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
        cb();
      }
    ).then(
      (objs, cb) => cb(thenCalls++)
    )
  );

  N.forEach((obj) => ffm(obj, () => cbCalls++));

  test.equals(followedByCalls, N.length - 42 - 1);
  test.equals(thenCalls, 0);
  test.equals(cbCalls, N.length);
  test.done();
};

exports.testContext = function (test) {
  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, pc, cb) => {
        if (!c.n) c.n = [];
        c.n = c.n.concat(o);
        cb(o === 42);
      }
    ).followedBy(
      (o, p, c, pc, cb) => {
        test.equal(pc.get('n').size, 43);
        pc.get('n').forEach((pc, i) => test.equal(pc, i));
        cb(true);
      }
    ).then()
  );

  N.forEach((obj) => ffm(obj));
  test.done();
};

exports.testForget = function (test) {
  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, pc, cb) => cb(o === 42)
    ).followedBy(
      (o, p, c, pc, cb, forget) => {
        forget(p.get(0));
        cb(true);
      }
    ).then(
      (objs, cb) => {
console.log(objs);
//        test.equals(objs.get(0), 43);
        cb();
      }
    )
  );

  N.forEach((obj) => ffm(obj));
  test.done();
};

exports.testMultiChain = function (test) {
  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, pc, cb) => cb(o === 42)
    ).followedBy(
      (o, p, c, pc, cb) => cb(true)
    ).then(
      (objs, cb) => {
        //test.equals(o.get(0), 43);
        cb();
      }
    ),
    // forget after 43
    ff.Builder(
      (o, p, c, pc, cb) => cb(o === 43)
    ).then(
      (objs, cb, forget) => {
        forget(42);
        cb();
      }
    )
  );

  N.forEach((obj) => ffm(obj));
  test.done();
};
