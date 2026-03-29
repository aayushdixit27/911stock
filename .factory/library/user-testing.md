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
