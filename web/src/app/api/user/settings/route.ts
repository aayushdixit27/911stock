import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserSettings, getUserTier, upsertUserSettings, getSql } from "@/lib/db";

/**
 * GET /api/user/settings
 *
 * Returns the user's settings, tier information, and Stripe subscription details.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const sql = getSql();
    const [settings, tier] = await Promise.all([
      getUserSettings(userId),
      getUserTier(userId),
    ]);

    // Get Stripe subscription details
    let stripeSubscriptionStatus: string | null = null;
    let stripeCurrentPeriodEnd: string | null = null;

    if (sql) {
      const userResult = await sql<{
        stripe_subscription_status: string | null;
        stripe_current_period_end: Date | null;
      }[]>`
        SELECT stripe_subscription_status, stripe_current_period_end 
        FROM users 
        WHERE id = ${userId}
      `;
      if (userResult[0]) {
        stripeSubscriptionStatus = userResult[0].stripe_subscription_status;
        stripeCurrentPeriodEnd = userResult[0].stripe_current_period_end?.toISOString() ?? null;
      }
    }

    return NextResponse.json({
      tier,
      isPremium: tier === "premium",
      stripeSubscriptionStatus,
      stripeCurrentPeriodEnd,
      riskTolerance: settings?.risk_tolerance ?? "moderate",
      notifyInApp: settings?.notify_in_app ?? true,
      notifyEmail: settings?.notify_email ?? false,
      notifyPhone: settings?.notify_phone ?? false,
    });
  } catch (err) {
    console.error("User settings error:", err);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/settings
 *
 * Updates user settings.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await req.json();
    const settings = await upsertUserSettings(userId, {
      risk_tolerance: body.riskTolerance,
      notify_in_app: body.notifyInApp,
      notify_email: body.notifyEmail,
      notify_phone: body.notifyPhone,
    });

    return NextResponse.json({
      success: true,
      settings: {
        riskTolerance: settings.risk_tolerance,
        notifyInApp: settings.notify_in_app,
        notifyEmail: settings.notify_email,
        notifyPhone: settings.notify_phone,
      },
    });
  } catch (err) {
    console.error("User settings update error:", err);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
