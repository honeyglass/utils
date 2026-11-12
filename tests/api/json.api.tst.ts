/**
 * The types `parseJson` gives a caller of '@honeyglass/utils/ts'.
 *
 * The value is the schema's output, and the bug's next comes in an optional options object.
 * Run with `pnpm test`, through TSTyche, against the committed '.d.ts' files.
 */
import { describe, expect, test } from 'tstyche';
import { z } from 'zod';
import type { Refusal } from '@honeyglass/utils/ts';
import { parseJson } from '@honeyglass/utils/ts';

const Beat = z.object({ at: z.number(), state: z.string() });

describe('parseJson', () => {
  test("answers the schema's output or a Refusal", () => {
    expect(parseJson('{}', Beat)).type.toBe<Promise<{ at: number; state: string } | Refusal>>();
  });

  test("takes a caller's next as a string in an options object", () => {
    expect(parseJson).type.toBeCallableWith('{}', Beat, { next: 'call x' });
    expect(parseJson).type.not.toBeCallableWith('{}', Beat, 'call x');
    expect(parseJson).type.not.toBeCallableWith('{}', Beat, { next: 1 });
  });

  test('refuses a value that is no schema', () => {
    expect(parseJson).type.not.toBeCallableWith('{}', { safeParse: () => 1 });
  });
});
