"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Check,
  Clock3,
  Crown,
  Dumbbell,
  Flame,
  Heart,
  Home,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "react-use";
import { toast } from "sonner";

import { ActivityPrompt } from "@/components/activity-prompt";
import { Button } from "@/components/ui/button";
import { MAX_HEARTS } from "@/constants";
import {
  getActivityCompanion,
  type ActivityCompanion,
} from "@/lib/activity-companions";
import { createFsrsCard, reviewFsrsCard, type FsrsCard } from "@/lib/fsrs";
import { getStreakUpdate } from "@/lib/streak";
import {
  buildBalancedLessonGroups,
  classifyTlichoUnit,
  tlichoUnitDefinitions,
} from "@/lib/tlicho-course-structure";
import { cn } from "@/lib/utils";

export type DemoVocabularyItem = {
  id: string;
  tlicho: string;
  english: string;
  audioSrc: string | null;
  category: string | null;
  partOfSpeech: string | null;
  exampleTlicho: string | null;
  exampleEnglish: string | null;
};

type StoredCard = Omit<FsrsCard, "due" | "lastReview"> & {
  due: string;
  lastReview?: string;
};

type DemoState = {
  version: 2;
  xp: number;
  hearts: number;
  streak: number;
  lastActivityAt?: string;
  completedLessons: string[];
  encountered: string[];
  cards: Record<string, StoredCard>;
  reviewsCompleted: number;
};

type Tab = "learn" | "practice" | "progress" | "profile";

type Activity = {
  itemId: string;
  instruction: string;
  focusText: string | null;
  focusLanguage: "Tłı̨chǫ" | "English" | "Audio";
  companion: ActivityCompanion;
  promptAudioSrc: string | null;
  revealAudioAfterAnswer: boolean;
  options: { id: string; text: string; correct: boolean }[];
};

type PracticeQueueItem = {
  itemId: string;
  sequence: number;
};

type Lesson = {
  id: string;
  title: string;
  items: DemoVocabularyItem[];
};

type Unit = {
  title: string;
  description: string;
  companionSrc: string;
  lessons: Lesson[];
};

const STORAGE_KEY = "tlicho-learning-demo-v2";

const initialState: DemoState = {
  version: 2,
  xp: 0,
  hearts: MAX_HEARTS,
  streak: 0,
  completedLessons: [],
  encountered: [],
  cards: {},
  reviewsCompleted: 0,
};

const serializeCard = (card: FsrsCard): StoredCard => ({
  ...card,
  due: card.due.toISOString(),
  lastReview: card.lastReview?.toISOString(),
});

const deserializeCard = (card: StoredCard): FsrsCard => ({
  ...card,
  due: new Date(card.due),
  lastReview: card.lastReview ? new Date(card.lastReview) : undefined,
});

const updateStreak = (state: DemoState, activityAt: Date) => {
  const update = getStreakUpdate(
    state.streak,
    state.lastActivityAt ? new Date(state.lastActivityAt) : null,
    activityAt
  );

  return {
    streak: update.currentStreak,
    lastActivityAt: update.lastActivityAt.toISOString(),
  };
};

const buildUnits = (items: DemoVocabularyItem[]): Unit[] => {
  const grouped = tlichoUnitDefinitions.map(() => [] as DemoVocabularyItem[]);
  items.forEach((item) =>
    grouped[classifyTlichoUnit(item.category)].push(item)
  );

  return tlichoUnitDefinitions.flatMap((definition, unitIndex) => {
    const entries = grouped[unitIndex];
    if (!entries.length) return [];

    const lessons = buildBalancedLessonGroups(
      entries,
      definition.lessonTitles
    ).map((group, lessonIndex) => ({
      id: `${unitIndex}-${lessonIndex}`,
      title: group.title,
      items: group.items,
    }));

    return [{ ...definition, lessons }];
  });
};

