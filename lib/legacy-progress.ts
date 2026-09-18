type LegacyChallengeProgress = {
  completed: boolean;
};

type LegacyChallenge = {
  challengeProgress?: LegacyChallengeProgress[] | null;
};

type LegacyLesson = {
  challenges: LegacyChallenge[];
};

type LegacyUnit<TLesson extends LegacyLesson> = {
  lessons: TLesson[];
};

/**
 * These helpers intentionally preserve the clone's current completion rules.
 * They are characterization seams, not the future NextHop mastery model.
 */
export const isLegacyChallengeCompleted = (challenge: LegacyChallenge) =>
  !!challenge.challengeProgress &&
  challenge.challengeProgress.length > 0 &&
  challenge.challengeProgress.every((progress) => progress.completed);

export const isLegacyLessonCompleted = (challenges: LegacyChallenge[]) =>
  challenges.length > 0 && challenges.every(isLegacyChallengeCompleted);

export const findFirstLegacyIncompleteLesson = <TLesson extends LegacyLesson>(
  units: LegacyUnit<TLesson>[]
) =>
  units
    .flatMap((unit) => unit.lessons)
    .find((lesson) =>
      lesson.challenges.some(
        (challenge) => !isLegacyChallengeCompleted(challenge)
      )
    );

export const getLegacyLessonPercentage = (challenges: LegacyChallenge[]) => {
  const completedChallenges = challenges.filter(isLegacyChallengeCompleted);

  return Math.round((completedChallenges.length / challenges.length) * 100);
};
