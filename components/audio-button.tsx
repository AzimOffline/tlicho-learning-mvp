"use client";

import { useEffect, useRef, useState } from "react";

import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AudioButtonProps = {
  src?: string | null;
  label?: string;
  className?: string;
  onUnavailable?: () => void;
};

export const AudioButton = (props: AudioButtonProps) => (
  <AudioPlayer key={props.src || "missing"} {...props} />
);

const AudioPlayer = ({
  src,
  label = "Play pronunciation",
  className,
  onUnavailable,
}: AudioButtonProps) => {
  const audio = useRef<HTMLAudioElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const clearTimer = () => {
    clearTimeout(timer.current);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const fail = () => {
    clearTimer();
    audio.current?.pause();
    setLoading(false);
    setFailed(true);
    onUnavailable?.();
  };
  const play = async () => {
    if (!audio.current || !src) return;
    clearTimer();
    setLoading(true);
    setFailed(false);
    if (failed) audio.current.load();
    timer.current = setTimeout(fail, 10000);
    try {
      await audio.current.play();
    } catch {
      fail();
    }
  };
  const unavailable = !src || failed;

  return (
    <>
      {src && (
        <audio
          ref={audio}
          src={src}
          preload="none"
          onError={fail}
          onPlaying={() => {
            clearTimer();
            setLoading(false);
          }}
          onWaiting={() => {
            clearTimer();
            timer.current = setTimeout(fail, 10000);
          }}
        />
      )}
      <Button
        type="button"
        variant="primaryOutline"
        size="lg"
        className={cn(
          "h-auto min-h-14 max-w-full justify-start gap-3 whitespace-normal border-2 border-b-4 border-sky-200 bg-sky-50 px-4 py-2 text-base shadow-sm hover:border-sky-300 hover:bg-sky-100 active:border-b-2",
          className
        )}
        disabled={!src || loading}
        onClick={() => void play()}
        aria-label={
          !src
            ? "Pronunciation audio unavailable"
            : failed
              ? "Retry pronunciation"
              : label
        }
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm">
          {unavailable ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </span>
        <span>
          {!src
            ? "Audio unavailable"
            : loading
              ? "Loading audio…"
              : failed
                ? "Retry pronunciation"
                : label}
        </span>
      </Button>
    </>
  );
};
