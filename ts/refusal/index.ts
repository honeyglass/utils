/**
 * The barrel of the refusal module, from './types.ts' and './api.ts'.
 *
 * Refusal, RefusalText: the refusal as an object, and the text only refusal() makes.
 * refusal: the text of a refusal, for an answer that reaches the agent or a RefusalError.
 * readRefusal: the refusal a text of refusal() holds.
 * isRefusal: whether a value is a refusal object, such as one a helper answers.
 * RefusalError: the one error that is thrown, its text as the message.
 * causeText: a cause chain as text, cut to its last 4000 characters.
 *
 * readRefusal and isRefusal check the form only, and anyone can write that form: neither proves
 * where a refusal came from, so neither may decide at a trust boundary.
 *
 * @example if (isRefusal(claims)) throw new RefusalError(claims)
 */
export type { Refusal, RefusalText } from './types.ts';
export { causeText, isRefusal, readRefusal, refusal, RefusalError } from './api.ts';
