// Onboarding API for RCS bot
// POST /api/onboarding/verify — send verification code
// POST /api/onboarding/confirm — verify code and create user

import { NextRequest, NextResponse } from "next/server";
import { getSql, migrate } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── POST /api/onboarding/verify ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  await migrate();

  const body = await request.json().catch(() => ({}));
  const phone = body.phone as string | undefined;

  if (!phone) {
    return NextResponse.json(
      { error: "Phone number required" },
      { status: 400 }
    );
  }

  // Generate verification code
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store code in DB
  await sql`
    INSERT INTO verification_codes (phone_number, code, expires_at)
    VALUES (${phone}, ${code}, ${expiresAt})
  `;

  // Send SMS with code
  const message = `Your 911Stock verification code is: ${code}. Valid for 10 minutes.`;
  const result = await sendWhatsAppMessage(phone, message);

  if (!result) {
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Verification code sent",
    // In production, don't return the code. For dev/testing only.
    ...(process.env.NODE_ENV === "development" ? { code } : {}),
  });
}