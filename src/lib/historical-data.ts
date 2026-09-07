/**
 * Historical reserve-currency statistics for the teaching deck.
 *
 * Primary sources (cite on-slide):
 * - IMF COFER (Currency Composition of Official Foreign Exchange Reserves),
 *   annual/quarterly allocated shares. Aggregated table commonly reproduced from
 *   IMF COFER + ECB compilations (see Wikipedia "Reserve currency" table notes:
 *   1995–99 & 2006–present IMF COFER; 1999–2005 ECB reserve papers).
 * - Pre-1965 FX-reserve shares: scholarly estimates from Eichengreen & Flandreau
 *   (NBER/ECB work on sterling–dollar transition), not official IMF COFER.
 *
 * Y-axis metric throughout: USD share of identified foreign-exchange reserves (%).
 * Gold dominated reserve assets before WWII; FX shares are a partial lens for that era.
 */

export type ReserveShares = {
  year: number;
  usd: number;
  eur: number;
  /** When true, eur is DEM+FRF+ECU (euro predecessors) before 1999. */
  eurIsLegacy: boolean;
  jpy: number;
  gbp: number;
  cny: number;
  other: number;
  source: string;
};

/** Milestone years for the interactive reserve-composition slider. */
export const reserveShareTimeline: ReserveShares[] = [
  {
    year: 1965,
    usd: 72.93,
    eur: 1.28,
    eurIsLegacy: true,
    jpy: 0,
    gbp: 25.76,
    cny: 0,
    other: 0.03,
    source: "IMF/ECB compiled FX reserve shares (COFER-era table)",
  },
  {
    year: 1970,
    usd: 84.85,
    eur: 2.67,
    eurIsLegacy: true,
    jpy: 0,
    gbp: 11.36,
    cny: 0,
    other: 1.12,
    source: "IMF/ECB compiled FX reserve shares",
  },
  {
    year: 1975,
    usd: 84.61,
    eur: 7.78,
    eurIsLegacy: true,
    jpy: 0.61,
    gbp: 3.42,
    cny: 0,
    other: 3.58,
    source: "IMF/ECB compiled FX reserve shares",
  },
  {
    year: 1980,
    usd: 57.88,
    eur: 31.35,
    eurIsLegacy: true,
    jpy: 3.93,
    gbp: 2.4,
    cny: 0,
    other: 4.44,
    source: "IMF/ECB compiled FX reserve shares (DEM+ECU+FRF as EUR*)",
  },
  {
    year: 1985,
    usd: 56.66,
    eur: 28.32,
    eurIsLegacy: true,
    jpy: 8.69,
    gbp: 2.03,
    cny: 0,
    other: 4.3,
    source: "IMF/ECB compiled FX reserve shares (DEM+ECU+FRF as EUR*)",
  },
  {
    year: 1990,
    usd: 47.14,
    eur: 34.18,
    eurIsLegacy: true,
    jpy: 9.4,
    gbp: 2.39,
    cny: 0,
    other: 6.89,
    source: "IMF/ECB compiled FX reserve shares (weak-dollar valuation year)",
  },
  {
    year: 1995,
    usd: 58.96,
    eur: 26.63,
    eurIsLegacy: true,
    jpy: 6.77,
    gbp: 2.11,
    cny: 0,
    other: 5.53,
    source: "IMF COFER (annual series begins mid-1990s)",
  },
  {
    year: 1999,
    usd: 71.01,
    eur: 17.9,
    eurIsLegacy: false,
    jpy: 6.37,
    gbp: 2.89,
    cny: 0,
    other: 1.83,
    source: "IMF COFER — euro introduced; inherits DEM/FRF reserve role",
  },
  {
    year: 2000,
    usd: 69.74,
    eur: 17.54,
    eurIsLegacy: false,
    jpy: 6.56,
    gbp: 3.41,
    cny: 0,
    other: 2.75,
    source: "IMF COFER",
  },
  {
    year: 2005,
    usd: 64.89,
    eur: 21.89,
    eurIsLegacy: false,
    jpy: 4.8,
    gbp: 4.75,
    cny: 0,
    other: 3.67,
    source: "IMF COFER / ECB compilations",
  },
  {
    year: 2010,
    usd: 61.94,
    eur: 22.91,
    eurIsLegacy: false,
    jpy: 4.09,
    gbp: 4.78,
    cny: 0,
    other: 6.28,
    source: "IMF COFER",
  },
  {
    year: 2015,
    usd: 64.15,
    eur: 19.4,
    eurIsLegacy: false,
    jpy: 3.9,
    gbp: 5.17,
    cny: 0,
    other: 7.38,
    source: "IMF COFER (RMB not yet separately reported here)",
  },
  {
    year: 2020,
    usd: 59.53,
    eur: 20.56,
    eurIsLegacy: false,
    jpy: 6.04,
    gbp: 4.76,
    cny: 2.32,
    other: 6.79,
    source: "IMF COFER",
  },
  {
    year: 2024,
    usd: 58.52,
    eur: 18.92,
    eurIsLegacy: false,
    jpy: 5.62,
    gbp: 4.6,
    cny: 2.06,
    other: 10.28,
    source: "IMF COFER (allocated shares; other includes AUD, CAD, CHF, etc.)",
  },
];

