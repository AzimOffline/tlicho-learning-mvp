export const tlichoUnitDefinitions = [
  {
    title: "People & Family",
    description: "People, family, and relationships",
    matches: ["people", "family"],
    lessonTitles: ["Meet the People", "Family & Relationships"],
    companionSrc: "/characters/tactile/moose-reading.png",
  },
  {
    title: "Home & Daily Life",
    description: "Food, clothing, shelter, and everyday actions",
    matches: ["food", "shelter", "clothing", "tools", "general activities"],
    lessonTitles: [
      "Food & Drink",
      "Everyday Actions",
      "Clothes & Footwear",
      "Around the Home",
      "Tools & Work",
      "Daily Life",
    ],
    companionSrc: "/characters/tactile/beaver.png",
  },
  {
    title: "Land & Living World",
    description: "Animals, land, water, and places",
    matches: ["living creatures", "land", "fire and water", "travel"],
    lessonTitles: [
      "Animals & Living Things",
      "Land, Water & Places",
      "Getting Around",
    ],
    companionSrc: "/characters/tactile/caribou.png",
  },
  {
    title: "Body & Wellbeing",
    description: "The body, health, mind, and spirit",
    matches: ["body", "mind and spirit"],
    lessonTitles: ["Body & Health", "Mind & Feelings", "Being Well"],
    companionSrc: "/characters/tactile/grizzly-bear.png",
  },
  {
    title: "Weather & Time",
    description: "Time, seasons, weather, and the sky",
    matches: ["time", "sky and weather"],
    lessonTitles: ["Weather & Sky", "Time & Seasons"],
    companionSrc: "/characters/tactile/bison.png",
  },
  {
    title: "Words for Conversation",
    description: "Numbers, descriptions, questions, and expressions",
    matches: [] as string[],
    lessonTitles: [
      "Numbers & Amounts",
      "Questions",
      "Descriptions",
      "Useful Expressions",
    ],
    companionSrc: "/characters/tactile/red-fox.png",
  },
] as const;

export const classifyTlichoUnit = (category: string | null) => {
  const normalizedCategory = category?.toLocaleLowerCase() ?? "";
  const index = tlichoUnitDefinitions.findIndex(({ matches }) =>
    matches.some((match) => normalizedCategory.includes(match))
  );

  return index === -1 ? tlichoUnitDefinitions.length - 1 : index;
};

export const buildBalancedLessonGroups = <T>(
  entries: T[],
  titles: readonly string[]
) => {
  if (!entries.length) return [];

  const lessonCount = Math.max(1, Math.round(entries.length / 5));
  const baseSize = Math.floor(entries.length / lessonCount);
  const largerGroups = entries.length % lessonCount;
  let cursor = 0;

  return Array.from({ length: lessonCount }, (_, index) => {
    const size = baseSize + (index < largerGroups ? 1 : 0);
    const items = entries.slice(cursor, cursor + size);
    cursor += size;

    return {
      title: titles[index] ?? `Trail ${index + 1}`,
      items,
    };
  });
};
