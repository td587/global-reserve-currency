import series from "@/data/inflation-series.json";
import type {
  PceContributionId,
  PceContributionState,
  PceOverlayState,
} from "@/lib/pce-categories";
import type { TechOverlayState } from "@/lib/tech-overlays";
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
  /** PCE category y/y overlays keyed by category id */
  pceCat?: Record<string, number | null>;
  /** CPI/PPI electronics overlays */
  techCat?: Record<string, number | null>;
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

function pceContribFor(obs: Observation, id: PceContributionId): number {
  const v = obs.pceContributions?.[id];
  return v == null ? 0 : v;
}

/**
 * CPI mode: counterfactual = headline − Σ(OFF CPI contributions).
 * PCE mode: counterfactual = PCE y/y − Σ(OFF PCE durables/ND/services contrib)
 *           − Shapiro demand if demand OFF.
 */
export function buildChartSeries(
  state: ShockState,
  opts?: {
    start?: string;
    mode?: "cpi" | "pce";
    observations?: Observation[];
    pceContribState?: PceContributionState;
  }
): ChartPoint[] {
  const start = opts?.start ?? "2020-01";
  const mode = opts?.mode ?? "cpi";
  const rows = opts?.observations ?? observations;
  const removedCpi = CPI_SHOCK_IDS.filter((id) => !state[id]);
  const pceContribState = opts?.pceContribState;

  return rows
    .filter((o) => o.date >= start)
    .map((o) => {
      const pceCat = o.pceCategories ?? undefined;
      const techCat = o.techCategories ?? undefined;

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
            pceCat,
            techCat,
          };
        }
        let removed = 0;
        if (!state.demandPce && o.shapiro?.demand != null) {
          removed += o.shapiro.demand;
        }
        if (pceContribState) {
          for (const id of ["durables", "nondurables", "services"] as const) {
            if (!pceContribState[id]) removed += pceContribFor(o, id);
          }
        }
        return {
          date: o.date,
          label: formatMonth(o.date),
          actual,
          counterfactual: Math.round((actual - removed) * 10) / 10,
          removedPp: Math.round(removed * 10) / 10,
          headlinePce: o.pceYoy,
          corePce: o.corePceYoy,
          pceCat,
          techCat,
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
        pceCat,
        techCat,
      };
    })
    .filter((p) => Number.isFinite(p.actual));
}

export function latestSnapshot(
  state: ShockState,
  mode: "cpi" | "pce",
  obs?: Observation[],
  pceContribState?: PceContributionState
) {
  const pts = buildChartSeries(state, {
    mode,
    start: "2020-01",
    observations: obs,
    pceContribState,
  });
  const last = pts.at(-1);
  const peak = pts.reduce(
    (best, p) => (p.actual > best.actual ? p : best),
    pts[0]
  );
  return { last, peak };
}

export function anyRemoved(
  state: ShockState,
  mode: "cpi" | "pce",
  pceContribState?: PceContributionState
) {
  if (mode === "pce") {
    const demandOff = !state.demandPce;
    const partOff =
      pceContribState != null &&
      (["durables", "nondurables", "services"] as const).some(
        (id) => !pceContribState[id]
      );
    return demandOff || partOff;
  }
  return CPI_SHOCK_IDS.some((id) => !state[id]);
}

export function removedLabels(
  state: ShockState,
  mode: "cpi" | "pce",
  pceContribState?: PceContributionState
) {
  if (mode === "pce") {
    const labels: string[] = [];
    if (!state.demandPce) labels.push("demandPce");
    if (pceContribState) {
      for (const id of ["durables", "nondurables", "services"] as const) {
        if (!pceContribState[id]) labels.push(id);
      }
    }
    return labels as ShockId[];
  }
  return CPI_SHOCK_IDS.filter((id) => !state[id]);
}

/** Flatten category overlays onto chart rows for Recharts dataKeys */
export function withPceOverlayKeys(
  points: ChartPoint[],
  overlayState: PceOverlayState,
  techOverlayState?: TechOverlayState
): Array<Record<string, unknown>> {
  return points.map((p) => {
    const row: Record<string, unknown> = { ...p };
    if (p.pceCat) {
      for (const [id, on] of Object.entries(overlayState)) {
        if (on) row[`pce_${id}`] = p.pceCat[id] ?? null;
      }
    }
    if (p.techCat && techOverlayState) {
      for (const [id, on] of Object.entries(techOverlayState)) {
        if (on) row[`tech_${id}`] = p.techCat[id] ?? null;
      }
    }
    return row;
  });
}
