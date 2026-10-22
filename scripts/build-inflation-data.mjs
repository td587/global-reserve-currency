/**
 * Build embedded inflation series from FRED CSVs + SF Fed Shapiro CSVs.
 * Run: node scripts/build-inflation-data.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const fredDir = path.join(root, "data", "fred");
const outPath = path.join(root, "src", "data", "inflation-series.json");

/** BLS CPI-U Relative Importance (Dec tables), public published figures */
const RI_BY_DEC = {
  2018: {
    food: 13.384,
    energy: 7.129,
    shelter: 32.843,
    usedVehicles: 2.213,
    airfares: 0.759,
    servicesExEnergy: 58.5,
    coreGoods: 20.3,
  },
  2019: {
    food: 13.869,
    energy: 6.706,
    shelter: 33.311,
    usedVehicles: 2.341,
    airfares: 0.726,
    servicesExEnergy: 59.0,
    coreGoods: 20.5,
  },
  2020: {
    food: 14.094,
    energy: 6.043,
    shelter: 33.532,
    usedVehicles: 2.787,
    airfares: 0.553,
    servicesExEnergy: 60.0,
    coreGoods: 21.0,
  },
  2021: {
    food: 13.355,
    energy: 7.348,
    shelter: 32.943,
    usedVehicles: 3.513,
    airfares: 0.603,
    servicesExEnergy: 57.5,
    coreGoods: 21.5,
  },
  2022: {
    food: 13.528,
    energy: 6.979,
    shelter: 34.412,
    usedVehicles: 2.752,
    airfares: 0.68,
    servicesExEnergy: 57.0,
    coreGoods: 21.0,
  },
  2023: {
    food: 13.384,
    energy: 6.689,
    shelter: 36.212,
    usedVehicles: 2.425,
    airfares: 0.655,
    servicesExEnergy: 58.0,
    coreGoods: 20.0,
  },
  2024: {
    food: 13.3,
    energy: 6.5,
    shelter: 36.5,
    usedVehicles: 2.3,
    airfares: 0.65,
    servicesExEnergy: 58.5,
    coreGoods: 19.5,
  },
};

const SERIES = {
  headline: "CPIAUCSL",
  food: "CPIUFDSL",
  energy: "CPIENGSL",
  shelter: "CUSR0000SAH1",
  usedVehicles: "CUSR0000SETA02",
  airfares: "CUSR0000SETG01",
  coreGoods: "CUSR0000SACL1E",
  servicesExEnergy: "CUSR0000SASLE",
  coreCpi: "CPILFESL",
  pce: "PCEPI",
  corePce: "PCEPILFE",
};

/** BEA Table 2.4.4 chain-type price indexes on FRED */
const PCE_PRICE_MONTHLY = {
  goods: "DGDSRG3M086SBEA",
  durables: "DDURRG3M086SBEA",
  nondurables: "DNDGRG3M086SBEA",
  services: "DSERRG3M086SBEA",
  food: "DFXARG3M086SBEA",
  energy: "DNRGRG3M086SBEA",
};

const PCE_PRICE_QUARTERLY = {
  housingUtilities: "DHUTRG3Q086SBEA",
  healthCare: "DHLCRG3Q086SBEA",
  motorVehicles: "DMOTRG3Q086SBEA",
  transportServices: "DTRSRG3Q086SBEA",
};

/** Current-dollar PCE for share × y/y contribution approximation */
const PCE_EXPENDITURE = {
  total: "PCE",
  durables: "PCEDG",
  nondurables: "PCEND",
  services: "PCES",
};

function parseFredCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  const lines = text.split(/\r?\n/).slice(1);
  const map = new Map();
  for (const line of lines) {
    const [date, value] = line.split(",");
    if (!date || value === "" || value === ".") continue;
    const v = Number(value);
    if (!Number.isFinite(v)) continue;
    map.set(date.slice(0, 7), v); // YYYY-MM
  }
  return map;
}

/** Expand quarterly FRED (dated at quarter start) across the three months of that quarter. */
function parseFredQuarterlyToMonthly(filePath) {
  const raw = parseFredCsv(filePath);
  const out = new Map();
  for (const [ym, v] of raw) {
    const [y, m] = ym.split("-").map(Number);
    // Quarter start months are 1,4,7,10
    const qStart = m;
    for (let i = 0; i < 3; i++) {
      const mm = qStart + i;
      if (mm > 12) break;
      out.set(`${y}-${String(mm).padStart(2, "0")}`, v);
    }
  }
  return out;
}

function yoy(map, ym) {
  const [y, m] = ym.split("-").map(Number);
  const prev = `${y - 1}-${String(m).padStart(2, "0")}`;
  const cur = map.get(ym);
  const base = map.get(prev);
  if (cur == null || base == null || base === 0) return null;
  return ((cur / base - 1) * 100);
}

