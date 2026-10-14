import { AS_OF } from "./assemble";
import type { Baseline, Observation } from "./types";

const TIMEOUT_MS = 4000;

type Point = { date: string; value: number };

const FRED_SERIES: { key: string; id: string; label: string }[] = [
  { key: "fedfunds", id: "DFF", label: "effective federal funds rate" },
  { key: "headlineInflation", id: "PCEPI", label: "headline PCE" },
  { key: "coreInflation", id: "PCEPILFE", label: "core PCE" },
  { key: "unemployment", id: "UNRATE", label: "unemployment rate" },
  { key: "realGdp", id: "GDPC1", label: "real GDP" },
  { key: "potentialGdp", id: "GDPPOT", label: "CBO potential GDP" },
  { key: "tips10", id: "DFII10", label: "10-year TIPS yield" },
  { key: "breakeven", id: "T10YIE", label: "10-year breakeven" },
];

async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
      headers: {
        Accept: "text/csv,application/json,text/plain,*/*",
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (!response.ok) return null;
    const text = await response.text();
    if (!text || text.trim().length < 8) return null;
    return text;
  } catch {
    return null;
  }
}

function parseFred(text: string): Point[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const out: Point[] = [];
  for (let i = 1; i < lines.length; i++) {
    const comma = lines[i].indexOf(",");
    if (comma < 0) continue;
    const date = lines[i].slice(0, comma).trim();
    const raw = lines[i].slice(comma + 1).trim().replace(/"/g, "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (raw === "" || raw === ".") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    out.push({ date, value });
  }
  return out;
}

function latest(points: Point[]): Point | null {
  return points.length ? points[points.length - 1] : null;
}

function quarterLabel(date: string) {
  const month = Number(date.slice(5, 7));
  const year = date.slice(0, 4);
  return `${year}Q${Math.floor((month - 1) / 3) + 1}`;
}

function monthLabel(date: string) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`;
}

function yoy(points: Point[]) {
  const last = latest(points);
  if (!last) return null;
  const prevDate = `${Number(last.date.slice(0, 4)) - 1}${last.date.slice(4)}`;
  const prev = points.find((point) => point.date === prevDate);
  if (!prev || prev.value === 0) return null;
  return {
    value: 100 * (last.value / prev.value - 1),
    date: last.date,
    prevDate,
    level: last.value,
    prevLevel: prev.value,
  };
}

function kept(obs: Observation | undefined) {
  if (!obs || obs.value == null) return "No saved value is available.";
  if (obs.status === "snapshot") return "The snapshot value is shown.";
  return "The reference file is shown.";
}

function failed(label: string, obs: Observation | undefined) {
  return `Live pull failed for ${label}. ${kept(obs)}`;
}

function liveCopy(obs: Observation, patch: Partial<Observation>): Observation {
  return { ...obs, ...patch, status: "live" };
}

function splitCsv(line: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += char;
  }
  out.push(cur.trim());
  return out;
}

function treasuryTenYear(text: string, column: string): Point | null {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headerIndex = lines.findIndex((line) => /^date,/i.test(line.trim()));
  if (headerIndex < 0) return null;
  const header = splitCsv(lines[headerIndex]).map((cell) => cell.toLowerCase());
  const columnIndex = header.findIndex((cell) => cell === column.toLowerCase());
  if (columnIndex < 0) return null;
  let best: Point | null = null;
  for (const line of lines.slice(headerIndex + 1)) {
    const cells = splitCsv(line);
    const rawDate = cells[0];
    const match = rawDate?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) continue;
    const date = `${match[3]}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
    const value = Number(cells[columnIndex]);
    if (!Number.isFinite(value)) continue;
    if (!best || date > best.date) best = { date, value };
  }
  return best;
}

function treasuryUrl(kind: "nominal" | "real") {
  const year = new Date().getUTCFullYear();
  const type =
    kind === "nominal"
      ? "daily_treasury_yield_curve"
      : "daily_treasury_real_yield_curve";
  return `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?type=${type}&field_tdr_date_value=${year}&page&_format=csv`;
}

