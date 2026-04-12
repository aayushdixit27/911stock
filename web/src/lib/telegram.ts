// Telegram bot for 911Stock alerts
// Free, no verification needed. Setup: @BotFather → /newbot → get token
// User starts the bot → gets chat_id → receives alerts

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = "https://api.telegram.org/bot";

/**
 * Send a Telegram message to a chat.
 * chatId: numeric chat ID (e.g., "123456789")
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<{ success: boolean; messageId?: number }> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("[telegram] Missing TELEGRAM_BOT_TOKEN");
    return { success: false };
  }

  try {
    const res = await fetch(`${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error("[telegram] API error:", data);
      return { success: false };
    }

    console.log(`[telegram] Sent message ${data.result.message_id} to ${chatId}`);
    return { success: true, messageId: data.result.message_id };
  } catch (err) {
    console.error("[telegram] Send error:", err);
    return { success: false };
  }
}

/**
 * Get bot info (test if token is valid).
 */
export async function getBotInfo() {
  if (!TELEGRAM_BOT_TOKEN) return null;

  try {
    const res = await fetch(`${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/getMe`);
    const data = await res.json();
    return data.ok ? data.result : null;
  } catch {
    return null;
  }
}

/**
 * Check if Telegram is configured.
 */
export function isTelegramConfigured(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN);
}
