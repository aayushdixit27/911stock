import Stripe from "stripe";

/**
 * Stripe server-side client
 * Used for creating checkout sessions, managing subscriptions, etc.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia", // Latest API version
  typescript: true,
});

/**
 * Price IDs for subscription plans
 * These should be set in environment variables
 */
export const STRIPE_PRICE_PREMIUM = process.env.STRIPE_PRICE_PREMIUM ?? "";

/**
 * Stripe webhook secret for verifying webhook signatures
 */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const sql = (await import("./db")).getSql();
  if (!sql) throw new Error("DATABASE_URL not set");

  // Check if user already has a Stripe customer ID
  const userResult = await sql<{ stripe_customer_id: string | null }[]>`
    SELECT stripe_customer_id FROM users WHERE id = ${userId}
  `;
  const user = userResult[0];

  if (user?.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });

  // Store the customer ID in the database
  await sql`
    UPDATE users SET stripe_customer_id = ${customer.id} WHERE id = ${userId}
  `;

  return customer.id;
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string
): Promise<Stripe.Checkout.Session> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/settings?checkout=success`,
    cancel_url: `${baseUrl}/settings?checkout=canceled`,
    subscription_data: {
      metadata: { userId },
    },
  });
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(
  customerId: string
): Promise<Stripe.BillingPortal.Session> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/settings`,
  });
}

/**
 * Retrieve a subscription from Stripe
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}
