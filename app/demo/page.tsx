import vocabularySource from "@/data/tlicho-vocabulary.json";

import { DemoApp, type DemoVocabularyItem } from "./demo-app";

const normalize = (value: string | null) => value?.normalize("NFC") ?? null;

const vocabulary: DemoVocabularyItem[] = vocabularySource.map((entry) => ({
  id: entry.id,
  tlicho: entry.term.normalize("NFC"),
  english: entry.definition.normalize("NFC"),
  audioSrc: entry.audio_url,
  category: normalize(entry.topic),
  partOfSpeech: normalize(entry.part_of_speech),
  exampleTlicho: normalize(entry.example_tlicho),
  exampleEnglish: normalize(entry.example_english),
}));

const DemoPage = () => <DemoApp vocabulary={vocabulary} />;

export default DemoPage;
