import type { Shocks, Solution } from "./types";

/** Illustrative slopes. Directions follow the concept note and the two papers. */
export const PARAMS = {
  bI: 0.6,
  bS: 0.4,
  psiProd: 0.08,
  psiSave: 0.04,
  demandShare: 0.6,
  a: 0.8,
  kappa: 0.4,
  phiPi: 1.5,
  phiY: 0.5,
  gamma: 0.111,
  gammaRnd: 0.199,
  piTarget: 2,
  longInflationWeight: 0.25,
} as const;

export const INITIAL_SHOCKS: Shocks = {
  capex: 0,
  capexOn: true,
  swe: 0,
  sweOn: true,
  rnd: false,
  precautionary: 0,
  precautionaryOn: true,
  termPremium: 0,
  termPremiumOn: true,
};

export const PRESETS: Record<string, Shocks> = {
  baseline: { ...INITIAL_SHOCKS },
  now: {
    ...INITIAL_SHOCKS,
    capex: 0.6,
    capexOn: true,
    swe: 0,
    sweOn: true,
  },
  later: {
    ...INITIAL_SHOCKS,
    capex: 0.6,
    swe: 32.6,
    sweOn: true,
    rnd: false,
  },
  pimco: {
    ...INITIAL_SHOCKS,
    capex: 0,
    swe: 32.6,
    sweOn: true,
    precautionary: 0.8,
    precautionaryOn: true,
    termPremium: 50,
    termPremiumOn: true,
    rnd: false,
  },
};

export type ModelLevels = {
  i0: number;
  pi0: number;
  gap0: number;
  rStar0: number;
  y10: number;
  expected0: number;
  tp0: number;
  real10: number;
};

const slopeSum = PARAMS.bI + PARAMS.bS;
const taylor = PARAMS.phiPi * PARAMS.kappa + PARAMS.phiY;
const denom = 1 + PARAMS.a * taylor;

export function effectiveShocks(shocks: Shocks) {
  const sweOn = shocks.sweOn && Math.abs(shocks.swe) > 1e-9;
  const gamma = shocks.rnd && sweOn ? PARAMS.gammaRnd : PARAMS.gamma;
  // swe is already in percent (32.6). gamma × swe is the GDP-level gain.
  const productivity = sweOn ? gamma * shocks.swe : 0;
  return {
    capex: shocks.capexOn ? shocks.capex : 0,
    gy: productivity,
    prec: shocks.precautionaryOn ? shocks.precautionary : 0,
    tau: shocks.termPremiumOn ? shocks.termPremium / 100 : 0,
    gamma: sweOn ? gamma : PARAMS.gamma,
    sweOn,
    rndOn: shocks.rnd && sweOn,
    capexOn: shocks.capexOn && Math.abs(shocks.capex) > 1e-9,
    precOn: shocks.precautionaryOn && Math.abs(shocks.precautionary) > 1e-9,
    fiscalOn: shocks.termPremiumOn && Math.abs(shocks.termPremium) > 1e-9,
  };
}

export type PolicyOptions = {
  /** When true, the Fed tracks the new r* one-for-one in its rule. */
  rStarInRule?: boolean;
};

export function solve(
  levels: ModelLevels,
  shocks: Shocks,
  options: PolicyOptions = {},
): Solution {
  const e = effectiveShocks(shocks);
  const imbalance =
    e.capex + (PARAMS.psiProd + PARAMS.psiSave) * e.gy - e.prec;
  const dRStar = imbalance / slopeSum;
  // Policy rule: Δi = taylor × Δgap + (rStarInRule ? Δr* : 0).
  // The IS curve feels Δi through the real rate, so a Fed that tracks r*
  // also tightens demand: Δgap = (capex − (1 − share)·gY − a·Δr*) / denom.
  const rStarPass = options.rStarInRule ? dRStar : 0;
  const dGap =
    (e.capex - (1 - PARAMS.demandShare) * e.gy - PARAMS.a * rStarPass) / denom;
  const dInflation = PARAMS.kappa * dGap;
  const dFunds = taylor * dGap + rStarPass;
  const dY10 = dRStar + PARAMS.longInflationWeight * dInflation - e.tau;
  const dReal10 = dRStar - e.tau;

  return {
    capex: e.capex,
    gy: e.gy,
    prec: e.prec,
    tau: e.tau,
    gamma: e.gamma,
    rStar: levels.rStar0 + dRStar,
    gap: levels.gap0 + dGap,
    inflation: levels.pi0 + dInflation,
    funds: levels.i0 + dFunds,
    realPolicy: levels.i0 - levels.pi0 + dFunds,
    output: levels.gap0 + dGap + e.gy,
    potential: e.gy,
    y10: levels.y10 + dY10,
    expected: levels.expected0 + dRStar + PARAMS.longInflationWeight * dInflation,
    termPremium: levels.tp0 - e.tau,
    real10: levels.real10 + dReal10,
    dGap,
    dInflation,
    dFunds,
    dRStar,
    dReal10,
    dY10,
  };
}

