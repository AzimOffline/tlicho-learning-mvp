"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { restoreHearts } from "@/actions/practice";
import { Button } from "@/components/ui/button";

export const HeartRecoveryButton = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="primary"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          restoreHearts()
            .then(() => router.push("/learn"))
            .catch(() => toast.error("Could not restore hearts."));
        })
      }
    >
      {pending ? "Restoring…" : "Restore hearts"}
    </Button>
  );
};
