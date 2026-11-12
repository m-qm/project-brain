import { isAppLocale } from "@/i18n/routing";
import { renderOnboardingPdf } from "@/lib/onboarding-pdf";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale } = await context.params;
  if (!isAppLocale(locale)) {
    return new Response("Not found", { status: 404 });
  }

  const { bytes, filename } = await renderOnboardingPdf(locale);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
