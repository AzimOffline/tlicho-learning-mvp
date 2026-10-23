import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";

export const AboutSupportCard = () => (
  <section className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-5">
    <HeartHandshake aria-hidden="true" className="mb-3 h-6 w-6 text-sky-700" />
    <h2 className="text-lg font-extrabold text-sky-950">
      Help shape Learn Tłı̨chǫ
    </h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">
      Help improve this free learning resource through feedback, language
      expertise, or educational partnerships.
    </p>
    <Link
      href="/about"
      className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-sky-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
    >
      About &amp; support <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  </section>
);
