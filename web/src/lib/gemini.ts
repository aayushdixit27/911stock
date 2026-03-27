import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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

  const result = await model.generateContent(prompt);
  return result.response.text();
}
