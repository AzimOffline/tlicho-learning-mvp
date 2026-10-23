import { AboutSupport } from "../../../components/about-support";

export default function AboutPage() {
  return (
    <AboutSupport
      backHref="/"
      email={process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@peakhop.app"}
    />
  );
}
