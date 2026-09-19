"use client";

import { useState } from "react";

import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "react-use";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AudioButtonProps = {
  src?: string | null;
  label?: string;
  className?: string;
};

export const AudioButton = ({
  src,
  label = "Play pronunciation",
  className,
}: AudioButtonProps) => {
  const [failed, setFailed] = useState(false);
  const [audio, , controls] = useAudio({
    src: src || "",
    onError: () => setFailed(true),
  });
  const unavailable = !src || failed;

  return (
    <>
      {audio}
      <Button
        type="button"
        variant="primaryOutline"
        size="lg"
        className={cn(
          "h-14 min-w-56 justify-start gap-3 border-2 border-b-4 border-sky-200 bg-sky-50 px-4 text-base shadow-sm hover:border-sky-300 hover:bg-sky-100 active:border-b-2",
          className
        )}
        disabled={unavailable}
        onClick={() => void controls.play()}
        aria-label={unavailable ? "Pronunciation audio unavailable" : label}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm">
          {unavailable ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </span>
        <span>{unavailable ? "Audio unavailable" : label}</span>
      </Button>
    </>
  );
};
