/**
 * The types the refusal functions give a caller of '@honeyglass/utils/ts'.
 *
 * Only refusal() makes a RefusalText, and a Refusal has no attempt: a caller writes its counter
 * into the state.
 * Run with `pnpm test`, through TSTyche, against the committed '.d.ts' files.
 */
import { describe, expect, test } from 'tstyche';
import type { Refusal, RefusalText } from '@honeyglass/utils/ts';
import { causeText, isRefusal, readRefusal, refusal, RefusalError } from '@honeyglass/utils/ts';

declare const r: Refusal;
declare const value: unknown;

describe('Refusal', () => {
  test('has five kinds', () => {
    expect<Refusal['kind']>().type.toBe<'fix' | 'retry' | 'ask' | 'blocked' | 'bug'>();
  });

  test('has no attempt', () => {
    expect<Refusal>().type.not.toHaveProperty('attempt');
  });

  test('refuses an object without next', () => {
    expect(refusal).type.not.toBeCallableWith({ kind: 'fix', step: 's', reason: 'r' });
  });
});

describe('refusal', () => {
  test('answers a RefusalText, which is a string', () => {
    expect(refusal(r)).type.toBe<RefusalText>();
    expect<RefusalText>().type.toBeAssignableTo<string>();
  });

  test('is the only maker of a RefusalText', () => {
    expect<string>().type.not.toBeAssignableTo<RefusalText>();
  });
});

describe('readRefusal', () => {
  test('answers a Refusal or undefined', () => {
    expect(readRefusal('text')).type.toBe<Refusal | undefined>();
  });
});

describe('isRefusal', () => {
  test('narrows a value to a Refusal', () => {
    if (isRefusal(value)) expect(value).type.toBe<Refusal>();
  });
});

describe('RefusalError', () => {
  test('is an Error with the kind and the step of its refusal', () => {
    expect(new RefusalError(r)).type.toBeAssignableTo<Error>();
    expect(new RefusalError(r).kind).type.toBe<Refusal['kind']>();
    expect(new RefusalError(r).step).type.toBe<string>();
  });
});

describe('causeText', () => {
  test('takes any value and answers a string', () => {
    expect(causeText(value)).type.toBe<string>();
  });
});
