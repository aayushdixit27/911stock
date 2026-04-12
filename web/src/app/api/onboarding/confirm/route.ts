// Confirm onboarding — verify code and create RCS user

import { NextRequest, NextResponse } from "next/server";
import { getSql, migrate } from "@/lib/db";

// ── POST /api/onboarding/confirm ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  await migrate();

  const body = await request.json().catch(() => ({}));
  const phone = body.phone as string | undefined;
  const code = body.code as string | undefined;
  const tickers = body.tickers as string[] | undefined;
  const sensitivity = body.sensitivity as string | undefined;

  if (!phone || !code) {
    return NextResponse.json(
      { error: "Phone number and verification code required" },
      { status: 400 }
    );
  }

  // Verify code
  const rows = await sql<Array<{ code: string; expires_at: Date }>>`
    SELECT code, expires_at FROM verification_codes
    WHERE phone_number = ${phone}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No verification code found. Request one first." },
      { status: 400 }
    );
  }

  const stored = rows[0];
  if (new Date() > stored.expires_at) {
    return NextResponse.json(
      { error: "Verification code expired. Request a new one." },
      { status: 400 }
    );
  }

  if (stored.code !== code) {
    return NextResponse.json(
      { error: "Invalid verification code" },
      { status: 400 }
    );
  }

  // Create RCS user
  const userTickers = tickers && tickers.length > 0 ? tickers : ["SMCI", "TSLA", "NVDA"];
  const userSensitivity = sensitivity || "moderate";

  await sql`
    INSERT INTO rcs_users (phone_number, tickers, sensitivity)
    VALUES (${phone}, ${userTickers}, ${userSensitivity})
    ON CONFLICT (phone_number) DO UPDATE SET
      tickers = ${userTickers},
      sensitivity = ${userSensitivity},
      updated_at = now()
  `;

  // Clean up verification codes
  await sql`
    DELETE FROM verification_codes WHERE phone_number = ${phone}
  `;

  return NextResponse.json({
    success: true,
    user_id: `phone:${phone}`,
    tickers: userTickers,
    sensitivity: userSensitivity,
  });
}