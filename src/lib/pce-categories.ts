/**
 * Official BEA/FRED PCE chain-type price indexes used in the explorer.
 * Expenditure series used only for approximate contribution shares.
 */

export type PceCategoryId =
  | "goods"
  | "durables"
  | "nondurables"
  | "services"
  | "food"
  | "energy"
  | "housingUtilities"
  | "healthCare"
  | "motorVehicles"
  | "transportServices"
  | "apparel"
  | "recreationGoods"
  | "recreationServices"
  | "foodServices"
  | "financialServices"
  | "otherServices";

export type PceCategoryDef = {
  id: PceCategoryId;
  label: string;
  shortLabel: string;
  fredId: string;
  frequency: "monthly" | "quarterly";
  /** show/hide y/y overlay */
  defaultOn: boolean;
  /** If true, OFF also removes approx. contribution from headline PCE (non-overlapping partition only) */
  contributionToggle?: boolean;
  group: "aggregate" | "detail" | "more";
  color: string;
  note?: string;
};

/** Price-index series (BEA Table 2.4.4 / FRED) */
export const PCE_CATEGORY_DEFS: PceCategoryDef[] = [
  {
    id: "goods",
    label: "Goods",
    shortLabel: "Goods",
    fredId: "DGDSRG3M086SBEA",
    frequency: "monthly",
    defaultOn: false,
    group: "aggregate",
    color: "#7cb89a",
    note: "Includes durables + nondurables (overlaps those toggles if both shown).",
  },
  {
    id: "durables",
    label: "Durable goods",
    shortLabel: "Durables",
    fredId: "DDURRG3M086SBEA",
    frequency: "monthly",
    defaultOn: true,
    contributionToggle: true,
    group: "aggregate",
    color: "#6a9bb8",
  },
  {
    id: "nondurables",
    label: "Nondurable goods",
    shortLabel: "Nondurables",
    fredId: "DNDGRG3M086SBEA",
    frequency: "monthly",
    defaultOn: true,
    contributionToggle: true,
    group: "aggregate",
    color: "#8f9ec2",
  },
  {
    id: "services",
    label: "Services",
    shortLabel: "Services",
    fredId: "DSERRG3M086SBEA",
    frequency: "monthly",
    defaultOn: true,
    contributionToggle: true,
    group: "aggregate",
    color: "#c4879a",
  },
  {
    id: "food",
    label: "Food",
    shortLabel: "Food",
    fredId: "DFXARG3M086SBEA",
    frequency: "monthly",
    defaultOn: false,
    group: "detail",
    color: "#e8a35c",
    note: "Subset of nondurables — overlay only (not additive with ND contribution).",
  },
  {
    id: "energy",
    label: "Energy goods & services",
    shortLabel: "Energy",
    fredId: "DNRGRG3M086SBEA",
    frequency: "monthly",
    defaultOn: false,
    group: "detail",
    color: "#d07a5c",
    note: "Cross-cuts goods/services — overlay only.",
  },
  {
    id: "housingUtilities",
    label: "Housing & utilities",
    shortLabel: "Housing",
    fredId: "DHUTRG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "detail",
    color: "#b8a06a",
    note: "Quarterly BEA series; shown constant within each quarter.",
  },
  {
    id: "healthCare",
    label: "Health care",
    shortLabel: "Health",
    fredId: "DHLCRG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "detail",
    color: "#5eb7a5",
    note: "Quarterly BEA series; shown constant within each quarter.",
  },
  {
    id: "motorVehicles",
    label: "Motor vehicles & parts",
    shortLabel: "Vehicles",
    fredId: "DMOTRG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "detail",
    color: "#9bb4c8",
    note: "Quarterly; subset of durables.",
  },
  {
    id: "transportServices",
    label: "Transportation services",
    shortLabel: "Transport svc",
    fredId: "DTRSRG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "detail",
    color: "#a8c0cf",
    note: "Quarterly; subset of services.",
  },
  {
    id: "apparel",
    label: "Clothing & footwear",
    shortLabel: "Apparel",
    fredId: "DCLORG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "more",
    color: "#d4a574",
    note: "Quarterly BEA; subset of nondurables. No clean monthly FRED chain index.",
  },
  {
    id: "recreationGoods",
    label: "Recreational goods & vehicles",
    shortLabel: "Rec goods",
    fredId: "DREQRG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "more",
    color: "#8bc4a8",
    note: "Quarterly; includes video/audio/info-processing equipment in BEA durables — closest PCE electronics proxy (not a pure computers line).",
  },
  {
    id: "recreationServices",
    label: "Recreation services",
    shortLabel: "Rec services",
    fredId: "DRCARG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "more",
    color: "#7ab89a",
    note: "Quarterly; subset of services.",
  },
  {
    id: "foodServices",
    label: "Food services & accommodations",
    shortLabel: "Food svc / hotels",
    fredId: "DFSARG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "more",
    color: "#e0a070",
    note: "Quarterly BEA; restaurants + accommodations.",
  },
  {
    id: "financialServices",
    label: "Financial services & insurance",
    shortLabel: "Financial svc",
    fredId: "DIFSRG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "more",
    color: "#9a8ec4",
    note: "Quarterly; subset of services.",
  },
  {
    id: "otherServices",
    label: "Other services",
    shortLabel: "Other svc",
    fredId: "DOTSRG3Q086SBEA",
    frequency: "quarterly",
    defaultOn: false,
    group: "more",
    color: "#a0a8b8",
    note: "Quarterly residual services bucket.",
  },
];

/** Current-dollar PCE for share-based contribution approximation */
export const PCE_EXPENDITURE_IDS = {
  total: "PCE",
  durables: "PCEDG",
  nondurables: "PCEND",
  services: "PCES",
  food: "DFXARC1M027SBEA",
  energy: "DNRGRC1M027SBEA",
} as const;

export type PceOverlayState = Record<PceCategoryId, boolean>;

export const DEFAULT_PCE_OVERLAY_STATE: PceOverlayState = Object.fromEntries(
  PCE_CATEGORY_DEFS.map((d) => [d.id, d.defaultOn])
) as PceOverlayState;

/** Contribution-remove state for the additive durables/ND/services partition */
export type PceContributionId = "durables" | "nondurables" | "services";

export type PceContributionState = Record<PceContributionId, boolean>;

export const DEFAULT_PCE_CONTRIBUTION_STATE: PceContributionState = {
  durables: true,
  nondurables: true,
  services: true,
};

export const PCE_OMITTED_NOTE =
  "Still not on FRED as clean monthly chain-type price indexes: net foreign travel, and most finer 2.4.4U lines. Apparel / recreation / food services / financial / other services are quarterly only (held constant within quarter). No dedicated PCE “computers / information processing equipment” FRED ID — use recreational goods & vehicles (includes that BEA bucket) plus CPI computers / IT overlays.";
