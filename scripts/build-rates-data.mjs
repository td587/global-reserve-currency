/**
 * Build monthly rates/expectations series from daily FRED CSVs.
 * Run: node scripts/build-rates-data.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const fredDir = path.join(root, "data", "fred");
const outPath = path.join(root, "src", "data", "rates-series.json");

/** Prefer monthly FRED if present; else average daily within month */
const SERIES = {
  tips5y: { id: "DFII5", label: "5y TIPS real yield (DFII5)", unit: "%" },
  tips10y: { id: "DFII10", label: "10y TIPS real yield (DFII10)", unit: "%" },
  be5y: { id: "T5YIE", label: "5y breakeven inflation (T5YIE)", unit: "%" },
  fwd5y5y: {
    id: "T5YIFR",
    label: "5y5y forward inflation expectation (T5YIFR)",
    unit: "%",
  },
  dgs5: { id: "DGS5", label: "5y Treasury yield (DGS5)", unit: "%" },
  dgs10: { id: "DGS10", label: "10y Treasury yield (DGS10)", unit: "%" },
};

function parseFredDaily(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  const lines = text.split(/\r?\n/).slice(1);
  const byMonth = new Map(); // ym -> {sum, n}
  for (const line of lines) {
    const [date, value] = line.split(",");
    if (!date || value === "" || value === ".") continue;
    const v = Number(value);
    if (!Number.isFinite(v)) continue;
    const ym = date.slice(0, 7);
    const cur = byMonth.get(ym) ?? { sum: 0, n: 0 };
    cur.sum += v;
    cur.n += 1;
    byMonth.set(ym, cur);
  }
  const out = new Map();
  for (const [ym, { sum, n }] of byMonth) {
    out.set(ym, Math.round((sum / n) * 100) / 100);
  }
  return out;
}

function main() {
  const maps = {};
  for (const [key, meta] of Object.entries(SERIES)) {
    const fp = path.join(fredDir, `${meta.id}.csv`);
    if (!fs.existsSync(fp)) throw new Error(`Missing ${fp}`);
    maps[key] = parseFredDaily(fp);
  }

  const months = new Set();
  for (const m of Object.values(maps)) {
    for (const ym of m.keys()) {
      if (ym >= "2019-01") months.add(ym);
    }
  }
  const sorted = [...months].sort();

  const observations = sorted.map((ym) => {
    const row = { date: ym };
    for (const key of Object.keys(SERIES)) {
      row[key] = maps[key].get(ym) ?? null;
    }
    return row;
  });

  const payload = {
    meta: {
      builtAt: new Date().toISOString().slice(0, 10),
      frequency: "Monthly average of daily FRED observations",
      window: {
        start: observations[0]?.date,
        end: observations.at(-1)?.date,
      },
      series: SERIES,
      notes: [
        "DFII5 / DFII10 are TIPS constant-maturity real yields (H.15), not nominal.",
        "T5YIE is 5-year breakeven (DGS5 − DFII5 conceptually); includes inflation risk & liquidity premia.",
        "T5YIFR is 5-year, 5-year forward inflation compensation from Treasury/TIPS curve.",
        "Single-name corporate CDS is not on FRED — see hyperscalers section for CDS gaps.",
      ],
      update: "Refresh CSVs in data/fred, then npm run data:rates",
    },
    observations,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload));
  console.log(
    `Wrote ${observations.length} months → ${path.relative(root, outPath)}`
  );
}

main();