const selectChoices = (
  item: DemoVocabularyItem,
  allItems: DemoVocabularyItem[],
  field: "tlicho" | "english",
  offset: number
) => {
  const choices = [item];
  const seen = new Set([item[field]]);
  const start = Math.max(
    0,
    allItems.findIndex(({ id }) => id === item.id)
  );

  for (let step = 1; choices.length < 4 && step <= allItems.length; step++) {
    const candidate = allItems[(start + step) % allItems.length];
    if (!seen.has(candidate[field])) {
      seen.add(candidate[field]);
      choices.push(candidate);
    }
  }

  const correct = choices.shift();
  if (correct) choices.splice(offset % (choices.length + 1), 0, correct);
  return choices;
};

const buildActivity = (
  item: DemoVocabularyItem,
  allItems: DemoVocabularyItem[],
  sequence: number
): Activity => {
  const requestedMode = sequence % 4;
  const mode = item.audioSrc ? requestedMode : requestedMode % 2;
  const answerInEnglish = mode === 0 || mode === 2;
  const choices = selectChoices(
    item,
    allItems,
    answerInEnglish ? "english" : "tlicho",
    sequence
  );
  const instruction =
    mode === 0
      ? "Choose the English meaning"
      : mode === 1
        ? "Choose the Tłı̨chǫ translation"
        : mode === 2
          ? "Listen, then choose the English meaning"
          : "Listen, then choose the Tłı̨chǫ word";

  const focusText = mode === 0 ? item.tlicho : mode === 1 ? item.english : null;
  const focusLanguage =
    mode === 0 ? "Tłı̨chǫ" : mode === 1 ? "English" : "Audio";

  return {
    itemId: item.id,
    instruction,
    focusText,
    focusLanguage,
    companion: getActivityCompanion(`${item.id}:${sequence}`),
    promptAudioSrc: item.audioSrc,
    revealAudioAfterAnswer: mode === 1,
    options: choices.map((choice) => ({
      id: choice.id,
      text: answerInEnglish ? choice.english : choice.tlicho,
      correct: choice.id === item.id,
    })),
  };
};

const AnswerGrid = ({
  activity,
  selectedId,
  result,
  onSelect,
}: {
  activity: Activity;
  selectedId?: string;
  result?: "correct" | "incorrect";
  onSelect: (id: string) => void;
}) => (
  <div className="mt-8 grid gap-3 sm:grid-cols-2">
    {activity.options.map((option, optionIndex) => {
      const selected = option.id === selectedId;
      return (
        <button
          type="button"
          key={`${option.id}-${optionIndex}`}
          disabled={!!result}
          onClick={() => onSelect(option.id)}
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
          <span>{option.text}</span>
          <span className="ml-3 rounded-lg border-2 px-2 py-1 text-xs text-neutral-400">
            {optionIndex + 1}
          </span>
        </button>
      );
    })}
  </div>
);

