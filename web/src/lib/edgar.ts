// SEC EDGAR Form 4 poller
// Fetches real insider trading filings for watched tickers and returns Signal objects.

export type Signal = {
  id: string
  ticker: string
  companyName: string
  insider: string
  role: string
  action: string
  shares: number
  price_per_share: number
  total_value: number
  date: string                    // YYYY-MM-DD
  filed: string                   // ISO string
  scheduled_10b5_1: boolean
  last_transaction_months_ago: number
  position_reduced_pct: number
  source: string                  // "SEC Form 4"
}

// CIK map — padded to 10 digits
const CIK_MAP: Record<string, string> = {
  SMCI: "0001096343",
  TSLA: "0001318605",
  NVDA: "0001045810",
}

const EDGAR_HEADERS = {
  "User-Agent": "911Stock contact@911stock.ai",
  "Accept": "application/json",
}

// Delay helper for rate-limiting (max 5 req/s → 200 ms between requests)
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Safe fetch wrapper — never throws
async function safeFetch(url: string, isJson = true): Promise<unknown> {
  try {
    const res = await fetch(url, { headers: EDGAR_HEADERS })
    if (!res.ok) {
      console.warn(`[edgar] HTTP ${res.status} for ${url}`)
      return null
    }
    return isJson ? await res.json() : await res.text()
  } catch (err) {
    console.warn(`[edgar] fetch error for ${url}:`, err)
    return null
  }
}

// ── XML helpers (no external dependencies) ──────────────────────────────────

function xmlTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i")
  const m = re.exec(xml)
  return m ? m[1].trim() : ""
}

// Pull the first <value> inside a given parent element
function xmlNestedValue(xml: string, parent: string): string {
  const parentContent = xmlTag(xml, parent)
  if (!parentContent) return ""
  return xmlTag(parentContent, "value")
}

// ── Submissions JSON types ────────────────────────────────────────────────────

interface SubmissionsRecent {
  form: string[]
  filingDate: string[]
  accessionNumber: string[]
  primaryDocument: string[]
}

interface SubmissionsJson {
  filings?: {
    recent?: SubmissionsRecent
  }
}

// ── Accession number → URL path ───────────────────────────────────────────────
// Strip dashes for the directory name used in EDGAR archive URLs
function accessionToPath(accession: string): string {
  return accession.replace(/-/g, "")
}

// ── Parse a single Form 4 XML document ───────────────────────────────────────

function parseForm4Xml(
  xml: string,
  ticker: string,
  filingDate: string,
  accession: string
): Signal | null {
  try {
    if (!xml || xml.length < 100) return null

    const companyName =
      xmlTag(xml, "issuerName") || xmlTag(xml, "name") || ticker
    const issuerSymbol = xmlTag(xml, "issuerTradingSymbol") || ticker

    // Reporting owner name — handle nested structure
    const ownerSection = xmlTag(xml, "reportingOwner")
    const insider =
      xmlTag(ownerSection || xml, "rptOwnerName") ||
      xmlTag(xml, "rptOwnerName") ||
      "Unknown"

    // Role — officerTitle lives inside reportingOwnerRelationship
    const relSection =
      xmlTag(ownerSection || xml, "reportingOwnerRelationship") ||
      xmlTag(xml, "reportingOwnerRelationship")
    const role = xmlTag(relSection, "officerTitle") || "Insider"

    // Non-derivative transactions — grab first one
    const ndSection = xmlTag(xml, "nonDerivativeTransaction")
    if (!ndSection) return null

    const transactionDate =
      xmlNestedValue(ndSection, "transactionDate") ||
      xmlTag(xmlTag(ndSection, "transactionDate"), "value") ||
      filingDate

    const sharesRaw = xmlNestedValue(ndSection, "transactionShares")
    const priceRaw = xmlNestedValue(ndSection, "transactionPricePerShare")
    const adCode = xmlNestedValue(ndSection, "transactionAcquiredDisposedCode")

    const shares = sharesRaw ? parseFloat(sharesRaw) : 0
    const price_per_share = priceRaw ? parseFloat(priceRaw) : 0
    const action = adCode === "D" ? "sell" : "buy"
    const total_value = shares * price_per_share

    // 10b5-1 plan detection
    const allFootnotes = xmlTag(xml, "footnotes").toLowerCase()
    const planCodeSection = xmlTag(ndSection, "transactionCoding")
    const planCode = xmlTag(planCodeSection, "equitySwapInvolved") || ""
    const scheduled_10b5_1 =
      allFootnotes.includes("10b5-1") ||
      allFootnotes.includes("10b5\u20131") ||
      planCode === "1"

    // Normalise date
    const dateParts = transactionDate.match(/(\d{4}-\d{2}-\d{2})/)
    const date = dateParts ? dateParts[1] : filingDate

    const id = `${issuerSymbol}-${accession}`

    return {
      id,
      ticker: issuerSymbol.toUpperCase(),
      companyName,
      insider,
      role,
      action,
      shares,
      price_per_share,
      total_value,
      date,
      filed: (() => { try { const d = new Date(filingDate); return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(); } catch { return new Date().toISOString(); } })(),
      scheduled_10b5_1,
      last_transaction_months_ago: 12,  // fallback — not in Form 4
      position_reduced_pct: 10,         // fallback
      source: "SEC Form 4",
    }
  } catch (err) {
    console.warn("[edgar] parseForm4Xml error:", err)
    return null
  }
}

