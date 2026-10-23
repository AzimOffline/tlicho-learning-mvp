import Link from "next/link";
import { WordLibrary } from "@/components/word-library";
import { vocabulary } from "@/lib/vocabulary";
import { isDemoMode } from "@/lib/demo-mode";

import { pageMetadata, siteUrl } from "@/lib/seo";
import { StructuredData } from "@/components/structured-data";

export const metadata = pageMetadata(
  "Tlicho Dictionary & Words | Learn Tłı̨chǫ",
  "Search a starter Tlicho (Tłı̨chǫ) dictionary and word collection: English meanings, categories, examples, source links, and available pronunciation audio.",
  "/words"
);

export default function WordsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <Link
        href={isDemoMode() ? "/demo" : "/learn"}
        className="mb-6 inline-block rounded-lg px-2 py-3 font-semibold text-sky-800 underline"
      >
        Back to learning
      </Link>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "@id": siteUrl + "/words#collection",
          name: "Tłı̨chǫ words and meanings",
          description:
            "A starter Tlicho word collection, not a complete dictionary.",
          url: siteUrl + "/words",
          hasDefinedTerm: vocabulary.map((word) => ({
            "@type": "DefinedTerm",
            name: word.tlicho,
            description: word.english,
            url: siteUrl + "/words#word-" + encodeURIComponent(word.id),
            inDefinedTermSet: siteUrl + "/words#collection",
          })),
        }}
      />
      <WordLibrary vocabulary={vocabulary} title="Tłı̨chǫ words & meanings" />
      <section
        className="mt-8 rounded-2xl border border-sky-100 bg-white p-6"
        aria-labelledby="collection-heading"
      >
        <h2
          id="collection-heading"
          className="text-xl font-extrabold text-sky-950"
        >
          About this starter Tlicho dictionary
        </h2>
        <p className="mt-3 leading-7 text-slate-600">
          Browse {vocabulary.length} Tłı̨chǫ words with English meanings. Tlicho
          is the plain-text spelling used here alongside Tłı̨chǫ. Search by a
          word or its meaning, filter by category, and expand a row for
          available examples and source attribution.
        </p>
        <p className="mt-3 leading-7 text-slate-600">
          This is an independent learning collection, not a complete dictionary
          or an official language resource. Recordings and examples are not
          available for every entry. Language corrections are welcome for
          review.
        </p>
        <div className="mt-4 flex flex-wrap gap-5 text-sky-800 underline underline-offset-4">
          <Link href="/">Learn Tlicho with free lessons</Link>
          <Link href="/about">Project background and feedback</Link>
        </div>
      </section>
    </main>
  );
}
