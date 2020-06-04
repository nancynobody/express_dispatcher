const _ = require('../utils/lists');

const v0 = '+11111111111';
const v1 = '+12222222222';

const l0 = [];
const l1 = ['+10000000000', '+12222222222'];


// TEST isin() //

// undefined, nulls and empty lists
test('throws on undefined item', () => {
  expect(() => {
    _.isin(undefined, l1);
  }).toThrow();
});

test('throws on null item', () => {
  expect(() => {
    _.isin(null, l1);
  }).toThrow();
});

// values in lists
test(`value isin list should return index 1`, () => {
  expect(_.isin(v1, l1)).toBe(1);
});

test(`value isin list should return false`, () => {
  expect(_.isin(v0, l1)).toBe(false);
});

// values in empty lists
test(`value isin list should return false`, () => {
  expect(_.isin(v1, l0)).toBe(false);
});

// TEST add() //
// TODO - write test

// TEST rmv() //
// TODO - write test

// TEST get_random() //
// TODO - write test