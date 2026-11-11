import type { Refusal, RefusalText } from './types.ts';
/**
 * The text of a refusal, for an answer that reaches the agent or a RefusalError.
 *
 * Each field is read once, so a getter cannot make the text and its check disagree.
 *
 * @param r - the refusal
 * @returns its text: the kind, step and reason, the next step, the state, the cause indented
 * @throws a bug RefusalError for a field outside the allow-list or one readRefusal does not read back whole, such as a step with a colon
 * @example return { deny: refusal({ kind: 'retry', step: 'git commit', reason: 'HEAD moved', next: 'call commit again' }) }
 */
export declare const refusal: (r: Refusal) => RefusalText;
/**
 * The refusal a text of refusal() holds, such as the answer of a `$.tool.call`.
 *
 * The cause comes back as its text, its indent removed.
 *
 * @param text - any text
 * @returns the refusal, or undefined for a text refusal() did not make
 * @example if (readRefusal(answer.deny)?.kind === 'fix') return retryOf(answer)
 */
export declare const readRefusal: (text: string) => Refusal | undefined;
/**
 * Whether a value is a refusal, such as the one parseJson answers in place of a value.
 *
 * @param value - any value
 * @returns true for an object with a kind, a step, a reason and a next
 * @example if (isRefusal(parsed)) return { deny: refusal(parsed) }
 */
export declare const isRefusal: (value: unknown) => value is Refusal;
/** A refusal thrown: its text as the message, its cause as the cause. */
export declare class RefusalError extends Error {
    readonly kind: Refusal['kind'];
    readonly step: string;
    constructor(r: Refusal);
}
/**
 * A cause as text: each error of its chain as `Name: message`, capped with its end kept.
 *
 * It never throws: a link it cannot read, such as one whose getter throws, is a fixed fallback text,
 * and each link is cut to its end before the links are joined, so a chain of huge messages cannot
 * make the join throw.
 * A carriage return becomes a line break; every character but letters, marks, digits,
 * punctuation, symbols, the space, the tab and the line break becomes U+FFFD, and so does one
 * that shows as nothing, such as U+3164 HANGUL FILLER.
 *
 * @param cause - an error, a program's output, or any thrown value
 * @returns at most 4000 characters
 * @example const line = { step, error: causeText(error) }
 */
export declare const causeText: (cause: unknown) => string;
