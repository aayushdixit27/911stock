// SEC EDGAR Form 4 parser — standalone copy for bot
// Mirrors web/src/lib/edgar.ts but without Next.js dependencies

export type Signal = {
  id: string;
  ticker: string;
  companyName: string;
  insider: string;
  role: string;
  action: string;
  shares: number;
  price_per_share: number;
  total_value: number;
  date: string;
  filed: string;
  scheduled_10b5_1: boolean;
  last_transaction_months_ago: number;
  position_reduced_pct: number;
  source: string;
};

// CIK map — extend as needed or move to DB
const CIK_MAP: Record<string, string> = {
  SMCI: "0001375365",
  TSLA: "0001318605",
  NVDA: "0001045810",
  AAPL: "0000320193",
  GOOGL: "0001652044",
  AMZN: "0001018724",
  META: "0001326801",
  MSFT: "0000789019",
};

export const SUPPORTED_TICKERS = Object.keys(CIK_MAP);

const EDGAR_HEADERS = {
  "User-Agent": "911Stock contact@911stock.ai",
  Accept: "application/json",
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeFetch(url: string, isJson = true): Promise<unknown> {
  try {
    const res = await fetch(url, { headers: EDGAR_HEADERS });
    if (!res.ok) {
      console.warn(`[edgar] HTTP ${res.status} for ${url}`);
      return null;
    }
    return isJson ? await res.json() : await res.text();
  } catch (err) {
    console.warn(`[edgar] fetch error:`, err);
    return null;
  }
}

function xmlTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = re.exec(xml);
  return m ? m[1].trim() : "";
}

function xmlNestedValue(xml: string, parent: string): string {
  const parentContent = xmlTag(xml, parent);
  if (!parentContent) return "";
  return xmlTag(parentContent, "value");
}

function accessionToPath(accession: string): string {
  return accession.replace(/-/g, "");
}

function parseForm4Xml(
  xml: string,
  ticker: string,
  filingDate: string,
  accession: string
): Signal | null {
  try {
    if (!xml || xml.length < 100) return null;

    const companyName = xmlTag(xml, "issuerName") || xmlTag(xml, "name") || ticker;
    const issuerSymbol = xmlTag(xml, "issuerTradingSymbol") || ticker;

    const ownerSection = xmlTag(xml, "reportingOwner");
    const insider =
      xmlTag(ownerSection || xml, "rptOwnerName") ||
      xmlTag(xml, "rptOwnerName") ||
      "Unknown";

    const relSection =
      xmlTag(ownerSection || xml, "reportingOwnerRelationship") ||
      xmlTag(xml, "reportingOwnerRelationship");
    const role = xmlTag(relSection, "officerTitle") || "Insider";

    const ndSection = xmlTag(xml, "nonDerivativeTransaction");
    if (!ndSection) return null;

    const transactionDate =
      xmlNestedValue(ndSection, "transactionDate") ||
      xmlTag(xmlTag(ndSection, "transactionDate"), "value") ||
      filingDate;

    const sharesRaw = xmlNestedValue(ndSection, "transactionShares");
    const priceRaw = xmlNestedValue(ndSection, "transactionPricePerShare");
    const adCode = xmlNestedValue(ndSection, "transactionAcquiredDisposedCode");

    const shares = sharesRaw ? parseFloat(sharesRaw) : 0;
    const price_per_share = priceRaw ? parseFloat(priceRaw) : 0;
    const action = adCode === "D" ? "sell" : "buy";
    const total_value = shares * price_per_share;

    const allFootnotes = xmlTag(xml, "footnotes").toLowerCase();
    const planCodeSection = xmlTag(ndSection, "transactionCoding");
    const planCode = xmlTag(planCodeSection, "equitySwapInvolved") || "";
    const scheduled_10b5_1 =
      allFootnotes.includes("10b5-1") ||
      allFootnotes.includes("10b5\u20131") ||
      planCode === "1";

    const dateParts = transactionDate.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateParts ? dateParts[1] : filingDate;

    return {
      id: `${issuerSymbol}-${accession}`,
      ticker: issuerSymbol.toUpperCase(),
      companyName,
      insider,
      role,
      action,
      shares,
      price_per_share,
      total_value,
      date,
      filed: (() => {
        try {
          const d = new Date(filingDate);
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        } catch {
          return new Date().toISOString();
        }
      })(),
      scheduled_10b5_1,
      last_transaction_months_ago: 12,
      position_reduced_pct: 10,
      source: "SEC Form 4",
    };
  } catch (err) {
    console.warn("[edgar] parse error:", err);
    return null;
  }
}

export async function fetchRecentForm4s(ticker: string): Promise<Signal[]> {
  const cik = CIK_MAP[ticker.toUpperCase()];
  if (!cik) {
    return [];
  }

  const submissionsUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
  const submissionsRaw = await safeFetch(submissionsUrl);
  if (!submissionsRaw) return [];

  const submissions = submissionsRaw as {
    filings?: { recent?: { form: string[]; filingDate: string[]; accessionNumber: string[]; primaryDocument: string[] } };
  };
  const recent = submissions?.filings?.recent;
  if (!recent) return [];

  const form4Indices: number[] = [];
  for (let i = 0; i < recent.form.length && form4Indices.length < 5; i++) {
    if (recent.form[i] === "4") form4Indices.push(i);
  }

  if (form4Indices.length === 0) return [];

  const signals: Signal[] = [];
  for (const idx of form4Indices) {
    const accession = recent.accessionNumber[idx];
    const fDate = recent.filingDate[idx];
    const primaryDoc = recent.primaryDocument[idx];
    const accessionPath = accessionToPath(accession);
    const cikInt = parseInt(cik, 10);
    const xmlUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accessionPath}/${primaryDoc}`;

    await delay(200);
    const xmlRaw = await safeFetch(xmlUrl, false);
    if (typeof xmlRaw !== "string") continue;

    const signal = parseForm4Xml(xmlRaw, ticker, fDate, accession);
    if (signal) signals.push(signal);
  }

  return signals;
}
