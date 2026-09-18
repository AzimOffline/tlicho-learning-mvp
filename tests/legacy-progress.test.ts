import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  findFirstLegacyIncompleteLesson,
  getLegacyLessonPercentage,
  isLegacyChallengeCompleted,
  isLegacyLessonCompleted,
} from "@/lib/legacy-progress";

const challenge = (...completed: boolean[]) => ({
  challengeProgress: completed.map((value) => ({ completed: value })),
});

describe("legacy lesson progression characterization", () => {
  it("requires at least one completed progress row", () => {
    assert.equal(isLegacyChallengeCompleted(challenge()), false);
    assert.equal(isLegacyChallengeCompleted(challenge(true)), true);
    assert.equal(isLegacyChallengeCompleted(challenge(true, false)), false);
  });

  it("does not consider an empty lesson complete", () => {
    assert.equal(isLegacyLessonCompleted([]), false);
  });

  it("considers a lesson complete only when every challenge is complete", () => {
    assert.equal(
      isLegacyLessonCompleted([challenge(true), challenge(true)]),
      true
    );
    assert.equal(
      isLegacyLessonCompleted([challenge(true), challenge(false)]),
      false
    );
  });

  it("selects the first lesson containing an incomplete challenge", () => {
    const completeLesson = {
      id: 1,
      challenges: [challenge(true)],
    };
    const incompleteLesson = {
      id: 2,
      challenges: [challenge()],
    };
    const laterLesson = {
      id: 3,
      challenges: [challenge(false)],
    };

    assert.equal(
      findFirstLegacyIncompleteLesson([
        { lessons: [completeLesson, incompleteLesson] },
        { lessons: [laterLesson] },
      ]),
      incompleteLesson
    );
  });

  it("preserves the current behavior that skips empty lessons", () => {
    const emptyLesson = { id: 1, challenges: [] };
    const incompleteLesson = { id: 2, challenges: [challenge()] };

    assert.equal(
      findFirstLegacyIncompleteLesson([
        { lessons: [emptyLesson, incompleteLesson] },
      ]),
      incompleteLesson
    );
  });

  it("calculates rounded completion percentage", () => {
    assert.equal(
      getLegacyLessonPercentage([
        challenge(true),
        challenge(false),
        challenge(false),
      ]),
      33
    );
  });
});
