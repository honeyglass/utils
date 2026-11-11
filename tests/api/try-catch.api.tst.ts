/**
 * The types `$try`, `trySync$` and `anyError` give a caller of '@honeyglass/utils/ts'.
 *
 * A fallback joins the type of the data, and every error is an Error, never unknown.
 * Run with `pnpm test`, through TSTyche, against the committed '.d.ts' files.
 */
import { describe, expect, test } from 'tstyche';
import type { Failure, Result, Success } from '@honeyglass/utils/ts';
import { $try, anyError, trySync$ } from '@honeyglass/utils/ts';

declare const read: Promise<string>;
declare const isMissing: (error: Error) => boolean;

describe('$try', () => {
  test('answers a Result of the data for a promise or a function', () => {
    expect($try(read)).type.toBe<Promise<Result<string>>>();
    expect($try(() => 42)).type.toBe<Promise<Result<number>>>();
    expect($try(async () => true)).type.toBe<Promise<Result<boolean>>>();
  });

  test('answers the data or the fallback with a fallback', () => {
    expect($try(read, { or: 0, expected: isMissing })).type.toBe<Promise<string | number>>();
    expect($try(read, { or: undefined, expected: anyError })).type.toBe<
      Promise<string | undefined>
    >();
  });

  test('refuses a value that is neither a promise nor a function', () => {
    expect($try).type.not.toBeCallableWith('text');
  });

  test('refuses a fallback without expected', () => {
    expect($try).type.not.toBeCallableWith(read, { or: '' });
  });
});

describe('trySync$', () => {
  test('answers a Result at once, with no promise', () => {
    expect(trySync$(() => JSON.stringify(42))).type.toBe<Result<string>>();
  });
});

describe('Result', () => {
  test('is a Success or a Failure, with Error as the default error', () => {
    expect<Result<string>>().type.toBe<Success<string> | Failure<Error>>();
    expect<Success<string>>().type.toBe<{ data: string; error: null }>();
    expect<Failure<Error>>().type.toBe<{ data: null; error: Error }>();
  });
});
