const _ = require('lodash');
const async = require('async');

const ff = require('..');

const N = _.range(100);

exports.testSimpleMatch = function (test) {
  var thenCalls = 0;
  var cbCalls = 0;

  const ffm = ff.Matcher(
    ff.Builder(
      (o, p, c, cb) => cb(o === 42)
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
      (o, p, c, cb) => cb(false)
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
      (o, p, c, cb) => setTimeout(
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
      (o, p, c, cb) => setTimeout(
        () => cb(false),
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
      (o, p, c, cb) => cb(o === 42)
    ).followedBy(
      (o, p, c, cb) => {
        followedByCalls++;
        cb(o.n <= p.get(0));
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

