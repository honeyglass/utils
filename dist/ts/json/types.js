/**
 * The shape of the schema parseJson checks a value with, as Zod 4's safeParse answers.
 *
 * Schema: a value whose safeParse answers the data it checked, or an error with its issues' paths.
 *
 * It names only what parseJson reads, never a type of Zod's: a caller that loads Zod by a path
 * gets another declaration file than the package would, and TypeScript holds the two apart.
 *
 * @example const state = await parseJson(text, z.object({ at: z.number() }))
 */
export {};
