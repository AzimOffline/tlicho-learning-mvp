"use client";

import { ClerkLoading, ClerkLoaded, UserButton } from "@clerk/nextjs";
import { BarChart3, BookOpen, Dumbbell, Loader, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { SidebarItem } from "./sidebar-item";

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r border-sky-100 bg-white/90 px-4 backdrop-blur-xl lg:fixed lg:w-[256px]",
        className
      )}
    >
      <Link href="/learn" prefetch>
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <Image src="/tlicho-mark.svg" alt="" height={40} width={40} />

          <h1 className="text-xl font-black tracking-tight text-sky-900">
            Tłı̨chǫ Learning
          </h1>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem label="Learn" href="/learn" icon={BookOpen} />
        <SidebarItem label="Practice" href="/practice" icon={Dumbbell} />
        <SidebarItem label="Progress" href="/progress" icon={BarChart3} />
        <SidebarItem label="Profile" href="/profile" icon={UserRound} />
      </div>

      <div className="relative mb-3 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-teal-50 p-4 pr-20 text-sm text-sky-950">
        <strong className="block font-extrabold">Keep going</strong>
        <span className="mt-1 block text-xs font-medium text-slate-500">
          Your learning trail is waiting.
        </span>
        <Image
          src="/characters/tactile/moose-peek.png"
          alt=""
          width={90}
          height={90}
          className="absolute -bottom-4 -right-2 h-auto w-24 object-contain"
        />
      </div>

      <div className="p-4">
        <ClerkLoading>
          <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
        </ClerkLoading>

        <ClerkLoaded>
          <UserButton
            appearance={{
              elements: { userButtonPopoverCard: { pointerEvents: "initial" } },
            }}
          />
        </ClerkLoaded>
      </div>
    </div>
  );
};
