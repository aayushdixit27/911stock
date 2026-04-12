// Test Twilio configuration and send a test SMS
// GET /api/twilio-test — check config status
// POST /api/twilio-test — send test SMS to MY_PHONE_NUMBER

import { NextRequest, NextResponse } from "next/server";
import { isTwilioConfigured, getTwilioStatus, sendSMS } from "@/lib/twilio";

export async function GET() {
  const status = getTwilioStatus();
  return NextResponse.json({
    ...status,
    message: status.configured
      ? "Twilio is configured and ready to send"
      : "Twilio not configured — add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER to .env.local",
  });
}

export async function POST(request: NextRequest) {
  const status = getTwilioStatus();
  if (!status.configured) {
    return NextResponse.json(
      { error: "Twilio not configured", status },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const to = body.to || process.env.MY_PHONE_NUMBER;

  if (!to) {
    return NextResponse.json(
      { error: "No recipient phone number. Set MY_PHONE_NUMBER in .env.local or pass 'to' in body." },
      { status: 400 }
    );
  }

  const testMessage = "🧪 911Stock test — Twilio SMS is working! Reply STOP to opt out.";

  const result = await sendSMS(to, testMessage);

  if (!result) {
    return NextResponse.json(
      { error: "Failed to send SMS. Check Twilio credentials and logs." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    sid: result.sid,
    status: result.status,
    to,
    message: testMessage,
  });
}