"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef } from "react";

type Props = {
  slug: string;
  section?: string;
};

/** Fires once per mount when a learn doc is viewed. */
export function LearnDocAnalytics({ slug, section }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track("learn_doc", section ? { slug, section } : { slug });
  }, [slug, section]);

  return null;
}
