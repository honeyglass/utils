/**
 * What `UNSAFE_CHAR`, `UNSAFE_RUN`, `quoted` and `shown` answer a caller, read through
 * '@honeyglass/utils/ts'.
 *
 * The cases came from lean-code's 'tests/internals/args.internals.test.ts', where a typed word
 * that holds an unsafe character refuses with the word quoted, and from
 * 'tests/internals/paths.internals.test.ts'. A caller decides on a typed word by UNSAFE_CHAR, and
 * an agent reads the quoted text, so these tests assert which characters are unsafe and the exact
 * escapes.
 * Run with `pnpm test`, which runs the built package as a project that installs it.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { quoted, shown, UNSAFE_CHAR, UNSAFE_RUN } from '@honeyglass/utils/ts';

describe('a character that does not show as itself', () => {
  const unsafe = [
    { what: 'a zero-width space', word: '\u{200b}--dry-run', one: '"\\u{200b}--dry-run"' },
    { what: 'a soft hyphen', word: '\u{ad}--dry-run', one: '"\\u{ad}--dry-run"' },
    { what: 'a word joiner', word: '\u{2060}--dry-run', one: '"\\u{2060}--dry-run"' },
    { what: 'a bidi override', word: '\u{202e}--dry-run', one: '"\\u{202e}--dry-run"' },
    { what: 'a Hangul filler', word: '\u{3164}--dry-run', one: '"\\u{3164}--dry-run"' },
    { what: 'a variation selector', word: '\u{fe0f}--dry-run', one: '"\\u{fe0f}--dry-run"' },
    {
      what: 'a combining grapheme joiner',
      word: '\u{34f}--dry-run',
      one: '"\\u{34f}--dry-run"',
    },
    { what: 'a braille blank', word: '\u{2800}--dry-run', one: '"\\u{2800}--dry-run"' },
    { what: 'a line separator', word: '/a\u{2028}b', one: '"/a\\u{2028}b"' },
    { what: 'a control that JSON keeps', word: 'a\u{85}b', one: '"a\\u{85}b"' },
    { what: 'a newline', word: '/a\nb', one: '"/a\\nb"' },
    { what: 'a tab', word: 'a\tb', one: '"a\\tb"' },
    // characters no list names, which the allow-list refuses all the same
    { what: 'a no-break space', word: '/a\u{a0}b', one: '"/a\\u{a0}b"' },
    { what: 'a private use character', word: '/a\u{e000}b', one: '"/a\\u{e000}b"' },
    { what: 'an unassigned code point', word: '/a\u{378}b', one: '"/a\\u{378}b"' },
  ];
  for (const { what, word, one } of unsafe) {
    test(`such as ${what} is unsafe, and quoted shows it as an escape`, () => {
      assert.equal(UNSAFE_CHAR.test(word), true);
      assert.equal(quoted(word), one);
    });
  }

  const safe = [
    { what: 'a flag', word: '--dry-run', one: '"--dry-run"' },
    { what: 'an em dash', word: '—dry-run', one: '"—dry-run"' },
    { what: 'a letter outside ASCII and a space', word: 'café au lait', one: '"café au lait"' },
    { what: 'a quote and a backslash', word: 'a"b\\c', one: '"a\\"b\\\\c"' },
  ];
  for (const { what, word, one } of safe) {
    test(`is not ${what}, which quoted shows in JSON's quotes`, () => {
      assert.equal(UNSAFE_CHAR.test(word), false);
      assert.equal(quoted(word), one);
    });
  }
});

describe('a run of unsafe characters', () => {
  test('is one match, so one space replaces each run where a text must fit one line', () => {
    assert.equal('a\r\n\u{2028}b\u{200b}c d'.replace(UNSAFE_RUN, ' '), 'a b c d');
  });
});

describe('a value from outside as a refusal shows it', () => {
  const values = [
    { what: 'a line feed', value: 'a\nb', one: '"a\\nb"' },
    { what: 'a carriage return', value: 'a\rb', one: '"a\\rb"' },
    { what: 'a line separator', value: 'a\u{2028}b', one: '"a\\u{2028}b"' },
    { what: 'a paragraph separator', value: 'a\u{2029}b', one: '"a\\u{2029}b"' },
    { what: 'a C0 control', value: 'a\u{7}b', one: '"a\\u0007b"' },
    { what: 'a C1 control', value: 'a\u{85}b', one: '"a\\u{85}b"' },
    // a character outside [\w@./+-] is quoted, unsafe or not, so no case nobody listed stays bare
    { what: 'a space', value: 'src/a b.ts', one: '"src/a b.ts"' },
    { what: 'a tilde', value: '~/a.ts', one: '"~/a.ts"' },
    { what: 'a letter outside ASCII', value: 'café.ts', one: '"café.ts"' },
    { what: 'nothing', value: '', one: '""' },
    {
      what: 'only listed characters',
      value: '/repo/src/a_b-c+d@2.ts',
      one: '/repo/src/a_b-c+d@2.ts',
    },
  ];
  for (const { what, value, one } of values) {
    test(`with ${what} is ${one}`, () => {
      assert.equal(shown(value), one);
    });
  }
});
