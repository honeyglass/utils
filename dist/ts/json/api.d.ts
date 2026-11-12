import type { Refusal } from '../refusal/index.ts';
import type { Schema } from './types.ts';
/**
 * The value a JSON text holds, checked by its schema, or a refusal that says why not.
 *
 * The refusal is a `bug`, as for a program's own state files; a caller whose text comes from the
 * agent or the person spreads it with its own kind, step and next.
 *
 * @param text - the JSON text
 * @param schema - the Zod schema the value must match; a key it does not name is dropped
 * @param options - next, the bug's next step; without a string, "stop and tell the person; the program's maintainer fixes it"
 * @returns the value, or the refusal with the parse or schema error as its cause
 * @example
 * const claims = await parseJson(await readFile(path, 'utf8'), Claims)
 * if (isRefusal(claims)) return { deny: refusal({ ...claims, step: 'claims' }) }
 * @example const state = await parseJson(text, State, { next: "stop; lean-code's maintainer fixes it" })
 */
export declare const parseJson: <Output>(text: string, schema: Schema<Output>, options?: {
    next: string;
}) => Promise<Output | Refusal>;
