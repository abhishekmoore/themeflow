import assert from "node:assert/strict";
import test from "node:test";
import { formatRelative } from "../lib/dates.js";

test("formatRelative uses date-fns and returns a relative string", () => {
  const iso = new Date(Date.now() - 60_000).toISOString();
  const text = formatRelative(iso);
  assert.ok(text.includes("minute") || text.includes("ago") || text.includes("less than"));
  assert.notEqual(text, "unknown time");
});

test("formatRelative handles invalid date", () => {
  assert.equal(formatRelative("not-a-date"), "unknown time");
});
