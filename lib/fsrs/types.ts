import type { State } from "ts-fsrs";

export type ItemId = string;

export type ReviewOutcome = "correct" | "incorrect";

export type FsrsRating = "Again" | "Good";

export type FsrsCard = {
  itemId: ItemId;
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: State;
  lastReview?: Date;
};

export type FsrsReviewEvent = {
  itemId: ItemId;
  rating: FsrsRating;
  ratingValue: 1 | 3;
  reviewedAt: Date;
  stateBefore: State;
  stateAfter: State;
  dueBefore: Date;
  dueAfter: Date;
};

export type FsrsReviewResult = {
  card: FsrsCard;
  event: FsrsReviewEvent;
};

export type DueItem<T> = {
  card: FsrsCard;
  payload: T;
};
