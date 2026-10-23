import Link from "next/link";
import { ArrowLeft, BookOpen, MessageSquare, Users } from "lucide-react";

const repository = "https://github.com/AzimOffline/tlicho-learning-mvp";

export const AboutSupport = ({
  backHref,
  email,
}: {
  backHref: string;
  email?: string;
}) => {
  const contactEmail = email?.trim();
  const hasEmail =
    !!contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);
  const contact = (subject: string, body: string) =>
    hasEmail
      ? `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      : `${repository}/issues/new?title=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const linkStyle =
    "mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300";

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <Link
        href={backHref}
        className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-sky-800 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-sky-600"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to learning
      </Link>
      <header className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white to-sky-100 p-6 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
          Free learning. Shared possibilities.
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-sky-950 sm:text-4xl">
          About &amp; support
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Learn Tłı̨chǫ helps learners explore vocabulary through short lessons,
          pronunciation recordings, and practice that brings words back over
          time.
        </p>
        <p className="mt-4 font-bold text-sky-900">
          Our commitment: learning stays free and accessible to everyone.
        </p>
      </header>

      <section aria-labelledby="project-heading" className="my-8">
        <h2
          id="project-heading"
          className="text-xl font-extrabold text-sky-950"
        >
          An early-stage, independent project
        </h2>
        <p className="mt-3 leading-7 text-slate-600">
          The project is maintained by{" "}
          <a
            href="https://github.com/AzimOffline"
            className="rounded text-sky-800 underline"
          >
            AzimOffline
          </a>
          . We welcome input from Tłı̨chǫ speakers, learners, educators, and
          community organizations to help guide its development.
        </p>
        <p className="mt-3 leading-7 text-slate-600">
          This prototype is not presented as an official or community-endorsed
          language resource. Community review and content/audio permissions need
          to be confirmed before a wider public release.
        </p>
        <a
          href={`${repository}/blob/main/AUDIO_LICENSE_STATUS.md`}
          className="mt-2 inline-block rounded py-2 text-sm text-sky-800 underline"
        >
          Read the current content and audio status
        </a>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <section className="rounded-2xl border border-sky-100 bg-white p-5 sm:p-6">
          <MessageSquare aria-hidden="true" className="h-7 w-7 text-sky-700" />
          <h2 className="mt-3 text-xl font-extrabold text-sky-950">
            Share feedback
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Tell us what helps you learn, what is confusing, or where the app
            could be easier to use. Language corrections and suggestions are
            welcome for review.
          </p>
          <a
            className={linkStyle}
            href={contact(
              "Learn Tłı̨chǫ feedback",
              "What would you like to share?\n\nIf relevant, include the word or lesson, what happened, and what you expected.\n"
            )}
          >
            {hasEmail ? "Send feedback" : "Share feedback on GitHub"}
          </a>
        </section>
        <section className="rounded-2xl border border-sky-100 bg-white p-5 sm:p-6">
          <Users aria-hidden="true" className="h-7 w-7 text-teal-700" />
          <h2 className="mt-3 text-xl font-extrabold text-sky-950">
            Explore a partnership
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            We’d like to hear from schools, educators, language programs, and
            cultural organizations interested in reviewing content, trying the
            app, or supporting its development.
          </p>
          <a
            className={linkStyle}
            href={contact(
              "Learn Tłı̨chǫ partnership enquiry",
              "Please share your organization (if applicable), your interest in the project, and what you would like to explore together.\n"
            )}
          >
            {hasEmail
              ? "Discuss a partnership"
              : "Start a conversation on GitHub"}
          </a>
        </section>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">
        {hasEmail
          ? "These links open your email app. Share only the details needed for your enquiry."
          : "GitHub requires an account, and submissions are public. Please leave out private learner information and confidential partnership details."}
      </p>

      <section
        className="mt-8 rounded-2xl bg-white p-6"
        aria-labelledby="future-heading"
      >
        <BookOpen aria-hidden="true" className="h-6 w-6 text-sky-700" />
        <h2
          id="future-heading"
          className="mt-3 text-xl font-extrabold text-sky-950"
        >
          What collaboration could make possible
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-slate-600">
          <li>Community-reviewed vocabulary, examples, and lessons.</li>
          <li>
            Compensated recordings from fluent speakers, with permission and
            attribution.
          </li>
          <li>
            Educator feedback and learning materials shaped by classroom needs.
          </li>
          <li>
            Better accessibility, mobile learning, and long-term maintenance.
          </li>
        </ul>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          These are areas we hope to develop with partners, rather than
          commitments from existing sponsors.
        </p>
      </section>
      <footer className="mt-8 border-t border-sky-100 pt-5 text-sm leading-6 text-slate-600">
        You can also help by sharing the app with someone who may find it
        useful. Participation is optional and never affects access to learning.{" "}
        <a href={repository} className="rounded text-sky-800 underline">
          View the project on GitHub.
        </a>
      </footer>
    </main>
  );
};
