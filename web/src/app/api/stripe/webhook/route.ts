import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { getSql } from "@/lib/db";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events.
 * This route does NOT require auth - Stripe sends it directly.
 * Verifies webhook signature and processes subscription events.
 */
export async function POST(req: Request) {
  // Get the raw body for signature verification
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  // Verify signature presence
  if (!signature) {
    console.error("Stripe webhook: Missing signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verify webhook secret is configured
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook: STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook: Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const sql = getSql();
  if (!sql) {
    console.error("Stripe webhook: Database not configured");
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only process subscription checkouts
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await updateUserSubscription(sql, subscription);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateUserSubscription(sql, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await downgradeUserToFree(sql, subscription.customer as string);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await updateSubscriptionStatus(sql, invoice.customer as string, "past_due");
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription
          );
          await updateUserSubscription(sql, subscription);
        }
        break;
      }

      default:
        console.log(`Stripe webhook: Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error("Stripe webhook: Handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Update user subscription details from Stripe subscription
 */
async function updateUserSubscription(
  sql: ReturnType<typeof getSql>,
  subscription: Stripe.Subscription
): Promise<void> {
  if (!sql) throw new Error("Database not configured");

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;
  // current_period_end is a number (Unix timestamp) in the Stripe API
  const currentPeriodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000);

  await sql`
    UPDATE users
    SET 
      stripe_subscription_id = ${subscription.id},
      stripe_price_id = ${priceId ?? null},
      stripe_subscription_status = ${status},
      stripe_current_period_end = ${currentPeriodEnd},
      tier = CASE 
        WHEN ${status} IN ('active', 'trialing') THEN 'premium'
        ELSE 'free'
      END
    WHERE stripe_customer_id = ${customerId}
  `;
}

/**
 * Downgrade user to free tier when subscription is deleted
 */
async function downgradeUserToFree(
  sql: ReturnType<typeof getSql>,
  customerId: string
): Promise<void> {
  if (!sql) throw new Error("Database not configured");

  await sql`
    UPDATE users
    SET 
      stripe_subscription_id = NULL,
      stripe_price_id = NULL,
      stripe_subscription_status = 'canceled',
      stripe_current_period_end = NULL,
      tier = 'free'
    WHERE stripe_customer_id = ${customerId}
  `;
}

/**
 * Update subscription status (e.g., for payment failures)
 */
async function updateSubscriptionStatus(
  sql: ReturnType<typeof getSql>,
  customerId: string,
  status: string
): Promise<void> {
  if (!sql) throw new Error("Database not configured");

  await sql`
    UPDATE users
    SET stripe_subscription_status = ${status}
    WHERE stripe_customer_id = ${customerId}
  `;
}
