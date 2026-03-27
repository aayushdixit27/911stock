export type NewsSentiment = {
  overallScore: number; // -1.0 (very negative) to 1.0 (very positive)
  label: string; // "Bearish" | "Somewhat-Bearish" | "Neutral" | "Somewhat-Bullish" | "Bullish"
  headlines: string[]; // up to 3 recent headlines
  articleCount: number;
};

type TickerSentiment = {
  ticker: string;
  ticker_sentiment_score: string;
  ticker_sentiment_label: string;
};

type FeedItem = {
  title: string;
  ticker_sentiment: TickerSentiment[];
};

type AlphaVantageResponse = {
  feed: FeedItem[];
};

function scoreToLabel(score: number): string {
  if (score <= -0.35) return "Bearish";
  if (score <= -0.15) return "Somewhat-Bearish";
  if (score < 0.15) return "Neutral";
  if (score < 0.35) return "Somewhat-Bullish";
  return "Bullish";
}

// Fetch news sentiment for a ticker via Alpha Vantage
// Returns null if API key not set or request fails — never throws
export async function fetchNewsSentiment(
  ticker: string
): Promise<NewsSentiment | null> {
  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${encodeURIComponent(ticker)}&apikey=${apiKey}&limit=10`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error(
        `[news] Alpha Vantage request failed: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = (await response.json()) as AlphaVantageResponse;

    if (!data.feed || !Array.isArray(data.feed) || data.feed.length === 0) {
      return null;
    }

    const tickerUpper = ticker.toUpperCase();
    const scores: number[] = [];
    const headlines: string[] = [];

    for (const item of data.feed) {
      if (headlines.length < 3 && item.title) {
        headlines.push(item.title);
      }

      if (Array.isArray(item.ticker_sentiment)) {
        const match = item.ticker_sentiment.find(
          (ts) => ts.ticker.toUpperCase() === tickerUpper
        );
        if (match) {
          const parsed = parseFloat(match.ticker_sentiment_score);
          if (!isNaN(parsed)) {
            scores.push(parsed);
          }
        }
      }
    }

    if (scores.length === 0) {
      return null;
    }

    const overallScore =
      scores.reduce((sum, s) => sum + s, 0) / scores.length;

    return {
      overallScore,
      label: scoreToLabel(overallScore),
      headlines,
      articleCount: scores.length,
    };
  } catch (err) {
    console.error("[news] Failed to fetch news sentiment:", err);
    return null;
  }
}
