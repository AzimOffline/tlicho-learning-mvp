import type { FsrsReviewResult, ReviewOutcome } from "@/lib/fsrs";

/**
 * Keep missed Practice items available for an immediate corrective session.
 * The reusable FSRS engine still records an Again review; this app-level policy
 * only overrides the next due time used by the Practice queue.
 */
export const applyPracticeReviewPolicy = (
  review: FsrsReviewResult,
  outcome: ReviewOutcome,
  reviewedAt: Date
): FsrsReviewResult => {
  if (outcome === "correct") return review;

  return {
    card: {
      ...review.card,
      due: reviewedAt,
    },
    event: {
      ...review.event,
      dueAfter: reviewedAt,
    },
  };
};
