/**
 * Shared FRED → inflation / rates builders (used by build scripts conceptually
 * and by /api/data/refresh at runtime). No API key — public FRED CSV graphs.
 */

export const INFLATION_SERIES_IDS = {
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
} as const;

/** Monthly BEA/FRED PCE chain-type price indexes */
export const PCE_PRICE_MONTHLY_IDS = {
  goods: "DGDSRG3M086SBEA",
  durables: "DDURRG3M086SBEA",
  nondurables: "DNDGRG3M086SBEA",
  services: "DSERRG3M086SBEA",
  food: "DFXARG3M086SBEA",
  energy: "DNRGRG3M086SBEA",
} as const;

/** Quarterly BEA/FRED PCE chain-type price indexes (expanded to months) */
export const PCE_PRICE_QUARTERLY_IDS = {
  housingUtilities: "DHUTRG3Q086SBEA",
  healthCare: "DHLCRG3Q086SBEA",
  motorVehicles: "DMOTRG3Q086SBEA",
  transportServices: "DTRSRG3Q086SBEA",
  apparel: "DCLORG3Q086SBEA",
  recreationGoods: "DREQRG3Q086SBEA",
  recreationServices: "DRCARG3Q086SBEA",
  foodServices: "DFSARG3Q086SBEA",
  financialServices: "DIFSRG3Q086SBEA",
  otherServices: "DOTSRG3Q086SBEA",
} as const;

/** CPI / PPI electronics & semiconductor overlays (monthly; not CPI contribution math) */
export const TECH_OVERLAY_IDS = {
  cpiComputers: "CUSR0000SEEE01",
  cpiItHardware: "CUSR0000SEEE",
  ppiSemiconductors: "PCU334413334413",
  ppiElectronicComponents: "WPU1178",
} as const;

/** Current-dollar PCE for share-based contribution approximation */
export const PCE_EXPENDITURE_IDS = {
  total: "PCE",
  durables: "PCEDG",
  nondurables: "PCEND",
  services: "PCES",
} as const;

export const RATES_SERIES_IDS = {
  tips5y: "DFII5",
  tips10y: "DFII10",
  be5y: "T5YIE",
  fwd5y5y: "T5YIFR",
  dgs5: "DGS5",
  dgs10: "DGS10",
} as const;

/** BLS CPI-U Relative Importance (Dec tables), public published figures */
const RI_BY_DEC: Record<
  number,
  {
    food: number;
    energy: number;
    shelter: number;
    usedVehicles: number;
    airfares: number;
    servicesExEnergy: number;
    coreGoods: number;
  }
