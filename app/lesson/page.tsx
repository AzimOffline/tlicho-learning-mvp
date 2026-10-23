import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import { shuffleChoices } from "@/lib/answer-choices";

import { Quiz } from "./quiz";

const LessonPage = async () => {
  await auth.protect();

  const lessonData = getLesson();
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();

  const [lesson, userProgress, userSubscription] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
  ]);

  if (!lesson || !userProgress) return redirect("/learn");
  if (userProgress.hearts === 0 && !userSubscription?.isActive)
    return redirect("/practice");

  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
      lesson.challenges.length) *
    100;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges.map((challenge) => ({
        ...challenge,
        challengeOptions: shuffleChoices(challenge.challengeOptions),
      }))}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
      userSubscription={userSubscription}
    />
  );
};

export default LessonPage;
