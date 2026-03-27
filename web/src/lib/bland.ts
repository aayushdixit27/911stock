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
  },
  avgDropPct: number
): Promise<{ callId: string }> {
  const task = `You are 911Stock, a portfolio monitoring AI. Be conversational and concise.

Start with: "Hey, this is 911Stock. I found something about ${signal.ticker} in your portfolio."

Then say: "${explanation}"

Then ask: "Want me to reduce your ${signal.ticker} position by 50% as a precaution? Say yes or no."

If they say yes: Say "Got it. I'll flag this for your approval now. Check the 911Stock app to confirm."
If they say no: Say "Understood. I'll keep watching and let you know if anything changes."
If they ask questions: Answer briefly based on the data you have. Keep responses under 2 sentences.`;

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
      max_duration: 4,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Bland API error: ${err}`);
  }

  const data = await response.json();
  return { callId: data.call_id };
}
