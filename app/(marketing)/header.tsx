"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo-mode";

export const Header = () => {
  const demoMode = isDemoMode();

  return (
    <header className="sticky top-0 z-40 h-[5.5rem] w-full border-b border-sky-100 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex h-full max-w-[1340px] items-center justify-between">
        <Link href="/" prefetch className="flex items-center gap-x-3">
          <Image src="/tlicho-mark.svg" alt="" height={48} width={48} />

          <h1 className="text-xl font-black tracking-tight text-sky-950 sm:text-2xl lg:text-[1.7rem]">
            Tłı̨chǫ Learning
          </h1>
        </Link>

        <div className="flex gap-x-3">
          {demoMode ? (
            <Button
              size="lg"
              variant="primary"
              className="h-14 rounded-2xl px-6 text-base"
              asChild
            >
              <Link href="/demo">Open demo</Link>
            </Button>
          ) : (
            <>
              <ClerkLoading>
                <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
              </ClerkLoading>
              <ClerkLoaded>
                <Show when="signed-in">
                  <UserButton />
                </Show>

                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <Button size="lg" variant="ghost" className="rounded-2xl">
                      Login
                    </Button>
                  </SignInButton>
                </Show>
              </ClerkLoaded>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
