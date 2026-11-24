# Telegram client brains

One webhook, one `TELEGRAM_BOT_TOKEN`. A client is a folder in this directory. No new bot token.

The folder name is the deep-link id. It uses the same four files as the company loader:

- `facts/project.md`
- `facts/offer-limits.md`
- `open-questions.md`
- `stories/positioning.md`

Share `https://t.me/agentkbase_bot?start=<id>`.

No id keeps the public lead chat on the Agent KBase company brain. A normal message never switches brains. An unknown id does not open a different client.

`[CONFIRM]` lines are not facts. The model may only say what that folder supports. Text is capped at 14,000 characters, same as the company brain.

Local check, from the repo root, with `pnpm dev` already running. No deploy.

```bash
curl -sS -X POST http://localhost:3000/api/telegram/webhook \
  -H 'content-type: application/json' \
  -d '{"message":{"text":"Hey Agent KBase!","from":{"id":900001,"language_code":"en"},"chat":{"id":900001}}}'

curl -sS -X POST http://localhost:3000/api/telegram/webhook \
  -H 'content-type: application/json' \
  -d '{"message":{"text":"/start dualperspective","from":{"id":900002,"language_code":"en"},"chat":{"id":900002}}}'
```

The first reply is `brain` `company` and speaks as Agent KBase. The second is `brain` `dualperspective` and only uses that folder. If `TELEGRAM_WEBHOOK_SECRET` is set, send it as `x-telegram-bot-api-secret-token`. Do not deploy while Vercel is rate-limited.
