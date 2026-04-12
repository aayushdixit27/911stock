// Twilio webhook — handles incoming SMS replies (STOP, DETAILS, etc.)

import { NextRequest, NextResponse } from "next/server";
import { getSql, migrate } from "@/lib/db";
import { sendWhatsApp } from "@/lib/twilio";

// ── POST /api/twilio-webhook ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  await migrate();

  const formData = await request.formData();
  const from = formData.get("From") as string | null;
  const body = (formData.get("Body") as string | null)?.trim().toUpperCase();

  if (!from || !body) {
    return new NextResponse("", { status: 200 }); // Twilio expects 200
  }

  // ── STOP — unsubscribe immediately ──────────────────────────────────────

  if (body === "STOP") {
    await sql`
      DELETE FROM rcs_users WHERE phone_number = ${from}
    `;

    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <Response><Message>You have been unsubscribed from 911Stock alerts. Reply START to resubscribe.</Message></Response>
    `, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ── START — resubscribe ─────────────────────────────────────────────────

  if (body === "START") {
    await sql`
      INSERT INTO rcs_users (phone_number, tickers, sensitivity)
      VALUES (${from}, '{"SMCI","TSLA","NVDA"}', 'moderate')
      ON CONFLICT (phone_number) DO UPDATE SET
        tickers = '{"SMCI","TSLA","NVDA"}',
        sensitivity = 'moderate',
        updated_at = now()
    `;

    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <Response><Message>Welcome back to 911Stock! You'll receive alerts for SMCI, TSLA, NVDA at Moderate sensitivity. Reply SETTINGS to change.</Message></Response>
    `, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ── DETAILS — show score breakdown ──────────────────────────────────────

  if (body === "DETAILS") {
    // Get the most recent signal for this user
    const signals = await sql<Array<{
      ticker: string;
      insider: string;
      role: string;
      action: string;
      shares: number;
      price_per_share: number;
      total_value: number;
      score: number;
      explanation: string | null;
      scheduled_10b5_1: boolean;
    }>>`
      SELECT ticker, insider, role, action, shares, price_per_share, total_value,
             score, explanation, scheduled_10b5_1
      FROM signals
      WHERE user_id = ${from}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (signals.length === 0) {
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
        <Response><Message>No recent signals found. You'll get alerts when insider moves happen.</Message></Response>
      `, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    const s = signals[0];
    const actionVerb = s.action === "sell" ? "sold" : "bought";
    const valueFormatted = s.total_value >= 1_000_000
      ? `$${(s.total_value / 1_000_000).toFixed(1)}M`
      : `$${(s.total_value / 1_000).toFixed(0)}K`;

    const details = `${s.ticker} ${s.insider} ${actionVerb} ${valueFormatted}

Score: ${s.score}/10
- ${s.role} role (+${["CEO", "CFO", "CTO", "COO"].includes(s.role) ? 2 : 0})
- ${s.scheduled_10b5_1 ? "Scheduled 10b5-1 plan (0)" : "Unscheduled sale (+3)"}
- ${s.total_value >= 2_000_000 ? "Large value (+1)" : "Value < $2M (0)"}

${s.explanation || "No additional context available."}

Reply: HOLD | SELL 50%`;

    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <Response><Message>${details}</Message></Response>
    `, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ── SETTINGS — show current settings ────────────────────────────────────

  if (body === "SETTINGS") {
    const users = await sql<Array<{
      tickers: string[];
      sensitivity: string;
    }>>`SELECT tickers, sensitivity FROM rcs_users WHERE phone_number = ${from}`;

    if (users.length === 0) {
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
        <Response><Message>You're not subscribed to 911Stock. Reply START to subscribe.</Message></Response>
      `, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    const u = users[0];
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <Response><Message>Your 911Stock settings:
Tickers: ${u.tickers.join(", ")}
Sensitivity: ${u.sensitivity}

To change sensitivity, reply: PARANOID, MODERATE, or HANDS-OFF</Message></Response>
    `, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ── Sensitivity changes ─────────────────────────────────────────────────

  if (body === "PARANOID" || body === "MODERATE" || body === "HANDS-OFF" || body === "HANDS_OFF") {
    const newSensitivity = body === "HANDS-OFF" || body === "HANDS_OFF" ? "hands_off" : body.toLowerCase();

    await sql`
      UPDATE rcs_users SET sensitivity = ${newSensitivity}, updated_at = now()
      WHERE phone_number = ${from}
    `;

    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <Response><Message>Sensitivity updated to ${newSensitivity}. You'll receive alerts matching this level going forward.</Message></Response>
    `, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // ── Unknown reply ───────────────────────────────────────────────────────

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
    <Response><Message>Unknown command. Reply: STOP, DETAILS, SETTINGS, PARANOID, MODERATE, or HANDS-OFF</Message></Response>
  `, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}