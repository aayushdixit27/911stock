import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserTier } from "@/lib/db";
import {
  stripe,
  STRIPE_PRICE_PREMIUM,
  getOrCreateStripeCustomer,
  createCheckoutSession,
} from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session for premium subscription.
 * Only allows if user is on free tier.
 * Returns the checkout session URL.
 */
export async function POST() {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Check if user is already premium
    const tier = await getUserTier(userId);
    if (tier === "premium") {
      return NextResponse.json(
        { error: "Already subscribed", message: "You are already on the Premium plan" },
        { status: 400 }
      );
    }

    // Check if Stripe price ID is configured
    if (!STRIPE_PRICE_PREMIUM) {
      return NextResponse.json(
        { error: "Stripe not configured", message: "Premium pricing is not configured" },
        { status: 503 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      userId,
      session.user.email ?? "",
      session.user.name
    );

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      customerId,
      STRIPE_PRICE_PREMIUM,
      userId
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
