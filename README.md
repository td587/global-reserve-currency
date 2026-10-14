# Demand today, supply tomorrow

In-class briefing for Rodrigo Abucham, Alex Dinh, Dan Sen, and Takaaki Tanabe. MGT 932E, 24 October 2026.

The AI boom is a demand shock today and a supply shock tomorrow. Capex lifts investment and inflation before productivity arrives. The saving–investment balance pushes the equilibrium real rate up. Later, the software-engineering productivity gain can ease inflation enough for the Fed to cut, while long real yields stay high. PIMCO’s precautionary-saving and term-premium channels are the alternative.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43125](http://127.0.0.1:43125).

## Data

`data/reference/` holds the FRED graph CSVs used for the baseline. `data/baseline.json` is the committed snapshot, including series taken from the NY Fed HLW workbook, the NY Fed ACM term premium, and the Board’s Gürkaynak–Sack–Wright yield curve.

Refresh re-reads `data/reference/` on this machine. It does not call FRED. If a reference file is missing or unreadable, that series falls back to `data/baseline.json` and the page says so. Unemployment, inflation, funds, GDP, TIPS, and breakeven are computed from the CSVs. Year-over-year PCE uses the index level twelve months earlier. The output gap uses real GDP and CBO potential in the same quarter. Potential GDP itself is the latest GDPPOT observation on or before 14 October 2026. Later rows in that file are projections and are not used.

There is no API key.

## Deploy on Vercel

1. Import this repository (or this branch) in Vercel.
2. Set the project root to the repository root. Framework preset: Next.js.
3. Leave environment variables empty. Do not add `FRED_API_KEY`.
4. Deploy. `npm run build` is the production build.

Deploy was not run from this environment.
