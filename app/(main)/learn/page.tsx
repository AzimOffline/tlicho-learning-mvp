import { auth } from "@clerk/nextjs/server";
import { Dumbbell, Heart } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";

import { Header } from "./header";
import { Unit } from "./unit";

const LearnPage = async () => {
  await auth.protect();

  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();
  const lessonPercentageData = getLessonPercentage();
  const unitsData = getUnits();
  const userSubscriptionData = getUserSubscription();

  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubscription,
  ] = await Promise.all([
    userProgressData,
    unitsData,
    courseProgressData,
    lessonPercentageData,
    userSubscriptionData,
  ]);

  if (!courseProgress || !userProgress || !userProgress.activeCourse)
    redirect("/courses");

  const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />

        <Quests points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />
        {userProgress.hearts === 0 && !isPro && (
          <div className="mb-8 flex flex-col gap-4 rounded-3xl border-2 border-rose-100 bg-rose-50 p-5 text-rose-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Heart className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
              <div>
                <strong className="block text-lg">Lessons paused</strong>
                <p className="mt-1 text-sm font-medium text-rose-800/80">
                  Complete a Practice session to refill your hearts and unlock
                  Learn.
                </p>
              </div>
            </div>
            <Link
              href="/practice"
              className="flex h-12 shrink-0 items-center justify-center rounded-xl border-b-4 border-sky-700 bg-sky-500 px-5 font-bold text-white transition hover:bg-sky-400 active:border-b-0"
            >
              <Dumbbell className="mr-2 h-5 w-5" /> Go to Practice
            </Link>
          </div>
        )}
        {units.map((unit) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={courseProgress.activeLesson}
              activeLessonPercentage={lessonPercentage}
              heartsDepleted={userProgress.hearts === 0 && !isPro}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
