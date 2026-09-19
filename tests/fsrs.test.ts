import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";

import {
  createFsrsCard,
  outcomeToRating,
  reviewFsrsCard,
  selectDueItems,
} from "@/lib/fsrs";
import { applyPracticeReviewPolicy } from "@/lib/practice-review-policy";
import {
  applyPracticeHeartReward,
  getPracticeHeartReward,
} from "@/lib/practice-rewards";

describe("reusable FSRS scheduler", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");

  it("maps app outcomes to only Again and Good", () => {
    assert.deepEqual(outcomeToRating("incorrect"), {
      label: "Again",
      value: 1,
    });
    assert.deepEqual(outcomeToRating("correct"), { label: "Good", value: 3 });
  });

  it("schedules a correct answer and records a Good review", () => {
    const result = reviewFsrsCard(
      createFsrsCard("item-1", now),
      "correct",
      now
    );

    assert.equal(result.event.rating, "Good");
    assert.equal(result.card.reps, 1);
    assert.ok(result.card.due.getTime() > now.getTime());
  });

  it("schedules an incorrect answer and records a lapse/Again path", () => {
    const first = reviewFsrsCard(
      createFsrsCard("item-1", now),
      "correct",
      now
    ).card;
    const later = new Date("2026-01-02T12:00:00.000Z");
    const result = reviewFsrsCard(first, "incorrect", later);

    assert.equal(result.event.rating, "Again");
    assert.equal(result.card.reps, 2);
    assert.ok(result.card.lapses >= first.lapses);
  });

  it("keeps an incorrect Practice item immediately ready for correction", () => {
    const scheduled = reviewFsrsCard(
      createFsrsCard("item-1", now),
      "incorrect",
      now
    );
    const result = applyPracticeReviewPolicy(scheduled, "incorrect", now);

    assert.equal(result.event.rating, "Again");
    assert.equal(result.card.due.getTime(), now.getTime());
    assert.equal(result.event.dueAfter.getTime(), now.getTime());
  });

  it("preserves the FSRS due date after a correct Practice answer", () => {
    const scheduled = reviewFsrsCard(
      createFsrsCard("item-1", now),
      "correct",
      now
    );
    const result = applyPracticeReviewPolicy(scheduled, "correct", now);

    assert.ok(result.card.due.getTime() > now.getTime());
    assert.equal(result.card.due.getTime(), scheduled.card.due.getTime());
  });

  it("shows five reviews immediately after five misses in a seven-item session", () => {
    const reviewedCards = Array.from({ length: 7 }, (_, index) => {
      const outcome = index < 5 ? "incorrect" : "correct";
      return applyPracticeReviewPolicy(
        reviewFsrsCard(createFsrsCard(`item-${index}`, now), outcome, now),
        outcome,
        now
      ).card;
    });

    const ready = selectDueItems(
      reviewedCards.map((card) => ({ card, payload: card.itemId })),
      now,
      reviewedCards.length
    );

    assert.equal(ready.length, 5);
    assert.deepEqual(
      ready.map(({ card }) => card.itemId),
      ["item-0", "item-1", "item-2", "item-3", "item-4"]
    );
  });

  it("rewards correct Practice answers without exceeding the heart cap", () => {
    assert.equal(getPracticeHeartReward(0), 0);
    assert.equal(getPracticeHeartReward(1), 1);
    assert.equal(getPracticeHeartReward(2), 1);
    assert.equal(getPracticeHeartReward(3), 1);
    assert.equal(getPracticeHeartReward(4), 2);
    assert.equal(getPracticeHeartReward(5), 2);
    assert.equal(getPracticeHeartReward(6), 2);
    assert.equal(getPracticeHeartReward(7), 3);

    assert.deepEqual(applyPracticeHeartReward(1, 6, 5), {
      heartsEarned: 2,
      heartsRestored: 2,
      nextHearts: 3,
    });
    assert.deepEqual(applyPracticeHeartReward(5, 6, 5), {
      heartsEarned: 2,
      heartsRestored: 0,
      nextHearts: 5,
    });
  });

  it("selects only due items in due-date order and respects session size", () => {
    const overdue = createFsrsCard(
      "overdue",
      new Date("2025-12-30T12:00:00.000Z")
    );
    const due = createFsrsCard("due", now);
    const future = createFsrsCard(
      "future",
      new Date("2026-01-02T12:00:00.000Z")
    );

    const selected = selectDueItems(
      [
        { card: due, payload: "b" },
        { card: future, payload: "c" },
        { card: overdue, payload: "a" },
      ],
      now,
      2
    );

    assert.deepEqual(
      selected.map(({ card }) => card.itemId),
      ["overdue", "due"]
    );
  });

  it("keeps the scheduler independent from app, database, and Tłı̨chǫ code", () => {
    const core = ["lib/fsrs/index.ts", "lib/fsrs/types.ts"]
      .map((path) => readFileSync(resolve(process.cwd(), path), "utf8"))
      .join("\n");

    assert.doesNotMatch(
      core,
      /@\/db|drizzle|vocabulary|courseId|lessonId|tlicho/i
    );
  });

  it("does not expose manual rating controls or typed answers in Practice", () => {
    const practiceUi = readFileSync(
      resolve(process.cwd(), "app/(main)/practice/practice-session.tsx"),
      "utf8"
    );

    assert.doesNotMatch(practiceUi, />\s*(Again|Hard|Good|Easy)\s*</i);
    assert.doesNotMatch(practiceUi, /<(input|textarea)\b/i);
  });

  it("keeps the current demo activity stable while its FSRS card updates", () => {
    const demoUi = readFileSync(
      resolve(process.cwd(), "app/demo/demo-app.tsx"),
      "utf8"
    );

    assert.match(demoUi, /sequence: state\.reviewsCompleted \+ sessionIndex/);
    assert.match(
      demoUi,
      /buildActivity\(\s*practiceItem,\s*courseVocabulary,\s*practiceQueueItem\.sequence\s*\)/
    );
    assert.doesNotMatch(
      demoUi,
      /buildActivity\(practiceItem, vocabulary, practiceCard\.reps\)/
    );
  });

  it("uses a focused lesson shell and plays the finish sound in the demo", () => {
    const demoUi = readFileSync(
      resolve(process.cwd(), "app/demo/demo-app.tsx"),
      "utf8"
    );

    assert.match(demoUi, /const lessonInProgress =/);
    assert.match(demoUi, /void finishControls\.play\(\)/);
    assert.match(demoUi, /src: "\/finish\.mp3"/);
  });
});
