import { redirect } from "@/i18n/navigation";

/** Old marketing routes fold into the one-page proposal. */
export function redirectHome(locale: string) {
  redirect({ href: "/", locale });
}
