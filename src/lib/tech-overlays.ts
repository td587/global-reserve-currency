/**
 * AI / electronics / memory-related price overlays (CPI consumer + PPI producer).
 * Show/hide y/y only — not CPI contribution-remove (PPI is outside CPI; RI for
 * fine CPI electronics lines is small and easy to over-claim for "AI memory").
 */

export type TechOverlayId =
  | "cpiComputers"
  | "cpiItHardware"
  | "ppiSemiconductors"
  | "ppiElectronicComponents";

export type TechOverlayDef = {
  id: TechOverlayId;
  label: string;
  shortLabel: string;
  fredId: string;
  source: "CPI" | "PPI";
  defaultOn: boolean;
  color: string;
  note: string;
};

export const TECH_OVERLAY_DEFS: TechOverlayDef[] = [
  {
    id: "cpiComputers",
    label: "CPI: Computers & peripherals",
    shortLabel: "CPI computers",
    fredId: "CUSR0000SEEE01",
    source: "CPI",
    defaultOn: false,
    color: "#7ec8e3",
    note: "BLS CPI-U Computers, peripherals, and smart home assistants — consumer equipment, not chip fab costs.",
  },
  {
    id: "cpiItHardware",
    label: "CPI: IT hardware & services",
    shortLabel: "CPI IT hw/svc",
    fredId: "CUSR0000SEEE",
    source: "CPI",
    defaultOn: false,
    color: "#5eb0d0",
    note: "Broader IT hardware & services; overlaps CPI computers (SEEE01 ⊂ SEEE).",
  },
  {
    id: "ppiSemiconductors",
    label: "PPI: Semiconductor devices",
    shortLabel: "PPI semis",
    fredId: "PCU334413334413",
    source: "PPI",
    defaultOn: false,
    color: "#c9a0dc",
    note: "Producer prices for semiconductor & related device mfg — not headline CPI electronics. Honest AI/memory cost channel vs consumer gear.",
  },
  {
    id: "ppiElectronicComponents",
    label: "PPI: Electronic components",
    shortLabel: "PPI e-components",
    fredId: "WPU1178",
    source: "PPI",
    defaultOn: false,
    color: "#b388c9",
    note: "Commodity PPI electronic components & accessories — producer/input lens; ≠ CPI IT.",
  },
];

export type TechOverlayState = Record<TechOverlayId, boolean>;

export const DEFAULT_TECH_OVERLAY_STATE: TechOverlayState = Object.fromEntries(
  TECH_OVERLAY_DEFS.map((d) => [d.id, d.defaultOn])
) as TechOverlayState;

export const TECH_OVERLAY_NOTE =
  "Chip / component PPI is a producer cost channel — it is not the same as CPI computers or IT hardware. CPI IT lines overlap each other; toggling both double-plots related consumer series. None of these enter CPI contribution-remove math.";