/**
 * Every corner of the slider box that the charts should frame without
 * rescaling: capex 0–1.5, the paper's 32.6 productivity gain, precautionary
 * saving 0–1.5, term premium 0–100 bp, with the policy rule both ways.
 * The model is linear in each shock, so any setting inside the box lands
 * inside the range these corners span. Settings beyond it (productivity
 * above 32.6, or the R&D channel) widen the axes smoothly.
 */
const envelopeCache = new WeakMap<ModelLevels, Solution[]>();

export function chartEnvelope(levels: ModelLevels): Solution[] {
  const cached = envelopeCache.get(levels);
  if (cached) return cached;
  const out: Solution[] = [];
  for (const capex of [0, 1.5])
    for (const swe of [0, 32.6])
      for (const precautionary of [0, 1.5])
        for (const termPremium of [0, 100])
          for (const rStarInRule of [false, true])
            out.push(
              solve(
                levels,
                { ...INITIAL_SHOCKS, capex, swe, precautionary, termPremium },
                { rStarInRule },
              ),
            );
  envelopeCache.set(levels, out);
  return out;
}

export function presetName(shocks: Shocks): string | null {
  for (const [name, preset] of Object.entries(PRESETS)) {
    if (JSON.stringify(shocks) === JSON.stringify(preset)) return name;
  }
  return null;
}

