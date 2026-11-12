<div align="center">

# @honeyglass/utils

**`$try` and `refusal()` for TypeScript and JavaScript**

</div>

---

## Introduction

**@honeyglass/utils** holds `$try`, which turns an expected failure into a value the caller handles inline instead of in a try block, and `refusal()`, which writes an error as a text that says who acts next. Code reads that text back with `readRefusal`, so it tells a bug from a message to fix.

---

## Installation

Add the package from GitHub, pinned by a full 40-character commit sha:

```json
{
  "dependencies": {
    "@honeyglass/utils": "github:honeyglass/utils#54e75f80b0b28f13062d8d24a931795f9e66a909"
  }
}
```

It is not published to npm (`"private": true` in `package.json`).

---

## Usage

Every export is listed in [`ts/index.ts`](ts/index.ts).

### 1. `$try`

`$try` takes a promise, or a function so that a synchronous throw is caught too, and answers `{ data, error }`:

```typescript
import assert from 'node:assert/strict';
import { $try } from '@honeyglass/utils/ts';

assert.deepEqual(await $try(Promise.resolve(42)), { data: 42, error: null });

const boom = new Error('no');
const { data, error } = await $try(() => {
  throw boom;
});
assert.equal(data, null);
assert.equal(error, boom);
```

With a fallback `{ or, expected }` it answers the data, or `or` for an error `expected` accepts, and throws every other error again:

```typescript
import { lstat } from 'node:fs/promises';
import { $try, anyError } from '@honeyglass/utils/ts';

const isMissing = (error: Error) => error.message === 'missing';

const missing = Promise.reject(new Error('missing'));
assert.equal(await $try(missing, { or: false, expected: isMissing }), false);

const denied = new Error('EACCES');
const work = $try(Promise.reject(denied), { or: '', expected: isMissing });
await assert.rejects(work, error => error === denied);

const link = await $try(lstat(path), { or: false, expected: anyError }); // every error is the answer
```

### 2. `trySync$`

`trySync$` does the same at once, without a promise, for a function that must stay synchronous:

```typescript
import { trySync$ } from '@honeyglass/utils/ts';

const { data: url, error } = trySync$(() => new URL(href));
```

### 3. `refusal()` and `RefusalError`

`refusal()` turns a `Refusal` into its text, for an answer that reaches an agent. `RefusalError` is the error to throw: its message is that text, its cause the refusal's cause. The `Refusal` type in [`ts/refusal/types.ts`](ts/refusal/types.ts) documents each field and each `kind`.

```typescript
import { refusal, RefusalError } from '@honeyglass/utils/ts';
import type { Refusal } from '@honeyglass/utils/ts';

const RETRY: Refusal = {
  kind: 'retry',
  step: 'git commit',
  reason: 'did not finish within 3 minutes',
  next: 'call commit again',
  state: 'Nothing was committed.',
  cause: new Error('timed out after 180000 ms'),
};

assert.equal(
  refusal(RETRY),
  'Refused (retry) at git commit: did not finish within 3 minutes.\n' +
    'Next: call commit again.\n' +
    'Nothing was committed.\n' +
    'Cause: Error: timed out after 180000 ms',
);

const error = new RefusalError(RETRY);
assert.equal(error.message, refusal(RETRY));
assert.equal(error.cause, RETRY.cause);
assert.equal(error.kind, 'retry');
```

> [!WARNING]
> `refusal()` and `new RefusalError()` throw a `RefusalError` of kind `bug` when a field other than `cause` holds a character outside its allow-list (letters, marks, digits, punctuation, symbols and the space) or does not read back whole, such as a `step` with a colon or a `state` of two lines.

### 4. `readRefusal`

`readRefusal` reads the text of `refusal()` back into a `Refusal`, and answers `undefined` for any other text. Here it reads the bug from the warning above, with `RETRY` from the example before:

```typescript
import { readRefusal, refusal, RefusalError, trySync$ } from '@honeyglass/utils/ts';

const { error } = trySync$(() => refusal({ ...RETRY, step: 'git: apply' }));
assert.ok(error instanceof RefusalError);
const read = readRefusal(error.message);
assert.deepEqual({ kind: read?.kind, step: read?.step }, { kind: 'bug', step: 'refusal' });

assert.equal(readRefusal('Refused: something went wrong.'), undefined);
```

> [!WARNING]
> `readRefusal` and `isRefusal` check the form only, and anyone can write that form: neither proves where a refusal came from, so neither may decide at a trust boundary.

---

## Importing

### In a package

The package exports one subpath, `./ts`, built to `dist/ts/`:

```typescript
import { $try, anyError } from '@honeyglass/utils/ts';
```

### In a hooks module of Claude Code

A hooks module imports a package by relative path only, never by its name. So it loads this package through one file that re-exports the installed build, never a bundle of it, and every other module imports from that file. A missing file stops the whole module, so a change in how the package arrives changes that one file alone. In lean-code that file is `lpm/utils.ts`:

```typescript
export {
  $try,
  anyError,
  causeText,
  isRefusal,
  readRefusal,
  refusal,
  RefusalError,
  trySync$,
  type Refusal,
  type RefusalText,
} from '../node_modules/@honeyglass/utils/dist/ts/index.js';
```

and a hook imports it as `import { $try, anyError, causeText, isRefusal, refusal } from '../lpm/utils.ts';`.

---

## License

MIT, see [LICENSE](LICENSE).
