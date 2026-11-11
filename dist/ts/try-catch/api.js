export async function $try(arg, fallback) {
    try {
        const data = typeof arg === 'function' ? await arg() : await arg;
        return fallback === undefined ? { data, error: null } : data;
    }
    catch (thrown) {
        const error = errorOf(thrown);
        if (fallback === undefined)
            return { data: null, error };
        const judged = trySync$(() => fallback.expected(error) === true);
        // An expected check that throws would hide the error it judged, so both leave together.
        if (judged.error !== null) {
            throw new AggregateError([thrown, judged.error], 'expected threw while it judged an error');
        }
        if (judged.data)
            return fallback.or;
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
export const trySync$ = (func) => {
    try {
        return { data: func(), error: null };
    }
    catch (thrown) {
        return { data: null, error: errorOf(thrown) };
    }
};
// A thrown value that is no Error, such as a string, becomes the cause of one, so callers get an Error.
const errorOf = (thrown) => isError(thrown) ? thrown : new Error('a value that is no Error was thrown', { cause: thrown });
// An Error of another realm, such as Jest's vm or an iframe, fails instanceof, so the check reads
// the internal tag: Error.isError where the runtime has it, else instanceof, which a same-realm
// DOMException passes, or Object.prototype.toString.
const isError = (value) => 'isError' in Error && typeof Error.isError === 'function'
    ? Error.isError(value) === true
    : value instanceof Error || Object.prototype.toString.call(value) === '[object Error]';
/**
 * Accepts every error, for a call whose every failure is the answer, such as a stat that asks
 * whether a path is a link. The name makes that choice visible.
 *
 * @example const link = await $try(lstat(path), { or: false, expected: anyError })
 */
export const anyError = (_error) => true;
