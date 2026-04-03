# RCS/SMS Message Templates

Templates for Twilio RCS (with SMS fallback). Variables in `{BRACES}`.

---

## 1. Welcome (on signup)

```
911stock: You're in. Watching {TICKERS}.
You'll get alerts within minutes of insider trades on these stocks. Reply STOP to cancel anytime.
```

**Variables:**
- `{TICKERS}` — comma-separated list, e.g. "AAPL, TSLA, NVDA"

---

## 2. Alert (core product)

```
{TICKER} — {HEADLINE}
{CONTEXT_SENTENCE}
Score: {SCORE}/10 | Filed: {TIME_AGO}
→ See filing: {SEC_LINK}
```

**Example:**
```
SMCI — CEO sold $2.1M in stock
First unscheduled sale in 14 months. Last 3 times this pattern hit, stock dropped 12% avg in 30 days. Outside his 10b5-1 plan.
Score: 8.5/10 | Filed: 3m ago
→ See filing: sec.gov/cgi-bin/...
```

**Variables:**
- `{TICKER}` — stock symbol
- `{HEADLINE}` — LLM-generated 1-line summary (Crimson Pro style: short, punchy)
- `{CONTEXT_SENTENCE}` — LLM-generated 1-2 sentences explaining why this matters
- `{SCORE}` — signal score 0-10 from scoring engine
- `{TIME_AGO}` — relative time since SEC filing
- `{SEC_LINK}` — direct link to Form 4 on EDGAR

---

## 3. Confirmation (ticker update)

```
911stock: Updated. Now watching {TICKERS}. Alerts are active.
```

---

## 4. Trial ending (3 days before expiry)

```
911stock: Your free trial ends in 3 days. Keep getting alerts → {STRIPE_LINK}
$99/year. Cancel anytime.
```

**Variables:**
- `{STRIPE_LINK}` — Stripe Checkout URL for $99/year plan
