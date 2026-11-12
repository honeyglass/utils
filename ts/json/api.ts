/**
 * The one place a project parses JSON, always against a Zod schema.
 *
 * parseJson: the value a JSON text holds, checked by its schema, or a bug refusal that says why not.
 *
 * No file, no program's output and no model's answer reaches code as a type it was never checked
 * for. Only Zod's types are imported: the schema a caller passes does the check.
 *
 * @example const claims = await parseJson(await readFile(path, 'utf8'), Claims)
 */
import type { z } from 'zod';
import { shown } from '../quote/index.ts';
import type { Refusal } from '../refusal/index.ts';
import { $try } from '../try-catch/index.ts';

// Every project calls parseJson, so its bug names no program; a caller passes its own next.
const BUG_NEXT = "stop and tell the person; the program's maintainer fixes it";

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
export const parseJson = async <S extends z.ZodType>(
  text: string,
  schema: S,
  options?: { next: string },
): Promise<z.output<S> | Refusal> => {
  // A caller in JavaScript can pass any value, and a next that is no string makes an answer that
  // isRefusal denies, read as checked data; it is read once, so a getter cannot change it.
  const own = options?.next;
  const next = typeof own === 'string' ? own : BUG_NEXT;
  const { data, error } = await $try((): unknown => JSON.parse(text));
  if (error !== null) return { ...BROKEN, next, reason: 'the text is no JSON', cause: error };
  const parsed = schema.safeParse(data);
  if (parsed.success) return parsed.data;
  const path = parsed.error.issues[0]?.path.join('.') || 'its top';
  return {
    ...BROKEN,
    next,
    reason: `the JSON does not match its schema at ${shown(path)}`,
    cause: parsed.error,
  };
};

const BROKEN = { kind: 'bug', step: 'parse json' } as const;
