/**
 * The shapes `$try` and `trySync$` answer in, so a caller handles an expected failure inline.
 *
 * Success: the data of a work that returned, with no error.
 * Failure: the error of a work that threw, with no data.
 * Result: a Success or a Failure; a check of error tells them apart.
 * Fallback: the value for an expected error, and which errors are expected.
 *
 * @example const { error } = await $try(prepare($))
 */
export type Success<T> = {
    data: T;
    error: null;
};
export type Failure<E> = {
    data: null;
    error: E;
};
export type Result<T, E = Error> = Success<T> | Failure<E>;
/** The value for an expected error, and which errors are expected. */
export type Fallback<F> = {
    or: F;
    expected: (error: Error) => boolean;
};
