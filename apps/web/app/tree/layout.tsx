import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "/tree",
  "Brain map · Agent KBase",
  "Preview the radial map of an Agent KBase wizard draft.",
);

export default function TreeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
