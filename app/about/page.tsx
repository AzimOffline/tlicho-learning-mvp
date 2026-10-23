import { AboutSupport } from "@/components/about-support";
import { isDemoMode } from "@/lib/demo-mode";

export const metadata = {
  title: "About & support",
  description:
    "Learn about Learn Tłı̨chǫ, share feedback, and explore educational and community partnerships.",
};

export default function AboutPage() {
  return (
    <AboutSupport
      backHref={isDemoMode() ? "/demo" : "/learn"}
      email={process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@peakhop.app"}
    />
  );
}
