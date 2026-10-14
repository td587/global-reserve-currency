export type SeriesStatus = "reference" | "snapshot" | "live" | "missing";

export type Observation = {
  key: string;
  label: string;
  units: string;
  value: number | null;
  date: string | null;
  dateLabel: string;
  source: string;
  fredId: string | null;
  status: SeriesStatus;
  detail: string;
};

export type Baseline = {
  asOf: string;
  readAt: string;
  failures: string[];
  series: Record<string, Observation>;
};

export type Shocks = {
  capex: number;
  capexOn: boolean;
  swe: number;
  sweOn: boolean;
  rnd: boolean;
  precautionary: number;
  precautionaryOn: boolean;
  termPremium: number;
  termPremiumOn: boolean;
};

export type CurveKey =
  | "is"
  | "fe"
  | "phillips"
  | "saving"
  | "investment"
  | "expectedPath"
  | "termPremium";

export type CurveVisibility = Record<CurveKey, boolean>;

export type Solution = {
  capex: number;
  gy: number;
  prec: number;
  tau: number;
  gamma: number;
  rStar: number;
  gap: number;
  inflation: number;
  funds: number;
  realPolicy: number;
  output: number;
  potential: number;
  y10: number;
  expected: number;
  termPremium: number;
  real10: number;
  dGap: number;
  dInflation: number;
  dFunds: number;
  dRStar: number;
  dReal10: number;
  dY10: number;
};
