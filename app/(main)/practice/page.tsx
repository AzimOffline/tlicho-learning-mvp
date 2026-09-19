import { auth } from "@clerk/nextjs/server";
import { Clock3 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import db from "@/db/drizzle";
import { getUserProgress } from "@/db/queries";
import { getDueFsrsCards, getFsrsCardsForUser } from "@/lib/fsrs-drizzle";
import { buildPracticeActivity } from "@/lib/practice-activities";

import { PracticeSession } from "./practice-session";
import { HeartRecoveryButton } from "./heart-recovery-button";

const PracticePage = async () => {
  const { userId } = await auth.protect();
  const sessionSize = Math.max(
    1,
    Math.min(30, Number(process.env.PRACTICE_SESSION_SIZE) || 10)
  );

  const [progress, dueCards, allVocabulary] = await Promise.all([
    getUserProgress(),
    getDueFsrsCards(userId, 1_000),
    db.query.vocabularyItems.findMany(),
  ]);

  if (!progress?.activeCourse) redirect("/courses");

  const reviewCards =
    dueCards.length > 0
      ? dueCards
      : progress.hearts === 0
        ? (await getFsrsCardsForUser(userId)).slice(0, sessionSize)
        : [];

  const activities = reviewCards
    .slice(0, sessionSize)
    .filter((card) => card.vocabularyItem)
    .map((card, sessionIndex, cards) =>
      buildPracticeActivity(
        card.vocabularyItem!,
        allVocabulary,
        (cards[0]?.reps ?? 0) + sessionIndex
      )
    );

  if (!activities.length) {
    return (
      <div className="px-6 pb-28 lg:pb-10">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-3xl border-2 border-sky-100 bg-gradient-to-b from-sky-50 to-white p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <Clock3 className="h-8 w-8 text-sky-700" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-800">
            You&apos;re caught up
          </h1>
          <p className="text-neutral-600">
            Complete lessons in Learn to encounter new words. Reviews will
            appear here when they are due.
          </p>
          {progress.hearts === 0 ? (
            <HeartRecoveryButton />
          ) : (
            <Button variant="primary" asChild>
              <Link href="/learn">Go to Learn</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-28 lg:pb-10">
      <PracticeSession activities={activities} dueCount={dueCards.length} />
    </div>
  );
};

export default PracticePage;
