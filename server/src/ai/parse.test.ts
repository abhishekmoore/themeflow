import assert from "node:assert/strict";
import test from "node:test";
import { extractJson } from "./parse.js";

test("extractJson parses raw JSON", () => {
  const value = extractJson('{"themes":[]}');
  assert.deepEqual(value, { themes: [] });
});

test("extractJson strips markdown fences", () => {
  const value = extractJson('```json\n{"ok":true}\n```');
  assert.deepEqual(value, { ok: true });
});

test("extractJson rejects empty", () => {
  assert.throws(() => extractJson("   "), /empty/);
});
