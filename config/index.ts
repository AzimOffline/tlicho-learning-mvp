import type { Metadata } from "next";
import { getMetadataBase } from "@/lib/site-url";

export const siteConfig: Metadata = {
  metadataBase: getMetadataBase(process.env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Tłı̨chǫ Learning",
    template: "%s | Tłı̨chǫ Learning",
  },
  description:
    "Learn Tłı̨chǫ vocabulary through short lessons and personalized practice.",
  keywords: [
    "Tłı̨chǫ",
    "language learning",
    "spaced repetition",
  ] as Array<string>,
  openGraph: {
    type: "website",
    title: "Tłı̨chǫ Learning",
    description:
      "Learn Tłı̨chǫ vocabulary through short lessons and personalized practice.",
    images: [{ url: "/icon2.png", width: 192, height: 192 }],
  },
  twitter: {
    card: "summary",
    title: "Tłı̨chǫ Learning",
    description:
      "Learn Tłı̨chǫ vocabulary through short lessons and personalized practice.",
    images: ["/icon2.png"],
  },
} as const;
