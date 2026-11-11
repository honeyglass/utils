/**
 * An expected failure as a value, so the caller handles it inline instead of in a try block.
 *
 * $try: the result of a promise or a function, or the error it threw.
 * trySync$: the same at once, for a function that must stay synchronous.
 * anyError: accepts every error, for a call whose every failure is the answer.
 *
 * @example const entries = await $try($.fs.list(root), { or: [], expected: anyError })
 */
import type { Fallback, Result } from './types.ts';

/**
 * The result of a promise or a function, or the error it threw.
 *
 * A function is the only way to catch a sync throw, since an argument is evaluated first.
 *
 * @param arg - the promise, or the function that runs one or more steps
 * @returns data on success, error on failure; a thrown value that is no Error is the error's cause
 *
 * @example const { data: raw, error } = await $try(readFile(path, 'utf8'))   // a promise
 * @example const { data: user, error } = await $try(loadCurrentUser)          // a function by name
 * @example const { data: json, error } = await $try(() => JSON.parse(raw))    // a sync throw
 * @example const ask = async () => (await $try(classify(text))).data ?? undefined  // the helper catches once, so callers read a value
 * @example void compact($, answer)   // the async function awaits $try, the caller does not wait
 * @example
 * const { data: config, error } = await $try(async () => {           // several awaits
 *   const parsed = validate(JSON.parse(await readFile(path, 'utf8')))
 *   await save(parsed)
 *   return parsed
 * })
 */
export async function $try<T>(promise: Promise<T>): Promise<Result<T>>;
export async function $try<T>(promiseFunc: () => T | Promise<T>): Promise<Result<T>>;
/**
 * The data of a promise or a function, or the fallback for an error `expected` accepts.
 *
 * Any other error is thrown again, so only the failure the caller named becomes a value.
 * For a thrown value that is no Error, `expected` sees an Error with that value as its cause.
 * When `expected` throws, an AggregateError carries the original error first, then its own.
 *
 * @param arg - the promise, or the function that runs one or more steps
 * @param fallback - `or`, the value for an expected error; `expected`, which errors those are
 * @returns the data, or `or`
 *
 * @example const text = await $try(readFile(path, 'utf8'), { or: '', expected: isMissing })  // EACCES is thrown on
 * @example const link = await $try(lstat(path), { or: false, expected: anyError })         // every error is the answer
 */
export async function $try<T, F>(
  arg: Promise<T> | (() => T | Promise<T>),
  fallback: Fallback<F>,
): Promise<T | F>;
export async function $try<T, F = never>(
  arg: (() => T | Promise<T>) | Promise<T>,
  fallback?: Fallback<F>,
): Promise<Result<T> | T | F> {
  try {
    const data = typeof arg === 'function' ? await arg() : await arg;
    return fallback === undefined ? { data, error: null } : data;
  } catch (thrown) {
    const error = errorOf(thrown);
    if (fallback === undefined) return { data: null, error };
    const judged = trySync$(() => fallback.expected(error) === true);
    // An expected check that throws would hide the error it judged, so both leave together.
    if (judged.error !== null) {
      throw new AggregateError([thrown, judged.error], 'expected threw while it judged an error');
    }
    if (judged.data) return fallback.or;
    throw thrown;
  }
}

/**
 * The result of a function, or the error it threw, at once and without a promise.
 *
 * For a function that must stay synchronous, since its caller uses the answer at once.
 *
 * @param func - the function, run at once
 * @returns data on return, error on throw; a thrown value that is no Error is the error's cause
 *
 * @example const { data: url, error } = trySync$(() => new URL(href))
 */
export const trySync$ = <T>(func: () => T): Result<T> => {
  try {
    return { data: func(), error: null };
  } catch (thrown) {
    return { data: null, error: errorOf(thrown) };
  }
};

// A thrown value that is no Error, such as a string, becomes the cause of one, so callers get an Error.
const errorOf = (thrown: unknown) =>
  isError(thrown) ? thrown : new Error('a value that is no Error was thrown', { cause: thrown });

// An Error of another realm, such as Jest's vm or an iframe, fails instanceof, so the check reads
// the internal tag: Error.isError where the runtime has it, else instanceof, which a same-realm
// DOMException passes, or Object.prototype.toString.
const isError = (value: unknown): value is Error =>
  'isError' in Error && typeof Error.isError === 'function'
    ? Error.isError(value) === true
    : value instanceof Error || Object.prototype.toString.call(value) === '[object Error]';

/**
 * Accepts every error, for a call whose every failure is the answer, such as a stat that asks
 * whether a path is a link. The name makes that choice visible.
 *
 * @example const link = await $try(lstat(path), { or: false, expected: anyError })
 */
export const anyError = (_error: Error) => true;
