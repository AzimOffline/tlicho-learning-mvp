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
  translationAfterAnswer?: string | null;
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
  translationAfterAnswer,
  answered,
  companion,
}: ActivityPromptProps) => (
  <>
    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-600 sm:text-xs">
      {eyebrow}
    </p>
    <h1 className="mt-1.5 text-lg font-extrabold leading-snug text-neutral-600 sm:mt-2 lg:text-xl">
      {instruction}
    </h1>

    <div className="mt-3 flex min-h-24 items-center gap-3 rounded-2xl border-2 border-sky-100 bg-sky-50 px-3 py-3 sm:mt-5 sm:min-h-32 sm:gap-6 sm:px-6 sm:py-4">
      <div className="relative h-16 w-16 shrink-0 self-end sm:h-28 sm:w-28">
        <Image
          src={companion.src}
          alt={companion.alt}
          fill
          sizes="(max-width: 640px) 64px, 112px"
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
              className="mt-1 break-words text-2xl font-extrabold text-neutral-800 sm:text-3xl lg:text-4xl"
            >
              {focusText}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <AudioButton src={promptAudioSrc} className="mx-auto" />
            {answered && translationAfterAnswer && (
              <div className="animate-answer-pop rounded-xl bg-white/90 px-3 py-2 text-center shadow-sm">
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-600">
                  English meaning
                </span>
                <strong className="mt-0.5 block text-sm text-neutral-800 sm:text-base">
                  {translationAfterAnswer}
                </strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {focusText && (!revealAudioAfterAnswer || answered) && (
      <AudioButton src={promptAudioSrc} className="mt-3 sm:mt-5" />
    )}
  </>
);
