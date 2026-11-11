/**
 * A refusal from one function, so code can read it back and tell a bug from a message to fix.
 *
 * refusal: the text of a refusal, for an answer that reaches the agent or a RefusalError.
 * readRefusal: the refusal a text of refusal() holds.
 * isRefusal: whether a value is a refusal object, such as one a helper answers.
 * RefusalError: the one error that is thrown, its text as the message.
 * causeText: a cause chain as text, cut to its last 4000 characters.
 *
 * readRefusal and isRefusal check the form only, and anyone can write that form: neither proves
 * where a refusal came from, so neither may decide at a trust boundary.
 *
 * @example if (isRefusal(scopes)) return { deny: refusal(scopes) }
 */
import { trySync$ } from '../try-catch/index.ts';
import type { Refusal, RefusalText } from './types.ts';

// A program's output can reach 4 MB; its end names the failure.
const CAUSE_LIMIT = 4000;
// A chain deeper than this is cut, so a cause that names itself ends.
const CHAIN_LIMIT = 10;
const KINDS = ['fix', 'retry', 'ask', 'blocked', 'bug'];
// Every field but the cause is one line, so no field forges a line of the text, such as a second
// Next line; \u2028 and \u2029 end a line as well. One-line classes also keep the match linear.
const TEXT =
  /^Refused \((fix|retry|ask|blocked|bug)\) at ([^:\n\r\u2028\u2029]+): ([^\n\r\u2028\u2029]*)\.\nNext: ([^\n\r\u2028\u2029]*)\.(?:\n(?!Cause: )([^\n\r\u2028\u2029]*))?(?:\nCause: ([\s\S]*))?$/;
// Each line of the cause is indented, so none of them starts like a line of the refusal.
const CAUSE_BREAK = /[\n\u2028\u2029]/g;
const CAUSE_INDENT = '\n  ';
// A control other than a tab or a line break, or an invisible format character such as a bidi
// override or a tag character, can hide or reorder what a reader of the cause sees.
const UNSAFE = /(?![\t\n])[\p{Cc}\p{Cf}]/gu;
const UNREAD = '[a cause that could not be read]';
// A refusal with a field readRefusal does not read back whole, such as a step with a colon, is the caller's bug.
// Its own fields are fixed, so the RefusalError it throws passes the check.
const MALFORMED = {
  kind: 'bug',
  step: 'refusal',
  reason:
    'a field readRefusal does not read back whole, such as a step with a colon or a state of two lines',
  next: 'tell the person; the code that made this refusal needs a fix',
} as const;

/**
 * The text of a refusal, for an answer that reaches the agent or a RefusalError.
 *
 * Each field is read once, so a getter cannot make the text and its check disagree.
 *
 * @param r - the refusal
 * @returns its text: the kind, step and reason, the next step, the state, the cause indented
 * @throws a bug RefusalError for a field readRefusal does not read back whole, such as a step with a colon or a state of two lines
 * @example return { deny: refusal({ kind: 'retry', step: 'git commit', reason: 'HEAD moved', next: 'call commit again' }) }
 */
export const refusal = (r: Refusal) => {
  const { kind, step, reason, next, state, cause } = r;
  const lines = [`Refused (${kind}) at ${step}: ${reason}.`, `Next: ${next}.`];
  if (state !== undefined && state !== '') lines.push(state);
  if (cause !== undefined)
    lines.push(`Cause: ${causeText(cause).replace(CAUSE_BREAK, CAUSE_INDENT)}`);
  const text = lines.join('\n');
  if (isReadBack(text, { kind, step, reason, next, state })) return text;
  throw new RefusalError({ ...MALFORMED, cause: new Error(text, { cause }) });
};

/**
 * The refusal a text of refusal() holds, such as the answer of a `$.tool.call`.
 *
 * The cause comes back as its text, its indent removed.
 *
 * @param text - any text
 * @returns the refusal, or undefined for a text refusal() did not make
 * @example if (readRefusal(answer.deny)?.kind === 'fix') return retryOf(answer)
 */
