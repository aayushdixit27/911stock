# Stripe Subscription Billing — Next.js App Router Integration

> Official docs: https://docs.stripe.com/billing/subscriptions
> Stripe.js: https://docs.stripe.com/js
> Next.js examples: https://github.com/stripe-samples

## Installation

```bash
npm install stripe @stripe/stripe-js
```

No need for `@stripe/react-stripe-js` if using Stripe Checkout (redirect) or Embedded Checkout — recommended for subscriptions.

## Environment Variables

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product/Price IDs from Stripe Dashboard
STRIPE_PRICE_FREE=price_free_id        # Optional: if using a $0 plan
STRIPE_PRICE_PRO=price_pro_monthly_id
STRIPE_PRICE_PRO_YEARLY=price_pro_yearly_id
```

## Stripe Client Setup

### Server-side client

```typescript
// lib/stripe.ts
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-18.acacia", // Use latest API version
  typescript: true,
})
```

### Client-side (only if needed for Elements)

```typescript
// lib/stripe-client.ts
import { loadStripe } from "@stripe/stripe-js"

export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}
```

## Database Schema

Add subscription tracking columns to your users table:

```sql
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN stripe_price_id TEXT;
ALTER TABLE users ADD COLUMN stripe_status TEXT DEFAULT 'inactive';
  -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive'
ALTER TABLE users ADD COLUMN stripe_current_period_end TIMESTAMPTZ;
```

## Stripe Product Setup (Dashboard or API)

Create products in Stripe Dashboard:
1. **Free tier** — no Stripe product needed, just gate features in code
2. **Pro tier** — Create a Product with a recurring Price (e.g., $29/month)

Or via API:

```typescript
// One-time setup script
const product = await stripe.products.create({
  name: "Pro Plan",
  description: "Full access to all features",
})

const monthlyPrice = await stripe.prices.create({
  product: product.id,
  unit_amount: 2900, // $29.00
  currency: "usd",
  recurring: { interval: "month" },
})

const yearlyPrice = await stripe.prices.create({
  product: product.id,
  unit_amount: 29000, // $290.00 (saves ~$58/yr)
  currency: "usd",
  recurring: { interval: "year" },
})
```

## Checkout Session — Creating Subscriptions

### API Route: Create Checkout Session

```typescript
// app/api/stripe/checkout/route.ts
import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { priceId } = await req.json()

  // Get or create Stripe customer
  const userResult = await pool.query(
    'SELECT stripe_customer_id, email FROM users WHERE id = $1',
    [session.user.id]
  )
  const user = userResult.rows[0]

  let customerId = user.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id
    await pool.query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [customerId, session.user.id]
    )
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.AUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.AUTH_URL}/pricing`,
    subscription_data: {
      metadata: { userId: session.user.id },
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
```

### Client: Redirect to Checkout

```typescript
// components/UpgradeButton.tsx
"use client"

export function UpgradeButton({ priceId }: { priceId: string }) {
  const handleCheckout = async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return <button onClick={handleCheckout}>Upgrade to Pro</button>
}
```

## Webhook Handler (CRITICAL)

This is the **single source of truth** for subscription state. Never trust client-side checkout success.

```typescript
// app/api/stripe/webhook/route.ts
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { Pool } from "pg"
import Stripe from "stripe"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// CRITICAL: Disable body parsing — Stripe needs raw body for signature verification
export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === "subscription") {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          await updateSubscription(subscription)
        }
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await updateSubscription(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        await pool.query(
          `UPDATE users SET
            stripe_subscription_id = NULL,
            stripe_price_id = NULL,
            stripe_status = 'canceled',
            stripe_current_period_end = NULL
          WHERE stripe_customer_id = $1`,
          [customerId]
        )
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        await pool.query(
          `UPDATE users SET stripe_status = 'past_due' WHERE stripe_customer_id = $1`,
          [customerId]
        )
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.billing_reason === "subscription_cycle") {
          // Renewal payment succeeded
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          await updateSubscription(subscription)
        }
        break
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function updateSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  await pool.query(
    `UPDATE users SET
      stripe_subscription_id = $1,
      stripe_price_id = $2,
      stripe_status = $3,
      stripe_current_period_end = to_timestamp($4)
    WHERE stripe_customer_id = $5`,
    [
      subscription.id,
      subscription.items.data[0].price.id,
      subscription.status,
      subscription.current_period_end,
      customerId,
    ]
  )
}
```

