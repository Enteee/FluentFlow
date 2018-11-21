/* global $ */

[
  $(
    (o, p, c, pc, cb) => cb(true)
  ).then(
    (objs, cb) => 0() // runntime exception
  )
];
