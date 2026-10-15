# Demand today, supply tomorrow

In-class briefing for Rodrigo Abucham, Alex Dinh, Dan Sen, and Takaaki Tanabe. MGT 932E, 24 October 2026.

Core question: is AI-driven productive capacity expanding fast enough to keep up with the demand boom it has already created? Base case: the demand effect is more visible today than the realized supply effect, and the productivity channel matters more over time. The effect on long-term rates is ambiguous: a higher r* pushes them up, while PIMCO’s precautionary-saving and term-premium channels pull them down.

The main page (`/`) is the full briefing. `/slides` follows the presentation outline section by section. See `CHANGELOG.md` for what changed and why.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43125](http://127.0.0.1:43125). The slide version is [http://127.0.0.1:43125/slides](http://127.0.0.1:43125/slides). Arrow keys move between slides. Shock settings carry from one slide to the next.

## Data

`data/reference/` holds the FRED graph CSVs used for the baseline. `data/baseline.json` is the committed snapshot, including series taken from the NY Fed HLW workbook, the NY Fed ACM term premium, and the Board’s Gürkaynak–Sack–Wright yield curve.

The first paint uses `data/baseline.json` and does not call the network. Refresh re-reads `data/reference/`, then tries a four-second pull of the FRED graph CSVs, the New York Fed effective funds rate, and the Treasury yield curve. A series that returns replaces that print and its date. A series that fails keeps the reference file, or the snapshot if the file itself could not be read, and the page says the live pull failed. Unemployment, inflation, funds, GDP, TIPS, and breakeven are computed from those files. Year-over-year PCE uses the index level twelve months earlier. The output gap uses real GDP and CBO potential in the same quarter. Potential GDP itself is the latest GDPPOT observation on or before 14 October 2026. Later rows in that file are projections and are not used. The Holston–Laubach–Williams r* and the Adrian–Crump–Moench split stay on the saved prints. Shock settings are not reset.

There is no API key.

## Deploy on Vercel

1. Import this repository (or this branch) in Vercel.
2. Set the project root to the repository root. Framework preset: Next.js.
3. Leave environment variables empty. Do not add `FRED_API_KEY`.
4. Deploy. `npm run build` is the production build.

Deploy was not run from this environment.
