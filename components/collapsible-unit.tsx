"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export const CollapsibleUnit = ({
  title,
  description,
  number,
  completed,
  total,
  current,
  children,
}: {
  title: string;
  description: string;
  number: number;
  completed: number;
  total: number;
  current: boolean;
  children: ReactNode;
}) => {
  const [expanded, setExpanded] = useState(current);
  return (
    <section className="overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-sm">
      <h2>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`unit-content-${number}`}
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-4 p-5 text-left hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-300"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 font-black text-sky-800">
            {number}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-sky-700">
              {completed === total
                ? "Complete"
                : current
                  ? "Current unit"
                  : "Upcoming unit"}{" "}
              · {completed}/{total} lessons
            </span>
            <span className="mt-1 block text-lg font-extrabold text-sky-950">
              {title}
            </span>
            <span className="mt-1 block text-sm font-normal text-slate-600">
              {description}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 text-sky-700 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </h2>
      <div
        id={`unit-content-${number}`}
        hidden={!expanded}
        className="border-t border-sky-100"
      >
        {children}
      </div>
    </section>
  );
};
