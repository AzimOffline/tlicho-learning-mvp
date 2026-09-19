import { Flame, Heart, InfinityIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MAX_HEARTS } from "@/constants";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { cn } from "@/lib/utils";

export const MobileHeader = async () => {
  const [progress, subscription] = await Promise.all([
    getUserProgress(),
    getUserSubscription(),
  ]);
  const level = Math.floor((progress?.points ?? 0) / 100) + 1;
  const levelXp = (progress?.points ?? 0) % 100;

  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center gap-2 border-b border-sky-100 bg-white/95 px-3 text-sky-900 shadow-sm backdrop-blur-xl sm:h-20 sm:gap-4 sm:px-5 lg:hidden">
      <Link
        href="/learn"
        className="flex shrink-0 items-center gap-2 font-extrabold"
      >
        <Image src="/tlicho-mark.svg" alt="" width={34} height={34} />
        <span className="hidden sm:inline">Tłı̨chǫ Learning</span>
      </Link>

      {progress && (
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-3">
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-50 px-2 py-1.5 text-orange-600 sm:px-3 sm:py-2">
            <Flame
              className={cn(
                "h-5 w-5 fill-current sm:h-6 sm:w-6",
                progress.currentStreak > 0 && "animate-streak-flame"
              )}
            />
            <strong className="text-sm sm:text-base">
              {progress.currentStreak}
            </strong>
          </div>

          <div className="min-w-0 rounded-xl bg-sky-50 px-2 py-1.5 sm:w-48 sm:px-3 sm:py-2">
            <div className="flex items-center justify-between text-[10px] font-extrabold text-sky-800 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 fill-sky-400 text-sky-500" />
                Level {level}
              </span>
              <span className="hidden sm:inline">{levelXp}/100 XP</span>
            </div>
            <div className="mt-1 hidden h-2 overflow-hidden rounded-full bg-sky-100 sm:block">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400"
                style={{ width: `${levelXp}%` }}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-50 px-2 py-1.5 text-rose-500 sm:px-3 sm:py-2">
            <Heart className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
            {subscription?.isActive ? (
              <InfinityIcon className="h-4 w-4 stroke-[3]" />
            ) : (
              <strong className="text-sm sm:text-base">
                {progress.hearts}/{MAX_HEARTS}
              </strong>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
