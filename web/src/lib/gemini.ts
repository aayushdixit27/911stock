import OpenAI from "openai";

const TRUEFOUNDRY_BASE_URL = "https://gateway.truefoundry.ai";
const GATEWAY_MODEL = "google-gemini/gemini-3-flash-preview";

function getOpenAI() {
  const apiKey = process.env.TRUEFOUNDRY_API_KEY;
  if (!apiKey) {
    throw new Error("TRUEFOUNDRY_API_KEY is not set");
  }
  return new OpenAI({
    apiKey,
    baseURL: TRUEFOUNDRY_BASE_URL,
    defaultHeaders: {
      "X-TFY-METADATA": "{}",
      "X-TFY-LOGGING-CONFIG": JSON.stringify({ enabled: true }),
    },
  });
}

export async function analyzeSignal(
  signal: {
    ticker: string;
    companyName: string;
    insider: string;
    role: string;
    action: string;
    shares: number;
    total_value: number;
    scheduled_10b5_1: boolean;
    last_transaction_months_ago: number;
    position_reduced_pct: number;
  },
  historicalPattern: {
    avg_30d_drop_pct: number;
    occurrences: { date: string; insider: string; subsequent_30d_drop_pct: number }[];
    confidence: string;
  } | null
): Promise<string> {
  const prompt = `You are 911Stock, a portfolio monitoring AI that watches stocks for retail investors.

Analyze this insider transaction and explain what it means in plain English for someone who owns this stock.

TRANSACTION:
- Company: ${signal.companyName} (${signal.ticker})
- Who: ${signal.insider} (${signal.role})
- Action: SOLD ${signal.shares.toLocaleString()} shares worth $${(signal.total_value / 1_000_000).toFixed(1)}M
- Scheduled plan (10b5-1): ${signal.scheduled_10b5_1 ? "Yes — routine" : "No — discretionary"}
- Last transaction: ${signal.last_transaction_months_ago} months ago
- Position reduced by: ${signal.position_reduced_pct}%

${historicalPattern ? `HISTORICAL PATTERN for ${signal.ticker}:
- Last ${historicalPattern.occurrences.length} times insiders made unscheduled sales, the stock dropped an average of ${historicalPattern.avg_30d_drop_pct}% over 30 days
- Confidence: ${historicalPattern.confidence}` : ""}

Rules:
- 2-4 sentences max
- No financial jargon. Plain English only.
- Be direct about what this might mean for someone holding this stock
- Include the historical pattern if available
- End with one clear sentence about why this matters to the holder`;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: GATEWAY_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2500,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty response from TrueFoundry gateway");
  }
  return text;
}
