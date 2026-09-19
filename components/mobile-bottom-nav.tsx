"use client";

import { BarChart3, BookOpen, Dumbbell, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Practice", href: "/practice", icon: Dumbbell },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export const MobileBottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-4 border-t border-sky-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:h-20 lg:hidden">
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold text-neutral-400 sm:gap-1 sm:text-xs",
              active && "text-sky-800"
            )}
          >
            <Icon
              className={cn("h-5 w-5 sm:h-6 sm:w-6", active && "stroke-[3]")}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};