## Customer Portal (Manage Subscription)

```typescript
// app/api/stripe/portal/route.ts
import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await pool.query(
    'SELECT stripe_customer_id FROM users WHERE id = $1',
    [session.user.id]
  )
  const customerId = result.rows[0]?.stripe_customer_id

  if (!customerId) {
    return NextResponse.json({ error: "No subscription" }, { status: 400 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.AUTH_URL}/dashboard`,
  })

  return NextResponse.json({ url: portalSession.url })
}
```

Enable Customer Portal in Stripe Dashboard → Settings → Customer Portal. Configure allowed actions (cancel, switch plans, update payment method).

## Feature Gating — Tier Checking

### Server-side helper

```typescript
// lib/subscription.ts
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export type SubscriptionTier = "free" | "pro"

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const result = await pool.query(
    `SELECT stripe_status, stripe_price_id, stripe_current_period_end
     FROM users WHERE id = $1`,
    [userId]
  )
  const user = result.rows[0]
  if (!user) return "free"

  const isActive = user.stripe_status === "active" || user.stripe_status === "trialing"
  const notExpired = user.stripe_current_period_end
    ? new Date(user.stripe_current_period_end) > new Date()
    : false

  if (isActive && notExpired) return "pro"
  return "free"
}

export function canAccessFeature(tier: SubscriptionTier, feature: string): boolean {
  const features: Record<string, SubscriptionTier[]> = {
    "basic-alerts": ["free", "pro"],
    "advanced-signals": ["pro"],
    "auto-trading": ["pro"],
    "unlimited-watchlists": ["pro"],
  }
  return features[feature]?.includes(tier) ?? false
}
```

### Usage in Server Components / API Routes

```typescript
// app/dashboard/signals/page.tsx
import { auth } from "@/auth"
import { getUserTier, canAccessFeature } from "@/lib/subscription"
import { redirect } from "next/navigation"

export default async function SignalsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const tier = await getUserTier(session.user.id)
  if (!canAccessFeature(tier, "advanced-signals")) {
    redirect("/pricing?reason=upgrade-required")
  }

  return <div>Advanced Signals Dashboard</div>
}
```

## Local Development: Testing Webhooks

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# The CLI prints a webhook signing secret (whsec_...) — use it as STRIPE_WEBHOOK_SECRET
```

## Essential Webhook Events to Handle

| Event | When | Action |
|-------|------|--------|
| `checkout.session.completed` | User completes checkout | Link subscription to user |
| `customer.subscription.created` | Subscription created | Store subscription details |
| `customer.subscription.updated` | Plan change, renewal | Update plan/status |
| `customer.subscription.deleted` | Subscription canceled/expired | Revoke access |
| `invoice.payment_succeeded` | Renewal payment works | Update period end |
| `invoice.payment_failed` | Payment fails | Mark past_due, notify user |

## Common Pitfalls

1. **Raw body required for webhook verification**: Do NOT use `req.json()` before `stripe.webhooks.constructEvent()`. Use `req.text()` to get the raw body string.

2. **Never trust checkout success URL alone**: Always verify subscription state via webhooks. The `success_url` redirect is just UX — webhooks are the source of truth.

3. **Handle idempotency**: Stripe may send the same webhook event multiple times. Use `event.id` to deduplicate if needed, or make your handlers idempotent.

4. **Webhook ordering**: Events may arrive out of order. Always fetch the latest subscription state from Stripe when in doubt.

5. **`customer.subscription.deleted` fires on cancellation at period end**: The subscription object still has `current_period_end` — the user should retain access until then.

6. **Test mode vs Live mode**: Stripe test keys (`sk_test_`) only work with test data. Always use test mode during development.

7. **Configure Customer Portal**: You must enable and configure the Customer Portal in Stripe Dashboard before it works.

8. **Price IDs are environment-specific**: Test and live mode have different Price IDs.

## Key Links

- Stripe Billing docs: https://docs.stripe.com/billing
- Checkout Sessions: https://docs.stripe.com/api/checkout/sessions
- Webhooks: https://docs.stripe.com/webhooks
- Customer Portal: https://docs.stripe.com/customer-management/portal-deep-links
- Stripe CLI: https://docs.stripe.com/stripe-cli
- Testing: https://docs.stripe.com/testing
- Subscription lifecycle: https://docs.stripe.com/billing/subscriptions/overview
