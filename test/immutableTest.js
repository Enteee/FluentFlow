const { immutable } = require('../core/utils/immutable');

exports.testImmutableOfImmutablePreservesIdentity = function (test) {
  const obj = { a: 1 };

  const immutableObject1 = immutable(obj);
  const immutableObject2 = immutable(immutableObject1);

  test.equals(immutableObject1, immutableObject2);
  test.done();
};
