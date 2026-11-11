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
export {};