export async function applyLive(baseline: Baseline): Promise<Baseline> {
  const series: Record<string, Observation> = { ...baseline.series };
  const failures = [...baseline.failures];

  const fredUrls = FRED_SERIES.map(
    (item) =>
      `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${item.id}`,
  );
  const [fredTexts, effrText, nominalText, realText] = await Promise.all([
    Promise.all(fredUrls.map((url) => fetchText(url))),
    fetchText(
      "https://markets.newyorkfed.org/api/rates/unsecured/effr/last/1.json",
    ),
    fetchText(treasuryUrl("nominal")),
    fetchText(treasuryUrl("real")),
  ]);

  const fredPoints = fredTexts.map((text) => (text ? parseFred(text) : []));

  const dff = latest(fredPoints[0]);
  let effr: { date: string; value: number } | null = null;
  if (effrText) {
    try {
      const parsed = JSON.parse(effrText) as {
        refRates?: { effectiveDate?: string; percentRate?: number }[];
      };
      const row = parsed.refRates?.[0];
      if (
        row?.effectiveDate &&
        /^\d{4}-\d{2}-\d{2}$/.test(row.effectiveDate) &&
        typeof row.percentRate === "number" &&
        Number.isFinite(row.percentRate)
      ) {
        effr = { date: row.effectiveDate, value: row.percentRate };
      }
    } catch {
      effr = null;
    }
  }
  let fundsLive = false;
  const useFredFunds = Boolean(dff && (!effr || dff.date >= effr.date));
  if (useFredFunds && dff && series.fedfunds) {
    series.fedfunds = liveCopy(series.fedfunds, {
      value: dff.value,
      date: dff.date,
      dateLabel: dff.date,
      source:
        "FRED DFF live pull, effective federal funds rate. Not the target range.",
      fredId: "DFF",
      detail: "Latest observation from the FRED graph CSV.",
    });
    fundsLive = true;
  } else if (effr && series.fedfunds) {
    series.fedfunds = liveCopy(series.fedfunds, {
      value: effr.value,
      date: effr.date,
      dateLabel: effr.date,
      source:
        "Federal Reserve Bank of New York, effective federal funds rate (EFFR). Not the target range.",
      fredId: null,
      detail: dff
        ? `NY Fed EFFR is dated ${effr.date}, after the FRED DFF observation of ${dff.date}.`
        : "FRED DFF did not return. This print is the NY Fed EFFR percentRate.",
    });
    fundsLive = true;
  } else {
    failures.push(failed("the effective federal funds rate", series.fedfunds));
  }

  const headline = yoy(fredPoints[1]);
  if (headline && series.headlineInflation) {
    series.headlineInflation = liveCopy(series.headlineInflation, {
      value: headline.value,
      date: headline.date,
      dateLabel: monthLabel(headline.date),
      source:
        "FRED PCEPI live pull. Year-over-year change in the price index.",
      fredId: "PCEPI",
      detail: `100 × (${headline.level} / ${headline.prevLevel} − 1), ${headline.date} over ${headline.prevDate}.`,
    });
  } else {
    failures.push(failed("headline PCE inflation", series.headlineInflation));
  }

  const core = yoy(fredPoints[2]);
  if (core && series.coreInflation) {
    series.coreInflation = liveCopy(series.coreInflation, {
      value: core.value,
      date: core.date,
      dateLabel: monthLabel(core.date),
      source:
        "FRED PCEPILFE live pull. Year-over-year change in the core price index. The Phillips curve uses this print.",
      fredId: "PCEPILFE",
      detail: `100 × (${core.level} / ${core.prevLevel} − 1), ${core.date} over ${core.prevDate}.`,
    });
  } else {
    failures.push(failed("core PCE inflation", series.coreInflation));
  }

  const unrate = latest(fredPoints[3]);
  if (unrate && series.unemployment) {
    series.unemployment = liveCopy(series.unemployment, {
      value: unrate.value,
      date: unrate.date,
      dateLabel: monthLabel(unrate.date),
      source: "FRED UNRATE live pull, civilian unemployment rate.",
      fredId: "UNRATE",
      detail: "Latest observation from the FRED graph CSV.",
    });
  } else {
    failures.push(failed("the unemployment rate", series.unemployment));
  }

  const gdpPoints = fredPoints[4];
  const potPoints = fredPoints[5].filter((point) => point.date <= AS_OF);
  const gdpLast = latest(gdpPoints);
  const potCurrent = potPoints.length ? potPoints[potPoints.length - 1] : null;
  if (gdpLast && series.realGdp) {
    series.realGdp = liveCopy(series.realGdp, {
      value: gdpLast.value,
      date: gdpLast.date,
      dateLabel: quarterLabel(gdpLast.date),
      source: "FRED GDPC1 live pull, BEA real gross domestic product.",
      fredId: "GDPC1",
      detail: `Latest observation ${gdpLast.date}.`,
    });
  } else {
    failures.push(failed("real GDP", series.realGdp));
  }
  if (potCurrent && series.potentialGdp) {
    series.potentialGdp = liveCopy(series.potentialGdp, {
      value: potCurrent.value,
      date: potCurrent.date,
      dateLabel: quarterLabel(potCurrent.date),
      source: "FRED GDPPOT live pull, CBO potential GDP.",
      fredId: "GDPPOT",
      detail: `Latest observation on or before ${AS_OF}. Later projection rows are not used.`,
    });
  } else {
    failures.push(failed("CBO potential GDP", series.potentialGdp));
  }

  const potAligned = gdpLast
    ? potPoints.find((point) => point.date === gdpLast.date) ?? null
    : null;
  if (gdpLast && potAligned && series.outputGap) {
    series.outputGap = liveCopy(series.outputGap, {
      value: 100 * (gdpLast.value / potAligned.value - 1),
      date: gdpLast.date,
      dateLabel: quarterLabel(gdpLast.date),
      source: "Calculated from the live FRED GDPC1 and GDPPOT pulls for the same quarter.",
      fredId: null,
      detail: `100 × (${gdpLast.value} / ${potAligned.value} − 1) on ${gdpLast.date}.`,
    });
  } else if (!gdpLast || !potCurrent) {
    failures.push(failed("the output gap", series.outputGap));
  } else {
    failures.push(
      `Live pull failed for the output gap. Real GDP and potential GDP did not share a quarter in the pull. ${kept(series.outputGap)}`,
    );
  }

  const tips = latest(fredPoints[6]);
  const treasuryReal = realText ? treasuryTenYear(realText, "10 YR") : null;
  const useFredTips = Boolean(tips && (!treasuryReal || tips.date >= treasuryReal.date));
  if (useFredTips && tips && series.tips10) {
    series.tips10 = liveCopy(series.tips10, {
      value: tips.value,
      date: tips.date,
      dateLabel: tips.date,
      source: "FRED DFII10 live pull, 10-year Treasury inflation-indexed yield.",
      fredId: "DFII10",
      detail: "Latest observation from the FRED graph CSV.",
    });
  } else if (treasuryReal && series.tips10) {
    series.tips10 = liveCopy(series.tips10, {
      value: treasuryReal.value,
      date: treasuryReal.date,
      dateLabel: treasuryReal.date,
      source: "U.S. Treasury daily real yield curve, 10-year constant maturity.",
      fredId: null,
      detail: tips
        ? `Treasury real yield is dated ${treasuryReal.date}, after the FRED DFII10 observation of ${tips.date}.`
        : "FRED DFII10 did not return. Daily Treasury real yield curve, column 10 YR.",
    });
  } else {
    failures.push(failed("the 10-year TIPS yield", series.tips10));
  }

  const breakeven = latest(fredPoints[7]);
  if (breakeven && series.breakeven) {
    series.breakeven = liveCopy(series.breakeven, {
      value: breakeven.value,
      date: breakeven.date,
      dateLabel: breakeven.date,
      source: "FRED T10YIE live pull, 10-year breakeven inflation.",
      fredId: "T10YIE",
      detail: "Latest observation from the FRED graph CSV.",
    });
  } else {
    failures.push(failed("the 10-year breakeven", series.breakeven));
  }

  const treasuryNominal = nominalText
    ? treasuryTenYear(nominalText, "10 Yr")
    : null;
  if (!treasuryNominal) {
    failures.push(
      "Live pull failed for the Treasury yield curve. The ACM yield, the expected path, the term premium, and the Board par yield stay on the saved prints.",
    );
  }

  const funds = series.fedfunds;
  const coreObs = series.coreInflation;
  if (
    funds?.value != null &&
    coreObs?.value != null &&
    series.realPolicy &&
    (fundsLive || series.coreInflation.status === "live")
  ) {
    series.realPolicy = liveCopy(series.realPolicy, {
      value: funds.value - coreObs.value,
      date: funds.date,
      dateLabel: funds.dateLabel,
      source: "Calculated: effective federal funds rate minus core PCE inflation.",
      fredId: null,
      detail: `${funds.value} dated ${funds.date} minus core PCE of ${coreObs.value} through ${coreObs.date}.`,
    });
  }

  return {
    ...baseline,
    readAt: new Date().toISOString(),
    failures,
    series,
  };
}
