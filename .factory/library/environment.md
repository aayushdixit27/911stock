# Environment

Environment variables, external dependencies, and setup notes.

**What belongs here:** Required env vars, external API keys/services, dependency quirks, platform-specific notes.
**What does NOT belong here:** Service ports/commands (use `.factory/services.yaml`).

---

## Required Environment Variables

### Already Configured
- `DATABASE_URL` — Ghost DB (managed Postgres via ghost.build)
- `GHOST_DATABASE_ID` — Ghost database ID (toqk73p7da)
- `GEMINI_API_KEY` — Google AI Studio API key
- `BLAND_API_KEY` — Bland AI outbound calls
- `MY_PHONE_NUMBER` — Demo phone number for Bland calls
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` — Auth0 (legacy, keep for CIBA fallback)
- `OVERMIND_API_KEY` — Overmind/OverClaw integration
- `TRUEFOUNDRY_API_KEY` — TrueFoundry integration

### Needs Configuration (Mission)
- `NEXTAUTH_SECRET` — Auth.js session secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` — App URL (http://localhost:3000 for dev)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth (from Google Cloud Console)
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` — Stripe API keys (test mode)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `ALPACA_CLIENT_ID`, `ALPACA_CLIENT_SECRET` — Alpaca OAuth app credentials (from Alpaca dashboard)

## External Service Notes

- **Ghost DB**: Managed Postgres, no local DB needed. CLI at `~/.local/bin/ghost`.
- **Gemini**: Using `gemini-3-flash-preview` model via `@google/generative-ai` package.
- **Bland AI**: Outbound only. Webhook requires HTTPS (production URL). Costs per call.
- **EDGAR**: SEC filing API. Rate limited. Uses custom XML parser.
- **Alpaca**: Paper trading uses `https://paper-api.alpaca.markets`. OAuth uses `https://app.alpaca.markets/oauth/authorize`.
