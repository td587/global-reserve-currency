import series from "@/data/inflation-series.json";
import {
  CPI_SHOCK_IDS,
  type CpiShockId,
  type ShockId,
  type ShockState,
} from "@/lib/shocks";

export type Observation = (typeof series.observations)[number];

export type ChartPoint = {
  date: string;
  label: string;
  actual: number;
  counterfactual: number | null;
  removedPp: number;
  headlinePce?: number | null;
  corePce?: number | null;
};

export const inflationMeta = series.meta;
export const observations: Observation[] = series.observations;

export function formatMonth(ym: string) {
  const [y, m] = ym.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[Number(m) - 1]} ${y}`;
}

function contributionFor(obs: Observation, id: CpiShockId): number {
  const v = obs.contributions[id];
  return v == null ? 0 : v;
}

/**
 * CPI mode: counterfactual = headline − Σ(OFF contributions).
 * PCE + demand OFF: counterfactual = PCE y/y − Shapiro demand contribution.
 */
export function buildChartSeries(
  state: ShockState,
  opts?: { start?: string; mode?: "cpi" | "pce" }
): ChartPoint[] {
  const start = opts?.start ?? "2020-01";
  const mode = opts?.mode ?? "cpi";
  const removedCpi = CPI_SHOCK_IDS.filter((id) => !state[id]);

  return observations
    .filter((o) => o.date >= start)
    .map((o) => {
      if (mode === "pce") {
        const actual = o.pceYoy;
        if (actual == null) {
          return {
            date: o.date,
            label: formatMonth(o.date),
            actual: NaN,
            counterfactual: null,
            removedPp: 0,
            headlinePce: o.pceYoy,
            corePce: o.corePceYoy,
          };
        }
        let removed = 0;
        if (!state.demandPce && o.shapiro?.demand != null) {
          removed += o.shapiro.demand;
        }
        // Optional: if user also wants supply narrative on PCE lens — only demand is toggled per plan
        return {
          date: o.date,
          label: formatMonth(o.date),
          actual,
          counterfactual: Math.round((actual - removed) * 10) / 10,
          removedPp: Math.round(removed * 10) / 10,
          headlinePce: o.pceYoy,
          corePce: o.corePceYoy,
        };
      }

      const actual = o.headlineYoy;
      let removed = 0;
      for (const id of removedCpi) {
        removed += contributionFor(o, id);
      }
      return {
        date: o.date,
        label: formatMonth(o.date),
        actual,
        counterfactual: Math.round((actual - removed) * 10) / 10,
        removedPp: Math.round(removed * 10) / 10,
        headlinePce: o.pceYoy,
        corePce: o.corePceYoy,
      };
    })
    .filter((p) => Number.isFinite(p.actual));
}

export function latestSnapshot(state: ShockState, mode: "cpi" | "pce") {
  const pts = buildChartSeries(state, { mode, start: "2020-01" });
  const last = pts.at(-1);
  const peak = pts.reduce(
    (best, p) => (p.actual > best.actual ? p : best),
    pts[0]
  );
  return { last, peak };
}

export function anyRemoved(state: ShockState, mode: "cpi" | "pce") {
  if (mode === "pce") return !state.demandPce;
  return CPI_SHOCK_IDS.some((id) => !state[id]);
}

export function removedLabels(state: ShockState, mode: "cpi" | "pce") {
  if (mode === "pce") {
    return state.demandPce ? [] : (["demandPce"] as ShockId[]);
  }
  return CPI_SHOCK_IDS.filter((id) => !state[id]);
}
