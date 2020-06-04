const _ = require('../utils/date_diffs');

const d0 = new Date("January 1, 1800 00:00:00");
const d1 = new Date("January 1, 2020 09:00:00");
const d2 = new Date("January 1, 2020 10:00:00");
const d3 = new Date("January 2, 2020 11:30:00");
const d4 = new Date("January 1, 2050 00:00:00");


// TEST diff_days() //

// past minus future => negative
test(`subtr ${d1} and ${d2} to be -1`, () => {
  expect(_.diff_days(d1, d2)).toBe(-1);
});

// future minus past => positive
test(`subtr ${d2} and ${d1} to be 0`, () => {
  expect(_.diff_days(d2, d1)).toBe(0);
});

// huge diff
test(`subtr ${d4} and ${d0} to be 91311`, () => {
  expect(_.diff_days(d4, d0)).toBe(91311);
});

// small diff
test(`subtr ${d3} and ${d2} to be 1`, () => {
  expect(_.diff_days(d3, d2)).toBe(1);
});

// TEST diff_hours //
// TODO - write test

// TEST diff_mins //
// TODO - write test