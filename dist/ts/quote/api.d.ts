/**
 * A text from outside on one line, so no character in it hides, reorders or forges a line.
 *
 * UNSAFE_CHAR: a character that does not show as itself, such as a newline or a zero-width space.
 * UNSAFE_RUN: a run of such characters, which one space replaces where a text must fit one line.
 * quoted: a text in JSON's quotes, each character UNSAFE_CHAR finds as an escape.
 * shown: a value from outside as a refusal shows it, bare when plain, else quoted.
 *
 * A caller decides on a typed word by UNSAFE_CHAR, so a change to its allow-list changes what
 * that caller lets pass.
 *
 * @example const reason = `${shown(path)} does not exist`
 */
/**
 * A character that does not show as itself, such as a newline or a zero-width space.
 *
 * It is every character outside an allow-list: letters, marks, digits, punctuation, symbols and
 * the space, so a control, a bidi override or a case nobody thought of is unsafe. Two narrowings
 * take out what the list lets pass but shows as nothing: Unicode's Default_Ignorable code points
 * (such as U+3164 HANGUL FILLER and the variation selectors) and U+2800 BRAILLE PATTERN BLANK.
 */
export declare const UNSAFE_CHAR: RegExp;
/**
 * A run of characters UNSAFE_CHAR finds, which one space replaces where a text must fit one line.
 *
 * It has the g flag: use it with replace or replaceAll; test and exec move its shared lastIndex.
 */
export declare const UNSAFE_RUN: RegExp;
/**
 * A text in JSON's quotes, each character UNSAFE_CHAR finds as an escape, so a reason shows it.
 *
 * JSON.stringify escapes only the controls below U+0020; the rest becomes '\u{…}', so a bidi
 * override or a line separator cannot reorder or split the line it stands in.
 *
 * @param word - any text, such as a typed word or a path
 * @returns the text quoted, on one line
 * @example const reason = `${quoted(path)} does not exist`
 */
export declare const quoted: (word: string) => string;
/**
 * A value from outside, such as a path or a key, as a refusal shows it.
 *
 * It stays bare only when every character is on the allow-list BARE_VALUE names; else it is
 * quoted with each unsafe character escaped, so a line break keeps the field on one line and no
 * character can spoof the value.
 *
 * @param value - any text, such as a path, a branch or a key
 * @returns the value bare, or quoted on one line
 * @example const reason = `the JSON does not match its schema at ${shown(path)}`
 */
export declare const shown: (value: string) => string;
