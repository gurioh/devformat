const { test } = require('node:test');
const assert = require('node:assert/strict');
const { convertList } = require('../../assets/instant-list-tool.js');
const defaults = { mode: 'csv', trim: true, skipEmpty: true };
test('CSV escapes commas and embedded quotes', () => {
  assert.equal(convertList('apple\npear, ripe\n12" monitor', defaults).output, 'apple,"pear, ripe","12"" monitor"');
});
test('handles Windows and old Mac line endings', () => {
  assert.deepEqual(convertList(' a\r\nb\rc\n', defaults), { output: 'a,b,c', count: 3 });
});
test('preserves blanks and spaces when cleanup is disabled', () => {
  assert.deepEqual(convertList(' a \n\nb', { ...defaults, trim: false, skipEmpty: false }), { output: ' a ,,b', count: 3 });
});
test('quotes every CSV field when requested', () => {
  assert.equal(convertList('a\nb', { ...defaults, quoteAll: true }).output, '"a","b"');
});
test('env output stays a value list', () => {
  assert.equal(convertList('feature_a\nfeature_b', { ...defaults, mode: 'env' }).output, 'feature_a,feature_b');
});
test('empty input has no synthetic field', () => {
  assert.deepEqual(convertList('', { ...defaults, skipEmpty: false }), { output: '', count: 0 });
  assert.deepEqual(convertList(' \n ', defaults), { output: '', count: 0 });
});
