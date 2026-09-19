const dayNumber = (date: Date) =>
  Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      86_400_000
  );

export const getStreakUpdate = (
  currentStreak: number,
  lastActivityAt: Date | null,
  now: Date = new Date()
) => {
  if (!lastActivityAt) return { currentStreak: 1, lastActivityAt: now };

  const difference = dayNumber(now) - dayNumber(lastActivityAt);

  if (difference <= 0)
    return { currentStreak: Math.max(1, currentStreak), lastActivityAt: now };

  return {
    currentStreak: difference === 1 ? currentStreak + 1 : 1,
    lastActivityAt: now,
  };
};
