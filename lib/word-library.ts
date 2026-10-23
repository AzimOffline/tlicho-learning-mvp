export type LibraryWord = {
  id: string;
  tlicho: string;
  english: string;
  audioSrc: string | null;
  category: string | null;
  partOfSpeech: string | null;
  exampleTlicho: string | null;
  exampleEnglish: string | null;
  sourceUrl?: string | null;
};

// Search accepts ordinary keyboards while preserving the original spelling on screen.
const searchKey = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ł", "l")
    .replace(/[’‘]/g, "'");

export const filterWords = (
  words: LibraryWord[],
  query: string,
  category: string
) => {
  const terms = searchKey(query.trim()).split(/\s+/).filter(Boolean);
  return words.filter((word) => {
    const text = searchKey(
      [word.tlicho, word.english, word.exampleTlicho, word.exampleEnglish]
        .filter(Boolean)
        .join(" ")
    );
    return (
      (!category || word.category === category) &&
      terms.every((term) => text.includes(term))
    );
  });
};
