import { NotebookText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type UnitBannerProps = {
  title: string;
  description: string;
  companionSrc: string;
};

export const UnitBanner = ({
  title,
  description,
  companionSrc,
}: UnitBannerProps) => {
  return (
    <div className="relative isolate flex min-h-40 w-full items-center justify-between overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-sky-800 via-sky-700 to-teal-600 p-6 pr-28 text-white shadow-[0_18px_45px_-30px_rgba(3,105,161,0.8)] sm:pr-40">
      <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-200/15" />
      <div className="relative z-10 max-w-md space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100">
          Learning trail
        </p>
        <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        <p className="text-sm font-medium text-sky-50 sm:text-base">
          {description}
        </p>
      </div>

      <Link href="/lesson" prefetch className="relative z-20">
        <Button
          size="lg"
          variant="secondary"
          className="hidden border-2 border-white/25 bg-white/15 text-white backdrop-blur-sm active:border-b-2 xl:flex"
        >
          <NotebookText className="mr-2" />
          Continue
        </Button>
      </Link>

      <Image
        src={companionSrc}
        alt=""
        width={180}
        height={180}
        className="absolute -bottom-10 right-0 z-10 h-auto w-32 object-contain drop-shadow-xl sm:right-4 sm:w-40 xl:right-36"
      />
    </div>
  );
};
