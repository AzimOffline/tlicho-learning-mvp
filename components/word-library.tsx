"use client";

import { useMemo, useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { filterWords, type LibraryWord } from "@/lib/word-library";

export const WordLibrary = ({ vocabulary }: { vocabulary: LibraryWord[] }) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const categories = useMemo(
    () =>
      [
        ...new Set(
          vocabulary.flatMap((word) => (word.category ? [word.category] : []))
        ),
      ].sort(),
    [vocabulary]
  );
  const words = filterWords(vocabulary, query, category);
  return (
    <section aria-labelledby="words-title">
      <h1 id="words-title" className="text-3xl font-extrabold text-sky-950">
        Words
      </h1>
      <p className="mt-2 text-slate-600">
        Browse the learning collection, hear pronunciation, and explore
        examples. This is a word library, not a complete dictionary.
      </p>
      <div className="my-6 grid gap-4 sm:grid-cols-2">
        <label className="font-semibold text-slate-700">
          Search Tłı̨chǫ or English
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Word or meaning"
            className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 focus-visible:outline-sky-600"
          />
        </label>
        <label className="font-semibold text-slate-700">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 focus-visible:outline-sky-600"
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p role="status" className="mb-4 text-sm text-slate-600">
        {words.length} of {vocabulary.length} words
      </p>
      {!words.length && (
        <p className="rounded-xl bg-sky-50 p-5">
          No matching words. Try a shorter search or choose all categories.
        </p>
      )}
      <ul className="grid gap-4">
        {words.map((word) => (
          <li
            key={word.id}
            className="min-w-0 rounded-2xl border-2 border-sky-100 bg-white p-5"
          >
            <h2
              lang="dgr"
              className="break-words text-2xl font-bold text-sky-950"
            >
              {word.tlicho}
            </h2>
            <p className="mt-1 text-lg text-slate-800">{word.english}</p>
            <p className="mt-2 text-sm text-slate-500">
              {[word.partOfSpeech, word.category].filter(Boolean).join(" · ")}
            </p>
            {word.exampleTlicho && (
              <div className="my-4 rounded-xl bg-sky-50 p-3">
                <p lang="dgr">{word.exampleTlicho}</p>
                {word.exampleEnglish && (
                  <p className="mt-1 text-slate-600">{word.exampleEnglish}</p>
                )}
              </div>
            )}
            <AudioButton
              src={word.audioSrc}
              label={`Hear ${word.tlicho}`}
              className="mt-3"
            />
            {word.sourceUrl?.startsWith("https://") && (
              <a
                href={word.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block rounded px-1 py-2 text-sm text-sky-800 underline"
              >
                Dictionary source (opens in a new tab)
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
