import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  Show,
} from "@clerk/nextjs";
import {
  ArrowRight,
  BookOpen,
  Loader,
  Pencil,
  Sparkles,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo-mode";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  surfaceClassName: string;
};

const features: Feature[] = [
  {
    title: "Learn",
    description:
      "Follow a clear lesson path and build vocabulary step by step.",
    icon: BookOpen,
    iconClassName: "text-sky-700",
    surfaceClassName: "bg-sky-100",
  },
  {
    title: "Practice",
    description: "Review words at the right time, so they stay with you.",
    icon: Pencil,
    iconClassName: "text-teal-700",
    surfaceClassName: "bg-teal-100",
  },
  {
    title: "Listen",
    description:
      "Replay available pronunciation recordings whenever you need them.",
    icon: Volume2,
    iconClassName: "text-indigo-700",
    surfaceClassName: "bg-indigo-100",
  },
];

export default function MarketingPage() {
  const demoMode = isDemoMode();

  return (
    <div className="relative isolate w-full overflow-hidden px-5 pb-16 pt-10 sm:px-8 lg:pb-20 lg:pt-12">
      <div className="pointer-events-none absolute inset-x-0 bottom-44 -z-10 h-64 overflow-hidden opacity-80">
        <svg
          aria-hidden="true"
          viewBox="0 0 1600 240"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0 80 180 125 305 172 448 147 610 198 737 168 890 216 1052 170 1190 194 1380 149 1600 185V240H0Z"
            fill="#e0f2fe"
          />
          <path
            d="M0 160 150 191 295 178 455 222 620 190 770 229 960 197 1118 224 1285 186 1450 220 1600 199V240H0Z"
            fill="#f0f9ff"
          />
          <g fill="#bae6fd" opacity=".72">
            {Array.from({ length: 24 }, (_, index) => {
              const x = index * 68;
              const height = 26 + (index % 4) * 8;
              return (
                <path
                  key={x}
                  d={`M${x} 230l18-${height} 18 ${height}h-10l10 10H${x}l10-10Z`}
                />
              );
            })}
          </g>
        </svg>
      </div>

      <section className="mx-auto grid w-full max-w-[1340px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 xl:gap-20">
        <div className="flex flex-col items-start py-2 lg:py-8">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-sky-200 bg-white/85 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-sky-700 shadow-sm sm:text-sm">
            <Sparkles className="h-4 w-4 fill-amber-300 text-amber-500" />
            Short lessons. Steady progress.
          </div>

          <h1 className="mt-10 max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-sky-950 sm:text-6xl lg:text-[4rem] xl:text-[4.65rem]">
            Learn Tłı̨chǫ,
            <span className="mt-2 block bg-gradient-to-r from-sky-700 to-sky-500 bg-clip-text text-transparent">
              one word at a time.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-slate-600 sm:text-xl lg:text-[1.35rem]">
            Short lessons, clear pronunciation, and practice that brings words
            back at the right time.
          </p>

          <div className="mt-8 w-full max-w-md">
            {demoMode ? (
              <Button
                size="lg"
                variant="primary"
                className="group h-16 w-full rounded-2xl text-lg shadow-[0_16px_32px_-20px_rgba(3,105,161,0.9)]"
                asChild
              >
                <Link href="/demo">
                  Start learning
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : (
              <>
                <ClerkLoading>
                  <div className="flex h-16 items-center justify-center rounded-2xl border-2 border-sky-100 bg-white">
                    <Loader className="h-5 w-5 animate-spin text-sky-700" />
                  </div>
                </ClerkLoading>
                <ClerkLoaded>
                  <Show when="signed-in">
                    <Button
                      size="lg"
                      variant="primary"
                      className="h-16 w-full rounded-2xl text-lg"
                      asChild
                    >
                      <Link href="/learn" prefetch>
                        Continue learning
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </Link>
                    </Button>
                  </Show>
                  <Show when="signed-out">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <SignUpButton mode="modal">
                        <Button
                          size="lg"
                          variant="primary"
                          className="h-16 flex-1 rounded-2xl text-lg"
                        >
                          Get started
                        </Button>
                      </SignUpButton>
                      <SignInButton mode="modal">
                        <Button
                          size="lg"
                          variant="primaryOutline"
                          className="h-16 flex-1 rounded-2xl border-2 border-sky-200 text-lg"
                        >
                          Sign in
                        </Button>
                      </SignInButton>
                    </div>
                  </Show>
                </ClerkLoaded>
              </>
            )}
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500 sm:text-base">
            {demoMode
              ? "No account needed. Your progress stays in this browser."
              : "A welcoming path through vocabulary, listening, and review."}
          </p>
        </div>

        <div className="relative min-h-[480px] overflow-hidden rounded-[2.25rem] bg-sky-700 shadow-[0_34px_80px_-35px_rgba(3,105,161,0.72)] sm:min-h-[590px]">
          <Image
            src="/landing-landscape.svg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 720px, 95vw"
            className="object-cover"
          />

          <div className="absolute left-8 top-8 z-20 max-w-[16rem] text-white sm:left-12 sm:top-14 sm:max-w-sm">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-sky-100 sm:text-sm">
              Learn with a guide
            </p>
            <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-[2.65rem]">
              A friendly face along the way.
            </h2>
          </div>

          <div className="absolute -bottom-14 right-[-4.25rem] z-10 h-[430px] w-[430px] sm:-bottom-20 sm:right-[-4.75rem] sm:h-[590px] sm:w-[590px]">
            <Image
              src="/characters/tactile/moose.png"
              alt="Moose learning companion"
              fill
              priority
              sizes="(min-width: 1024px) 590px, 90vw"
              className="object-contain object-bottom drop-shadow-[0_28px_25px_rgba(3,33,64,0.28)]"
            />
          </div>

          <div className="absolute bottom-8 left-7 z-30 rounded-full border border-white/30 bg-white/15 px-5 py-3 text-sm font-extrabold text-white shadow-sm backdrop-blur-md sm:bottom-10 sm:left-10 sm:text-base">
            Small steps. Real progress.
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 grid w-full max-w-[1340px] gap-5 md:grid-cols-3 lg:mt-20">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="flex min-h-40 items-center gap-6 rounded-[1.75rem] border border-sky-100 bg-white/90 p-6 shadow-[0_20px_52px_-38px_rgba(8,47,73,0.45)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_58px_-36px_rgba(8,47,73,0.5)] sm:p-7"
            >
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${feature.surfaceClassName}`}
              >
                <Icon
                  className={`h-10 w-10 stroke-[2.5] ${feature.iconClassName}`}
                />
              </div>
              <div>
                <h2 className="text-xl font-black text-sky-950">
                  {feature.title}
                </h2>
                <p className="mt-1 text-base font-medium leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
