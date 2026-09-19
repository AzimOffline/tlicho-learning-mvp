import { auth } from "@clerk/nextjs/server";
import {
  BookCheck,
  Brain,
  CalendarClock,
  Flame,
  Medal,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getUnits, getUserProgress } from "@/db/queries";
import {
  getDueFsrsCards,
  getFsrsCardsForUser,
  getFsrsReviewHistoryForUser,
} from "@/lib/fsrs-drizzle";

const ProgressPage = async () => {
  const { userId } = await auth.protect();
  const [progress, units, cards, reviewHistory, dueCards] = await Promise.all([
    getUserProgress(),
    getUnits(),
    getFsrsCardsForUser(userId),
    getFsrsReviewHistoryForUser(userId),
    getDueFsrsCards(userId, 1_000),
  ]);

  if (!progress?.activeCourse) redirect("/courses");

  const lessonsCompleted = units
    .flatMap((unit) => unit.lessons)
    .filter((lesson) => lesson.completed).length;
  const due = dueCards.length;
  const counts = {
    new: cards.filter(({ state }) => state === 0).length,
    learning: cards.filter(({ state }) => state === 1 || state === 3).length,
    review: cards.filter(({ state }) => state === 2).length,
  };
  const summary = [
    { label: "Lessons complete", value: lessonsCompleted, icon: BookCheck },
    {
      label: "Current streak",
      value: `${progress.currentStreak} days`,
      icon: Flame,
    },
    { label: "Words encountered", value: cards.length, icon: Sparkles },
    { label: "Reviews due", value: due, icon: CalendarClock },
    { label: "Reviews completed", value: reviewHistory.length, icon: Brain },
    { label: "Total XP", value: progress.points, icon: Trophy },
  ];

  return (
    <div className="px-6 pb-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-600">
          Your learning
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-neutral-800">
          Progress
        </h1>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border-2 p-5 shadow-sm">
              <Icon className="mb-3 h-7 w-7 text-sky-600" />
              <p className="text-2xl font-extrabold text-neutral-800">
                {value}
              </p>
              <p className="text-sm font-semibold text-neutral-500">{label}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border-2 p-6">
          <h2 className="text-xl font-extrabold text-neutral-800">
            Practice status
          </h2>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {Object.entries(counts).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-sky-50 p-4">
                <p className="text-2xl font-extrabold text-sky-800">{value}</p>
                <p className="capitalize text-neutral-600">{label}</p>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full" variant="primary" asChild>
            <Link href="/practice">
              {due
                ? `Practice ${due} due item${due === 1 ? "" : "s"}`
                : "Open Practice"}
            </Link>
          </Button>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/leaderboard"
            className="flex items-center gap-4 rounded-2xl border-2 p-5 transition hover:bg-neutral-50"
          >
            <Medal className="h-9 w-9 text-amber-500" />
            <div>
              <h2 className="font-extrabold text-neutral-800">Leaderboard</h2>
              <p className="text-sm text-neutral-500">Compare community XP</p>
            </div>
          </Link>
          <Link
            href="/quests"
            className="flex items-center gap-4 rounded-2xl border-2 p-5 transition hover:bg-neutral-50"
          >
            <Sparkles className="h-9 w-9 text-violet-500" />
            <div>
              <h2 className="font-extrabold text-neutral-800">Quests</h2>
              <p className="text-sm text-neutral-500">Keep building your XP</p>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default ProgressPage;
