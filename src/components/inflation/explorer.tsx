"use client";

import { useMemo, useState, useTransition } from "react";
import { InflationChart } from "@/components/inflation/inflation-chart";
import { ShockToggles } from "@/components/inflation/shock-toggles";
import {
  anyRemoved,
  buildChartSeries,
  inflationMeta,
  latestSnapshot,
  removedLabels,
} from "@/lib/inflation";
import {
  CPI_SHOCK_IDS,
  DEFAULT_SHOCK_STATE,
  SHOCKS,
  type ShockId,
  type ShockState,
} from "@/lib/shocks";
import { cn } from "@/lib/utils";

export function InflationExplorer() {
  const [state, setState] = useState<ShockState>(DEFAULT_SHOCK_STATE);
  const [mode, setMode] = useState<"cpi" | "pce">("cpi");
  const [showHeadlinePce, setShowHeadlinePce] = useState(false);
  const [showCorePce, setShowCorePce] = useState(true);
  const [, startTransition] = useTransition();

  const chartData = useMemo(
    () => buildChartSeries(state, { mode, start: "2020-01" }),
    [state, mode]
  );
  const showCf = anyRemoved(state, mode);
  const { last, peak } = useMemo(
    () => latestSnapshot(state, mode),
    [state, mode]
  );
  const removed = removedLabels(state, mode);
  const removedNames = removed
    .map((id) => SHOCKS.find((s) => s.id === id)?.shortLabel)
    .filter(Boolean);

  function toggle(id: ShockId) {
    startTransition(() => {
      setState((s) => ({ ...s, [id]: !s[id] }));
    });
  }

  return (
    <section
      id="explorer"
      className="relative scroll-mt-4 px-4 py-14 md:px-8 md:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-12">
        <div className="flex min-h-0 flex-col">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] tracking-[0.22em] text-teal uppercase">
                Live path
              </p>
              <h2 className="font-serif text-3xl text-paper md:text-4xl">
                {mode === "cpi" ? "CPI year-over-year" : "PCE year-over-year"}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-mist">
                Solid line = published actual. Dashed = after removing OFF
                factors
                {mode === "cpi"
                  ? " (BLS-style approx. contributions)."
                  : " (Shapiro demand contribution on PCE)."}
              </p>
            </div>
            <div className="flex gap-6 tabular-nums">
              <div>
                <p className="text-[0.65rem] tracking-wider text-mist uppercase">
                  Latest actual
                </p>
                <p className="font-serif text-2xl text-paper">
                  {last ? `${last.actual.toFixed(1)}%` : "—"}
                </p>
              </div>
              {showCf && last?.counterfactual != null && (
                <div className="animate-fade-rise">
                  <p className="text-[0.65rem] tracking-wider text-ember uppercase">
                    Counterfactual
                  </p>
                  <p className="font-serif text-2xl text-ember">
                    {last.counterfactual.toFixed(1)}%
                  </p>
                </div>
              )}
              <div>
                <p className="text-[0.65rem] tracking-wider text-mist uppercase">
                  Peak actual
                </p>
                <p className="font-serif text-2xl text-paper/80">
                  {peak ? `${peak.actual.toFixed(1)}%` : "—"}
                </p>
                <p className="text-[0.65rem] text-mist/70">{peak?.label}</p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-ink/50 p-3 md:p-5",
              "min-h-[320px] md:min-h-[400px]"
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(232,163,92,0.12), transparent 55%)",
              }}
            />
            <div className="relative h-[300px] md:h-[380px]">
              <InflationChart
                data={chartData}
                showCounterfactual={showCf}
                mode={mode}
                showHeadlinePce={showHeadlinePce}
                showCorePce={showCorePce}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <p className="mr-2 self-center text-[0.65rem] tracking-wider text-mist uppercase">
              Overlay series
            </p>
            <button
              type="button"
              role="switch"
              aria-checked={showHeadlinePce}
              disabled={mode === "pce"}
              onClick={() =>
                startTransition(() => setShowHeadlinePce((v) => !v))
              }
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                mode === "pce" && "cursor-not-allowed opacity-40",
                showHeadlinePce && mode === "cpi"
                  ? "border-teal/40 bg-teal/15 text-teal-soft"
                  : "border-white/10 text-mist hover:border-white/25"
              )}
              title={
                mode === "pce"
                  ? "Headline PCE is the actual line in PCE mode"
                  : undefined
              }
            >
              Headline PCE {showHeadlinePce && mode === "cpi" ? "· on" : "· off"}
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={showCorePce}
              onClick={() => startTransition(() => setShowCorePce((v) => !v))}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                showCorePce
                  ? "border-[#6a9bb8]/50 bg-[#6a9bb8]/15 text-paper"
                  : "border-white/10 text-mist hover:border-white/25"
              )}
            >
              Core PCE {showCorePce ? "· on" : "· off"}
            </button>
          </div>

          <p
            className={cn(
              "mt-3 min-h-[2.5rem] text-sm transition-opacity",
              showCf ? "text-ember/90 opacity-100" : "opacity-50 text-mist"
            )}
            aria-live="polite"
          >
            {showCf
              ? `Counterfactual removes: ${removedNames.join(", ")} (−${last?.removedPp ?? 0} pp at latest month). Accounting path only — not a full GE “what if.”`
              : "All factors included — counterfactual matches actual. Flip a toggle to peel one off."}
          </p>
          <p className="mt-1 text-[0.7rem] text-mist/60">
            Data window {inflationMeta.window.start} → {inflationMeta.window.end}
            · built {inflationMeta.builtAt} · FRED / BLS / SF Fed
          </p>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ShockToggles
            state={state}
            mode={mode}
            onModeChange={(m) => startTransition(() => setMode(m))}
            onToggle={toggle}
            onReset={() =>
              startTransition(() => setState({ ...DEFAULT_SHOCK_STATE }))
            }
            onClearAll={() =>
              startTransition(() =>
                setState((s) => {
                  const next = { ...s };
                  for (const id of CPI_SHOCK_IDS) next[id] = false;
                  return next;
                })
              )
            }
          />
        </div>
      </div>
    </section>
  );
}
