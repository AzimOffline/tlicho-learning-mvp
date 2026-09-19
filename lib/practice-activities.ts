import type { vocabularyItems } from "@/db/schema";
import {
  getActivityCompanion,
  type ActivityCompanion,
} from "@/lib/activity-companions";

type VocabularyItem = typeof vocabularyItems.$inferSelect;

export type PracticeOption = {
  id: string;
  text: string;
  correct: boolean;
};

export type PracticeActivity = {
  itemId: string;
  instruction: string;
  focusText: string | null;
  focusLanguage: "Tłı̨chǫ" | "English" | "Audio";
  companion: ActivityCompanion;
  promptAudioSrc: string | null;
  revealAudioAfterAnswer: boolean;
  translationAfterAnswer: string | null;
  options: PracticeOption[];
};

const selectChoices = (
  item: VocabularyItem,
  allItems: VocabularyItem[],
  field: "tlicho" | "english",
  offset: number
) => {
  const choices = [item];
  const seen = new Set([item[field]]);
  const start = Math.max(
    0,
    allItems.findIndex(({ id }) => id === item.id)
  );

  for (let step = 1; choices.length < 4 && step <= allItems.length; step++) {
    const candidate = allItems[(start + step) % allItems.length];
    if (!seen.has(candidate[field])) {
      seen.add(candidate[field]);
      choices.push(candidate);
    }
  }

  const correct = choices.shift();
  if (correct) choices.splice(offset % (choices.length + 1), 0, correct);
  return choices;
};

export const buildPracticeActivity = (
  item: VocabularyItem,
  allItems: VocabularyItem[],
  sequence: number
): PracticeActivity => {
  const requestedMode = sequence % 4;
  const mode = item.audioSrc ? requestedMode : requestedMode % 2;
  const answerInEnglish = mode === 0 || mode === 2;
  const choices = selectChoices(
    item,
    allItems,
    answerInEnglish ? "english" : "tlicho",
    sequence
  );

  const instruction =
    mode === 0
      ? "Choose the English meaning"
      : mode === 1
        ? "Choose the Tłı̨chǫ translation"
        : mode === 2
          ? "Listen, then choose the English meaning"
          : "Listen, then choose the Tłı̨chǫ word";

  const focusText = mode === 0 ? item.tlicho : mode === 1 ? item.english : null;
  const focusLanguage =
    mode === 0 ? "Tłı̨chǫ" : mode === 1 ? "English" : "Audio";

  return {
    itemId: item.id,
    instruction,
    focusText,
    focusLanguage,
    companion: getActivityCompanion(`${item.id}:${sequence}`),
    promptAudioSrc: item.audioSrc,
    revealAudioAfterAnswer: mode === 1,
    translationAfterAnswer: mode === 3 ? item.english : null,
    options: choices.map((choice) => ({
      id: choice.id,
      text: answerInEnglish ? choice.english : choice.tlicho,
      correct: choice.id === item.id,
    })),
  };
};
