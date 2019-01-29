/* global $ */

[
  $(
    (o, p, c, pc, match) => match(true)
  ).then(
    (objs, cb) => 0() // runtime exception
  )
];
