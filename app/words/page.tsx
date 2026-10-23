import Link from "next/link";
import { WordLibrary } from "@/components/word-library";
import { vocabulary } from "@/lib/vocabulary";
import { isDemoMode } from "@/lib/demo-mode";

export const metadata = {
  title: "Words",
  description:
    "Browse Tłı̨chǫ words, English meanings, examples, and pronunciation recordings.",
};

export default function WordsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <Link
        href={isDemoMode() ? "/demo" : "/learn"}
        className="mb-6 inline-block rounded-lg px-2 py-3 font-semibold text-sky-800 underline"
      >
        Back to learning
      </Link>
      <WordLibrary vocabulary={vocabulary} />
    </main>
  );
}