function riForContributionMonth(ym) {
  // BLS: use relative importance at start of 12-month window ≈ Dec of (year-1) for calendar alignment;
  // we use Dec of prior calendar year as the RI vintage for months in year Y.
  const year = Number(ym.slice(0, 4));
  const decYear = year - 1;
  const keys = Object.keys(RI_BY_DEC)
    .map(Number)
    .sort((a, b) => a - b);
  let pick = keys[0];
  for (const k of keys) {
    if (k <= decYear) pick = k;
  }
  return RI_BY_DEC[pick];
}

function contrib(riPct, componentYoy) {
  if (componentYoy == null || riPct == null) return null;
  return (riPct / 100) * componentYoy;
}

function parseShapiroYoy(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  const lines = text.split(/\r?\n/).slice(1);
  const out = new Map();
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(",");
    const stamp = parts[0].trim(); // 2021m8 or 2021m10
    const demand = Number(parts[1]);
    const ambiguous = Number(parts[2]);
    const supply = Number(parts[3]);
    const m = stamp.match(/(\d{4})m(\d{1,2})/i);
    if (!m) continue;
    const ym = `${m[1]}-${String(Number(m[2])).padStart(2, "0")}`;
    out.set(ym, {
      demand: Number.isFinite(demand) ? demand : null,
      ambiguous: Number.isFinite(ambiguous) ? ambiguous : null,
      supply: Number.isFinite(supply) ? supply : null,
    });
  }
  return out;
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function lagYm(ym, monthsBack) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 - monthsBack, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function pceShareContrib(expMap, totalMap, priceMap, ym) {
  const baseYm = lagYm(ym, 12);
  const exp = expMap.get(baseYm);
  const tot = totalMap.get(baseYm);
  const py = yoy(priceMap, ym);
  if (exp == null || tot == null || tot === 0 || py == null) return null;
  return (exp / tot) * py;
}

