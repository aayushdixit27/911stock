// WhatsApp Cloud API sender — free, no Twilio needed
// Uses Meta's official WhatsApp Business API
// Free tier: 1000 service conversations/month
// Setup: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

/**
 * Send a WhatsApp text message via Cloud API.
 * Number format: country code + number (no +, no spaces)
 * e.g., "66898281688" for +66 89 828 1688
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<{ success: boolean; id?: string }> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("[whatsapp] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return { success: false };
  }

  try {
    const cleanNumber = to.replace(/[^0-9]/g, "");

    const res = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanNumber,
          type: "text",
          text: { body },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("[whatsapp] API error:", data);
      return { success: false };
    }

    const id = data.messages?.[0]?.id;
    console.log(`[whatsapp] Sent message ${id} to ${cleanNumber}`);
    return { success: true, id };
  } catch (err) {
    console.error("[whatsapp] Send error:", err);
    return { success: false };
  }
}

/**
 * Send a WhatsApp template message via Cloud API.
 * Use for outbound messages outside the 24-hour window.
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  language: string,
  components?: Array<Record<string, unknown>>
): Promise<{ success: boolean; id?: string }> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("[whatsapp] Missing credentials");
    return { success: false };
  }

  try {
    const cleanNumber = to.replace(/[^0-9]/g, "");

    const res = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanNumber,
          type: "template",
          template: {
            name: templateName,
            language: { code: language },
            components: components || [],
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("[whatsapp] Template error:", data);
      return { success: false };
    }

    const id = data.messages?.[0]?.id;
    console.log(`[whatsapp] Sent template ${templateName} to ${cleanNumber}, id: ${id}`);
    return { success: true, id };
  } catch (err) {
    console.error("[whatsapp] Template send error:", err);
    return { success: false };
  }
}

/**
 * Verify webhook signature from WhatsApp Cloud API.
 * Used for the initial webhook verification GET request.
 */
export function verifyWebhookToken(mode: string, token: string): boolean {
  return mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN;
}

/**
 * Check if WhatsApp is configured.
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID);
}
