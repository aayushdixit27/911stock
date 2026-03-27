# Deep Agents Hackathon - RSAC 2026

## Ghost (Postgres)
Managed Postgres: https://ghost.build — CLI `~/.local/bin/ghost`. Set `DATABASE_URL` from `ghost connect <id>` (see `web/.env.example`).

**Cursor MCP (server `user-ghost` / display name `ghost`):** Prefer MCP over raw CLI when automating. Tools: `ghost_list`, `ghost_connect`, `ghost_sql`, `ghost_schema`, `ghost_create`, `ghost_fork`, `ghost_pause`, `ghost_resume`, `ghost_delete`, `ghost_password`, `ghost_logs`, `ghost_rename`, `search_docs`, `view_skill`. Pass the 10-char database id from `ghost_list` as `id` on `ghost_sql` / `ghost_schema` / `ghost_connect`. Optional env `GHOST_DATABASE_ID` in `web/.env.local` keeps the id next to `DATABASE_URL` for humans and agents.

Schema for this app matches `migrate()` in `web/src/lib/db.ts` (`signals`, `alerts`). Apply via `GET /api/migrate` with `DATABASE_URL` set, or run the same DDL with `ghost_sql`.

## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse,
/qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro,
/investigate, /document-release, /codex, /cso, /autoplan, /careful, /freeze, /guard,
/unfreeze, /gstack-upgrade.
