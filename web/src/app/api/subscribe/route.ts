import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

const PRICE_ID = process.env.STRIPE_PRICE_PREMIUM ?? "";

/**
 * POST /api/subscribe
 *
 * Public endpoint — no auth required.
 * Creates a Stripe Checkout session for $99/year subscription.
 * Stores phone + tickers in session metadata for post-payment provisioning.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, tickers } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    if (!Array.isArray(tickers) || tickers.length === 0 || tickers.length > 5) {
      return NextResponse.json({ error: "Select 1-5 tickers" }, { status: 400 });
    }

    if (!PRICE_ID) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          phone: phone.trim(),
          tickers: tickers.join(","),
        },
      },
      metadata: {
        phone: phone.trim(),
        tickers: tickers.join(","),
      },
      success_url: `${baseUrl}/subscribe?status=success`,
      cancel_url: `${baseUrl}/subscribe?status=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Subscribe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