export const readRefusal = (text: string): Refusal | undefined => {
  const [, kind, step, reason, next, state, cause] = TEXT.exec(text) ?? [];
  if (kind === undefined || isKind(kind) === false) return undefined;
  return {
    kind,
    step,
    reason,
    next,
    ...(state === undefined ? {} : { state }),
    ...(cause === undefined ? {} : { cause: cause.replaceAll(CAUSE_INDENT, '\n') }),
  };
};

/**
 * Whether a value is a refusal, such as the one parseJson answers in place of a value.
 *
 * @param value - any value
 * @returns true for an object with a kind, a step, a reason and a next
 * @example if (isRefusal(parsed)) return { deny: refusal(parsed) }
 */
export const isRefusal = (value: unknown): value is Refusal =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  typeof value.kind === 'string' &&
  isKind(value.kind) &&
  'step' in value &&
  typeof value.step === 'string' &&
  'reason' in value &&
  typeof value.reason === 'string' &&
  'next' in value &&
  typeof value.next === 'string';

/** A refusal thrown: its text as the message, its cause as the cause. */
export class RefusalError extends Error {
  readonly kind: Refusal['kind'];
  readonly step: string;

  constructor(r: Refusal) {
    // Each field is read once, so the kind and the step are the ones the message names.
    const { kind, step, reason, next, state, cause } = r;
    super(refusal({ kind, step, reason, next, state, cause }), { cause });
    this.name = 'RefusalError';
    this.kind = kind;
    this.step = step;
  }
}

/**
 * A cause as text: each error of its chain as `Name: message`, capped with its end kept.
 *
 * It never throws: a link it cannot read, such as one whose getter throws, is a fixed fallback text.
 * A carriage return becomes a line break; controls and invisible format characters become U+FFFD.
 *
 * @param cause - an error, a program's output, or any thrown value
 * @returns at most 4000 characters
 * @example const line = { step, error: causeText(error) }
 */
export const causeText = (cause: unknown) => {
  const chain = [cause];
  for (
    let link = causeOf(cause);
    link !== undefined && chain.length < CHAIN_LIMIT;
    link = causeOf(link)
  ) {
    chain.push(link);
  }
  const text = chain
    .map(linkText)
    .join('\nCaused by: ')
    .replace(/\r\n?/g, '\n')
    .replace(UNSAFE, '\ufffd');
  return text.length <= CAUSE_LIMIT ? text : `…${text.slice(text.length - CAUSE_LIMIT + 1)}`;
};

// TEXT alone passes a step with a colon, read back cut at the colon, so the fields are compared.
const isReadBack = (text: string, r: Refusal): text is RefusalText => {
  const read = readRefusal(text);
  return (
    read?.kind === r.kind &&
    read.step === r.step &&
    read.reason === r.reason &&
    read.next === r.next &&
    read.state === (r.state === '' ? undefined : r.state)
  );
};

const isKind = (value: string): value is Refusal['kind'] => KINDS.includes(value);

// Reading a cause runs a getter or a proxy's trap, which may throw; the chain then ends there.
const causeOf = (link: unknown) => {
  const { data, error } = trySync$(() => (isError(link) ? link.cause : undefined));
  return error === null ? data : UNREAD;
};

// A getter, a proxy's trap or a toString may throw or answer no string, so a link is read inside
// trySync$, and an Error counts only with a string name and message.
const linkText = (link: unknown) => {
  const { data, error } = trySync$(() => (isError(link) ? errorText(link) : valueText(link)));
  return error === null ? data : UNREAD;
};

const errorText = ({ name, message }: Error) =>
  typeof name === 'string' && typeof message === 'string' ? `${name}: ${message}` : UNREAD;

// String() throws for an object without a prototype, such as Object.create(null).
const valueText = (value: unknown) =>
  typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === null
    ? '[object Object]'
    : String(value);

// The check of '../try-catch/api.ts', which that module keeps internal: an Error of another
// realm fails instanceof, so the check reads the internal tag where the runtime has Error.isError.
const isError = (value: unknown): value is Error =>
  'isError' in Error && typeof Error.isError === 'function'
    ? Error.isError(value) === true
    : value instanceof Error || Object.prototype.toString.call(value) === '[object Error]';
