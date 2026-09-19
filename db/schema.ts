import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { MAX_HEARTS } from "@/constants";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress),
  units: many(units),
}));

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // Unit 1
  description: text("description").notNull(), // Learn the basics of spanish
  courseId: integer("course_id")
    .references(() => courses.id, {
      onDelete: "cascade",
    })
    .notNull(),
  order: integer("order").notNull(),
});

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id")
    .references(() => units.id, {
      onDelete: "cascade",
    })
    .notNull(),
  order: integer("order").notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}));

export const vocabularyItems = pgTable("vocabulary_items", {
  id: text("id").primaryKey(),
  tlicho: text("tlicho").notNull(),
  english: text("english").notNull(),
  audioSrc: text("audio_src"),
  alternateAudioSrcs: text("alternate_audio_srcs").array(),
  category: text("category"),
  partOfSpeech: text("part_of_speech"),
  exampleTlicho: text("example_tlicho"),
  exampleEnglish: text("example_english"),
  notes: text("notes"),
  imageSrc: text("image_src"),
  sourceUrl: text("source_url"),
  verificationStatus: text("verification_status")
    .notNull()
    .default("source-checked"),
});

export const vocabularyItemsRelations = relations(
  vocabularyItems,
  ({ many }) => ({
    challenges: many(challenges),
    fsrsCards: many(fsrsCards),
  })
);

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, {
      onDelete: "cascade",
    })
    .notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
  vocabularyItemId: text("vocabulary_item_id").references(
    () => vocabularyItems.id,
    { onDelete: "set null" }
  ),
  activityType: text("activity_type"),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
  vocabularyItem: one(vocabularyItems, {
    fields: [challenges.vocabularyItemId],
    references: [vocabularyItems.id],
  }),
}));

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, {
      onDelete: "cascade",
    })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  })
);

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, {
      onDelete: "cascade",
    })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  })
);

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  hearts: integer("hearts").notNull().default(MAX_HEARTS),
  points: integer("points").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
}));

export const fsrsCards = pgTable(
  "fsrs_cards",
  {
    userId: text("user_id").notNull(),
    itemId: text("item_id")
      .references(() => vocabularyItems.id, { onDelete: "cascade" })
      .notNull(),
    due: timestamp("due", { withTimezone: true }).notNull(),
    stability: doublePrecision("stability").notNull().default(0),
    difficulty: doublePrecision("difficulty").notNull().default(0),
    elapsedDays: integer("elapsed_days").notNull().default(0),
    scheduledDays: integer("scheduled_days").notNull().default(0),
    learningSteps: integer("learning_steps").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    state: integer("state").notNull().default(0),
    lastReview: timestamp("last_review", { withTimezone: true }),
    encounteredAt: timestamp("encountered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.itemId] }),
    index("fsrs_cards_user_due_idx").on(table.userId, table.due),
  ]
);

export const fsrsCardsRelations = relations(fsrsCards, ({ one, many }) => ({
  vocabularyItem: one(vocabularyItems, {
    fields: [fsrsCards.itemId],
    references: [vocabularyItems.id],
  }),
  reviewHistory: many(fsrsReviewHistory),
}));

export const fsrsReviewHistory = pgTable(
  "fsrs_review_history",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    itemId: text("item_id")
      .references(() => vocabularyItems.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull(),
    stateBefore: integer("state_before").notNull(),
    stateAfter: integer("state_after").notNull(),
    dueBefore: timestamp("due_before", { withTimezone: true }).notNull(),
    dueAfter: timestamp("due_after", { withTimezone: true }).notNull(),
  },
  (table) => [index("fsrs_review_history_user_idx").on(table.userId)]
);

export const fsrsReviewHistoryRelations = relations(
  fsrsReviewHistory,
  ({ one }) => ({
    card: one(fsrsCards, {
      fields: [fsrsReviewHistory.userId, fsrsReviewHistory.itemId],
      references: [fsrsCards.userId, fsrsCards.itemId],
    }),
  })
);

export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
});
