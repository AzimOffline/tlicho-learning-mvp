import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";

import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config";
import { isDemoMode } from "@/lib/demo-mode";

import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0369A1",
};

export const metadata: Metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isDemoMode()) {
    return (
      <html lang="en">
        <body>
          <Toaster theme="light" richColors closeButton />
          {children}
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      appearance={{
        options: {
          logoImageUrl: "/favicon.ico",
        },
        variables: {
          colorPrimary: "#0369A1",
        },
      }}
      telemetry={false}
      afterSignOutUrl="/"
    >
      <html lang="en">
        <body>
          <Toaster theme="light" richColors closeButton />
          <ExitModal />
          <HeartsModal />
          <PracticeModal />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
