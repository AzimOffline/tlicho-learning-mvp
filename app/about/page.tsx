import { AboutSupport } from "@/components/about-support";
import { isDemoMode } from "@/lib/demo-mode";

import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "About & Support | Learn Tłı̨chǫ",
  "Learn about this independent Tlicho learning project, share feedback, and explore educational and community partnerships.",
  "/about"
);

export default function AboutPage() {
  return (
    <AboutSupport
      backHref={isDemoMode() ? "/demo" : "/learn"}
      email={process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@peakhop.app"}
    />
  );
}
