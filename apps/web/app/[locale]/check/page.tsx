import { redirectHome } from "@/lib/redirect-home";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirectHome(locale);
}
