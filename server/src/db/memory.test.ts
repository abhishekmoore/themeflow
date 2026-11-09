import assert from "node:assert/strict";
import test from "node:test";
import { createMemoryStore } from "./memory.js";

test("memory store insert list get remove", async () => {
  const store = createMemoryStore();
  const created = await store.insert({
    title: "test",
    feedbackText: "line one\nline two that is long enough to pass",
    result: {
      themes: [
        { name: "A", quotes: ["line one"], action: "Do something." },
        { name: "B", quotes: ["line two"], action: "Do another." },
        { name: "C", quotes: ["line one"], action: "Review." },
      ],
      source: "heuristic",
    },
  });
  assert.ok(created.id);
  const list = await store.list(10);
  assert.equal(list.length, 1);
  const got = await store.get(created.id);
  assert.equal(got?.title, "test");
  const removed = await store.remove(created.id);
  assert.equal(removed, true);
  assert.equal(await store.get(created.id), null);
});
