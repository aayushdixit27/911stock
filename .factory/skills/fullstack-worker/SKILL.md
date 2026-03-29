---
name: fullstack-worker
description: Full-stack Next.js worker for 911Stock SaaS features — handles DB schema, API routes, pages, and components
---

# Fullstack Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

All implementation features in the 911Stock mission: database migrations, API route handlers, page components, UI components, auth integration, billing integration, trading integration, and data pipeline work.

## Required Skills

- **agent-browser**: MUST invoke via Skill tool for all UI verification. After implementing any page or component change, use agent-browser to navigate to the page, interact with elements, and take screenshots to verify the feature works visually. Use 30s timeouts for click interactions.

## Work Procedure

### 1. Understand the Feature
- Read the feature description, preconditions, expectedBehavior, and verificationSteps from features.json
- Read relevant existing source files to understand current state
- Read `.factory/library/architecture.md` for system context
- Read relevant research files in `.factory/research/` if the feature involves Auth.js, Stripe, or Alpaca

### 2. Plan the Implementation
- Identify all files that need to be created or modified
- Determine the order of changes (DB schema first, then API routes, then UI)
- Identify what tests/checks you'll write

### 3. Database Changes (if needed)
- Add migrations to `web/src/lib/db.ts` in the `migrate()` function
- Use `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for idempotency
- EVERY table that stores user data MUST have a `user_id TEXT NOT NULL` column
- Add appropriate indexes for user_id columns

### 4. Implement Backend (API routes)
- Write API route handlers in `web/src/app/api/{route}/route.ts`
- ALWAYS check auth session at the top of every protected route:
  ```typescript
  import { auth } from "@/lib/auth";
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ```
- Scope ALL database queries by `session.user.id`
- Return proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Handle errors gracefully — never expose raw error messages

### 5. Implement Frontend (pages/components)
- Follow existing CSS design system (CSS variables: --ink, --orange, --terra, --white, --paper)
- Use Tailwind utilities alongside custom CSS where appropriate
- Match the existing code style in page-client.tsx and other pages
- Use client components ("use client") for interactive UI
- Server components for data fetching where possible

### 6. Verify with TypeScript and Lint
- Run `cd /Users/bunyasit/dev/911stock/web && npx tsc --noEmit` — fix ALL errors
- Run `cd /Users/bunyasit/dev/911stock/web && npx eslint src/` — fix errors (warnings OK)

### 7. Verify with agent-browser (REQUIRED for UI features)
- Start dev server if not running: `cd /Users/bunyasit/dev/911stock/web && PORT=3000 npx next dev --turbopack &`
- Wait for server to be ready
- Invoke the `agent-browser` skill
- Navigate to the affected pages
- Interact with the feature (click buttons, fill forms, etc.)
- Take screenshots as evidence
- Verify expected behavior matches what you see
- Record each check in `verification.interactiveChecks`

### 8. Verify API endpoints with curl (REQUIRED for API features)
- Test happy path with valid auth
- Test 401 without auth
- Test error cases (invalid input, missing data)
- Record in `verification.commandsRun`

## Example Handoff

```json
{
  "salientSummary": "Implemented Auth.js v5 with email/password + Google OAuth. Created users/accounts/sessions tables in migrate(). Added /api/auth/[...nextauth] route, /api/auth/register endpoint, and login/register pages. Verified login flow with agent-browser (screenshot: login form → submit → authenticated home). TypeScript clean, lint clean.",
  "whatWasImplemented": "Auth.js v5 integration: database schema (users, accounts, sessions tables with postgres adapter), NextAuth route handler, credentials provider with bcrypt password hashing, Google OAuth provider, registration API endpoint, login page with email/password form and Google button, middleware.ts for route protection, auth utility functions (auth(), signIn(), signOut()). All existing API routes wrapped with auth check returning 401 for unauthenticated requests.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "cd web && npx tsc --noEmit", "exitCode": 0, "observation": "No TypeScript errors" },
      { "command": "cd web && npx eslint src/", "exitCode": 0, "observation": "No lint errors" },
      { "command": "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/feed", "exitCode": 0, "observation": "401 — unauthenticated correctly rejected" },
      { "command": "curl -s -X POST http://localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"TestPass123\"}'", "exitCode": 0, "observation": "201 — user created successfully" }
    ],
    "interactiveChecks": [
      { "action": "Navigate to /auth/login, fill email and password, click Submit", "observed": "Form submits, redirected to authenticated home page. User email shown in header." },
      { "action": "Click logout button in header", "observed": "Redirected to landing page. Navigating to /dashboard redirects to login." },
      { "action": "Navigate to /auth/register, register new account", "observed": "Registration form works, redirected to onboarding after successful registration." }
    ]
  },
  "tests": {
    "added": []
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- Database migration fails and you can't determine why (Ghost DB connectivity issue)
- A feature requires an env var that isn't set (e.g., STRIPE_SECRET_KEY for billing features)
- Feature depends on another feature's API/schema that doesn't exist yet
- Auth.js, Stripe, or Alpaca integration behaves differently than documented in research files
- TypeScript errors in files you didn't modify that block compilation
