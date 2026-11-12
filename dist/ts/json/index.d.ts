/**
 * The barrel of the json module, from './api.ts'.
 *
 * parseJson: the value a JSON text holds, checked by its schema, or a bug refusal that says why not.
 *
 * @example if (isRefusal(claims)) throw new RefusalError({ ...claims, step: 'claims' })
 */
export { parseJson } from './api.ts';
