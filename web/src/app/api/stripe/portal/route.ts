import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { createPortalSession } from "@/lib/stripe";

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session for subscription management.
 * Only available for users with an active Stripe customer ID.
 * Returns the portal session URL.
 */
export async function POST() {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const sql = getSql();
    if (!sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Get user's Stripe customer ID
    const result = await sql<{ stripe_customer_id: string | null }[]>`
      SELECT stripe_customer_id FROM users WHERE id = ${userId}
    `;
    const customerId = result[0]?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json(
        { error: "No subscription found", message: "You do not have an active subscription" },
        { status: 400 }
      );
    }

    // Create portal session
    const portalSession = await createPortalSession(customerId);

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
