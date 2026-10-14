import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { FIXED_SERIES } from "./fixed-series";
import type { Baseline, Observation, SeriesStatus } from "./types";

export const AS_OF = "2026-10-14";

const REFERENCE_DIR = path.join(process.cwd(), "data", "reference");

type Point = { date: string; value: number };

function parseFred(text: string): Point[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const out: Point[] = [];
  for (let i = 1; i < lines.length; i++) {
    const comma = lines[i].indexOf(",");
    if (comma < 0) continue;
    const date = lines[i].slice(0, comma).trim();
    const raw = lines[i].slice(comma + 1).trim();
    if (!date || raw === "" || raw === ".") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    out.push({ date, value });
  }
  return out;
}

function readSeries(file: string): Point[] | null {
  const full = path.join(REFERENCE_DIR, file);
  if (!existsSync(full)) return null;
  try {
    return parseFred(readFileSync(full, "utf8"));
  } catch {
    return null;
  }
}

function latest(points: Point[]): Point | null {
  return points.length ? points[points.length - 1] : null;
}

function quarterLabel(date: string) {
  const month = Number(date.slice(5, 7));
  const year = date.slice(0, 4);
  const q = Math.floor((month - 1) / 3) + 1;
  return `${year}Q${q}`;
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
  const month = Number(date.slice(5, 7));
  return `${months[month - 1]} ${date.slice(0, 4)}`;
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

function obs(
  partial: Omit<Observation, "status"> & { status?: SeriesStatus },
  status: SeriesStatus,
): Observation {
  return { ...partial, status };
}

export function assemble(fallback?: Baseline): Baseline {
  const failures: string[] = [];
  const series: Record<string, Observation> = {};

  const take = (key: string, built: Observation | null, file: string) => {
    if (built) {
      series[key] = built;
      return;
    }
    const saved = fallback?.series[key];
    if (saved && saved.value != null) {
      series[key] = { ...saved, status: "snapshot" };
      failures.push(
        `${saved.label}: data/reference/${file} could not be read. The snapshot value is shown.`,
      );
      return;
    }
    series[key] = obs(
      {
        key,
        label: saved?.label ?? key,
        units: saved?.units ?? "",
        value: null,
        date: null,
        dateLabel: "Missing",
        source: saved?.source ?? "",
        fredId: saved?.fredId ?? null,
        detail: `${file} is not in data/reference, and the snapshot has no value.`,
      },
      "missing",
    );
    failures.push(`${series[key].label} is missing.`);
  };

  const dff = readSeries("DFF.csv");
  const dffLast = dff ? latest(dff) : null;
  take(
    "fedfunds",
    dffLast
      ? obs(
          {
            key: "fedfunds",
            label: "Effective federal funds rate",
            units: "percent",
            value: dffLast.value,
            date: dffLast.date,
            dateLabel: dffLast.date,
            source: "FRED DFF, Board of Governors via the St. Louis Fed. Effective rate, not the target range.",
            fredId: "DFF",
            detail: "Last observation in data/reference/DFF.csv.",
          },
          "reference",
        )
      : null,
    "DFF.csv",
  );

  const pce = readSeries("PCEPI.csv");
  const pceYoy = pce ? yoy(pce) : null;
  take(
    "headlineInflation",
    pceYoy
      ? obs(
          {
            key: "headlineInflation",
            label: "Headline PCE inflation",
            units: "percent, year over year",
            value: pceYoy.value,
            date: pceYoy.date,
            dateLabel: monthLabel(pceYoy.date),
            source: "FRED PCEPI, BEA personal consumption expenditures price index. Year-over-year change in the index.",
            fredId: "PCEPI",
            detail: `100 × (${pceYoy.level} / ${pceYoy.prevLevel} − 1), ${pceYoy.date} over ${pceYoy.prevDate}.`,
          },
          "reference",
        )
      : null,
    "PCEPI.csv",
  );

  const core = readSeries("PCEPILFE.csv");
  const coreYoy = core ? yoy(core) : null;
  take(
    "coreInflation",
    coreYoy
      ? obs(
          {
            key: "coreInflation",
            label: "Core PCE inflation",
            units: "percent, year over year",
            value: coreYoy.value,
            date: coreYoy.date,
            dateLabel: monthLabel(coreYoy.date),
            source: "FRED PCEPILFE, BEA PCE price index excluding food and energy. The Phillips curve uses this print.",
            fredId: "PCEPILFE",
            detail: `100 × (${coreYoy.level} / ${coreYoy.prevLevel} − 1), ${coreYoy.date} over ${coreYoy.prevDate}.`,
          },
          "reference",
        )
      : null,
    "PCEPILFE.csv",
  );

  const unrate = readSeries("UNRATE.csv");
  const unrateLast = unrate ? latest(unrate) : null;
  take(
    "unemployment",
    unrateLast
      ? obs(
          {
            key: "unemployment",
            label: "Unemployment rate",
            units: "percent",
            value: unrateLast.value,
            date: unrateLast.date,
            dateLabel: monthLabel(unrateLast.date),
            source: "FRED UNRATE, BLS civilian unemployment rate, seasonally adjusted.",
            fredId: "UNRATE",
            detail: "Shown as an observable. The curves use the output gap, not an unemployment gap.",
          },
          "reference",
        )
      : null,
    "UNRATE.csv",
  );

  const gdp = readSeries("GDPC1.csv");
  const pot = readSeries("GDPPOT.csv");
  const gdpLast = gdp ? latest(gdp) : null;
  const potCurrent = pot
    ? [...pot].reverse().find((point) => point.date <= AS_OF) ?? null
    : null;
  const potAligned =
    gdpLast && pot ? pot.find((point) => point.date === gdpLast.date) ?? null : null;

  take(
    "realGdp",
    gdpLast
      ? obs(
          {
            key: "realGdp",
            label: "Real GDP",
            units: "billions of chained 2017 dollars",
            value: gdpLast.value,
            date: gdpLast.date,
            dateLabel: quarterLabel(gdpLast.date),
            source: "FRED GDPC1, BEA real gross domestic product.",
            fredId: "GDPC1",
            detail: `Latest observation ${gdpLast.date}.`,
          },
          "reference",
        )
      : null,
    "GDPC1.csv",
  );

  take(
    "potentialGdp",
    potCurrent
      ? obs(
          {
            key: "potentialGdp",
            label: "CBO potential GDP",
            units: "billions of chained 2017 dollars",
            value: potCurrent.value,
            date: potCurrent.date,
            dateLabel: quarterLabel(potCurrent.date),
            source: "FRED GDPPOT, Congressional Budget Office potential GDP.",
            fredId: "GDPPOT",
            detail: `Latest observation on or before ${AS_OF}. Rows after that date run through 2036 and are not used. The output gap uses potential in the GDP quarter, ${potAligned ? potAligned.date : "which did not match"}.`,
          },
          "reference",
        )
      : null,
    "GDPPOT.csv",
  );

  take(
    "outputGap",
    gdpLast && potAligned
      ? obs(
          {
            key: "outputGap",
            label: "Output gap",
            units: "percent of potential",
            value: 100 * (gdpLast.value / potAligned.value - 1),
            date: gdpLast.date,
            dateLabel: quarterLabel(gdpLast.date),
            source: "Calculated from FRED GDPC1 and GDPPOT for the same quarter.",
            fredId: null,
            detail: `100 × (${gdpLast.value} / ${potAligned.value} − 1) on ${gdpLast.date}. Potential on that date is ${potAligned.value}. The later potential print dated ${potCurrent?.date ?? "n/a"} is not in this ratio.`,
          },
          "reference",
        )
      : null,
    "GDPC1.csv and GDPPOT.csv",
  );

  const tips = readSeries("DFII10.csv");
  const tipsLast = tips ? latest(tips) : null;
  take(
    "tips10",
    tipsLast
      ? obs(
          {
            key: "tips10",
            label: "10-year TIPS yield",
            units: "percent",
            value: tipsLast.value,
            date: tipsLast.date,
            dateLabel: tipsLast.date,
            source: "FRED DFII10, 10-year Treasury inflation-indexed constant maturity.",
            fredId: "DFII10",
            detail: "Market real long rate. The model moves it with r* and the term-premium shock.",
          },
          "reference",
        )
      : null,
    "DFII10.csv",
  );

  const be = readSeries("T10YIE.csv");
  const beLast = be ? latest(be) : null;
  take(
    "breakeven",
    beLast
      ? obs(
          {
            key: "breakeven",
            label: "10-year breakeven inflation",
            units: "percent",
            value: beLast.value,
            date: beLast.date,
            dateLabel: beLast.date,
            source: "FRED T10YIE, 10-year breakeven inflation rate.",
            fredId: "T10YIE",
            detail: "Blank rows in the file are skipped. This is the market print. It is not forced to equal the ACM yield minus the TIPS yield.",
          },
          "reference",
        )
      : null,
    "T10YIE.csv",
  );

  const funds = series.fedfunds;
  const coreObs = series.coreInflation;
  if (funds?.value != null && coreObs?.value != null) {
    series.realPolicy = obs(
      {
        key: "realPolicy",
        label: "Real policy rate",
        units: "percent",
        value: funds.value - coreObs.value,
        date: funds.date,
        dateLabel: funds.dateLabel,
        source: "Calculated: effective federal funds rate minus core PCE inflation.",
        fredId: null,
        detail: `${funds.value} dated ${funds.date} minus core PCE of ${coreObs.value} through ${coreObs.date}. Expected inflation in the IS curve is held at that core print.`,
      },
      funds.status === "reference" && coreObs.status === "reference"
        ? "reference"
        : "snapshot",
    );
  } else {
    const saved = fallback?.series.realPolicy;
    series.realPolicy = saved
      ? { ...saved, status: saved.value == null ? "missing" : "snapshot" }
      : obs(
          {
            key: "realPolicy",
            label: "Real policy rate",
            units: "percent",
            value: null,
            date: null,
            dateLabel: "Missing",
            source: "Calculated: effective federal funds rate minus core PCE inflation.",
            fredId: null,
            detail: "Needs both the funds rate and core PCE.",
          },
          "missing",
        );
    if (series.realPolicy.value == null) {
      failures.push("Real policy rate is missing because funds or core PCE is missing.");
    }
  }

  for (const fixed of FIXED_SERIES) {
    series[fixed.key] = { ...fixed, status: "snapshot" };
  }

  return {
    asOf: AS_OF,
    readAt: new Date().toISOString(),
    failures,
    series,
  };
}