export type DominancePoint = {
  year: number;
  usdShare: number;
  /** official = IMF/ECB compiled; estimate = scholarly reconstruction */
  quality: "official" | "estimate";
  note?: string;
};

/**
 * USD share of identified FX reserves, 1900–2025.
 * Official from 1965; earlier points are rounded scholarly estimates for teaching.
 */
export const usdDominanceSeries: DominancePoint[] = [
  {
    year: 1900,
    usdShare: 2,
    quality: "estimate",
    note: "Sterling era; gold still the primary reserve asset. Dollar FX role was minor (Lindert / Eichengreen).",
  },
  {
    year: 1913,
    usdShare: 5,
    quality: "estimate",
    note: "On the eve of WWI, sterling dominated FX reserves; the dollar’s share remained small.",
  },
  {
    year: 1924,
    usdShare: 40,
    quality: "estimate",
    note: "Eichengreen & Flandreau: in continuous country samples, the dollar overtook sterling around the mid-1920s.",
  },
  {
    year: 1929,
    usdShare: 45,
    quality: "estimate",
    note: "Interwar competition: dollar and sterling each held large FX-reserve roles (~40% class).",
  },
  {
    year: 1935,
    usdShare: 20,
    quality: "estimate",
    note: "After sterling (1931) and dollar (1933) left gold, many central banks liquidated FX for gold.",
  },
  {
    year: 1947,
    usdShare: 12,
    quality: "estimate",
    note: "ECB long-run work: sterling still >50–80% of FX reserves due to wartime sterling balances—not lasting leadership.",
  },
  {
    year: 1953,
    usdShare: 55,
    quality: "estimate",
    note: "Early 1950s turning point: the dollar overtook sterling as the leading FX reserve currency.",
  },
  {
    year: 1965,
    usdShare: 72.93,
    quality: "official",
    note: "Bretton Woods peak approach — IMF/ECB compiled shares.",
  },
  { year: 1970, usdShare: 84.85, quality: "official" },
  { year: 1975, usdShare: 84.61, quality: "official" },
  { year: 1980, usdShare: 57.88, quality: "official" },
  { year: 1985, usdShare: 56.66, quality: "official" },
  {
    year: 1990,
    usdShare: 47.14,
    quality: "official",
    note: "Low reading partly reflects dollar valuation; diversification into DEM/yen also mattered.",
  },
  { year: 1995, usdShare: 58.96, quality: "official" },
  { year: 1999, usdShare: 71.01, quality: "official" },
  { year: 2000, usdShare: 69.74, quality: "official" },
  { year: 2005, usdShare: 64.89, quality: "official" },
  { year: 2010, usdShare: 61.94, quality: "official" },
  { year: 2015, usdShare: 64.15, quality: "official" },
  { year: 2020, usdShare: 59.53, quality: "official" },
  { year: 2024, usdShare: 58.52, quality: "official" },
  { year: 2025, usdShare: 56.77, quality: "official" },
];

export type TimelineEvent = {
  year: number;
  label: string;
  description: string;
};

/** Key events for hover markers on the dominance chart. */
export const dominanceEvents: TimelineEvent[] = [
  {
    year: 1914,
    label: "WWI begins",
    description:
      "Gold convertibility collapses under war finance. The classical gold standard ends as a global system.",
  },
  {
    year: 1924,
    label: "Dollar challenges sterling",
    description:
      "Eichengreen & Flandreau’s reconstructions show the dollar overtaking sterling in FX reserves around the mid-1920s in key samples.",
  },
  {
    year: 1944,
    label: "Bretton Woods",
    description:
      "USD pegged to gold at $35/oz; other currencies peg to the dollar. The IMF is created to oversee adjustable pegs.",
  },
  {
    year: 1953,
    label: "Dollar leads reserves",
    description:
      "By the early 1950s the dollar permanently overtakes sterling as the main FX reserve currency (ECB/Eichengreen).",
  },
  {
    year: 1971,
    label: "Nixon shock",
    description:
      "August 1971: the U.S. suspends official gold convertibility for dollars. Bretton Woods pegs unravel.",
  },
  {
    year: 1973,
    label: "Float + oil shock",
    description:
      "Major currencies move to managed floats. Oil invoiced in dollars deepens petrodollar demand for USD assets.",
  },
  {
    year: 1999,
    label: "Euro launch",
    description:
      "The euro replaces legacy EU currencies and becomes the second reserve currency after the dollar (IMF COFER).",
  },
  {
    year: 2008,
    label: "Global financial crisis",
    description:
      "Flight to U.S. Treasuries reinforces the dollar’s safe-asset role even as longer-run diversification continues.",
  },
  {
    year: 2016,
    label: "RMB enters SDR",
    description:
      "The IMF adds the renminbi to the SDR basket. COFER later reports a small but rising CNY reserve share.",
  },
  {
    year: 2022,
    label: "Sanctions & diversification",
    description:
      "Geopolitical use of dollar plumbing accelerates talk of multipolar reserves; USD share remains majority but slowly drifts down.",
  },
];

/** Attach event markers to the nearest dominance series year for plotting. */
export function eventsForChart() {
  return dominanceEvents.map((event) => {
    const nearest = usdDominanceSeries.reduce((best, point) =>
      Math.abs(point.year - event.year) < Math.abs(best.year - event.year)
        ? point
        : best
    );
    return {
      ...event,
      usdShare: nearest.usdShare,
    };
  });
}
