import vocabularySource from "@/data/tlicho-vocabulary.json";
import type { LibraryWord } from "@/lib/word-library";

const normalize = (value: string | null) => value?.normalize("NFC") ?? null;

export const vocabulary: LibraryWord[] = vocabularySource.map((entry) => ({
  id: entry.id,
  sourceUrl: entry.source_url,
  tlicho: entry.term.normalize("NFC"),
  english: entry.definition.normalize("NFC"),
  audioSrc: entry.audio_url,
  category: normalize(entry.topic),
  partOfSpeech: normalize(entry.part_of_speech),
  exampleTlicho: normalize(entry.example_tlicho),
  exampleEnglish: normalize(entry.example_english),
}));
