/* global $ */

// emit something @ initialization
function emit () {
  console.log('log');
  console.error('error');
}
emit();

[
  $(
    (o, p, c, pc, match) => {
      emit();
      match(true);
    }
  ).then()
];
