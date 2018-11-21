/* global $ */

// emit something @ initialization
function emit () {
  console.log('log');
  console.error('error');
}
emit();

[
  $(
    (o, p, c, pc, cb) => {
      emit()
      cb(true)
    }
  ).then()
];
