import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";

/**
 * POST /api/user/onboarding
 *
 * Marks the user's onboarding as complete or incomplete.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { completed } = body;

    const sql = getSql();
    if (!sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    await sql`
      UPDATE users
      SET onboarding_completed = ${completed === true}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      onboardingCompleted: completed === true,
    });
  } catch (err) {
    console.error("Onboarding update error:", err);
    return NextResponse.json(
      { error: "Failed to update onboarding status" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/onboarding
 *
 * Returns the user's onboarding status.
 */
export async function GET() {
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

    const rows = await sql<{ onboarding_completed: boolean }[]>`
      SELECT onboarding_completed
      FROM users
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      onboardingCompleted: rows[0]?.onboarding_completed ?? false,
    });
  } catch (err) {
    console.error("Onboarding fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch onboarding status" },
      { status: 500 }
    );
  }
}
