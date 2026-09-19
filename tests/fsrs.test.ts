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
      /buildActivity\(practiceItem, vocabulary, practiceQueueItem\.sequence\)/
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
