"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import embeddedInflation from "@/data/inflation-series.json";
import embeddedRates from "@/data/rates-series.json";
import type { Observation } from "@/lib/inflation";
import type { RateObservation } from "@/lib/fred-pipeline";

export type DataMode = "snapshot" | "live-fred";

type InflationMeta = typeof embeddedInflation.meta & {
  fetchedAt?: string;
  mode?: DataMode;
};

type RatesMeta = typeof embeddedRates.meta & {
  fetchedAt?: string;
  mode?: DataMode;
};

type DataContextValue = {
  mode: DataMode;
  inflationMeta: InflationMeta;
  ratesMeta: RatesMeta;
  observations: Observation[];
  ratesObservations: RateObservation[];
  refreshing: boolean;
  error: string | null;
  notes: string[];
  lastFetchedAt: string | null;
  refresh: () => Promise<void>;
  resetToSnapshot: () => void;
};

const DataContext = createContext<DataContextValue | null>(null);

export function InflationDataProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DataMode>("snapshot");
  const [observations, setObservations] = useState<Observation[]>(
    embeddedInflation.observations as Observation[]
  );
  const [ratesObservations, setRatesObservations] = useState<RateObservation[]>(
    embeddedRates.observations as RateObservation[]
  );
  const [inflationMeta, setInflationMeta] = useState<InflationMeta>({
    ...embeddedInflation.meta,
    mode: "snapshot",
    fetchedAt: undefined,
  });
  const [ratesMeta, setRatesMeta] = useState<RatesMeta>({
    ...embeddedRates.meta,
    mode: "snapshot",
    fetchedAt: undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [refreshing, startTransition] = useTransition();
  const [pending, setPending] = useState(false);

  const resetToSnapshot = useCallback(() => {
    setMode("snapshot");
    setObservations(embeddedInflation.observations as Observation[]);
    setRatesObservations(embeddedRates.observations as RateObservation[]);
    setInflationMeta({
      ...embeddedInflation.meta,
      mode: "snapshot",
      fetchedAt: undefined,
    });
    setRatesMeta({
      ...embeddedRates.meta,
      mode: "snapshot",
      fetchedAt: undefined,
    });
    setLastFetchedAt(null);
    setError(null);
    setNotes([]);
  }, []);

  const refresh = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/data/refresh", { method: "POST" });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Refresh failed (${res.status})`);
      }
      startTransition(() => {
        setMode("live-fred");
        setObservations(body.inflation.observations);
        setInflationMeta({
          ...embeddedInflation.meta,
          ...body.inflation.meta,
          mode: "live-fred",
          fetchedAt: body.fetchedAt,
        });
        if (body.rates?.observations) {
          setRatesObservations(body.rates.observations);
          setRatesMeta({
            ...embeddedRates.meta,
            ...body.rates.meta,
            mode: "live-fred",
            fetchedAt: body.fetchedAt,
          });
        }
        setLastFetchedAt(body.fetchedAt);
        setNotes(Array.isArray(body.notes) ? body.notes : []);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setPending(false);
    }
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      mode,
      inflationMeta,
      ratesMeta,
      observations,
      ratesObservations,
      refreshing: pending || refreshing,
      error,
      notes,
      lastFetchedAt,
      refresh,
      resetToSnapshot,
    }),
    [
      mode,
      inflationMeta,
      ratesMeta,
      observations,
      ratesObservations,
      pending,
      refreshing,
      error,
      notes,
      lastFetchedAt,
      refresh,
      resetToSnapshot,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useInflationData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useInflationData must be used within InflationDataProvider");
  }
  return ctx;
}
