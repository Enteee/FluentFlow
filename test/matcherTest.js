const _ = require('lodash');
const ff = require('..');

const N = _.range(10).map(i => ({ n: i }));

exports.testSimpleMatch = function (test) {
  var thenCalls = 0;
  const ffm = ff.Matcher(
    ff.Builder(
      (cb) => cb(this.n === 3)
    ).then(
      (cb) => cb(thenCalls++)
    )
  );

  N.forEach((obj) => ffm(obj));
  test.ok(thenCalls === 1);
  test.done();
};

exports.testSimpleNoMatch = function (test) {
  const ffm = ff.Matcher(
    ff.Builder(
      (cb) => cb(false)
    ).then(
      (cb) => cb(test.ok(false))
    )
  );

  N.forEach((obj) => ffm(obj));
  test.done();
};
