import assert from "node:assert/strict";
import test from "node:test";

import {
  initialDemoProgressState,
  parseStoredDemoProgress,
} from "../lib/demo-progress";

test("malformed progress returns safe defaults", () => {
  assert.deepEqual(
    parseStoredDemoProgress("not json"),
    initialDemoProgressState
  );
});

test("partial progress is sanitized without losing valid fields", () => {
  const result = parseStoredDemoProgress(
    JSON.stringify({
      version: 1,
      xp: 40,
      hearts: 99,
      completedLessons: ["0-0", "0-0", 12],
      encountered: ["word-1"],
      cards: null,
    })
  );

  assert.equal(result.version, 2);
  assert.equal(result.xp, 40);
  assert.equal(result.hearts, initialDemoProgressState.hearts);
  assert.deepEqual(result.completedLessons, ["0-0"]);
  assert.deepEqual(result.encountered, ["word-1"]);
  assert.deepEqual(result.cards, {});
});

test("invalid cards are discarded while valid cards survive", () => {
  const validCard = {
    itemId: "word-1",
    due: "2026-09-19T12:00:00.000Z",
    stability: 1,
    difficulty: 5,
    elapsedDays: 0,
    scheduledDays: 1,
    learningSteps: 0,
    reps: 1,
    lapses: 0,
    state: 1,
  };
  const result = parseStoredDemoProgress(
    JSON.stringify({
      cards: { "word-1": validCard, "word-2": { ...validCard } },
    })
  );

  assert.deepEqual(result.cards, { "word-1": validCard });
});
