"use client";

import Image from "next/image";

import type { ActivityCompanion } from "@/lib/activity-companions";

import { AudioButton } from "./audio-button";

type ActivityPromptProps = {
  eyebrow: string;
  instruction: string;
  focusText: string | null;
  focusLanguage: "Tłı̨chǫ" | "English" | "Audio";
  promptAudioSrc: string | null;
  revealAudioAfterAnswer: boolean;
  answered: boolean;
  companion: ActivityCompanion;
};

export const ActivityPrompt = ({
  eyebrow,
  instruction,
  focusText,
  focusLanguage,
  promptAudioSrc,
  revealAudioAfterAnswer,
  answered,
  companion,
}: ActivityPromptProps) => (
  <>
    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
      {eyebrow}
    </p>
    <h1 className="mt-2 text-lg font-extrabold leading-snug text-neutral-600 lg:text-xl">
      {instruction}
    </h1>

    <div className="mt-5 flex min-h-32 items-center gap-3 rounded-2xl border-2 border-sky-100 bg-sky-50 px-4 py-4 sm:gap-6 sm:px-6">
      <div className="relative h-24 w-24 shrink-0 self-end sm:h-28 sm:w-28">
        <Image
          src={companion.src}
          alt={companion.alt}
          fill
          sizes="(max-width: 640px) 96px, 112px"
          className="object-contain drop-shadow-md"
        />
      </div>

      <div className="min-w-0 flex-1 text-center">
        {focusText ? (
          <>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600">
              {focusLanguage}
            </span>
            <p
              lang={focusLanguage === "Tłı̨chǫ" ? "dgr" : "en"}
              className="mt-1 break-words text-3xl font-extrabold text-neutral-800 lg:text-4xl"
            >
              {focusText}
            </p>
          </>
        ) : (
          <AudioButton src={promptAudioSrc} className="mx-auto" />
        )}
      </div>
    </div>

    {focusText && (!revealAudioAfterAnswer || answered) && (
      <AudioButton src={promptAudioSrc} className="mt-5" />
    )}
  </>
);
