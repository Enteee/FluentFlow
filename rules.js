/* global $ */
[
  /**
   * Check if somebody forked this repository after submitting an issue.
   * Reverse order because the github api displays events in this order.
   */
  $(
    (o, p, c, pc, cb) => {
      cb(o.get('type') === 'ForkEvent');
    }
  ).followedBy(
    (o, p, c, pc, cb) => cb(
      o.get('type') === 'IssuesEvent' &&
        o.get('actor').get('login') === p.get(0).get('actor').get('login')
    )
  ).then((objs, cb) => cb(
    console.log('User: ' +
      objs.get(1).get('actor').get('login') +
      ' forked after writing issue: ' +
      objs.get(0).get('id')
    )
  ))
];
