/**
 * What `$try`, `trySync$` and `anyError` answer a caller, read through '@honeyglass/utils/ts'.
 *
 * The first block came from stamina's 'tests/unit/try-catch.spec.ts', with `tryCatch` renamed to
 * `$try`: one case per path through it, and one line that only compiles while the union still
 * discriminates, the property its callers lean on.
 * One case expects otherwise than in stamina: a thrown value that is no Error now arrives as the
 * cause of an Error, since `$try` wraps it.
 * Run with `pnpm test`, which runs the built package as a project that installs it.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { $try, anyError, trySync$ } from '@honeyglass/utils/ts';

const isMissing = (error: Error) => error.message === 'missing';

describe('$try without a fallback', () => {
  test('a resolved promise carries its value and no error', async () => {
    assert.deepEqual(await $try(Promise.resolve(42)), { data: 42, error: null });
  });

  test('a rejected promise carries that very error', async () => {
    const boom = new Error('still running after 5000ms');
    const { data, error } = await $try(Promise.reject(boom));
    assert.equal(data, null);
    assert.equal(error, boom); // the same object, not a copy of its message
  });

  test('a function that returns a value synchronously', async () => {
    assert.deepEqual(await $try(() => 'ok'), { data: 'ok', error: null });
  });

  test('a function that throws synchronously', async () => {
    const boom = new Error('no');
    const { data, error } = await $try(() => {
      throw boom;
    });
    assert.equal(data, null);
    assert.equal(error, boom);
  });

  test('a function that returns a promise', async () => {
    assert.deepEqual(await $try(async () => 7), { data: 7, error: null });
  });

  test('something thrown that is no Error arrives as the cause of an Error', async () => {
    const { data, error } = await $try(() => {
      throw 'text';
    });
    assert.equal(data, null);
    assert.ok(error instanceof Error);
    assert.equal(error.cause, 'text');
  });

  test('the union discriminates, which is what a caller reads', async () => {
    const result = await $try(Promise.resolve('8040'));
    if (result.error) return assert.fail('the promise resolved');
    // This line is the test: past the guard, data is the value and not `string | null`,
    // so it takes a method of its own. A union that stopped discriminating would not compile.
    assert.equal(result.data.length, 4);
  });
});

describe('$try with a fallback', () => {
  test('answers the data of a work that succeeds', async () => {
    assert.equal(await $try(Promise.resolve('read'), { or: '', expected: isMissing }), 'read');
  });

  test('answers the fallback for an error expected accepts', async () => {
    const missing = Promise.reject(new Error('missing'));
    assert.equal(await $try(missing, { or: false, expected: isMissing }), false);
  });

  test('throws again an error expected does not accept', async () => {
    const denied = new Error('EACCES');
    const work = $try(Promise.reject(denied), { or: '', expected: isMissing });
    await assert.rejects(work, error => error === denied);
  });

  test('catches a sync throw of a function', async () => {
    const work = () => {
      throw new Error('missing');
    };
    assert.equal(await $try(work, { or: 0, expected: isMissing }), 0);
  });

  test('takes any error as the answer with anyError', async () => {
    const denied = Promise.reject(new Error('EACCES'));
    assert.equal(await $try(denied, { or: false, expected: anyError }), false);
  });

  test('shows expected a thrown value that is no Error as the cause of an Error', async () => {
    const seen: Error[] = [];
    const expected = (error: Error) => {
      seen.push(error);
      return true;
    };
    assert.equal(await $try(Promise.reject('missing'), { or: 0, expected }), 0);
    assert.ok(seen[0] instanceof Error);
    assert.equal(seen[0].cause, 'missing');
  });

  test('throws the original error and the error of expected together when expected throws', async () => {
    const denied = new Error('EACCES');
    const broken = new TypeError('expected broke');
    const expected = () => {
      throw broken;
    };
    const work = $try(Promise.reject(denied), { or: '', expected });
    await assert.rejects(
      work,
      error =>
        error instanceof AggregateError && error.errors[0] === denied && error.errors[1] === broken,
    );
  });

  test('throws again the original value that is no Error when expected does not accept it', async () => {
    const work = $try(Promise.reject('EACCES'), { or: '', expected: isMissing });
    await assert.rejects(work, error => error === 'EACCES');
  });
});

describe('trySync$', () => {
  test('answers what the function returned as data, at once', () => {
    assert.deepEqual(
      trySync$(() => 'read'),
      { data: 'read', error: null },
    );
  });

  test('answers a thrown Error as the error itself', () => {
    const denied = new Error('EACCES');
    const { data, error } = trySync$(() => {
      throw denied;
    });
    assert.equal(data, null);
    assert.equal(error, denied);
  });

  test('answers a thrown value that is no Error as an Error with that value as its cause', () => {
    const { data, error } = trySync$(() => {
      throw 'missing';
    });
    assert.equal(data, null);
    assert.ok(error instanceof Error);
    assert.equal(error.cause, 'missing');
  });
});
