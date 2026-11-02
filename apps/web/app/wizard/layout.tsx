import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "/wizard",
  "Wizard · Agent KBase",
  "Build and export a validated Agent KBase brain in the browser.",
);

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
