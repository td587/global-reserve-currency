import embedded from "@/data/inflation-series.json";
import {
  buildInflationObservations,
  buildRatesObservations,
  fredCsvUrl,
  INFLATION_SERIES_IDS,
  PCE_EXPENDITURE_IDS,
  PCE_PRICE_MONTHLY_IDS,
  PCE_PRICE_QUARTERLY_IDS,
  RATES_SERIES_IDS,
  TECH_OVERLAY_IDS,
  type ShapiroMap,
} from "@/lib/fred-pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function fetchFredCsv(seriesId: string): Promise<string> {
  const res = await fetch(fredCsvUrl(seriesId), {
    cache: "no-store",
    headers: { Accept: "text/csv,*/*" },
  });
  if (!res.ok) {
    throw new Error(`FRED ${seriesId} HTTP ${res.status}`);
  }
  return res.text();
}

/** Reuse Shapiro from the deployed snapshot (SF Fed Excel not re-pulled live). */
function shapiroFromEmbedded(): ShapiroMap {
  const map: ShapiroMap = new Map();
  for (const o of embedded.observations) {
    if (o.shapiro) {
      map.set(o.date, {
        demand: o.shapiro.demand,
        supply: o.shapiro.supply,
        ambiguous: o.shapiro.ambiguous,
      });
    }
  }
  return map;
}

export async function POST() {
  const fetchedAt = new Date().toISOString();
  const errors: string[] = [];

  try {
    const inflationEntries = await Promise.all(
      (
        Object.keys(INFLATION_SERIES_IDS) as Array<
          keyof typeof INFLATION_SERIES_IDS
        >
      ).map(async (key) => {
        const id = INFLATION_SERIES_IDS[key];
        try {
          const text = await fetchFredCsv(id);
          return [key, text] as const;
        } catch (e) {
          errors.push(`${id}: ${e instanceof Error ? e.message : String(e)}`);
          return null;
        }
      })
    );

    if (inflationEntries.some((e) => e == null)) {
      return Response.json(
        {
          ok: false,
          error: "One or more FRED inflation series failed to download.",
          errors,
          fetchedAt,
        },
        { status: 502 }
      );
    }

    const inflationCsv = Object.fromEntries(
      inflationEntries.filter(Boolean) as Array<[string, string]>
    ) as Record<keyof typeof INFLATION_SERIES_IDS, string>;

    const shapiro = shapiroFromEmbedded();

    async function fetchGroup<T extends Record<string, string>>(ids: T) {
      const entries = await Promise.all(
        (Object.keys(ids) as Array<keyof T>).map(async (key) => {
          const id = ids[key] as string;
          try {
            return [key, await fetchFredCsv(id)] as const;
          } catch (e) {
            errors.push(`${id}: ${e instanceof Error ? e.message : String(e)}`);
            return null;
          }
        })
      );
      if (entries.some((e) => e == null)) return null;
      return Object.fromEntries(entries.filter(Boolean) as Array<[string, string]>) as {
        [K in keyof T]: string;
      };
    }

    const pceMonthly = await fetchGroup(PCE_PRICE_MONTHLY_IDS);
    const pceQuarterly = await fetchGroup(PCE_PRICE_QUARTERLY_IDS);
    const pceExp = await fetchGroup(PCE_EXPENDITURE_IDS);
    const techCsv = await fetchGroup(TECH_OVERLAY_IDS);
    const pceCsv =
      pceMonthly && pceQuarterly && pceExp
        ? {
            monthly: pceMonthly,
            quarterly: pceQuarterly,
            expenditure: pceExp,
          }
        : null;

    const observations = buildInflationObservations(
      inflationCsv,
      shapiro,
      pceCsv,
      techCsv
    );

    const ratesEntries = await Promise.all(
      (
        Object.keys(RATES_SERIES_IDS) as Array<keyof typeof RATES_SERIES_IDS>
      ).map(async (key) => {
        const id = RATES_SERIES_IDS[key];
        try {
          const text = await fetchFredCsv(id);
          return [key, text] as const;
        } catch (e) {
          errors.push(`${id}: ${e instanceof Error ? e.message : String(e)}`);
          return null;
        }
      })
    );

    const ratesOk = ratesEntries.every((e) => e != null);
    const ratesCsv = ratesOk
      ? (Object.fromEntries(
          ratesEntries.filter(Boolean) as Array<[string, string]>
        ) as Record<keyof typeof RATES_SERIES_IDS, string>)
      : null;

    const ratesObservations = ratesCsv
      ? buildRatesObservations(ratesCsv)
      : null;

    return Response.json({
      ok: true,
      mode: "live-fred",
      fetchedAt,
      label: "Live FRED pull",
      sources: {
        inflation: "https://fred.stlouisfed.org/",
        rates: "https://fred.stlouisfed.org/",
        shapiro:
          "https://www.frbsf.org/research-and-insights/data-and-indicators/supply-and-demand-driven-pce-inflation/",
      },
      notes: [
        "CPI/PCE and Treasury/TIPS series re-fetched from public FRED CSV endpoints (no API key).",
        "Shapiro PCE demand/supply kept from the embedded snapshot (not re-pulled live).",
        "Contribution math still uses BLS relative-importance × component y/y approximation.",
      ],
      errors: errors.length ? errors : undefined,
      inflation: {
        meta: {
          builtAt: fetchedAt.slice(0, 10),
          fetchedAt,
          mode: "live-fred",
          window: {
            start: observations[0]?.date,
            end: observations.at(-1)?.date,
          },
          seriesIds: INFLATION_SERIES_IDS,
          techOverlaySeries: TECH_OVERLAY_IDS,
          pcePriceSeries: {
            ...PCE_PRICE_MONTHLY_IDS,
            ...PCE_PRICE_QUARTERLY_IDS,
          },
        },
        observations,
      },
      rates: ratesObservations
        ? {
            meta: {
              builtAt: fetchedAt.slice(0, 10),
              fetchedAt,
              mode: "live-fred",
              frequency: "Monthly average of daily FRED observations",
              window: {
                start: ratesObservations[0]?.date,
                end: ratesObservations.at(-1)?.date,
              },
              series: RATES_SERIES_IDS,
            },
            observations: ratesObservations,
          }
        : null,
    });
  } catch (e) {
    return Response.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Refresh failed",
        fetchedAt,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
