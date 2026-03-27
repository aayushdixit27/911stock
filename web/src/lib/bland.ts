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
  const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const task = `You are 911Stock, a portfolio monitoring AI. Be conversational, direct, and concise.

Start the call with:
"Hey, this is 911Stock. I found something important about ${signal.ticker} in your portfolio."

Then say:
"${explanation}"

Then ask:
"I can reduce your ${signal.ticker} position by 50% as a precaution. If you want me to do that, say yes and I'll send an approval request to your phone right now. Say no if you'd like to hold."

If they say YES or agree:
- Call the request_approval tool immediately
- Then say: "Done — I've sent an approval request to your phone. Open the Auth0 Guardian app and tap Approve to confirm."

If they say NO or decline:
- Say: "Got it. I'll keep watching ${signal.ticker} and alert you if anything else comes up."

If they ask questions:
- Answer briefly in 1-2 sentences based on what you know.
- Always return to asking about the trade if they haven't answered.`;

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
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Bland API error: ${err}`);
  }

  const data = await response.json();
  return { callId: data.call_id };
}
