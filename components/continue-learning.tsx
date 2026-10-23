import type { ReactNode } from "react";
import { ArrowRight, Clock3 } from "lucide-react";

export const ContinueLearning = ({
  title,
  detail,
  minutes,
  children,
}: {
  title: string;
  detail: string;
  minutes?: number;
  children: ReactNode;
}) => (
  <section
    aria-label="Continue learning"
    className="mb-6 flex flex-col gap-5 rounded-3xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
  >
    <div className="min-w-0">
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-sky-700">
        <ArrowRight aria-hidden="true" className="h-4 w-4" /> Your next step
      </p>
      <h2 className="mt-2 text-2xl font-extrabold text-sky-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
      {minutes && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Clock3 aria-hidden="true" className="h-4 w-4" /> About {minutes} min
        </p>
      )}
    </div>
    <div className="shrink-0 [&>a]:w-full [&>button]:w-full">{children}</div>
  </section>
);
