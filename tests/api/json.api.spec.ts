/**
 * What `parseJson` answers a caller, read through '@honeyglass/utils/ts'.
 *
 * The first cases came from lean-code's 'tests/internals/refusal.internals.test.ts'. The bug's
 * next is the package's own: by default it names no program, and a caller may pass its own.
 * Run with `pnpm test`, which runs the built package as a project that installs it.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { z } from 'zod';
import { isRefusal, parseJson, readRefusal, refusal } from '@honeyglass/utils/ts';

const Beat = z.object({ at: z.number(), state: z.string() });
const NEUTRAL_NEXT = "stop and tell the person; the program's maintainer fixes it";
const OWN_NEXT = "stop and tell the person; lean-code's maintainer fixes it";

describe('parseJson', () => {
  test('answers the value its schema checked, which is no refusal', async () => {
    const beat = await parseJson('{"at":1,"state":"idle","extra":true}', Beat);
    assert.deepEqual(beat, { at: 1, state: 'idle' });
    assert.equal(isRefusal(beat), false);
  });

  const broken = [
    { text: '{"at":', reason: 'the text is no JSON', cause: SyntaxError },
    {
      text: '{"at":"1","state":"idle"}',
      reason: 'the JSON does not match its schema at at',
      cause: z.ZodError,
    },
    { text: '[]', reason: 'the JSON does not match its schema at "its top"', cause: z.ZodError },
  ];
  for (const { text, reason, cause } of broken) {
    test(`refuses as a bug: ${reason}`, async () => {
      const refused = await parseJson(text, Beat);
      if (isRefusal(refused) === false) return assert.fail('the text holds no Beat');
      assert.deepEqual(
        { kind: refused.kind, step: refused.step, reason: refused.reason },
        { kind: 'bug', step: 'parse json', reason },
      );
      assert.ok(refused.cause instanceof cause);
    });
  }

  test('names a next that no program owns, which refusal() takes', async () => {
    const refused = await parseJson('{"at":', Beat);
    if (isRefusal(refused) === false) return assert.fail('the text is no JSON');
    assert.equal(readRefusal(refusal(refused))?.next, NEUTRAL_NEXT);
  });

  test("names the caller's own next in its place", async () => {
    for (const text of ['{"at":', '{}']) {
      const refused = await parseJson(text, Beat, { next: OWN_NEXT });
      if (isRefusal(refused) === false) return assert.fail(`${text} holds no Beat`);
      assert.equal(refused.next, OWN_NEXT);
    }
  });

  // A caller in JavaScript can pass any value; a next that is no string would make the answer
  // one isRefusal denies, which the caller would read as checked data.
  for (const next of [null, {}, 42]) {
    test(`names its own next for a next of ${JSON.stringify(next)}, so the answer stays a bug refusal`, async () => {
      const options = { next } as unknown as { next: string };
      const refused = await parseJson('{"at":', Beat, options);
      if (isRefusal(refused) === false) return assert.fail('the answer is no refusal');
      assert.deepEqual(
        { kind: refused.kind, next: refused.next },
        { kind: 'bug', next: NEUTRAL_NEXT },
      );
    });
  }
});
