import rates from "@/data/rates-series.json";

export type RateKey =
  | "tips5y"
  | "tips10y"
  | "be5y"
  | "fwd5y5y"
  | "dgs5"
  | "dgs10";

export type RateSeriesDef = {
  key: RateKey;
  label: string;
  shortLabel: string;
  color: string;
  defaultOn: boolean;
  blurb: string;
};

export const RATE_SERIES: RateSeriesDef[] = [
  {
    key: "tips5y",
    label: "5y TIPS real yield",
    shortLabel: "5y TIPS",
    color: "#5eb7a5",
    defaultOn: true,
    blurb: "FRED DFII5 — inflation-indexed Treasury constant maturity (real).",
  },
  {
    key: "tips10y",
    label: "10y TIPS real yield",
    shortLabel: "10y TIPS",
    color: "#8ecfc0",
    defaultOn: false,
    blurb: "FRED DFII10 — longer-horizon real yield.",
  },
  {
    key: "be5y",
    label: "5y breakeven inflation",
    shortLabel: "5y BE",
    color: "#e8a35c",
    defaultOn: true,
    blurb: "FRED T5YIE — market inflation compensation over next 5y (includes premia).",
  },
  {
    key: "fwd5y5y",
    label: "5y5y forward inflation",
    shortLabel: "5y5y",
    color: "#d07a5c",
    defaultOn: true,
    blurb: "FRED T5YIFR — expected avg inflation years 5–10 ahead.",
  },
  {
    key: "dgs5",
    label: "5y Treasury yield",
    shortLabel: "5y UST",
    color: "#6a9bb8",
    defaultOn: false,
    blurb: "FRED DGS5 — nominal constant-maturity yield.",
  },
  {
    key: "dgs10",
    label: "10y Treasury yield",
    shortLabel: "10y UST",
    color: "#8f9ec2",
    defaultOn: true,
    blurb: "FRED DGS10 — nominal constant-maturity yield.",
  },
];

export type RateState = Record<RateKey, boolean>;

export const DEFAULT_RATE_STATE: RateState = Object.fromEntries(
  RATE_SERIES.map((s) => [s.key, s.defaultOn])
) as RateState;

export const ratesMeta = rates.meta;

export function buildRatesChartData(start = "2020-01") {
  return (rates.observations as Array<Record<string, string | number | null>>)
    .filter((o) => String(o.date) >= start)
    .map((o) => {
      const [y, m] = String(o.date).split("-");
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
      return {
        ...o,
        label: `${months[Number(m) - 1]} ${y}`,
      };
    });
}
