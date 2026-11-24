import QRCode from "qrcode";
import { getLocale, getTranslations } from "next-intl/server";
import { telegramBotUsername, telegramChatUrl } from "@/lib/telegram-onboarding";

export async function GetStarted() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const chatUrl = telegramChatUrl(locale);
  const label = `t.me/${telegramBotUsername()}`;
  const svg = await QRCode.toString(chatUrl, {
    type: "svg",
    margin: 1,
    width: 196,
    color: { dark: "#2c2420", light: "#ffffff" },
  });

  return (
    <div className="get-started">
      <h1 className="get-started-title">{t("startTitle")}</h1>
      <p className="get-started-lead">{t("startLead")}</p>
      <div className="get-started-tabs" role="tablist" aria-label={t("startLead")}>
        <span className="get-started-tab" role="tab" aria-selected="false">
          {t("channelMessage")}
        </span>
        <span className="get-started-tab" role="tab" aria-selected="false">
          {t("channelWhatsapp")}
        </span>
        <span className="get-started-tab is-selected" role="tab" aria-selected="true">
          {t("channelTelegram")}
        </span>
      </div>
      <div className="get-started-qr" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="get-started-hint">{t("startHint")}</p>
      <a className="get-started-link" href={chatUrl}>
        {label}
      </a>
    </div>
  );
}
