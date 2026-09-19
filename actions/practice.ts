"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { MAX_HEARTS } from "@/constants";
import db from "@/db/drizzle";
import { userProgress, vocabularyItems } from "@/db/schema";
import { applyFsrsReview } from "@/lib/fsrs-drizzle";
import { applyPracticeHeartReward } from "@/lib/practice-rewards";
import { getStreakUpdate } from "@/lib/streak";

export const submitPracticeAnswer = async (
  itemId: string,
  correct: boolean
) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized.");

  const [item, progress] = await Promise.all([
    db.query.vocabularyItems.findFirst({
      where: eq(vocabularyItems.id, itemId),
    }),
    db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    }),
  ]);

  if (!item || !progress) throw new Error("Practice item not found.");

  const result = await applyFsrsReview(
    userId,
    itemId,
    correct ? "correct" : "incorrect"
  );
  const streak = getStreakUpdate(
    progress.currentStreak,
    progress.lastActivityAt
  );

  await db
    .update(userProgress)
    .set({
      points: correct ? progress.points + 10 : progress.points,
      ...streak,
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/practice");
  revalidatePath("/progress");
  revalidatePath("/learn");
  revalidatePath("/leaderboard");

  return {
    rating: result.event.rating,
    due: result.card.due.toISOString(),
  };
};

export const restoreHearts = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  await db
    .update(userProgress)
    .set({ hearts: MAX_HEARTS })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/practice");
  revalidatePath("/learn");
  return { hearts: MAX_HEARTS };
};

export const rewardPracticeHearts = async (correctAnswers: number) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");
  if (!Number.isInteger(correctAnswers) || correctAnswers < 0) {
    throw new Error("Invalid correct-answer count.");
  }

  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });
  if (!progress) throw new Error("User progress not found.");

  const reward = applyPracticeHeartReward(
    progress.hearts,
    correctAnswers,
    MAX_HEARTS
  );

  if (reward.nextHearts !== progress.hearts) {
    await db
      .update(userProgress)
      .set({ hearts: reward.nextHearts })
      .where(eq(userProgress.userId, userId));
  }

  revalidatePath("/practice");
  revalidatePath("/learn");

  return reward;
};
