# Inflation Shocks — MBA Presentation

Interactive Next.js presentation on US inflation (≈2020–2025): headline CPI/PCE paths with **primary shock toggles** that live-update an actual vs counterfactual series.

## Run

```bash
npm install
npm run data:inflation   # rebuild embedded series from data/
npm run dev              # http://127.0.0.1:43125
```

Production: `npm run build && npm run start` (Vercel-ready App Router).

## How toggles work

Each factor starts **ON** (included). Flip **OFF** to **remove that component’s approximate contribution to y/y inflation**. The chart keeps the solid **Actual** path and draws a dashed **Counterfactual** = Actual − Σ(removed contributions). CPI toggles use BLS relative importance × component y/y (teaching approximation). The **Demand impulse** control switches to a **PCE + SF Fed Shapiro** lens and subtracts the published demand-driven y/y contribution — never mixed into CPI algebra.

## Shocks

| Toggle | Data basis |
| --- | --- |
| Energy | FRED `CPIENGSL` × BLS RI |
| Food | FRED `CPIUFDSL` × BLS RI |
| Used vehicles | FRED `CUSR0000SETA02` × BLS RI |
| Airfares | FRED `CUSR0000SETG01` × BLS RI |
| Shelter lag | FRED `CUSR0000SAH1` × BLS RI |
| Services ex-shelter | Proxy from services less energy − shelter |
| Demand impulse | SF Fed Shapiro demand-driven PCE y/y |

## Data refresh

1. Re-download FRED CSVs into `data/fred/` (see series IDs in `scripts/build-inflation-data.mjs`).
2. Refresh Shapiro CSVs from [SF Fed supply/demand PCE](https://www.frbsf.org/research-and-insights/data-and-indicators/supply-and-demand-driven-pce-inflation/).
3. Run `npm run data:inflation`.

In-app detail: [`/methodology`](/methodology).

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Recharts.
