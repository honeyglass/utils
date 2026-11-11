/**
 * The shape of a refusal: an error that leaves the code and says who acts next.
 *
 * RefusalText: the text of a refusal; only refusal() makes one.
 * Refusal: the refusal as an object, its kind naming who acts next.
 *
 * A value of either type proves no origin: anyone can build the object or write the text, so
 * neither may decide at a trust boundary.
 *
 * @example if (isRefusal(permissions)) return denied($, permissions)
 */
declare const brand: unique symbol;
/** The text of a refusal; only refusal() makes one. */
export type RefusalText = string & {
    readonly [brand]: true;
};
/**
 * A refusal; every field but the cause holds only letters, marks, digits, punctuation, symbols
 * and spaces, so readRefusal reads each back whole and no field hides a character.
 *
 * It has no attempt: a caller that counts its attempts writes them into state, such as
 * 'Attempt 2 of 5.'
 */
export type Refusal = {
    /**
     * Who acts next: 'fix' the agent corrects its input, 'retry' the agent a bit later, 'ask' the
     * person, 'blocked' nobody since the route is shut, 'bug' the code's maintainer.
     */
    kind: 'fix' | 'retry' | 'ask' | 'blocked' | 'bug';
    /** Where it failed, in lowercase words without a colon, such as 'commitlint' or 'git apply'. */
    step: string;
    /** Why, as far as the code knows, as a clause without its final period. */
    reason: string;
    /** What to do now, without its final period. */
    next: string;
    /** What the failure left, as whole sentences on one line, such as 'Nothing was staged.' */
    state?: string;
    /** The original error object, or a program's output text. */
    cause?: unknown;
};
export {};