const GameStatusBar = ({ state }: { state: DemoState }) => {
  const level = Math.floor(state.xp / 100) + 1;
  const levelXp = state.xp % 100;

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl border-2 bg-white p-3 shadow-sm sm:grid-cols-[auto_minmax(220px,1fr)_auto] sm:items-center sm:p-4">
      <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-orange-600">
        <Flame
          className={cn(
            "h-7 w-7 fill-current",
            state.streak > 0 && "animate-streak-flame"
          )}
        />
        <div>
          <strong className="block text-lg leading-none">{state.streak}</strong>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800/70">
            Day streak
          </span>
        </div>
      </div>

      <div className="order-3 col-span-2 rounded-xl bg-sky-50 px-3 py-2 sm:order-none sm:col-span-1">
        <div className="mb-1.5 flex items-center justify-between text-xs font-extrabold text-sky-800">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 fill-sky-400 text-sky-500" /> Level{" "}
            {level}
          </span>
          <span key={state.xp} className="animate-score-pop">
            {levelXp}/100 XP
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-sky-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-[width] duration-700 ease-out"
            style={{ width: `${levelXp}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 rounded-xl bg-rose-50 px-3 py-2 text-rose-500">
        <Heart className="animate-heartbeat h-7 w-7 fill-current" />
        <div>
          <strong className="block text-lg leading-none">
            {state.hearts}/{MAX_HEARTS}
          </strong>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800/60">
            Hearts
          </span>
        </div>
      </div>
    </div>
  );
};

const RewardBurst = ({ title, detail }: { title: string; detail: string }) => (
  <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-sky-950/10 backdrop-blur-[2px]">
    <div className="animate-reward-burst relative rounded-3xl border-4 border-amber-200 bg-white px-10 py-8 text-center shadow-2xl">
      <Sparkles className="animate-reward-spark absolute -left-7 -top-7 h-12 w-12 fill-amber-300 text-amber-400" />
      <Star className="animate-reward-spark absolute -right-8 -top-4 h-11 w-11 fill-sky-300 text-sky-400 [animation-delay:120ms]" />
      <Star className="animate-reward-spark absolute -bottom-6 -left-5 h-9 w-9 fill-emerald-300 text-emerald-400 [animation-delay:240ms]" />
      <Trophy className="mx-auto h-14 w-14 fill-amber-300 text-amber-500" />
      <strong className="mt-3 block text-2xl font-extrabold text-neutral-800">
        {title}
      </strong>
      <span className="mt-1 block font-bold text-sky-600">{detail}</span>
    </div>
  </div>
);

const pathOffsets = [50, 34, 28, 40, 62, 70, 58, 38];

const unitStyles = [
  {
    banner: "from-sky-500 to-sky-600",
    node: "border-sky-700 bg-sky-500",
    current: "ring-sky-200",
    path: "#bae6fd",
  },
  {
    banner: "from-teal-500 to-emerald-600",
    node: "border-teal-700 bg-teal-500",
    current: "ring-teal-200",
    path: "#99f6e4",
  },
  {
    banner: "from-indigo-500 to-blue-600",
    node: "border-indigo-700 bg-indigo-500",
    current: "ring-indigo-200",
    path: "#c7d2fe",
  },
  {
    banner: "from-rose-500 to-orange-500",
    node: "border-rose-700 bg-rose-500",
    current: "ring-rose-200",
    path: "#fecdd3",
  },
  {
    banner: "from-amber-400 to-orange-500",
    node: "border-amber-600 bg-amber-400",
    current: "ring-amber-200",
    path: "#fde68a",
  },
  {
    banner: "from-violet-500 to-fuchsia-600",
    node: "border-violet-700 bg-violet-500",
    current: "ring-violet-200",
    path: "#ddd6fe",
  },
];

const LessonPath = ({
  unit,
  unitIndex,
  completedLessons,
  currentLessonId,
  onBegin,
}: {
  unit: Unit;
  unitIndex: number;
  completedLessons: string[];
  currentLessonId: string | undefined;
  onBegin: (lesson: Lesson) => void;
}) => {
  const style = unitStyles[unitIndex % unitStyles.length];
  const rowHeight = 150;
  const pathHeight = unit.lessons.length * rowHeight + 78;
  const points = unit.lessons.map((_, index) => ({
    x: pathOffsets[index % pathOffsets.length],
    y: 62 + index * rowHeight,
  }));
  const path = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const previous = points[index - 1];
      const midpoint = (previous.y + point.y) / 2;
      return `C ${previous.x} ${midpoint}, ${point.x} ${midpoint}, ${point.x} ${point.y}`;
    })
    .join(" ");
  const completedCount = unit.lessons.filter((lesson) =>
    completedLessons.includes(lesson.id)
  ).length;

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white/90 shadow-[0_18px_45px_-34px_rgba(8,47,73,0.55)]">
      <div
        className={cn(
          "flex items-center justify-between bg-gradient-to-r p-5 text-white sm:p-6",
          style.banner
        )}
      >
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-white/80">
            Unit {unitIndex + 1}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold">{unit.title}</h2>
          <p className="mt-1 text-sm font-semibold text-white/85">
            {unit.description}
          </p>
        </div>
        <div className="rounded-2xl bg-white/20 px-3 py-2 text-center backdrop-blur-sm">
          <strong className="block text-xl">{completedCount}</strong>
          <span className="text-xs font-bold uppercase">
            of {unit.lessons.length}
          </span>
        </div>
      </div>

      <div
        className="relative mx-auto w-full max-w-xl"
        style={{ height: pathHeight }}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 100 ${pathHeight}`}
          preserveAspectRatio="none"
        >
          <path
            d={path}
            fill="none"
            stroke={style.path}
            strokeDasharray="2 13"
            strokeLinecap="round"
            strokeWidth="7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div
          className={cn(
            "absolute z-0 hidden h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-sky-100 to-teal-50 shadow-sm sm:flex",
            unitIndex % 2 ? "left-3" : "right-3"
          )}
          style={{ top: Math.max(76, pathHeight / 2 - 48) }}
        >
          <Image
            src={unit.companionSrc}
            alt="Friendly course character"
            width={112}
            height={112}
            className="h-auto w-28 object-contain drop-shadow-sm"
          />
        </div>

        {unit.lessons.map((lesson, lessonIndex) => {
          const point = points[lessonIndex];
          const complete = completedLessons.includes(lesson.id);
          const current = lesson.id === currentLessonId;
          const locked = !complete && !current;
          const isMilestone = lessonIndex === unit.lessons.length - 1;
          const Icon = complete
            ? Check
            : locked
              ? LockKeyhole
              : isMilestone
                ? Crown
                : Star;

          return (
            <div
              key={lesson.id}
              className="absolute z-10 flex w-[176px] -translate-x-1/2 flex-col items-center"
              style={{ left: `${point.x}%`, top: point.y - 44 }}
            >
              {current && (
                <span className="absolute -top-10 animate-bounce rounded-xl border-2 border-sky-100 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-sky-600 shadow-sm">
                  Start
                </span>
              )}
              <button
                type="button"
                disabled={locked}
                onClick={() => onBegin(lesson)}
                aria-label={`${lesson.title}, ${lesson.items.length} activities${locked ? ", locked" : ""}`}
                className={cn(
                  "flex h-[82px] w-[82px] items-center justify-center rounded-full border-b-[9px] text-white shadow-md transition hover:-translate-y-1 active:translate-y-1 active:border-b-4",
                  style.node,
                  current && `ring-8 ${style.current}`,
                  complete &&
                    "animate-node-complete border-emerald-700 bg-emerald-500",
                  locked &&
                    "cursor-not-allowed border-neutral-400 bg-neutral-300 text-neutral-500 shadow-none hover:translate-y-0"
                )}
              >
                <Icon
                  className={cn(
                    "h-9 w-9 fill-current stroke-[3]",
                    complete && "fill-none"
                  )}
                />
              </button>
              <div className="mt-3 rounded-xl border-2 bg-white px-3 py-2 text-center shadow-sm">
                <strong className="block text-sm text-neutral-800">
                  {lesson.title}
                </strong>
                <span className="text-xs font-semibold text-neutral-500">
                  {lesson.items.length} activities
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const DemoApp = ({
  vocabulary,
}: {
  vocabulary: DemoVocabularyItem[];
}) => {
  const units = useMemo(() => buildUnits(vocabulary), [vocabulary]);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<DemoState>(initialState);
  const [tab, setTab] = useState<Tab>("learn");
  const [nowMs, setNowMs] = useState(0);
  const [activeLesson, setActiveLesson] = useState<Lesson>();
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [result, setResult] = useState<"correct" | "incorrect">();
  const [practiceQueue, setPracticeQueue] = useState<PracticeQueueItem[]>([]);
  const [reward, setReward] = useState<{
    title: string;
    detail: string;
  }>();
  const [correctAudio, , correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, , incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });
  const [finishAudio, , finishControls] = useAudio({ src: "/finish.mp3" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(JSON.parse(stored) as DemoState);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
    setNowMs(Date.now());
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const dueCards = Object.values(state.cards)
    .map(deserializeCard)
    .filter((card) => card.due.getTime() <= nowMs)
    .sort((a, b) => a.due.getTime() - b.due.getTime());
  const currentLessonId = units
    .flatMap((unit) => unit.lessons)
    .find((lesson) => !state.completedLessons.includes(lesson.id))?.id;

  const openTab = (nextTab: Tab) => {
    setActiveLesson(undefined);
    setSelectedId(undefined);
    setResult(undefined);
    setTab(nextTab);

    if (nextTab === "practice") {
      // Captured only when the learner opens Practice, not during render.
      // eslint-disable-next-line react-hooks/purity
      const currentTime = Date.now();
      setNowMs(currentTime);
      setPracticeQueue(
        Object.values(state.cards)
          .filter((card) => new Date(card.due).getTime() <= currentTime)
          .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
          .map((card, sessionIndex) => ({
            itemId: card.itemId,
            sequence: state.reviewsCompleted + sessionIndex,
          }))
      );
    }
  };

  const beginLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setQuizIndex(0);
    setSelectedId(undefined);
    setResult(undefined);
  };

  const resetProgress = () => {
    if (!window.confirm("Reset all local demo progress on this browser?")) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    setPracticeQueue([]);
    openTab("learn");
    toast.success("Local demo progress reset.");
  };

  const showReward = (title: string, detail: string) => {
    setReward({ title, detail });
    window.setTimeout(() => setReward(undefined), 1800);
  };

  const activity = activeLesson
    ? buildActivity(activeLesson.items[quizIndex], vocabulary, quizIndex)
    : undefined;

  const checkLessonAnswer = () => {
    if (!activity || !selectedId || result) return;
    const correct = activity.options.find(
      ({ id }) => id === selectedId
    )?.correct;
    void (correct ? correctControls : incorrectControls).play();
    setResult(correct ? "correct" : "incorrect");

    if (!correct) {
      setState((current) => ({
        ...current,
        hearts: Math.max(0, current.hearts - 1),
      }));
      return;
    }

    const reviewedAt = new Date();
    setNowMs(reviewedAt.getTime());
    setState((current) => ({
      ...current,
      xp: current.xp + 10,
      encountered: current.encountered.includes(activity.itemId)
        ? current.encountered
        : [...current.encountered, activity.itemId],
      cards: current.cards[activity.itemId]
        ? current.cards
        : {
            ...current.cards,
            [activity.itemId]: serializeCard(
              createFsrsCard(activity.itemId, reviewedAt)
            ),
          },
    }));
  };

  const continueLesson = () => {
    if (!activeLesson || !result) return;
    if (result === "incorrect") {
      setSelectedId(undefined);
      setResult(undefined);
      return;
    }

    if (quizIndex < activeLesson.items.length - 1) {
      setQuizIndex((current) => current + 1);
      setSelectedId(undefined);
      setResult(undefined);
      return;
    }

    const completedAt = new Date();
    setState((current) => ({
      ...current,
      ...updateStreak(current, completedAt),
      xp: current.xp + 20,
      completedLessons: current.completedLessons.includes(activeLesson.id)
        ? current.completedLessons
        : [...current.completedLessons, activeLesson.id],
    }));
    void finishControls.play();
    showReward("Lesson complete!", "+20 XP · streak updated");
    toast.success("Lesson complete — new words are ready for Practice.");
    setActiveLesson(undefined);
    setQuizIndex(0);
    setSelectedId(undefined);
    setResult(undefined);
  };

  const practiceQueueItem = practiceQueue[0];
  const practiceItemId = practiceQueueItem?.itemId;
  const practiceCard = practiceItemId
    ? deserializeCard(state.cards[practiceItemId])
    : undefined;
  const practiceItem = vocabulary.find(({ id }) => id === practiceItemId);
  const practiceActivity =
    practiceCard && practiceItem && practiceQueueItem
      ? buildActivity(practiceItem, vocabulary, practiceQueueItem.sequence)
      : undefined;

  const checkPracticeAnswer = () => {
    if (!practiceActivity || !practiceCard || !selectedId || result) return;
    const correct = practiceActivity.options.find(
      ({ id }) => id === selectedId
    )?.correct;
    void (correct ? correctControls : incorrectControls).play();
    const reviewedAt = new Date();
    const review = reviewFsrsCard(
      practiceCard,
      correct ? "correct" : "incorrect",
      reviewedAt
    );
    setResult(correct ? "correct" : "incorrect");
    setNowMs(reviewedAt.getTime());
    setState((current) => ({
      ...current,
      ...updateStreak(current, reviewedAt),
      xp: correct ? current.xp + 10 : current.xp,
      hearts: correct
        ? Math.min(MAX_HEARTS, current.hearts + 1)
        : current.hearts,
      reviewsCompleted: current.reviewsCompleted + 1,
      cards: {
        ...current.cards,
        [practiceCard.itemId]: serializeCard(review.card),
      },
    }));
  };

  const continuePractice = () => {
    if (practiceQueue.length === 1) {
      showReward("Practice complete!", "Your review schedule is up to date");
    }
    setPracticeQueue((current) => current.slice(1));
    setSelectedId(undefined);
    setResult(undefined);
  };

  if (!ready) {
    return (
      <>
        {correctAudio}
        {incorrectAudio}
        {finishAudio}
        <div className="flex min-h-screen items-center justify-center font-bold text-sky-700">
          Loading local demo…
        </div>
      </>
    );
  }

  const navItems = [
    { id: "learn" as const, label: "Learn", icon: BookOpen },
    { id: "practice" as const, label: "Practice", icon: Dumbbell },
    { id: "progress" as const, label: "Progress", icon: BarChart3 },
    { id: "profile" as const, label: "Profile", icon: UserRound },
  ];
  const lessonInProgress = tab === "learn" && !!activeLesson;

  return (
    <div
      className={cn(
        "min-h-screen bg-[#f7fbfe]",
        lessonInProgress ? "pb-0 lg:pl-0" : "pb-24 lg:pb-0 lg:pl-64"
      )}
    >
      {correctAudio}
      {incorrectAudio}
      {finishAudio}
      {reward && <RewardBurst title={reward.title} detail={reward.detail} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sky-100 bg-white/90 p-4 backdrop-blur-xl",
          lessonInProgress ? "lg:hidden" : "lg:flex"
        )}
      >
        <Link href="/" className="flex items-center gap-3 px-3 py-5">
          <Image src="/tlicho-mark.svg" alt="" width={42} height={42} />
          <span className="text-xl font-black tracking-tight text-sky-950">
            Tłı̨chǫ Learning
          </span>
        </Link>
        <div className="mt-4 flex flex-col gap-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => openTab(id)}
              className={cn(
                "flex h-[52px] items-center gap-4 rounded-xl px-4 font-bold text-neutral-500 hover:bg-slate-100",
                tab === id && "bg-sky-100 text-sky-800"
              )}
            >
              <Icon className="h-6 w-6" /> {label}
              {id === "practice" && dueCards.length > 0 && (
                <span className="ml-auto rounded-full bg-sky-600 px-2 py-0.5 text-xs text-white">
                  {dueCards.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative mt-auto overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-teal-50 p-4 pr-20 text-sm text-sky-950">
          <strong>Your learning trail</strong>
          <p className="mt-1">Progress stays in this browser.</p>
          <Image
            src="/characters/tactile/moose-peek.png"
            alt="Course mascot"
            width={72}
            height={72}
            className="absolute -bottom-4 -right-2 h-auto w-24 object-contain"
          />
        </div>
      </aside>

      <header
        className={cn(
          "sticky top-0 z-20 h-16 items-center justify-between border-b border-sky-100 bg-white/90 px-5 backdrop-blur-xl lg:hidden",
          lessonInProgress ? "hidden" : "flex"
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-sky-800"
        >
          <Image src="/tlicho-mark.svg" alt="" width={34} height={34} />
          Tłı̨chǫ Learning
        </Link>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          Demo
        </span>
      </header>

      <main
        className={cn(
          "mx-auto px-5 py-8",
          lessonInProgress ? "max-w-5xl" : "max-w-4xl"
        )}
      >
        {tab === "learn" && activeLesson && activity ? (
          <section className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => setActiveLesson(undefined)}
              className="mb-6 flex items-center gap-2 font-bold text-neutral-500"
            >
              <ArrowLeft className="h-5 w-5" /> Back to course
            </button>
            <div className="mb-5 flex items-center justify-between text-sm font-bold text-neutral-500">
              <span>
                {activeLesson.title} · {quizIndex + 1}/
                {activeLesson.items.length}
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <Heart className="h-5 w-5 fill-current" /> {state.hearts}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{
                  width: `${(quizIndex / activeLesson.items.length) * 100}%`,
                }}
              />
            </div>
            <div className="mt-6 rounded-3xl border-2 bg-white p-6 shadow-sm lg:p-10">
              <ActivityPrompt
                eyebrow="Learn"
                instruction={activity.instruction}
                focusText={activity.focusText}
                focusLanguage={activity.focusLanguage}
                promptAudioSrc={activity.promptAudioSrc}
                revealAudioAfterAnswer={activity.revealAudioAfterAnswer}
                answered={!!result}
                companion={activity.companion}
              />
              <AnswerGrid
                activity={activity}
                selectedId={selectedId}
                result={result}
                onSelect={setSelectedId}
              />
            </div>
            {result && (
              <div
                className={cn(
                  "mt-5 flex items-center gap-3 rounded-2xl p-4 font-bold",
                  result === "correct"
                    ? "animate-answer-pop bg-emerald-100 text-emerald-800"
                    : "animate-answer-shake bg-rose-100 text-rose-800"
                )}
              >
                {result === "correct" ? (
                  <Check className="animate-score-pop" />
                ) : (
                  <RotateCcw />
                )}
                <span>
                  {result === "correct"
                    ? "Correct!"
                    : "Not quite. Give it another try."}
                </span>
                {result === "correct" && (
                  <span className="animate-xp-float ml-auto text-sm">
                    +10 XP
                  </span>
                )}
              </div>
            )}
            <Button
              size="lg"
              className="mt-5 w-full"
              variant={result === "incorrect" ? "danger" : "primary"}
              disabled={!selectedId}
              onClick={result ? continueLesson : checkLessonAnswer}
            >
              {result === "incorrect"
                ? "Try again"
                : result === "correct"
                  ? "Continue"
                  : "Check answer"}
            </Button>
          </section>
        ) : tab === "learn" ? (
          <section className="mx-auto max-w-3xl">
            <GameStatusBar state={state} />
            <div className="relative min-h-56 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#07559a] via-[#087cae] to-[#1aa6a6] p-7 pr-28 text-white shadow-[0_24px_60px_-38px_rgba(3,105,161,0.9)] sm:min-h-64 sm:p-9 sm:pr-52">
              <div className="absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-white/10 sm:h-72 sm:w-72" />
              <p className="font-bold text-sky-100">Your learning trail</p>
              <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
                Learn Tłı̨chǫ
              </h1>
              <p className="relative z-10 mt-3 max-w-xl text-sm font-medium text-sky-50 sm:text-base">
                Follow the path through short, playful lessons. Each new word
                joins your personalized Practice schedule.
              </p>
              <div className="relative z-10 mt-5 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {vocabulary.length} real words
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {state.completedLessons.length} lessons complete
                </span>
              </div>
              <Image
                src="/characters/tactile/moose-learn-guide.png"
                alt="Moose course mascot"
                width={220}
                height={220}
                priority
                className="absolute -bottom-10 right-[-1rem] h-auto w-48 object-contain drop-shadow-xl sm:right-3 sm:w-56"
              />
            </div>
            <div className="mt-8 space-y-10">
              {units.map((unit, unitIndex) => (
                <LessonPath
                  key={unit.title}
                  unit={unit}
                  unitIndex={unitIndex}
                  completedLessons={state.completedLessons}
                  currentLessonId={currentLessonId}
                  onBegin={beginLesson}
                />
              ))}
            </div>
          </section>
        ) : tab === "practice" && practiceActivity && practiceCard ? (
          <section className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between text-sm font-bold text-neutral-500">
              <span>{practiceQueue.length} in this session</span>
              <span className="flex items-center gap-1 text-rose-500">
                <Heart className="h-5 w-5 fill-current" /> {state.hearts}
              </span>
            </div>
            <div className="mt-5 rounded-3xl border-2 bg-white p-6 shadow-sm lg:p-10">
              <ActivityPrompt
                eyebrow="Scheduled practice"
                instruction={practiceActivity.instruction}
                focusText={practiceActivity.focusText}
                focusLanguage={practiceActivity.focusLanguage}
                promptAudioSrc={practiceActivity.promptAudioSrc}
                revealAudioAfterAnswer={practiceActivity.revealAudioAfterAnswer}
                answered={!!result}
                companion={practiceActivity.companion}
              />
              <AnswerGrid
                activity={practiceActivity}
                selectedId={selectedId}
                result={result}
                onSelect={setSelectedId}
              />
            </div>
            {result && (
              <div
                className={cn(
                  "mt-5 flex items-center gap-3 rounded-2xl p-4 font-bold",
                  result === "correct"
                    ? "animate-answer-pop bg-emerald-100 text-emerald-800"
                    : "animate-answer-shake bg-rose-100 text-rose-800"
                )}
              >
                {result === "correct" ? (
                  <Check className="animate-score-pop" />
                ) : (
                  <RotateCcw />
                )}
                <span>
                  {result === "correct"
                    ? "Correct — the next review is scheduled."
                    : "Not quite — this word will return sooner."}
                </span>
                {result === "correct" && (
                  <span className="animate-xp-float ml-auto text-sm">
                    +10 XP
                  </span>
                )}
              </div>
            )}
            <Button
              size="lg"
              className="mt-5 w-full"
              variant={result === "incorrect" ? "danger" : "primary"}
              disabled={!selectedId}
              onClick={result ? continuePractice : checkPracticeAnswer}
            >
              {result ? "Continue" : "Check answer"}
            </Button>
          </section>
        ) : tab === "practice" ? (
          <section className="mx-auto max-w-xl rounded-3xl border-2 bg-white p-10 text-center shadow-sm">
            <Clock3 className="mx-auto h-14 w-14 text-sky-600" />
            <h1 className="mt-5 text-3xl font-extrabold text-neutral-800">
              {state.encountered.length
                ? "You’re caught up"
                : "Learn a few words first"}
            </h1>
            <p className="mt-3 text-neutral-600">
              {state.encountered.length
                ? "Your review schedule is current."
                : "Complete a Learn lesson and its words will appear here immediately."}
            </p>
            <Button
              className="mt-6"
              variant="primary"
              onClick={() => openTab("learn")}
            >
              Go to Learn
            </Button>
          </section>
        ) : tab === "progress" ? (
          <section>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-600">
              Local progress
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-neutral-800">
              Progress
            </h1>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Lessons complete", state.completedLessons.length, BookOpen],
                ["Current streak", `${state.streak} days`, Flame],
                ["Words encountered", state.encountered.length, Sparkles],
                ["Reviews due", dueCards.length, Clock3],
                ["Reviews completed", state.reviewsCompleted, Dumbbell],
                ["Total XP", state.xp, Trophy],
              ].map(([label, value, Icon]) => {
                const StatIcon = Icon as typeof BookOpen;
                return (
                  <div
                    key={String(label)}
                    className="rounded-2xl border-2 bg-white p-5"
                  >
                    <StatIcon className="mb-3 h-7 w-7 text-sky-600" />
                    <p className="text-2xl font-extrabold text-neutral-800">
                      {String(value)}
                    </p>
                    <p className="text-sm font-semibold text-neutral-500">
                      {String(label)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-xl">
            <div className="rounded-3xl border-2 bg-white p-8 text-center shadow-sm">
              <Image
                src="/tlicho-mark.svg"
                alt=""
                width={96}
                height={96}
                className="mx-auto"
              />
              <h1 className="mt-4 text-3xl font-extrabold text-neutral-800">
                Local learner
              </h1>
              <p className="mt-2 text-neutral-500">
                Zero-configuration private demo profile
              </p>
            </div>
            <div className="mt-5 rounded-2xl bg-amber-50 p-5 text-amber-900">
              This mode has no sign-in. Progress and FSRS schedules are stored
              in your browser’s local storage and are not synced anywhere.
            </div>
            <Button
              className="mt-5 w-full"
              variant="dangerOutline"
              onClick={resetProgress}
            >
              <RotateCcw className="mr-2 h-5 w-5" /> Reset local progress
            </Button>
            <Button className="mt-5 w-full" variant="primaryOutline" asChild>
              <Link href="/">
                <Home className="mr-2 h-5 w-5" /> Back to home
              </Link>
            </Button>
          </section>
        )}
      </main>

      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 h-20 grid-cols-4 border-t border-sky-100 bg-white/95 px-2 backdrop-blur-xl lg:hidden",
          lessonInProgress ? "hidden" : "grid"
        )}
      >
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => openTab(id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-bold text-neutral-400",
              tab === id && "text-sky-800"
            )}
          >
            <Icon className="h-6 w-6" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};
