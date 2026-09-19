import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { vocabularyItems } from "@/db/schema";
import { buildPracticeActivity } from "@/lib/practice-activities";

type VocabularyItem = typeof vocabularyItems.$inferSelect;

const item = (
  id: string,
  tlicho: string,
  english: string,
  audioSrc: string | null = null
): VocabularyItem => ({
  id,
  tlicho,
  english,
  audioSrc,
  alternateAudioSrcs: null,
  category: "test",
  partOfSpeech: null,
  exampleTlicho: null,
  exampleEnglish: null,
  notes: null,
  imageSrc: null,
  sourceUrl: null,
  verificationStatus: "source-checked",
});

const vocabulary = [
  item("one", "akwe", "one", "/audio/tlicho/one.mp3"),
  item("two", "nàke", "two"),
  item("three", "ta", "three"),
  item("four", "dı̨", "four"),
];

describe("practice activity presentation", () => {
  it("separates the instruction from the prominent Tłı̨chǫ target", () => {
    const activity = buildPracticeActivity(vocabulary[0], vocabulary, 0);

    assert.equal(activity.instruction, "Choose the English meaning");
    assert.equal(activity.focusText, "akwe");
    assert.equal(activity.focusLanguage, "Tłı̨chǫ");
    assert.match(activity.companion.src, /^\/characters\/tactile\//);
    assert.ok(
      activity.options.some(({ text, correct }) => text === "one" && correct)
    );
  });

  it("rotates to an English target and Tłı̨chǫ answers", () => {
    const activity = buildPracticeActivity(vocabulary[0], vocabulary, 1);

    assert.equal(activity.instruction, "Choose the Tłı̨chǫ translation");
    assert.equal(activity.focusText, "one");
    assert.equal(activity.focusLanguage, "English");
    assert.ok(
      activity.options.some(({ text, correct }) => text === "akwe" && correct)
    );
  });

  it("uses listening presentation when the item has audio", () => {
    const activity = buildPracticeActivity(vocabulary[0], vocabulary, 2);

    assert.equal(
      activity.instruction,
      "Listen, then choose the English meaning"
    );
    assert.equal(activity.focusText, null);
    assert.equal(activity.focusLanguage, "Audio");
    assert.equal(activity.promptAudioSrc, "/audio/tlicho/one.mp3");
  });

  it("keeps the selected companion stable for the same activity", () => {
    const first = buildPracticeActivity(vocabulary[0], vocabulary, 0);
    const rerendered = buildPracticeActivity(vocabulary[0], vocabulary, 0);

    assert.deepEqual(first.companion, rerendered.companion);
  });
});
