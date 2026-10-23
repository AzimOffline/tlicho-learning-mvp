import type { Metadata } from "next";
import { getMetadataBase } from "@/lib/site-url";

export const siteUrl = getMetadataBase(
  process.env.NEXT_PUBLIC_APP_URL,
  true
).origin;
export const siteName = "Learn Tłı̨chǫ";
export const publicPages = ["/", "/words", "/about"] as const;

export function pageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const url = new URL(path, siteUrl).href;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName,
      locale: "en_CA",
      images: [{ url: "/icon2.png", width: 192, height: 192 }],
    },
    twitter: { card: "summary", title, description, images: ["/icon2.png"] },
  };
}
