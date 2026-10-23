"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { filterWords, type LibraryWord } from "@/lib/word-library";

export const WordLibrary = ({
  vocabulary,
  stickyOffset = "top-0",
}: {
  vocabulary: LibraryWord[];
  stickyOffset?: string;
}) => {
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
      <div
        className={`sticky z-10 my-4 grid gap-3 border-b border-sky-100 bg-[#f7fbfe]/95 py-3 backdrop-blur-xl sm:grid-cols-2 ${stickyOffset}`}
      >
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
      <ul className="divide-y divide-sky-100 overflow-hidden rounded-2xl border border-sky-100 bg-white">
        {words.map((word) => (
          <li key={word.id} className="flex items-start gap-3 px-4 py-3">
            <details className="group min-w-0 flex-1">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1">
                  <h2
                    lang="dgr"
                    className="break-words text-lg font-extrabold text-sky-950"
                  >
                    {word.tlicho}
                  </h2>
                  <span className="mt-0.5 block text-sm text-slate-700">
                    {word.english}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                />
                <span className="sr-only">Examples and details</span>
              </summary>
              <div className="pb-2 pt-3">
                <p className="text-xs font-semibold text-slate-500">
                  {[word.partOfSpeech, word.category]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {word.exampleTlicho ? (
                  <div className="mt-3 rounded-xl bg-sky-50 p-3">
                    <p lang="dgr">{word.exampleTlicho}</p>
                    {word.exampleEnglish && (
                      <p className="mt-1 text-sm text-slate-600">
                        {word.exampleEnglish}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No example available for this word yet.
                  </p>
                )}
                {word.sourceUrl?.startsWith("https://") && (
                  <a
                    href={word.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block rounded py-3 text-sm text-sky-800 underline"
                  >
                    Dictionary source (opens in a new tab)
                  </a>
                )}
              </div>
            </details>
            <AudioButton
              compact
              src={word.audioSrc}
              label={`Hear ${word.tlicho}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
