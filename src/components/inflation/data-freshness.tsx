"use client";

import { useInflationData } from "@/components/inflation/data-provider";
import { cn } from "@/lib/utils";

function formatStamp(isoOrDate: string) {
  // Accept YYYY-MM-DD or full ISO
  const d = new Date(isoOrDate.includes("T") ? isoOrDate : `${isoOrDate}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoOrDate;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: isoOrDate.includes("T") ? "2-digit" : undefined,
    minute: isoOrDate.includes("T") ? "2-digit" : undefined,
    timeZoneName: isoOrDate.includes("T") ? "short" : undefined,
  });
}

export function DataFreshnessBar({ className }: { className?: string }) {
  const {
    mode,
    inflationMeta,
    refreshing,
    error,
    notes,
    lastFetchedAt,
    refresh,
    resetToSnapshot,
  } = useInflationData();

  const asOf =
    mode === "live-fred" && lastFetchedAt
      ? lastFetchedAt
      : inflationMeta.builtAt;
  const windowEnd = inflationMeta.window?.end;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-white/10 bg-ink/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 text-xs leading-relaxed text-mist">
        <p>
          <span
            className={cn(
              "mr-2 inline-block rounded px-1.5 py-0.5 text-[0.65rem] tracking-wider uppercase",
              mode === "live-fred"
                ? "bg-teal/20 text-teal-soft"
                : "bg-paper/10 text-paper/80"
            )}
          >
            {mode === "live-fred" ? "Live FRED pull" : "Embedded snapshot"}
          </span>
          <span className="text-paper">
            Last updated {formatStamp(asOf)}
          </span>
          {windowEnd && (
            <span className="text-mist/80">
              {" "}
              · series through {windowEnd}
            </span>
          )}
        </p>
        <p className="mt-0.5 text-[0.7rem] text-mist/70">
          Source:{" "}
          <a
            href="https://fred.stlouisfed.org/"
            className="text-ember/90 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            FRED / BLS
          </a>
          {mode === "snapshot"
            ? " · baked into this deploy (not auto-updating)"
            : " · re-fetched via /api/data/refresh (no API key)"}
        </p>
        {notes.length > 0 && mode === "live-fred" && (
          <p className="mt-1 text-[0.65rem] text-mist/60">{notes[0]}</p>
        )}
        {error && (
          <p className="mt-1 text-[0.7rem] text-red-300" role="alert">
            Refresh failed: {error}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className={cn(
            "rounded-lg bg-ember px-3 py-2 text-xs font-medium text-ink transition",
            "hover:bg-ember/90 disabled:cursor-wait disabled:opacity-60"
          )}
        >
          {refreshing ? "Refreshing…" : "Refresh data"}
        </button>
        {mode === "live-fred" && (
          <button
            type="button"
            onClick={resetToSnapshot}
            disabled={refreshing}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-mist hover:border-white/30 hover:text-paper"
          >
            Use snapshot
          </button>
        )}
      </div>
    </div>
  );
}
