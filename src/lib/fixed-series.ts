import type { Observation } from "./types";

/** Values read from the uploaded workbooks. Not re-fetched. */
export const FIXED_SERIES: Observation[] = [
  {
    key: "rstar",
    label: "Holston–Laubach–Williams r*",
    units: "percent",
    value: 1.00864835850403,
    date: "2026-04-01",
    dateLabel: "2026Q2",
    source:
      "Federal Reserve Bank of New York, Holston–Laubach–Williams current estimates, United States, one-sided. Final data point on the sheet: 2026Q2.",
    fredId: null,
    status: "snapshot",
    detail:
      "US natural rate in the HLW workbook, 1.009 percent rounded to 1.01 on the chart. The same sheet's US output gap is −0.11 percent. The curves use the BEA/CBO gap instead.",
  },
  {
    key: "acmYield",
    label: "ACM 10-year yield",
    units: "percent",
    value: 5.228382779885093,
    date: "2026-10-09",
    dateLabel: "9 Oct 2026",
    source:
      "Federal Reserve Bank of New York, Adrian–Crump–Moench daily term premium, series ACMY10.",
    fredId: null,
    status: "snapshot",
    detail:
      "Fitted 10-year zero-coupon yield. It equals the risk-neutral yield plus the term premium on the same day. The reference folder has no DGS10 file, so this is the nominal 10-year the model moves.",
  },
  {
    key: "expectedPath",
    label: "ACM expected path",
    units: "percent",
    value: 4.326085631992512,
    date: "2026-10-09",
    dateLabel: "9 Oct 2026",
    source:
      "Federal Reserve Bank of New York, Adrian–Crump–Moench, series ACMRNY10 (risk-neutral 10-year yield).",
    fredId: null,
    status: "snapshot",
    detail: "The expectations component of the ACM 10-year yield.",
  },
  {
    key: "termPremium",
    label: "ACM 10-year term premium",
    units: "percent",
    value: 0.9022971478925816,
    date: "2026-10-09",
    dateLabel: "9 Oct 2026",
    source:
      "Federal Reserve Bank of New York, Adrian–Crump–Moench, series ACMTP10.",
    fredId: null,
    status: "snapshot",
    detail: "ACMY10 − ACMRNY10 on 9 October 2026. The two components add to the fitted yield.",
  },
  {
    key: "boardParYield",
    label: "Board 10-year par yield",
    units: "percent",
    value: 5.2692,
    date: "2026-10-09",
    dateLabel: "9 Oct 2026",
    source:
      "Federal Reserve Board yield curve (Gürkaynak, Sack, and Wright), SVENPY10, from the saved yield-curve file.",
    fredId: null,
    status: "snapshot",
    detail:
      "Coupon-equivalent 10-year par yield. The file is a fitted yield curve. It does not contain a Kim–Wright term premium. The term-premium split uses ACM.",
  },
];