// ── Main exported functions ────────────────────────────────────────────────────

/**
 * Fetch recent Form 4 filings for a ticker from SEC EDGAR.
 * Returns Signal[] — may be empty if no recent filings or API unavailable.
 */
export async function fetchRecentForm4s(ticker: string): Promise<Signal[]> {
  const cik = CIK_MAP[ticker.toUpperCase()]
  if (!cik) {
    console.warn(`[edgar] No CIK mapping for ticker: ${ticker}`)
    return []
  }

  const submissionsUrl = `https://data.sec.gov/submissions/CIK${cik}.json`
  const submissionsRaw = await safeFetch(submissionsUrl)
  if (!submissionsRaw) return []

  const submissions = submissionsRaw as SubmissionsJson
  const recent = submissions?.filings?.recent
  if (!recent) return []

  const { form, filingDate, accessionNumber, primaryDocument } = recent

  // Collect indices of Form 4 filings (up to 5 most recent)
  const form4Indices: number[] = []
  for (let i = 0; i < form.length && form4Indices.length < 5; i++) {
    if (form[i] === "4") {
      form4Indices.push(i)
    }
  }

  if (form4Indices.length === 0) return []

  const signals: Signal[] = []

  for (const idx of form4Indices) {
    const accession = accessionNumber[idx]       // e.g. "0001234567-26-001234"
    const fDate = filingDate[idx]
    const primaryDoc = primaryDocument[idx]

    const accessionPath = accessionToPath(accession)
    // CIK without leading zeros for the archive path
    const cikInt = parseInt(cik, 10)
    const xmlUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accessionPath}/${primaryDoc}`

    await delay(200) // respect 5 req/s rate limit

    const xmlRaw = await safeFetch(xmlUrl, false)
    if (typeof xmlRaw !== "string") continue

    const signal = parseForm4Xml(xmlRaw, ticker, fDate, accession)
    if (signal) signals.push(signal)
  }

  return signals
}

/**
 * Fetch Form 4s for all watched tickers.
 * Returns the first filing found, or null.
 */
export async function fetchLatestSignal(tickers: string[]): Promise<Signal | null> {
  for (const ticker of tickers) {
    try {
      const signals = await fetchRecentForm4s(ticker)
      if (signals.length > 0) {
        // EDGAR returns filings in reverse-chronological order
        return signals[0]
      }
    } catch (err) {
      console.warn(`[edgar] fetchLatestSignal error for ${ticker}:`, err)
    }
  }
  return null
}
