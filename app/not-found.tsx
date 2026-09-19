import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70svh] items-center justify-center px-5 py-16">
      <div className="max-w-lg rounded-3xl border-2 border-sky-100 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-600">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black text-sky-950">
          This trail doesn’t lead anywhere
        </h1>
        <p className="mt-3 font-medium text-slate-600">
          The page may have moved, or the address may be incorrect.
        </p>
        <Button className="mt-7" size="lg" variant="primary" asChild>
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
