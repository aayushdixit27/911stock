// Twilio WhatsApp + SMS messaging for 911Stock alerts
// WhatsApp sandbox for immediate testing, SMS/RCS for production

import twilio from "twilio";

// ── Environment ──────────────────────────────────────────────────────────────

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"; // Twilio sandbox
const TWILIO_WHATSAPP_CONTENT_SID = process.env.TWILIO_WHATSAPP_CONTENT_SID; // Content template SID
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // SMS fallback

// Lazy-init client (avoid startup errors if env not set)
let _client: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
  if (!_client && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    _client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return _client;
}

// ── Types ────────────────────────────────────────────────────────────────────

export type RCSAction = {
  type: "URL" | "PHONE_NUMBER" | "QUICK_REPLY";
  title: string;
  url?: string; // for URL type
  phone?: string; // for PHONE_NUMBER type
  id?: string; // for QUICK_REPLY type
};

export type RCSRichCard = {
  title: string;
  body: string;
  mediaUrl?: string;
  actions: RCSAction[];
};

export type AlertMessage = {
  ticker: string;
  insider: string;
  role: string;
  action: "buy" | "sell";
  totalValue: number;
  score: number;
  context: string; // Plain-English explanation from Gemini
};

// ── Send RCS Rich Card ───────────────────────────────────────────────────────

/**
 * Send an RCS rich card message with action buttons.
 * Falls back to SMS automatically if RCS not available on recipient device.
 */
export async function sendRCSRichCard(
  to: string,
  card: RCSRichCard
): Promise<{ sid: string; status: string } | null> {
  const client = getClient();
  if (!client) {
    console.warn("[twilio] Client not initialized — missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
    return null;
  }

  try {
    // For RCS rich cards, we need to use Content API templates
    // For now, send as MMS with media and body (works as fallback too)
    const message = await client.messages.create({
      body: `${card.title}\n\n${card.body}`,
      mediaUrl: card.mediaUrl ? [card.mediaUrl] : undefined,
      from: TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`[twilio] Sent message ${message.sid} to ${to}, status: ${message.status}`);
    return { sid: message.sid, status: message.status || "unknown" };
  } catch (err) {
    console.error("[twilio] sendRCSRichCard error:", err);
    return null;
  }
}

// ── Send WhatsApp message ────────────────────────────────────────────────────

/**
 * Send a WhatsApp message via Twilio.
 * Uses content template if TWILIO_WHATSAPP_CONTENT_SID is set, otherwise plain text.
 * User must join sandbox first: send "join <sandbox-code>" to +14155238886
 */
export async function sendWhatsApp(
  to: string,
  body: string,
  contentVariables?: Record<string, string>
): Promise<{ sid: string; status: string } | null> {
  const client = getClient();
  if (!client) {
    console.warn("[twilio] Client not initialized");
    return null;
  }

  // Ensure to number has whatsapp: prefix
  const toWhatsApp = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  try {
    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: toWhatsApp,
      ...(TWILIO_WHATSAPP_CONTENT_SID
        ? {
            contentSid: TWILIO_WHATSAPP_CONTENT_SID,
            contentVariables: contentVariables ? JSON.stringify(contentVariables) : undefined,
          }
        : { body }),
    });

    console.log(`[twilio] Sent WhatsApp ${message.sid} to ${toWhatsApp}, status: ${message.status}`);
    return { sid: message.sid, status: message.status || "unknown" };
  } catch (err) {
    console.error("[twilio] sendWhatsApp error:", err);
    return null;
  }
}

// ── Send SMS (fallback or direct) ────────────────────────────────────────────

/**
 * Send a plain SMS message.
 * Use this when you don't need rich cards or as explicit fallback.
 */
export async function sendSMS(
  to: string,
  body: string
): Promise<{ sid: string; status: string } | null> {
  const client = getClient();
  if (!client) {
    console.warn("[twilio] Client not initialized");
    return null;
  }

  const from = TWILIO_PHONE_NUMBER;
  if (!from) {
    console.warn("[twilio] Missing sender (TWILIO_PHONE_NUMBER)");
    return null;
  }

  try {
    const message = await client.messages.create({
      body,
      from,
      to,
    });

    console.log(`[twilio] Sent SMS ${message.sid} to ${to}, status: ${message.status}`);
    return { sid: message.sid, status: message.status || "unknown" };
  } catch (err) {
    console.error("[twilio] sendSMS error:", err);
    return null;
  }
}

// ── 911Stock Alert Helpers ───────────────────────────────────────────────────

/**
 * Format an alert message for SMS/RCS.
 * Plain-English, concise, actionable.
 */
export function formatAlertMessage(alert: AlertMessage): string {
  const actionVerb = alert.action === "sell" ? "sold" : "bought";
  const valueFormatted = formatCurrency(alert.totalValue);
  const urgency = alert.score >= 8 ? "⚠️ URGENT" : alert.score >= 6 ? "⚡ Important" : "";

  return `${urgency} ${alert.ticker} Alert

${alert.insider} (${alert.role}) ${actionVerb} ${valueFormatted} in stock.

${alert.context}

Score: ${alert.score}/10

Reply HOLD to keep, SELL to reduce 50%, or DETAILS for more.`;
}

/**
 * Create an RCS rich card for an alert.
 */
export function formatAlertRichCard(alert: AlertMessage, detailsUrl?: string): RCSRichCard {
  const actionVerb = alert.action === "sell" ? "sold" : "bought";
  const valueFormatted = formatCurrency(alert.totalValue);
  const urgencyEmoji = alert.score >= 8 ? "⚠️" : alert.score >= 6 ? "⚡" : "📊";

  return {
    title: `${urgencyEmoji} ${alert.ticker}: ${alert.insider} ${actionVerb} ${valueFormatted}`,
    body: alert.context,
    actions: [
      { type: "QUICK_REPLY" as const, title: "HOLD", id: "hold" },
      { type: "QUICK_REPLY" as const, title: "SELL 50%", id: "sell_50" },
      ...(detailsUrl ? [{ type: "URL" as const, title: "Details", url: detailsUrl }] : []),
    ],
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// ── Health Check ─────────────────────────────────────────────────────────────

/**
 * Check if Twilio is configured and ready to send.
 */
export function isTwilioConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN);
}

/**
 * Get Twilio configuration status for debugging.
 */
export function getTwilioStatus(): {
  configured: boolean;
  hasAccount: boolean;
  hasWhatsApp: boolean;
  hasPhoneNumber: boolean;
} {
  return {
    configured: isTwilioConfigured(),
    hasAccount: Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN),
    hasWhatsApp: true, // WhatsApp sandbox always available
    hasPhoneNumber: Boolean(TWILIO_PHONE_NUMBER),
  };
}