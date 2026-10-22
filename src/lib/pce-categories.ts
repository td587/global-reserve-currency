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
  | "transportServices";

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
  group: "aggregate" | "detail";
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
  "BEA Table 2.4.4 has many finer lines (apparel, recreation, financial services, etc.). This app shows the standard published aggregates students use plus food, energy, housing & utilities, health care, motor vehicles, and transportation services. Finer lines are omitted for UX — not missing from BEA.";
