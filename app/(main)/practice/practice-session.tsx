"use client";

import { useState, useTransition } from "react";

import { Check, Heart, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useAudio } from "react-use";
import { toast } from "sonner";

import { submitPracticeAnswer } from "@/actions/practice";
import { ActivityPrompt } from "@/components/activity-prompt";
import { Button } from "@/components/ui/button";
import type { PracticeActivity } from "@/lib/practice-activities";
import { cn } from "@/lib/utils";

type PracticeSessionProps = {
  activities: PracticeActivity[];
  dueCount: number;
  initialHearts: number;
};

export const PracticeSession = ({
  activities,
  dueCount,
  initialHearts,
}: PracticeSessionProps) => {
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [result, setResult] = useState<"correct" | "incorrect">();
  const [hearts, setHearts] = useState(initialHearts);
  const [pending, startTransition] = useTransition();
  const [correctAudio, , correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, , incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });
  const activity = activities[index];

  if (!activity) {
    return (
      <>
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
            Your review schedule is updated. Correct answers also restored
            hearts.
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
      </>
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
        .then((response) => {
          setResult(correct ? "correct" : "incorrect");
          setHearts(response.hearts);
        })
        .catch(() => toast.error("Could not save this review. Try again."));
    });
  };

  const onContinue = () => {
    setIndex((current) => current + 1);
    setSelectedId(undefined);
    setResult(undefined);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {correctAudio}
      {incorrectAudio}
      <div className="flex items-center justify-between text-sm font-bold text-neutral-500">
        <span>
          Review {index + 1} of {activities.length} · {dueCount} due
        </span>
        <span className="flex items-center gap-1 text-rose-500">
          <Heart className="h-5 w-5 fill-current" /> {hearts}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-sky-500 transition-all"
          style={{ width: `${(index / activities.length) * 100}%` }}
        />
      </div>

      <section className="rounded-3xl border-2 border-neutral-100 bg-white p-6 shadow-sm lg:p-10">
        <ActivityPrompt
          eyebrow="Scheduled practice"
          instruction={activity.instruction}
          focusText={activity.focusText}
          focusLanguage={activity.focusLanguage}
          promptAudioSrc={activity.promptAudioSrc}
          revealAudioAfterAnswer={activity.revealAudioAfterAnswer}
          answered={!!result}
          companion={activity.companion}
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {activity.options.map((option, optionIndex) => {
            const selected = option.id === selectedId;
            return (
              <button
                type="button"
                key={`${option.id}-${optionIndex}`}
                disabled={!!result || pending}
                onClick={() => setSelectedId(option.id)}
                className={cn(
                  "flex min-h-20 items-center justify-between rounded-2xl border-2 border-b-4 p-4 text-left font-bold text-neutral-700 transition hover:bg-neutral-50 active:border-b-2",
                  selected && "border-sky-400 bg-sky-50 text-sky-700",
                  result &&
                    selected &&
                    option.correct &&
                    "border-emerald-500 bg-emerald-50 text-emerald-700",
                  result &&
                    selected &&
                    !option.correct &&
                    "border-rose-500 bg-rose-50 text-rose-700"
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
            "flex items-center gap-3 rounded-2xl p-4 font-bold",
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
            : "Not quite — this item will return sooner."}
        </div>
      )}

      <Button
        size="lg"
        variant={result === "incorrect" ? "danger" : "primary"}
        disabled={!selectedId || pending}
        onClick={result ? onContinue : onCheck}
      >
        {pending ? "Saving…" : result ? "Continue" : "Check answer"}
      </Button>
    </div>
  );
};
