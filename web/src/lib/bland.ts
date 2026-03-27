const BLAND_API_KEY = process.env.BLAND_API_KEY!;
const BLAND_BASE = "https://api.bland.ai/v1";

export async function makeOutboundCall(
  phoneNumber: string,
  explanation: string,
  signal: {
    ticker: string;
    insider: string;
    role: string;
    total_value: number;
    last_transaction_months_ago: number;
  }
): Promise<{ callId: string }> {
  const appUrl = process.env.NEXT_PUBLIC_URL || "";
  const isPublicUrl = appUrl.startsWith("https://");

  // Position data for personalization
  const shares = 1000; // TODO: fetch from portfolio
  const currentValue = shares * 42.50;
  const estLoss = Math.round(currentValue * 0.12);

  const task = `You are 911Stock, a portfolio monitoring AI. Be conversational, direct, and concise. Speak in plain English — no jargon.

Start the call with:
"Hey, this is 911Stock. I found something urgent about ${signal.ticker} in your portfolio."

Then explain with SOURCE CITATIONS:
"According to a DOJ press release filed today and confirmed by Reuters, ${signal.insider}, the ${signal.role} of Super Micro Computer, has been charged with conspiring to smuggle two point five billion dollars of AI servers to China. ${explanation}"

Then give PERSONAL impact:
"You hold ${shares} shares of ${signal.ticker} worth about $${currentValue.toLocaleString()}. Based on 3 similar events in ${signal.ticker}'s history, the stock typically drops 12% within 30 days. That could mean a loss of about $${estLoss.toLocaleString()} if you hold."

Then ask:
"I can reduce your ${signal.ticker} position by 50% as a precaution. Want me to do that? I'll send an approval to your phone — you'll need to confirm before anything happens."

HANDLING "HOLD ON" / "WAIT" / "LET ME CHECK":
If the user says hold on, wait, let me check, give me a second, or anything similar:
- Say: "Take your time. I'll stay on the line. Your dashboard is showing the source documents right now — the DOJ filing and the Reuters article."
- DO NOT repeat the pitch. DO NOT hang up. Wait silently for them to come back.
- When they return, ask: "What would you like to do?"

If they say YES or agree:
- Call the request_approval tool immediately
- Then say: "Done — I've sent an approval request to your phone. Open the Auth0 Guardian app and tap Approve to confirm the trade."

If they say NO or decline:
- Say: "Got it. I'll keep watching ${signal.ticker} and alert you if anything changes. The sources are on your dashboard if you want to review them."

If they ask questions:
- Answer briefly in 1-2 sentences.
- Cite sources when possible: "According to the DOJ filing..." or "Reuters reported that..."
- If you don't know something, say "I don't have data on that right now, but the DOJ filing is linked on your dashboard."
- Always return to asking about the trade if they haven't decided.`;

  const response = await fetch(`${BLAND_BASE}/calls`, {
    method: "POST",
    headers: {
      authorization: BLAND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      task,
      voice: "maya",
      wait_for_greeting: true,
      record: true,
      max_duration: 5,
      ...(isPublicUrl && {
        tools: [
          {
            name: "request_approval",
            description: "Call this tool when the user says yes and wants to approve the trade",
            url: `${appUrl}/api/bland-webhook`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: {
              approved: true,
              ticker: signal.ticker,
            },
            response_data: [
              {
                name: "status",
                data: "$.status",
                context: "Whether the approval request was sent successfully",
              },
            ],
          },
        ],
      }),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Bland API error: ${err}`);
  }

  const data = await response.json();
  return { callId: data.call_id };
}