> = {
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

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function parseFredCsvText(text: string): Map<string, number> {
  const lines = text.trim().split(/\r?\n/).slice(1);
  const map = new Map<string, number>();
  for (const line of lines) {
    const [date, value] = line.split(",");
    if (!date || value === "" || value === ".") continue;
    const v = Number(value);
    if (!Number.isFinite(v)) continue;
    map.set(date.slice(0, 7), v);
  }
  return map;
}

/** Expand quarterly FRED (dated at quarter start) across three months. */
export function parseFredQuarterlyTextToMonthly(text: string): Map<string, number> {
  const raw = parseFredCsvText(text);
  const out = new Map<string, number>();
  for (const [ym, v] of raw) {
    const [y, m] = ym.split("-").map(Number);
    for (let i = 0; i < 3; i++) {
      const mm = m + i;
      if (mm > 12) break;
      out.set(`${y}-${String(mm).padStart(2, "0")}`, v);
    }
  }
  return out;
}

function lagYm(ym: string, monthsBack: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 - monthsBack, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Daily FRED → monthly average */
export function parseFredDailyToMonthly(text: string): Map<string, number> {
  const lines = text.trim().split(/\r?\n/).slice(1);
  const byMonth = new Map<string, { sum: number; n: number }>();
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
  const out = new Map<string, number>();
  for (const [ym, { sum, n }] of byMonth) {
    out.set(ym, round2(sum / n));
  }
  return out;
}

function yoy(map: Map<string, number>, ym: string): number | null {
  const [y, m] = ym.split("-").map(Number);
  const prev = `${y - 1}-${String(m).padStart(2, "0")}`;
  const cur = map.get(ym);
  const base = map.get(prev);
  if (cur == null || base == null || base === 0) return null;
  return (cur / base - 1) * 100;
}

function riForContributionMonth(ym: string) {
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

function contrib(riPct: number, componentYoy: number | null) {
  if (componentYoy == null) return null;
  return (riPct / 100) * componentYoy;
}

export type ShapiroMap = Map<
  string,
  { demand: number | null; supply: number | null; ambiguous: number | null }
>;

export function parseShapiroYoyText(text: string): ShapiroMap {
  const lines = text.trim().split(/\r?\n/).slice(1);
  const out: ShapiroMap = new Map();
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(",");
    const stamp = parts[0].trim();
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

export type BuiltObservation = {
  date: string;
  headlineYoy: number;
  coreCpiYoy: number | null;
  pceYoy: number | null;
  corePceYoy: number | null;
  contributions: {
    food: number | null;
    energy: number | null;
    shelter: number | null;
    usedVehicles: number | null;
    airfares: number | null;
    coreGoodsExUsed: number | null;
    servicesExShelter: number | null;
  };
  componentYoy: {
    food: number | null;
    energy: number | null;
    shelter: number | null;
    usedVehicles: number | null;
    airfares: number | null;
  };
  pceCategories?: Record<string, number | null>;
  techCategories?: Record<string, number | null>;
  pceContributions?: {
    durables: number | null;
    nondurables: number | null;
    services: number | null;
  };
  shapiro: {
    demand: number | null;
    supply: number | null;
    ambiguous: number | null;
  } | null;
  riVintage: number | undefined;
};

export type PceCsvBundle = {
  monthly: Record<keyof typeof PCE_PRICE_MONTHLY_IDS, string>;
  quarterly: Record<keyof typeof PCE_PRICE_QUARTERLY_IDS, string>;
  expenditure: Record<keyof typeof PCE_EXPENDITURE_IDS, string>;
};

function pceShareContrib(
  expMap: Map<string, number>,
  totalMap: Map<string, number>,
  priceMap: Map<string, number>,
  ym: string
) {
  const baseYm = lagYm(ym, 12);
  const exp = expMap.get(baseYm);
  const tot = totalMap.get(baseYm);
  const py = yoy(priceMap, ym);
  if (exp == null || tot == null || tot === 0 || py == null) return null;
  return (exp / tot) * py;
}

export function buildInflationObservations(
  csvByKey: Record<keyof typeof INFLATION_SERIES_IDS, string>,
  shapiro: ShapiroMap | null,
  pceCsv?: PceCsvBundle | null,
  techCsv?: Record<keyof typeof TECH_OVERLAY_IDS, string> | null
): BuiltObservation[] {
  const maps = {} as Record<
    keyof typeof INFLATION_SERIES_IDS,
    Map<string, number>
  >;
  for (const key of Object.keys(INFLATION_SERIES_IDS) as Array<
    keyof typeof INFLATION_SERIES_IDS
  >) {
    maps[key] = parseFredCsvText(csvByKey[key]);
  }

  const pcePrice: Record<string, Map<string, number>> = {};
  const pceExp: Record<string, Map<string, number>> = {};
  if (pceCsv) {
    for (const key of Object.keys(PCE_PRICE_MONTHLY_IDS) as Array<
      keyof typeof PCE_PRICE_MONTHLY_IDS
    >) {
      pcePrice[key] = parseFredCsvText(pceCsv.monthly[key]);
    }
    for (const key of Object.keys(PCE_PRICE_QUARTERLY_IDS) as Array<
      keyof typeof PCE_PRICE_QUARTERLY_IDS
    >) {
      pcePrice[key] = parseFredQuarterlyTextToMonthly(pceCsv.quarterly[key]);
    }
    for (const key of Object.keys(PCE_EXPENDITURE_IDS) as Array<
      keyof typeof PCE_EXPENDITURE_IDS
    >) {
      pceExp[key] = parseFredCsvText(pceCsv.expenditure[key]);
    }
  }

  const techMaps = {} as Record<
    keyof typeof TECH_OVERLAY_IDS,
    Map<string, number>
  >;
  if (techCsv) {
    for (const key of Object.keys(TECH_OVERLAY_IDS) as Array<
      keyof typeof TECH_OVERLAY_IDS
    >) {
      techMaps[key] = parseFredCsvText(techCsv[key]);
    }
  }

  const months = [...maps.headline.keys()]
    .filter((ym) => ym >= "2019-01")
    .sort();

  const observations: BuiltObservation[] = [];
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
    const cSupercore =
      cSvc != null && cShelter != null ? cSvc - cShelter : null;
    const cCoreGoodsExUsed =
      cCoreGoods != null && cUsed != null ? cCoreGoods - cUsed : null;

    const shap = shapiro?.get(ym) ?? null;
    const pceYoy = yoy(maps.pce, ym);
    const corePceYoy = yoy(maps.corePce, ym);
    const coreCpiYoy = yoy(maps.coreCpi, ym);

    const pceCategories: Record<string, number | null> = {};
    for (const key of Object.keys(pcePrice)) {
      const v = yoy(pcePrice[key], ym);
      pceCategories[key] = v == null ? null : round1(v);
    }

    const techCategories: Record<string, number | null> = {};
    for (const key of Object.keys(techMaps) as Array<
      keyof typeof TECH_OVERLAY_IDS
    >) {
      const v = yoy(techMaps[key], ym);
      techCategories[key] = v == null ? null : round1(v);
    }

    let pceContributions:
      | {
          durables: number | null;
          nondurables: number | null;
          services: number | null;
        }
      | undefined;
    if (pceCsv && pceExp.total) {
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
      pceContributions = {
        durables: cDur == null ? null : round1(cDur),
        nondurables: cNd == null ? null : round1(cNd),
        services: cSvcPce == null ? null : round1(cSvcPce),
      };
    }

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
      pceCategories: Object.keys(pceCategories).length
        ? pceCategories
        : undefined,
      techCategories: Object.keys(techCategories).length
        ? techCategories
        : undefined,
      pceContributions,
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
  return observations;
}

export type RateObservation = {
  date: string;
  tips5y: number | null;
  tips10y: number | null;
  be5y: number | null;
  fwd5y5y: number | null;
  dgs5: number | null;
  dgs10: number | null;
};

export function buildRatesObservations(
  csvByKey: Record<keyof typeof RATES_SERIES_IDS, string>
): RateObservation[] {
  const maps = {} as Record<
    keyof typeof RATES_SERIES_IDS,
    Map<string, number>
  >;
  for (const key of Object.keys(RATES_SERIES_IDS) as Array<
    keyof typeof RATES_SERIES_IDS
  >) {
    maps[key] = parseFredDailyToMonthly(csvByKey[key]);
  }
  const months = new Set<string>();
  for (const m of Object.values(maps)) {
    for (const ym of m.keys()) {
      if (ym >= "2019-01") months.add(ym);
    }
  }
  return [...months].sort().map((ym) => ({
    date: ym,
    tips5y: maps.tips5y.get(ym) ?? null,
    tips10y: maps.tips10y.get(ym) ?? null,
    be5y: maps.be5y.get(ym) ?? null,
    fwd5y5y: maps.fwd5y5y.get(ym) ?? null,
    dgs5: maps.dgs5.get(ym) ?? null,
    dgs10: maps.dgs10.get(ym) ?? null,
  }));
}

export function fredCsvUrl(seriesId: string) {
  return `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`;
}
