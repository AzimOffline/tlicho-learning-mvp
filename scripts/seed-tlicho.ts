import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import {
  buildBalancedLessonGroups,
  classifyTlichoUnit,
  tlichoUnitDefinitions,
} from "@/lib/tlicho-course-structure";

type SourceEntry = {
  id: string;
  term: string;
  definition: string;
  part_of_speech: string | null;
  example_tlicho: string | null;
  example_english: string | null;
  topic: string | null;
  audio_url: string | null;
  audio_urls: string[];
  source_url: string | null;
};

type ActivityType =
  | "TLICHO_TO_ENGLISH"
  | "ENGLISH_TO_TLICHO"
  | "AUDIO_TO_ENGLISH"
  | "AUDIO_TO_TLICHO";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const db = drizzle(neon(databaseUrl), { schema });

const normalize = (value: string | null) => value?.normalize("NFC") ?? null;

const entries = (
  JSON.parse(
    readFileSync(resolve(process.cwd(), "data/tlicho-vocabulary.json"), "utf8")
  ) as SourceEntry[]
).map((entry) => ({
  ...entry,
  term: entry.term.normalize("NFC"),
  definition: entry.definition.normalize("NFC"),
  part_of_speech: normalize(entry.part_of_speech),
  example_tlicho: normalize(entry.example_tlicho),
  example_english: normalize(entry.example_english),
  topic: normalize(entry.topic),
}));

const distinctChoices = (
  current: SourceEntry,
  property: "term" | "definition"
) => {
  const start = entries.findIndex(({ id }) => id === current.id);
  const choices = [current];
  const seen = new Set([current[property]]);

  for (
    let offset = 1;
    choices.length < 4 && offset < entries.length;
    offset++
  ) {
    const candidate = entries[(start + offset) % entries.length];
    if (!seen.has(candidate[property])) {
      seen.add(candidate[property]);
      choices.push(candidate);
    }
  }

  const correctPosition = start % choices.length;
  const [correct] = choices.splice(0, 1);
  choices.splice(correctPosition, 0, correct);
  return choices;
};

const activityFor = (index: number, entry: SourceEntry): ActivityType => {
  const activities: ActivityType[] = [
    "TLICHO_TO_ENGLISH",
    "ENGLISH_TO_TLICHO",
    "AUDIO_TO_ENGLISH",
    "AUDIO_TO_TLICHO",
  ];
  const selected = activities[index % activities.length];
  return entry.audio_url ? selected : index % 2 ? activities[1] : activities[0];
};

const main = async () => {
  console.log(`Importing ${entries.length} NFC-normalized vocabulary items...`);

  for (const entry of entries) {
    const values = {
      id: entry.id,
      tlicho: entry.term,
      english: entry.definition,
      audioSrc: entry.audio_url,
      alternateAudioSrcs: entry.audio_urls,
      category: entry.topic,
      partOfSpeech: entry.part_of_speech,
      exampleTlicho: entry.example_tlicho,
      exampleEnglish: entry.example_english,
      sourceUrl: entry.source_url,
      verificationStatus: "source-checked",
    };

    await db
      .insert(schema.vocabularyItems)
      .values(values)
      .onConflictDoUpdate({ target: schema.vocabularyItems.id, set: values });
  }

  const existingCourse = await db.query.courses.findFirst({
    where: eq(schema.courses.title, "Tłı̨chǫ"),
  });

  if (existingCourse) {
    console.log(
      "Vocabulary updated. Existing Tłı̨chǫ course structure was preserved."
    );
    return;
  }

  const [course] = await db
    .insert(schema.courses)
    .values({ title: "Tłı̨chǫ", imageSrc: "/tlicho-course.svg" })
    .returning();

  const grouped = tlichoUnitDefinitions.map(() => [] as SourceEntry[]);
  entries.forEach((entry) => {
    const unitIndex = classifyTlichoUnit(entry.topic);
    if (unitIndex !== null) grouped[unitIndex].push(entry);
  });

  let globalIndex = 0;

  for (
    let unitIndex = 0;
    unitIndex < tlichoUnitDefinitions.length;
    unitIndex++
  ) {
    const definition = tlichoUnitDefinitions[unitIndex];
    const unitEntries = grouped[unitIndex];
    if (!unitEntries.length) continue;

    const [unit] = await db
      .insert(schema.units)
      .values({
        courseId: course.id,
        title: `Unit ${unitIndex + 1}: ${definition.title}`,
        description: definition.description,
        order: unitIndex + 1,
      })
      .returning();

    const lessonGroups = buildBalancedLessonGroups(
      unitEntries,
      definition.lessonTitles
    );

    for (
      let lessonIndex = 0;
      lessonIndex < lessonGroups.length;
      lessonIndex++
    ) {
      const { title, items: lessonEntries } = lessonGroups[lessonIndex];
      const [lesson] = await db
        .insert(schema.lessons)
        .values({
          unitId: unit.id,
          title,
          order: lessonIndex + 1,
        })
        .returning();

      for (let index = 0; index < lessonEntries.length; index++) {
        const entry = lessonEntries[index];
        const activityType = activityFor(globalIndex++, entry);
        const englishAnswers =
          activityType === "TLICHO_TO_ENGLISH" ||
          activityType === "AUDIO_TO_ENGLISH";
        const question =
          activityType === "TLICHO_TO_ENGLISH"
            ? `What does “${entry.term}” mean?`
            : activityType === "ENGLISH_TO_TLICHO"
              ? `Choose the Tłı̨chǫ word for “${entry.definition}”`
              : activityType === "AUDIO_TO_ENGLISH"
                ? "Listen and choose the English meaning"
                : "Listen and choose the Tłı̨chǫ word";

        const [challenge] = await db
          .insert(schema.challenges)
          .values({
            lessonId: lesson.id,
            type: englishAnswers ? "ASSIST" : "SELECT",
            question,
            order: index + 1,
            vocabularyItemId: entry.id,
            activityType,
          })
          .returning();

        const choices = distinctChoices(
          entry,
          englishAnswers ? "definition" : "term"
        );

        await db.insert(schema.challengeOptions).values(
          choices.map((choice) => ({
            challengeId: challenge.id,
            text: englishAnswers ? choice.definition : choice.term,
            correct: choice.id === entry.id,
            audioSrc: englishAnswers ? null : choice.audio_url,
          }))
        );
      }
    }
  }

  console.log("Tłı̨chǫ course, lessons, and challenges created successfully.");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
