// Manual test endpoint — sends a fake alert via Telegram

import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { getSql, migrate } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const chatId = body.chatId as string | undefined;

  if (!chatId) {
    return NextResponse.json({
      error: "chatId required. Send your Telegram chat ID.",
      hint: "Message your bot, then check the webhook logs for your chat_id, or use /start first.",
    }, { status: 400 });
  }

  // Fake alert for testing
  const message = `🚨 <b>URGENT SMCI Alert</b>

Charles Liang (CEO) sold $2.1M in stock.

First sale in 14 months, outside scheduled plan. Last 3 similar sales: 12% avg drop over 30 days.

Score: 7/10

Reply /details for more, /stop to unsubscribe.`;

  const result = await sendTelegramMessage(chatId, message);

  return NextResponse.json({
    success: result.success,
    message,
    chatId,
    messageId: result.messageId,
  });
}