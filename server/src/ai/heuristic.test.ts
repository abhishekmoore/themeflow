import assert from "node:assert/strict";
import test from "node:test";
import { heuristicCluster } from "./heuristic.js";

const SAMPLE = `The app is slow when I load the dashboard.
I keep hitting a crash on the export button.
The pricing page is confusing and I almost cancelled.
Support took three days to reply.
The new chart is beautiful but hard to read on mobile.
Search does not find old tickets.`;

test("heuristicCluster returns 3 to 6 themes", () => {
  const result = heuristicCluster(SAMPLE);
  assert.equal(result.source, "heuristic");
  assert.ok(result.themes.length >= 3 && result.themes.length <= 6);
  for (const theme of result.themes) {
    assert.ok(theme.name.length > 0);
    assert.ok(theme.quotes.length > 0);
    assert.ok(theme.action.length > 0);
    for (const quote of theme.quotes) {
      assert.ok(SAMPLE.includes(quote) || quote.length > 0);
    }
  }
});

test("heuristicCluster does not invent model source", () => {
  const result = heuristicCluster(SAMPLE);
  assert.equal(result.source, "heuristic");
  assert.equal(result.model, undefined);
});
