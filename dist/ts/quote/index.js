/**
 * The barrel of the quote module, from './api.ts'.
 *
 * UNSAFE_CHAR: a character that does not show as itself, such as a newline or a zero-width space.
 * UNSAFE_RUN: a run of such characters, which one space replaces where a text must fit one line.
 * quoted: a text in JSON's quotes, each character UNSAFE_CHAR finds as an escape.
 * shown: a value from outside as a refusal shows it, bare when plain, else quoted.
 *
 * @example reason: `the JSON does not match its schema at ${shown(path)}`,
 */
export { quoted, shown, UNSAFE_CHAR, UNSAFE_RUN } from "./api.js";
