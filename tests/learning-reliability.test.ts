import assert from "node:assert/strict";
import test from "node:test";
import { seededRandom, shuffleChoices } from "../lib/answer-choices";
import { buildPracticeActivity } from "../lib/practice-activities";
import {
  parseStoredDemoProgress,
  resumeLessonSession,
} from "../lib/demo-progress";
import { getMetadataBase } from "../lib/site-url";
import { filterWords } from "../lib/word-library";
import { vocabulary } from "../lib/vocabulary";

test("every exercise mode permits every correct-answer position", () => {
  for (let mode = 0; mode < 4; mode++) {
    const positions = new Set<number>();
    for (let attempt = 0; attempt < 100; attempt++) {
      const activity = buildPracticeActivity(
        vocabulary[0],
        vocabulary,
        mode,
        seededRandom(`attempt-${attempt}`)
      );
      positions.add(activity.options.findIndex((option) => option.correct));
      assert.equal(
        activity.options.filter((option) => option.correct).length,
        1
      );
      assert.equal(
        new Set(activity.options.map((option) => option.text)).size,
        4
      );
    }
    assert.deepEqual([...positions].sort(), [0, 1, 2, 3]);
  }
});

test("an attempt keeps its order across rerenders without mutating input", () => {
  const choices = [1, 2, 3, 4];
  assert.deepEqual(
    shuffleChoices(choices, seededRandom("session")),
    shuffleChoices(choices, seededRandom("session"))
  );
  assert.deepEqual(choices, [1, 2, 3, 4]);
});

test("listening fallbacks preserve a solvable translation exercise", () => {
  assert.equal(
    buildPracticeActivity(vocabulary[0], vocabulary, 2).fallbackText,
    vocabulary[0].tlicho
  );
  assert.equal(
    buildPracticeActivity(vocabulary[0], vocabulary, 3).fallbackText,
    vocabulary[0].english
  );
});

test("checked lesson results survive saving, but obsolete lesson contents do not resume", () => {
  const session = {
    lessonId: "0-0",
    itemIds: ["a", "b"],
    index: 1,
    seed: "attempt",
    selectedId: "b",
    result: "correct",
  };
  const restored = parseStoredDemoProgress(
    JSON.stringify({ xp: 20, lessonSession: session })
  );
  assert.deepEqual(restored.lessonSession, session);
  assert.equal(restored.xp, 20);
  assert.deepEqual(
    resumeLessonSession(restored.lessonSession, [
      { id: "0-0", items: [{ id: "a" }, { id: "b" }] },
    ]),
    session
  );
  assert.equal(
    resumeLessonSession(restored.lessonSession, [
      { id: "0-0", items: [{ id: "b" }, { id: "a" }] },
    ]),
    undefined
  );
  for (const invalid of [
    { ...session, index: 2 },
    { ...session, index: -1 },
    { ...session, seed: null },
    { ...session, selectedId: null },
  ]) {
    assert.equal(
      parseStoredDemoProgress(JSON.stringify({ lessonSession: invalid }))
        .lessonSession,
      undefined
    );
  }
});

test("production metadata never falls back to a local or malformed URL", () => {
  for (const url of [
    undefined,
    "",
    "bad",
    "http://localhost:3000",
    "https://127.0.0.1",
    "http://[::1]",
    "javascript:alert(1)",
  ]) {
    assert.equal(getMetadataBase(url, true).origin, "https://learntlicho.ca");
  }
  assert.equal(
    getMetadataBase("https://preview.example.org/path", true).origin,
    "https://preview.example.org"
  );
  assert.equal(
    getMetadataBase(undefined, false).origin,
    "http://localhost:3000"
  );
});

test("word search supports meanings, Unicode normalization, and category filtering", () => {
  const word = vocabulary.find((word) => word.exampleTlicho)!;
  assert.ok(
    filterWords(vocabulary, word.tlicho.normalize("NFD"), "").includes(word)
  );
  assert.ok(
    filterWords(vocabulary, word.english, word.category!).includes(word)
  );
  assert.equal(filterWords(vocabulary, "no-such-word-xyz", "").length, 0);
  assert.equal(filterWords(vocabulary, "", "").length, 100);
  assert.ok(
    filterWords(vocabulary, "", word.category!).every(
      (item) => item.category === word.category
    )
  );
});
