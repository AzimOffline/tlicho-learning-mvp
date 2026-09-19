import {
  createEmptyCard,
  fsrs,
  Rating,
  type Card,
  type CardInput,
} from "ts-fsrs";

import type {
  DueItem,
  FsrsCard,
  FsrsRating,
  FsrsReviewResult,
  ItemId,
  ReviewOutcome,
} from "./types";

export type {
  DueItem,
  FsrsCard,
  FsrsRating,
  FsrsReviewEvent,
  FsrsReviewResult,
  ItemId,
  ReviewOutcome,
} from "./types";

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 36_500,
  enable_fuzz: false,
});

const toLibraryCard = (card: FsrsCard): CardInput => ({
  due: card.due,
  stability: card.stability,
  difficulty: card.difficulty,
  elapsed_days: card.elapsedDays,
  scheduled_days: card.scheduledDays,
  learning_steps: card.learningSteps,
  reps: card.reps,
  lapses: card.lapses,
  state: card.state,
  last_review: card.lastReview,
});

const fromLibraryCard = (itemId: ItemId, card: Card): FsrsCard => ({
  itemId,
  due: card.due,
  stability: card.stability,
  difficulty: card.difficulty,
  elapsedDays: card.elapsed_days,
  scheduledDays: card.scheduled_days,
  learningSteps: card.learning_steps,
  reps: card.reps,
  lapses: card.lapses,
  state: card.state,
  lastReview: card.last_review,
});

export const createFsrsCard = (
  itemId: ItemId,
  now: Date = new Date()
): FsrsCard => fromLibraryCard(itemId, createEmptyCard(now));

export const outcomeToRating = (
  outcome: ReviewOutcome
): { label: FsrsRating; value: Rating.Again | Rating.Good } =>
  outcome === "correct"
    ? { label: "Good", value: Rating.Good }
    : { label: "Again", value: Rating.Again };

export const reviewFsrsCard = (
  card: FsrsCard,
  outcome: ReviewOutcome,
  now: Date = new Date()
): FsrsReviewResult => {
  const rating = outcomeToRating(outcome);
  const result = scheduler.next(toLibraryCard(card), now, rating.value);
  const nextCard = fromLibraryCard(card.itemId, result.card);

  return {
    card: nextCard,
    event: {
      itemId: card.itemId,
      rating: rating.label,
      ratingValue: rating.value,
      reviewedAt: now,
      stateBefore: card.state,
      stateAfter: nextCard.state,
      dueBefore: card.due,
      dueAfter: nextCard.due,
    },
  };
};

export const selectDueItems = <T>(
  items: DueItem<T>[],
  now: Date = new Date(),
  limit = 10
): DueItem<T>[] =>
  items
    .filter(({ card }) => card.due.getTime() <= now.getTime())
    .sort((a, b) => a.card.due.getTime() - b.card.due.getTime())
    .slice(0, Math.max(0, limit));

export const isDue = (card: FsrsCard, now: Date = new Date()) =>
  card.due.getTime() <= now.getTime();
