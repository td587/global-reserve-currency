# Inflation Shocks — MBA Presentation

Interactive Next.js presentation on US inflation (≈2020–2025): headline CPI/PCE paths with **primary shock toggles** that live-update an actual vs counterfactual series.

## Run

```bash
npm install
npm run data:all         # rebuild inflation + rates JSON from data/fred
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

## Also in the deck

- **Rates panel:** toggle 5y/10y TIPS (`DFII5`/`DFII10`), 5y breakeven (`T5YIE`), 5y5y (`T5YIFR`), 5y/10y UST (`DGS5`/`DGS10`).
- **PCE overlays** on the explorer: Headline PCE (`PCEPI`) / Core PCE (`PCEPILFE`) show-hide, plus BEA Table 2.4.4 category toggles (goods, durables, nondurables, services, food, energy, housing, health, vehicles, transport).
- **Hyperscalers & neoclouds:** SEC-cited capex/commitments, ratings, CDS gaps.

## Data refresh

1. Re-download FRED CSVs into `data/fred/` (inflation + rates IDs in `scripts/`).
2. Refresh Shapiro CSVs from [SF Fed supply/demand PCE](https://www.frbsf.org/research-and-insights/data-and-indicators/supply-and-demand-driven-pce-inflation/).
3. Run `npm run data:all`.

In-app detail: [`/methodology`](/methodology).

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Recharts.