function pp(n: number, digits = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function signedPp(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${pp(Math.abs(n))}`;
}

function bpPhrase(deltaPp: number) {
  const bp = Math.round(Math.abs(deltaPp) * 100);
  const direction = deltaPp > 0.005 ? "higher" : deltaPp < -0.005 ? "lower" : "unchanged";
  if (direction === "unchanged") return "unchanged";
  return `${bp} basis points ${direction}`;
}

export function narrate(
  shocks: Shocks,
  sol: Solution,
  base: Solution,
  extras: { headline: number | null; unemployment: number | null },
  options: PolicyOptions = {},
): string {
  const e = effectiveShocks(shocks);
  const active = e.capexOn || e.sweOn || e.precOn || e.fiscalOn;

  if (!active) {
    const u =
      extras.unemployment == null
        ? "Unemployment was not in the reference files."
        : `Unemployment is ${pp(extras.unemployment, 1)} percent.`;
    const h =
      extras.headline == null
        ? ""
        : ` Headline PCE inflation is ${pp(extras.headline)} percent.`;
    return `Every shock is at zero, so this is the data. The effective federal funds rate is ${pp(base.funds)} percent, core PCE inflation is ${pp(base.inflation)} percent, and real GDP is ${pp(base.gap)} percent above CBO potential.${h} ${u} The Holston–Laubach–Williams neutral rate is ${pp(base.rStar)} percent. The ACM 10-year yield is ${pp(base.y10)} percent, split into an expected path of ${pp(base.expected)} and a term premium of ${pp(base.termPremium)}. The 10-year TIPS yield is ${pp(base.real10)} percent. Turn on capex for the demand shock today, or the software-engineering productivity gain for the supply shock later.`;
  }

  const parts: string[] = [];

  if (e.capexOn && !e.sweOn) {
    parts.push(
      `Now: AI capex of ${pp(e.capex)} percent of GDP raises desired investment before the productivity gain arrives. The investment curve and the IS curve shift right. Full-employment output stays put. The saving–investment balance puts the equilibrium real rate ${bpPhrase(sol.dRStar)}, at ${pp(sol.rStar)} percent. The output gap is ${pp(sol.gap)} percent and core inflation is ${bpPhrase(sol.dInflation)}. The funds rate is ${bpPhrase(sol.dFunds)}, at ${pp(sol.funds)} percent.`,
    );
  } else if (e.sweOn && !e.capexOn) {
    parts.push(
      `Later, if the expected gain is realized: markets price a ${pp(shocks.swe, 1)} percent software-engineering productivity gain, the market-implied estimate from Blumenfeld, Hazell, Lian, and Schaab over November 2022 to December 2025. That is an expectation, not a measured gain. If it arrives, with a GDP weight of ${pp(e.gamma, 3)}, potential output is ${pp(e.gy)} percent higher and the full-employment line shifts right. Inflation pressure eases: core inflation is ${bpPhrase(sol.dInflation)} and the funds rate is ${bpPhrase(sol.dFunds)}, at ${pp(sol.funds)} percent. Desired investment rises and desired saving falls, so the equilibrium real rate is still ${bpPhrase(sol.dRStar)}, at ${pp(sol.rStar)} percent.`,
    );
  } else if (e.sweOn && e.capexOn) {
    parts.push(
      `Demand is still on, and here the expected supply gain has also arrived. Capex of ${pp(e.capex)} percent of GDP keeps investment demand elevated, and if the ${pp(shocks.swe, 1)} percent expected software-engineering productivity gain is realized, potential output rises by ${pp(e.gy)} percent (weight ${pp(e.gamma, 3)}). The full-employment line shifts right, the gap moves to ${pp(sol.gap)} percent, and core inflation is ${bpPhrase(sol.dInflation)}. The funds rate is ${bpPhrase(sol.dFunds)}, at ${pp(sol.funds)} percent. The saving–investment balance puts r* ${bpPhrase(sol.dRStar)}, at ${pp(sol.rStar)} percent, so the long real yield can stay high even as the policy rate ${sol.dFunds < -0.005 ? "falls" : "moves"}.`,
    );
  }

  if (e.rndOn) {
    parts.push(
      "The R&D channel is on, so the GDP weight is 0.199 instead of the production-only 0.111, the amplification in the paper's innovation extension.",
    );
  }

  if (e.precOn || e.fiscalOn) {
    const bits: string[] = [];
    if (e.precOn) {
      bits.push(
        `precautionary saving of ${pp(e.prec)} percent of GDP, the labor-disruption channel`,
      );
    }
    if (e.fiscalOn) {
      bits.push(
        `a term-premium compression of ${Math.round(e.tau * 100)} basis points, the fiscal-sustainability channel`,
      );
    }
    const net =
      sol.dRStar < -0.005
        ? "Net, r* falls"
        : sol.dRStar > 0.005
          ? "Net, r* still rises"
          : "Net, r* is about unchanged";
    parts.push(
      `The PIMCO alternative is on: ${bits.join(" and ")}. Wilding and Scott argue that AI news has lowered far-forward yields through precautionary saving and a smaller term premium, even if trend growth is higher. ${net}, at ${pp(sol.rStar)} percent, and the ACM 10-year yield is ${bpPhrase(sol.dY10)}, at ${pp(sol.y10)} percent. Set those two switches off to see the case where the equilibrium real rate rises instead. Which channel wins is why the effect on long rates is ambiguous.`,
    );
  } else {
    parts.push(
      `The ACM 10-year yield is ${bpPhrase(sol.dY10)}, at ${pp(sol.y10)} percent. The expected path is ${pp(sol.expected)} and the term premium is ${pp(sol.termPremium)}. The 10-year real yield is ${bpPhrase(sol.dReal10)}, at ${pp(sol.real10)} percent.`,
    );
  }

  if (options.rStarInRule && Math.abs(sol.dRStar) > 0.005) {
    parts.push(
      `The Fed's rule tracks r* here, so the policy rate carries the ${bpPhrase(sol.dRStar)} move in the neutral rate on top of its response to inflation and the gap. Set the rule back to "Fed lags r*" to see the slow-recognition case.`,
    );
  }

  return parts.join(" ");
}

export function signedMove(n: number) {
  return signedPp(n);
}
