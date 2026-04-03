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

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