function main() {
  const maps = {};
  for (const [key, id] of Object.entries(SERIES)) {
    const fp = path.join(fredDir, `${id}.csv`);
    if (!fs.existsSync(fp)) throw new Error(`Missing ${fp}`);
    maps[key] = parseFredCsv(fp);
  }

  const pcePrice = {};
  for (const [key, id] of Object.entries(PCE_PRICE_MONTHLY)) {
    const fp = path.join(fredDir, `${id}.csv`);
    if (!fs.existsSync(fp)) throw new Error(`Missing ${fp}`);
    pcePrice[key] = parseFredCsv(fp);
  }
  for (const [key, id] of Object.entries(PCE_PRICE_QUARTERLY)) {
    const fp = path.join(fredDir, `${id}.csv`);
    if (!fs.existsSync(fp)) throw new Error(`Missing ${fp}`);
    pcePrice[key] = parseFredQuarterlyToMonthly(fp);
  }

  const pceExp = {};
  for (const [key, id] of Object.entries(PCE_EXPENDITURE)) {
    const fp = path.join(fredDir, `${id}.csv`);
    if (!fs.existsSync(fp)) throw new Error(`Missing ${fp}`);
    pceExp[key] = parseFredCsv(fp);
  }

  const shapiro = parseShapiroYoy(
    path.join(root, "data", "shapiro-headline-yoy.csv")
  );

  // Union of months from headline, filtered to presentation window
  const months = [...maps.headline.keys()]
    .filter((ym) => ym >= "2019-01" && ym <= "2026-12")
    .sort();

  const observations = [];
  for (const ym of months) {
    const headlineYoy = yoy(maps.headline, ym);
    if (headlineYoy == null) continue;

    const ri = riForContributionMonth(ym);
    const foodYoy = yoy(maps.food, ym);
    const energyYoy = yoy(maps.energy, ym);
    const shelterYoy = yoy(maps.shelter, ym);
    const usedYoy = yoy(maps.usedVehicles, ym);
    const airYoy = yoy(maps.airfares, ym);
    const coreGoodsYoy = yoy(maps.coreGoods, ym);
    const svcYoy = yoy(maps.servicesExEnergy, ym);

    const cFood = contrib(ri.food, foodYoy);
    const cEnergy = contrib(ri.energy, energyYoy);
    const cShelter = contrib(ri.shelter, shelterYoy);
    const cUsed = contrib(ri.usedVehicles, usedYoy);
    const cAir = contrib(ri.airfares, airYoy);
    const cCoreGoods = contrib(ri.coreGoods, coreGoodsYoy);
    const cSvc = contrib(ri.servicesExEnergy, svcYoy);
    // Proxy: services ex-energy & shelter
    const cSupercore =
      cSvc != null && cShelter != null ? cSvc - cShelter : null;
    // Core goods ex used vehicles (approx)
    const cCoreGoodsExUsed =
      cCoreGoods != null && cUsed != null ? cCoreGoods - cUsed : null;

    const shap = shapiro.get(ym);
    const pceYoy = yoy(maps.pce, ym);
    const corePceYoy = yoy(maps.corePce, ym);
    const coreCpiYoy = yoy(maps.coreCpi, ym);

    const pceCategories = {};
    for (const key of Object.keys(pcePrice)) {
      const v = yoy(pcePrice[key], ym);
      pceCategories[key] = v == null ? null : round1(v);
    }

    const cDur = pceShareContrib(
      pceExp.durables,
      pceExp.total,
      pcePrice.durables,
      ym
    );
    const cNd = pceShareContrib(
      pceExp.nondurables,
      pceExp.total,
      pcePrice.nondurables,
      ym
    );
    const cSvcPce = pceShareContrib(
      pceExp.services,
      pceExp.total,
      pcePrice.services,
      ym
    );

    observations.push({
      date: ym,
      headlineYoy: round1(headlineYoy),
      coreCpiYoy: coreCpiYoy == null ? null : round1(coreCpiYoy),
      pceYoy: pceYoy == null ? null : round1(pceYoy),
      corePceYoy: corePceYoy == null ? null : round1(corePceYoy),
      contributions: {
        food: cFood == null ? null : round1(cFood),
        energy: cEnergy == null ? null : round1(cEnergy),
        shelter: cShelter == null ? null : round1(cShelter),
        usedVehicles: cUsed == null ? null : round1(cUsed),
        airfares: cAir == null ? null : round1(cAir),
        coreGoodsExUsed:
          cCoreGoodsExUsed == null ? null : round1(cCoreGoodsExUsed),
        servicesExShelter: cSupercore == null ? null : round1(cSupercore),
      },
      componentYoy: {
        food: foodYoy == null ? null : round1(foodYoy),
        energy: energyYoy == null ? null : round1(energyYoy),
        shelter: shelterYoy == null ? null : round1(shelterYoy),
        usedVehicles: usedYoy == null ? null : round1(usedYoy),
        airfares: airYoy == null ? null : round1(airYoy),
      },
      pceCategories,
      pceContributions: {
        durables: cDur == null ? null : round1(cDur),
        nondurables: cNd == null ? null : round1(cNd),
        services: cSvcPce == null ? null : round1(cSvcPce),
      },
      shapiro: shap
        ? {
            demand: shap.demand == null ? null : round1(shap.demand),
            supply: shap.supply == null ? null : round1(shap.supply),
            ambiguous:
              shap.ambiguous == null ? null : round1(shap.ambiguous),
          }
        : null,
      riVintage: Object.keys(RI_BY_DEC)
        .map(Number)
        .filter((y) => y <= Number(ym.slice(0, 4)) - 1)
        .sort((a, b) => a - b)
        .at(-1),
    });
  }

  const payload = {
    meta: {
      builtAt: new Date().toISOString().slice(0, 10),
      window: { start: observations[0]?.date, end: observations.at(-1)?.date },
      methodology:
        "Approximate CPI y/y contribution = (BLS Dec relative importance at start of window / 100) × component y/y. Approximate PCE contribution for durables/nondurables/services = (category current-dollar share at t−12) × category price y/y. Shapiro demand/supply are SF Fed PCE y/y contributions.",
      sources: [
        {
          name: "FRED / BLS CPI",
          series: Object.values(SERIES),
          url: "https://fred.stlouisfed.org/",
        },
        {
          name: "FRED / BEA PCE price indexes (Table 2.4.4)",
          series: [
            ...Object.values(PCE_PRICE_MONTHLY),
            ...Object.values(PCE_PRICE_QUARTERLY),
          ],
          url: "https://fred.stlouisfed.org/release/tables?eid=44067&rid=53",
        },
        {
          name: "FRED / BEA PCE current-dollar (shares)",
          series: Object.values(PCE_EXPENDITURE),
          url: "https://fred.stlouisfed.org/",
        },
        {
          name: "BLS Relative Importance",
          url: "https://www.bls.gov/cpi/tables/relative-importance/",
        },
        {
          name: "SF Fed Shapiro supply/demand PCE",
          url: "https://www.frbsf.org/research-and-insights/data-and-indicators/supply-and-demand-driven-pce-inflation/",
        },
      ],
      seriesIds: SERIES,
      pcePriceSeries: { ...PCE_PRICE_MONTHLY, ...PCE_PRICE_QUARTERLY },
      pceExpenditureSeries: PCE_EXPENDITURE,
      relativeImportanceByDec: RI_BY_DEC,
      update:
        "Refresh CSVs in data/fred and data/shapiro-*.csv, then run npm run data:inflation",
    },
    observations,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(
    `Wrote ${observations.length} months → ${path.relative(root, outPath)} (${payload.meta.window.start} … ${payload.meta.window.end})`
  );
}

main();
