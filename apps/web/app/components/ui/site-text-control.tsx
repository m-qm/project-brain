"use client";

import { Input } from "@ui-sdk/react/input";
import { Textarea } from "@ui-sdk/react/textarea";
import type { ComponentProps } from "react";

export function SiteInput(props: ComponentProps<typeof Input>) {
  return <Input {...props} />;
}

export function SiteTextarea(props: ComponentProps<typeof Textarea>) {
  return <Textarea {...props} />;
}