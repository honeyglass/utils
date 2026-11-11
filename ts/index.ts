/**
 * The TypeScript utils of '@honeyglass/utils', at its subpath './ts'; they import nothing.
 *
 * Success, Failure, Result, Fallback: the shapes `$try` and `trySync$` answer in.
 * $try: the result of a promise or a function, or the error it threw.
 * trySync$: the same at once, for a function that must stay synchronous.
 * anyError: accepts every error, for a call whose every failure is the answer.
 * Refusal, RefusalText: the refusal as an object, and the text only refusal() makes.
 * refusal: the text of a refusal, for an answer that reaches the agent or a RefusalError.
 * readRefusal: the refusal a text of refusal() holds.
 * isRefusal: whether a value is a refusal object, such as one a helper answers.
 * RefusalError: the one error that is thrown, its text as the message.
 * causeText: a cause chain as text, cut to its last 4000 characters.
 *
 * @example import { $try, anyError } from '@honeyglass/utils/ts'
 */
export type { Failure, Fallback, Result, Success } from './try-catch/index.ts';
export { $try, anyError, trySync$ } from './try-catch/index.ts';
export type { Refusal, RefusalText } from './refusal/index.ts';
export { causeText, isRefusal, readRefusal, refusal, RefusalError } from './refusal/index.ts';
