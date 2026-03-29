# User Testing

## Validation Surface

### Primary Surface: Web Browser
- **Tool:** agent-browser (v0.17.1, installed at ~/.factory/bin/agent-browser)
- **Dev server:** Next.js 16 + Turbopack, starts in ~468ms on port 3000
- **Interactions:** Navigate, click, type, screenshot, verify DOM state
- **Note:** Use 30s timeouts for click interactions (Turbopack compilation can cause delays on first page load)

### Secondary Surface: API (curl)
- **Tool:** curl
- **Used for:** Auth API testing (401s), webhook testing, signal scoring comparison, staggered delivery timing

## Validation Concurrency

### agent-browser
- **Machine:** 32GB RAM, 10 CPU cores (macOS)
- **Dev server footprint:** ~1.3GB RAM per instance (Next.js + PostCSS worker)
- **Agent-browser footprint:** ~300MB per instance
- **Baseline OS usage:** ~4GB
- **Usable headroom (70%):** (32 - 4) * 0.7 = ~19.6GB
- **Max concurrent validators:** 4 (conservative, accounts for Turbopack CPU spikes during compilation)

## Testing Considerations

- **Stripe Checkout:** Cannot fully test Stripe Checkout redirect in agent-browser (external domain). Test the redirect URL generation and webhook handling separately via curl.
- **Google OAuth:** Cannot test full Google OAuth flow in agent-browser (requires Google login). Test the redirect URL and callback handling.
- **Alpaca OAuth:** Similar to Google — test redirect URL generation and callback token exchange via curl.
- **Bland AI phone calls:** Cannot test actual phone calls in automation. Verify the API call is made with correct parameters via curl/mocking.
- **Email notifications:** Verify email sending logic is called with correct parameters. Actual delivery depends on email service configuration.

## Flow Validator Guidance: Web Browser (Foundation Milestone)

### Isolation Rules
- **User Accounts:** Each validator should use a unique test user account to ensure data isolation
- **Test Users:** 
  - `testuser1@example.com` / `TestPass123!` - User A (with data)
  - `testuser2@example.com` / `TestPass123!` - User B (for multi-tenancy testing)
- **Session Management:** Each agent-browser instance should use its own session (use `--session` flag)
- **Shared State:** Do NOT delete or modify test user accounts created by other validators
- **Database:** All validators share the same Ghost DB - respect user_id scoping

### Boundaries
- Use the existing dev server on port 3000
- Do NOT start additional Next.js instances
- Do NOT modify the database schema
- Do NOT run migrations during validation (should already be applied)

### Test Data Setup
Before running validators, ensure these test users exist:
- User A: `testuser1@example.com` with some signals/watchlist data
- User B: `testuser2@example.com` with no data (for multi-tenancy testing)
