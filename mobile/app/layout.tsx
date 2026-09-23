import type { Metadata, Viewport } from "next";

import "../../app/globals.css";

export const metadata: Metadata = {
  title: "Tłı̨chǫ Learning",
  description: "A playful Tłı̨chǫ language-learning app.",
  icons: { icon: "/tlicho-mark.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7fbfe",
};

const MobileLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default MobileLayout;
