export type CpiShockId =
  | "energy"
  | "food"
  | "usedVehicles"
  | "airfares"
  | "shelter"
  | "servicesExShelter";

export type ShockId = CpiShockId | "demandPce";

export type ShockDef = {
  id: ShockId;
  label: string;
  shortLabel: string;
  episode: string;
  /** Shown under the toggle */
  offMeans: string;
  kind: "cpi-contribution" | "pce-shapiro";
  accent: string;
};

export const SHOCKS: ShockDef[] = [
  {
    id: "energy",
    label: "Energy",
    shortLabel: "Energy",
    episode: "Oil rebound & Russia–Ukraine (2021–22)",
    offMeans: "Remove energy’s approx. contribution to CPI y/y",
    kind: "cpi-contribution",
    accent: "#e8a35c",
  },
  {
    id: "food",
    label: "Food",
    shortLabel: "Food",
    episode: "Global food & logistics (2021–22)",
    offMeans: "Remove food’s approx. contribution to CPI y/y",
    kind: "cpi-contribution",
    accent: "#7cb89a",
  },
  {
    id: "usedVehicles",
    label: "Used vehicles",
    shortLabel: "Used cars",
    episode: "COVID supply chain / chips (2021–22)",
    offMeans: "Remove used-vehicle contribution to CPI y/y",
    kind: "cpi-contribution",
    accent: "#6a9bb8",
  },
  {
    id: "airfares",
    label: "Airfares",
    shortLabel: "Airfares",
    episode: "Travel reopening spike",
    offMeans: "Remove airline-fare contribution to CPI y/y",
    kind: "cpi-contribution",
    accent: "#c4879a",
  },
  {
    id: "shelter",
    label: "Shelter lag",
    shortLabel: "Shelter",
    episode: "Sticky rents & OER lag",
    offMeans: "Remove shelter’s approx. contribution to CPI y/y",
    kind: "cpi-contribution",
    accent: "#b8a06a",
  },
  {
    id: "servicesExShelter",
    label: "Services ex-shelter",
    shortLabel: "Services*",
    episode: "Labor tightness / wage–services proxy",
    offMeans: "Remove services ex-energy & shelter contribution (proxy)",
    kind: "cpi-contribution",
    accent: "#8f9ec2",
  },
  {
    id: "demandPce",
    label: "Demand impulse",
    shortLabel: "Demand",
    episode: "Fiscal + pent-up demand (Shapiro PCE)",
    offMeans: "On PCE lens: remove SF Fed demand-driven y/y contribution",
    kind: "pce-shapiro",
    accent: "#d07a5c",
  },
];

export const CPI_SHOCK_IDS: CpiShockId[] = [
  "energy",
  "food",
  "usedVehicles",
  "airfares",
  "shelter",
  "servicesExShelter",
];

export type ShockState = Record<ShockId, boolean>;

/** true = included in path; false = contribution removed */
export const DEFAULT_SHOCK_STATE: ShockState = {
  energy: true,
  food: true,
  usedVehicles: true,
  airfares: true,
  shelter: true,
  servicesExShelter: true,
  demandPce: true,
};
