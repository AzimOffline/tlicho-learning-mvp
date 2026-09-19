import { and, asc, eq, lte } from "drizzle-orm";

import db from "@/db/drizzle";
import { fsrsCards, fsrsReviewHistory } from "@/db/schema";
import {
  createFsrsCard,
  reviewFsrsCard,
  type FsrsCard,
  type ReviewOutcome,
} from "@/lib/fsrs";
import { applyPracticeReviewPolicy } from "@/lib/practice-review-policy";

type CardRow = typeof fsrsCards.$inferSelect;

const fromRow = (row: CardRow): FsrsCard => ({
  itemId: row.itemId,
  due: row.due,
  stability: row.stability,
  difficulty: row.difficulty,
  elapsedDays: row.elapsedDays,
  scheduledDays: row.scheduledDays,
  learningSteps: row.learningSteps,
  reps: row.reps,
  lapses: row.lapses,
  state: row.state,
  lastReview: row.lastReview ?? undefined,
});

const cardValues = (userId: string, card: FsrsCard) => ({
  userId,
  itemId: card.itemId,
  due: card.due,
  stability: card.stability,
  difficulty: card.difficulty,
  elapsedDays: card.elapsedDays,
  scheduledDays: card.scheduledDays,
  learningSteps: card.learningSteps,
  reps: card.reps,
  lapses: card.lapses,
  state: card.state,
  lastReview: card.lastReview ?? null,
  updatedAt: new Date(),
});

export const ensureFsrsCard = async (
  userId: string,
  itemId: string,
  now: Date = new Date()
) => {
  const card = createFsrsCard(itemId, now);

  await db
    .insert(fsrsCards)
    .values(cardValues(userId, card))
    .onConflictDoNothing({ target: [fsrsCards.userId, fsrsCards.itemId] });

  return card;
};

export const applyFsrsReview = async (
  userId: string,
  itemId: string,
  outcome: ReviewOutcome,
  now: Date = new Date()
) => {
  let row = await db.query.fsrsCards.findFirst({
    where: and(eq(fsrsCards.userId, userId), eq(fsrsCards.itemId, itemId)),
  });

  if (!row) {
    await ensureFsrsCard(userId, itemId, now);
    row = await db.query.fsrsCards.findFirst({
      where: and(eq(fsrsCards.userId, userId), eq(fsrsCards.itemId, itemId)),
    });
  }

  if (!row) throw new Error("Unable to create review card.");

  const result = applyPracticeReviewPolicy(
    reviewFsrsCard(fromRow(row), outcome, now),
    outcome,
    now
  );

  await db
    .update(fsrsCards)
    .set(cardValues(userId, result.card))
    .where(and(eq(fsrsCards.userId, userId), eq(fsrsCards.itemId, itemId)));

  await db.insert(fsrsReviewHistory).values({
    userId,
    itemId,
    rating: result.event.ratingValue,
    reviewedAt: result.event.reviewedAt,
    stateBefore: result.event.stateBefore,
    stateAfter: result.event.stateAfter,
    dueBefore: result.event.dueBefore,
    dueAfter: result.event.dueAfter,
  });

  return result;
};

export const getDueFsrsCards = async (
  userId: string,
  limit = 10,
  now: Date = new Date()
) =>
  db.query.fsrsCards.findMany({
    where: and(eq(fsrsCards.userId, userId), lte(fsrsCards.due, now)),
    orderBy: [asc(fsrsCards.due)],
    limit,
    with: { vocabularyItem: true },
  });

export const getFsrsCardsForUser = (userId: string) =>
  db.query.fsrsCards.findMany({
    where: eq(fsrsCards.userId, userId),
    with: { vocabularyItem: true },
  });

export const getFsrsReviewHistoryForUser = (userId: string) =>
  db.query.fsrsReviewHistory.findMany({
    where: eq(fsrsReviewHistory.userId, userId),
  });
