export type PracticeHeartReward = {
  heartsEarned: number;
  heartsRestored: number;
  nextHearts: number;
};

export const getPracticeHeartReward = (correctAnswers: number) => {
  const safeCorrectAnswers = Math.max(0, Math.floor(correctAnswers));
  return Math.ceil(safeCorrectAnswers / 3);
};

export const applyPracticeHeartReward = (
  currentHearts: number,
  correctAnswers: number,
  maximumHearts: number
): PracticeHeartReward => {
  const heartsEarned = getPracticeHeartReward(correctAnswers);
  const nextHearts = Math.min(
    maximumHearts,
    Math.max(0, currentHearts) + heartsEarned
  );

  return {
    heartsEarned,
    heartsRestored: nextHearts - Math.max(0, currentHearts),
    nextHearts,
  };
};
