export const metadata = { robots: { index: false, follow: true } };

import { vocabulary } from "@/lib/vocabulary";
import { DemoApp } from "./demo-app";

export default function DemoPage() {
  return <DemoApp vocabulary={vocabulary} />;
}
