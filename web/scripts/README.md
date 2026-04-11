# 911Stock Scripts

## EDGAR Poller

Standalone Node.js script that polls SEC EDGAR every 60 seconds for new Form 4 insider trading filings.

### Local Development

```bash
cd web
npm run poller
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Ghost DB connection string |
| `TRUEFOUNDRY_API_KEY` | LLM gateway API key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | Fallback chat ID for alerts (optional) |

### Production (Railway)

1. Push to GitHub
2. Create new Railway service from repo
3. Set root directory to `web`
4. Set start command to `npx tsx scripts/poller.ts`
5. Configure environment variables
