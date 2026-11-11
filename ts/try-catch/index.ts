/**
 * The barrel of the try-catch module, from './types.ts' and './api.ts'.
 *
 * Success, Failure, Result, Fallback: the shapes `$try` and `trySync$` answer in.
 * $try: the result of a promise or a function, or the error it threw.
 * trySync$: the same at once, for a function that must stay synchronous.
 * anyError: accepts every error, for a call whose every failure is the answer.
 *
 * @example const stat = await $try($.fs.stat(path), { or: undefined, expected: anyError })
 */
export type { Failure, Fallback, Result, Success } from './types.ts';
export { $try, anyError, trySync$ } from './api.ts';
