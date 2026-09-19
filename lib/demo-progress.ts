import { MAX_HEARTS } from "@/constants";
import type { FsrsCard } from "@/lib/fsrs";

export type StoredCard = Omit<FsrsCard, "due" | "lastReview"> & {
  due: string;
  lastReview?: string;
};

export type DemoProgressState = {
  version: 2;
  xp: number;
  hearts: number;
  streak: number;
  lastActivityAt?: string;
  completedLessons: string[];
  encountered: string[];
  cards: Record<string, StoredCard>;
  reviewsCompleted: number;
};

export const DEMO_PROGRESS_STORAGE_KEY = "tlicho-learning-demo-v2";

export const initialDemoProgressState: DemoProgressState = {
  version: 2,
  xp: 0,
  hearts: MAX_HEARTS,
  streak: 0,
  completedLessons: [],
  encountered: [],
  cards: {},
  reviewsCompleted: 0,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const nonNegativeInteger = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : fallback;

const validDate = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

const stringArray = (value: unknown) =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.filter((item): item is string => typeof item === "string")
        ),
      ]
    : [];

const parseCard = (key: string, value: unknown): StoredCard | undefined => {
  if (!isRecord(value) || value.itemId !== key || !validDate(value.due)) {
    return undefined;
  }

  const numericFields = [
    "stability",
    "difficulty",
    "elapsedDays",
    "scheduledDays",
    "learningSteps",
    "reps",
    "lapses",
  ] as const;
  if (
    numericFields.some(
      (field) =>
        typeof value[field] !== "number" || !Number.isFinite(value[field])
    ) ||
    typeof value.state !== "number" ||
    !Number.isInteger(value.state) ||
    value.state < 0 ||
    value.state > 3 ||
    (value.lastReview !== undefined && !validDate(value.lastReview))
  ) {
    return undefined;
  }

  return value as StoredCard;
};

export const parseStoredDemoProgress = (raw: string): DemoProgressState => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return initialDemoProgressState;

    const cards = isRecord(parsed.cards)
      ? Object.fromEntries(
          Object.entries(parsed.cards).flatMap(([key, value]) => {
            const card = parseCard(key, value);
            return card ? [[key, card] as const] : [];
          })
        )
      : {};

    return {
      version: 2,
      xp: nonNegativeInteger(parsed.xp),
      hearts: Math.min(
        MAX_HEARTS,
        nonNegativeInteger(parsed.hearts, MAX_HEARTS)
      ),
      streak: nonNegativeInteger(parsed.streak),
      lastActivityAt: validDate(parsed.lastActivityAt)
        ? parsed.lastActivityAt
        : undefined,
      completedLessons: stringArray(parsed.completedLessons),
      encountered: stringArray(parsed.encountered),
      cards,
      reviewsCompleted: nonNegativeInteger(parsed.reviewsCompleted),
    };
  } catch {
    return initialDemoProgressState;
  }
};
