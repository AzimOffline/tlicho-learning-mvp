"use client";

import { useState, useTransition } from "react";

import { ArrowLeft, Check, Clock3, Dumbbell, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "react-use";
import { toast } from "sonner";

import { rewardPracticeHearts, submitPracticeAnswer } from "@/actions/practice";
import { ActivityPrompt } from "@/components/activity-prompt";
import { Button } from "@/components/ui/button";
import { MAX_HEARTS } from "@/constants";
import type { PracticeActivity } from "@/lib/practice-activities";
import { cn } from "@/lib/utils";

type PracticeSessionProps = {
  activities: PracticeActivity[];
  dueCount: number;
};

export const PracticeSession = ({
  activities,
  dueCount,
}: PracticeSessionProps) => {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [result, setResult] = useState<"correct" | "incorrect">();
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [completionMessage, setCompletionMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [correctAudio, , correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, , incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });
  const activity = activities[index];
  const reviewsLeftToday = dueCount > 0 ? dueCount : activities.length;

  if (!started) {
    return (
      <section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border-2 border-sky-100 bg-white shadow-[0_24px_60px_-38px_rgba(3,105,161,0.9)]">
        {correctAudio}
        {incorrectAudio}
        <div className="relative min-h-[205px] overflow-hidden bg-gradient-to-br from-sky-700 via-sky-600 to-teal-500 p-5 pr-28 text-white sm:min-h-72 sm:p-9 sm:pr-64">
          <div className="absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-white/10" />
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-100">
            Targeted practice
          </p>
          <h1 className="mt-2 text-2xl font-black leading-tight sm:mt-3 sm:text-4xl">
            Strengthen the words that need attention
          </h1>
          <p className="relative z-10 mt-3 hidden max-w-md font-medium text-sky-50 sm:block">
            Short, focused activities bring back recent words—including anything
            you missed in Learn.
          </p>
          <Image
            src="/characters/tactile/moose-reading.png"
            alt="Moose practice companion"
            width={250}
            height={250}
            className="absolute bottom-0 right-2 h-auto w-32 object-contain drop-shadow-xl sm:right-3 sm:w-56"
          />
        </div>

        <div className="border-t-2 border-sky-100 bg-white p-4 text-center sm:p-8">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Clock3 className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-600 sm:mt-4 sm:text-sm">
            Reviews left today
          </p>
          <strong className="mt-1 block text-3xl font-black text-neutral-800 sm:text-5xl">
            {reviewsLeftToday}
          </strong>
          <p className="mx-auto mt-1 max-w-md text-xs font-medium text-neutral-600 sm:mt-3 sm:text-base">
            {reviewsLeftToday} focused{" "}
            {reviewsLeftToday === 1 ? "review is" : "reviews are"} ready.
            Correct answers earn hearts.
          </p>
          <Button
            size="lg"
            className="mt-3 h-11 w-full sm:mt-6 sm:h-12"
            variant="primary"
            onClick={() => setStarted(true)}
          >
            <Dumbbell className="mr-2 h-5 w-5" /> Start practice
          </Button>
        </div>
      </section>
    );
  }

  if (!activity) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#f7fbfe] p-4 sm:p-8">
        {correctAudio}
        {incorrectAudio}
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-3xl border-2 border-emerald-100 bg-white p-8 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-800">
            Practice complete
          </h1>
          <p className="text-neutral-600">
            {completionMessage ||
              "Your review schedule is updated. Correct answers earn heart recovery."}
          </p>
          <div className="flex gap-3">
            <Button variant="primaryOutline" asChild>
              <Link href="/progress">View progress</Link>
            </Button>
            <Button variant="primary" asChild>
              <Link href="/learn">Keep learning</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedOption = activity.options.find(
    (option) => option.id === selectedId
  );

  const onCheck = () => {
    if (!selectedOption || result || pending) return;
    const correct = selectedOption.correct;
    void (correct ? correctControls : incorrectControls).play();

    startTransition(() => {
      submitPracticeAnswer(activity.itemId, correct)
        .then(() => {
          setResult(correct ? "correct" : "incorrect");
          if (correct) setCorrectAnswers((current) => current + 1);
        })
        .catch(() => toast.error("Could not save this review. Try again."));
    });
  };

  const onContinue = () => {
    if (index === activities.length - 1) {
      startTransition(() => {
        rewardPracticeHearts(correctAnswers)
          .then(({ heartsEarned, heartsRestored, nextHearts }) => {
            setCompletionMessage(
              heartsEarned === 0
                ? "No heart earned this time. Get at least 1 answer correct to restore a heart."
                : heartsRestored > 0
                  ? `${heartsRestored} ${
                      heartsRestored === 1 ? "heart" : "hearts"
                    } restored. You now have ${nextHearts}/${MAX_HEARTS}.`
                  : "Your hearts were already full, and your correct answers still earned XP."
            );
            setIndex((current) => current + 1);
            setSelectedId(undefined);
            setResult(undefined);
          })
          .catch(() =>
            toast.error("Could not apply the Practice reward. Try again.")
          );
      });
      return;
    }

    setIndex((current) => current + 1);
    setSelectedId(undefined);
    setResult(undefined);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f7fbfe] px-4 py-4 sm:px-5 sm:py-8">
      {correctAudio}
      {incorrectAudio}
      <div className="mx-auto flex max-w-2xl flex-col">
        <div className="flex items-center justify-between gap-3 text-sm font-bold text-neutral-500">
          <Link
            href="/learn"
            className="flex items-center gap-1.5 rounded-xl px-1 py-1 hover:text-sky-700"
          >
            <ArrowLeft className="h-5 w-5" /> Exit
          </Link>
          <span>
            Review {index + 1} of {activities.length} ·{" "}
            {dueCount > 0 ? `${dueCount} due` : "heart recovery"}
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600">
            Review
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100 sm:h-3">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${(index / activities.length) * 100}%` }}
          />
        </div>

        <section className="mt-3 rounded-3xl border-2 border-neutral-100 bg-white p-4 shadow-sm sm:mt-5 sm:p-6 lg:p-10">
          <ActivityPrompt
            eyebrow="Scheduled practice"
            instruction={activity.instruction}
            focusText={activity.focusText}
            focusLanguage={activity.focusLanguage}
            promptAudioSrc={activity.promptAudioSrc}
            revealAudioAfterAnswer={activity.revealAudioAfterAnswer}
            translationAfterAnswer={activity.translationAfterAnswer}
            answered={!!result}
            companion={activity.companion}
          />

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3">
            {activity.options.map((option, optionIndex) => {
              const selected = option.id === selectedId;
              return (
                <button
                  type="button"
                  key={`${option.id}-${optionIndex}`}
                  disabled={!!result || pending}
                  onClick={() => setSelectedId(option.id)}
                  className={cn(
                    "flex min-h-16 items-center justify-between rounded-2xl border-2 border-b-4 p-3 text-left text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 active:border-b-2 sm:min-h-20 sm:p-4 sm:text-base",
                    selected && "border-sky-400 bg-sky-50 text-sky-700",
                    result &&
                      selected &&
                      option.correct &&
                      "border-emerald-500 bg-emerald-50 text-emerald-700",
                    result &&
                      selected &&
                      !option.correct &&
                      "border-rose-500 bg-rose-50 text-rose-700",
                    result === "incorrect" &&
                      option.correct &&
                      "border-emerald-500 bg-emerald-50 text-emerald-700"
                  )}
                >
                  <span lang="dgr">{option.text}</span>
                  <span className="ml-3 rounded-lg border-2 px-2 py-1 text-xs text-neutral-400">
                    {optionIndex + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {result && (
          <div
            className={cn(
              "mt-3 flex items-center gap-3 rounded-2xl p-3 text-sm font-bold sm:mt-5 sm:p-4 sm:text-base",
              result === "correct"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            )}
          >
            {result === "correct" ? (
              <Check className="h-6 w-6" />
            ) : (
              <RotateCcw className="h-6 w-6" />
            )}
            {result === "correct"
              ? "Correct — your next review is scheduled."
              : `Not quite — the correct answer is “${
                  activity.options.find((option) => option.correct)?.text ??
                  "shown in green"
                }”.`}
          </div>
        )}

        <Button
          size="lg"
          className="mt-3 w-full sm:mt-5"
          variant={result === "incorrect" ? "danger" : "primary"}
          disabled={!selectedId || pending}
          onClick={result ? onContinue : onCheck}
        >
          {pending ? "Saving…" : result ? "Continue" : "Check answer"}
        </Button>
      </div>
    </div>
  );
};
