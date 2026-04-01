# SEC EDGAR API Reference

## Endpoints used

### 1. Company submissions (JSON)
```
GET https://data.sec.gov/submissions/CIK{padded_cik}.json
```
Returns all recent filings. Filter for `form === "4"` to get insider trading filings.

Response structure:
```json
{
  "filings": {
    "recent": {
      "form": ["4", "4", "10-K", ...],
      "filingDate": ["2026-03-15", ...],
      "accessionNumber": ["0001234567-26-001234", ...],
      "primaryDocument": ["xslF345X05/primary_doc.xml", ...]
    }
  }
}
```

### 2. Form 4 XML document
```
GET https://www.sec.gov/Archives/edgar/data/{cik_int}/{accession_no_dashes}/{primary_doc}
```

The accession number must have dashes removed for the URL path.

### Required headers

```
User-Agent: YourAppName contact@youremail.com
Accept: application/json
```

SEC requires a descriptive User-Agent. Generic user agents get blocked.

### Rate limits

- Maximum 10 requests per second (we use 5 req/s = 200ms delay to be safe)
- No API key required
- No authentication required
- Data is public domain

## CIK lookup

To find a company's CIK:
```
https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK=TICKER&type=4&dateb=&owner=include&count=10&search_text=&action=getcompany
```

CIKs must be zero-padded to 10 digits (e.g., `1096343` → `0001096343`).

## Form 4 XML structure

Key elements:
```xml
<ownershipDocument>
  <issuer>
    <issuerCik>0001096343</issuerCik>
    <issuerName>Super Micro Computer Inc</issuerName>
    <issuerTradingSymbol>SMCI</issuerTradingSymbol>
  </issuer>
  <reportingOwner>
    <reportingOwnerId>
      <rptOwnerCik>...</rptOwnerCik>
      <rptOwnerName>Liang Charles</rptOwnerName>
    </reportingOwnerId>
    <reportingOwnerRelationship>
      <officerTitle>CEO</officerTitle>
    </reportingOwnerRelationship>
  </reportingOwner>
  <nonDerivativeTable>
    <nonDerivativeTransaction>
      <transactionDate><value>2026-03-14</value></transactionDate>
      <transactionShares><value>50000</value></transactionShares>
      <transactionPricePerShare><value>42.50</value></transactionPricePerShare>
      <transactionAcquiredDisposedCode><value>D</value></transactionAcquiredDisposedCode>
    </nonDerivativeTransaction>
  </nonDerivativeTable>
  <footnotes>
    <footnote id="F1">Transaction pursuant to Rule 10b5-1 plan...</footnote>
  </footnotes>
</ownershipDocument>
```
