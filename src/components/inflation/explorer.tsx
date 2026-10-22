"use client";

import { useMemo, useState, useTransition } from "react";
import { DataFreshnessBar } from "@/components/inflation/data-freshness";
import { useInflationData } from "@/components/inflation/data-provider";
import { InflationChart } from "@/components/inflation/inflation-chart";
import { ShockToggles } from "@/components/inflation/shock-toggles";
import {
  anyRemoved,
  buildChartSeries,
  latestSnapshot,
  removedLabels,
  withPceOverlayKeys,
} from "@/lib/inflation";
import {
  DEFAULT_PCE_CONTRIBUTION_STATE,
  DEFAULT_PCE_OVERLAY_STATE,
  PCE_CATEGORY_DEFS,
  PCE_OMITTED_NOTE,
  type PceContributionId,
  type PceContributionState,
  type PceCategoryId,
  type PceOverlayState,
} from "@/lib/pce-categories";
import {
  DEFAULT_TECH_OVERLAY_STATE,
  TECH_OVERLAY_DEFS,
  TECH_OVERLAY_NOTE,
  type TechOverlayId,
  type TechOverlayState,
} from "@/lib/tech-overlays";
import {
  CPI_SHOCK_IDS,
  DEFAULT_SHOCK_STATE,
  SHOCKS,
  type ShockId,
  type ShockState,
} from "@/lib/shocks";
import { cn } from "@/lib/utils";

export function InflationExplorer() {
  const { observations, inflationMeta } = useInflationData();
  const [state, setState] = useState<ShockState>(DEFAULT_SHOCK_STATE);
  const [mode, setMode] = useState<"cpi" | "pce">("cpi");
  const [showHeadlinePce, setShowHeadlinePce] = useState(true);
  const [showCorePce, setShowCorePce] = useState(true);
  const [pceOverlay, setPceOverlay] = useState<PceOverlayState>(
    DEFAULT_PCE_OVERLAY_STATE
  );
  const [pceContrib, setPceContrib] = useState<PceContributionState>(
    DEFAULT_PCE_CONTRIBUTION_STATE
  );
  const [techOverlay, setTechOverlay] = useState<TechOverlayState>(
    DEFAULT_TECH_OVERLAY_STATE
  );
  const [, startTransition] = useTransition();

  const chartData = useMemo(() => {
    const base = buildChartSeries(state, {
      mode,
      start: "2020-01",
      observations,
      pceContribState: mode === "pce" ? pceContrib : undefined,
    });
    return withPceOverlayKeys(base, pceOverlay, techOverlay);
  }, [state, mode, observations, pceContrib, pceOverlay, techOverlay]);

  const showCf = anyRemoved(state, mode, mode === "pce" ? pceContrib : undefined);
  const { last, peak } = useMemo(
    () =>
      latestSnapshot(
        state,
        mode,
        observations,
        mode === "pce" ? pceContrib : undefined
      ),
    [state, mode, observations, pceContrib]
  );
  const removed = removedLabels(
    state,
    mode,
    mode === "pce" ? pceContrib : undefined
  );
  const removedNames = removed.map((id) => {
    if (id === "demandPce") return "Demand (Shapiro)";
    const cat = PCE_CATEGORY_DEFS.find((d) => d.id === id);
    if (cat) return cat.shortLabel;
    return SHOCKS.find((s) => s.id === id)?.shortLabel ?? id;
  });

  function toggle(id: ShockId) {
    startTransition(() => {
      setState((s) => ({ ...s, [id]: !s[id] }));
    });
  }

  function togglePceOverlay(id: PceCategoryId) {
    startTransition(() => {
      setPceOverlay((s) => ({ ...s, [id]: !s[id] }));
    });
  }

  function togglePceContrib(id: PceContributionId) {
    startTransition(() => {
      setPceContrib((s) => ({ ...s, [id]: !s[id] }));
    });
  }

  function toggleTechOverlay(id: TechOverlayId) {
    startTransition(() => {
      setTechOverlay((s) => ({ ...s, [id]: !s[id] }));
    });
  }

  const aggregates = PCE_CATEGORY_DEFS.filter((d) => d.group === "aggregate");
  const details = PCE_CATEGORY_DEFS.filter((d) => d.group === "detail");
  const moreDetail = PCE_CATEGORY_DEFS.filter((d) => d.group === "more");
  const techCpi = TECH_OVERLAY_DEFS.filter((d) => d.source === "CPI");
  const techPpi = TECH_OVERLAY_DEFS.filter((d) => d.source === "PPI");

  return (
    <section
      id="explorer"
      className="relative scroll-mt-4 px-4 py-14 md:px-8 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <DataFreshnessBar className="mb-8" />
      </div>
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
                Solid line = published actual. Dashed amber = after removing OFF
                contributions
                {mode === "cpi"
                  ? " (BLS-style CPI approx.)."
                  : " (PCE durables/ND/services share×y/y and/or Shapiro demand)."}
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
              "min-h-[320px] md:min-h-[420px]"
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(232,163,92,0.12), transparent 55%)",
              }}
            />
            <div className="relative h-[320px] md:h-[400px]">
              <InflationChart
                data={chartData}
                showCounterfactual={showCf}
                mode={mode}
                showHeadlinePce={showHeadlinePce}
                showCorePce={showCorePce}
                pceOverlayState={pceOverlay}
                techOverlayState={techOverlay}
              />
            </div>
          </div>

          {/* AI / electronics / memory — CPI consumer + PPI producer */}
          <div className="mt-5 rounded-xl border border-[#7ec8e3]/25 bg-[#7ec8e3]/5 px-3 py-3">
            <p className="text-[0.65rem] tracking-wider text-[#7ec8e3] uppercase">
              AI / electronics / memory (FRED) — show / hide y/y
            </p>
            <p className="mt-1 text-[0.7rem] text-mist">
              Consumer CPI vs producer chip/component PPI. Overlay only — not
              contribution-remove. Works in CPI and PCE modes.
            </p>
            <p className="mt-3 text-[0.65rem] tracking-wider text-mist/80 uppercase">
              Consumer (CPI)
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {techCpi.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="switch"
                  aria-checked={techOverlay[d.id]}
                  onClick={() => toggleTechOverlay(d.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[0.7rem] transition-colors",
                    techOverlay[d.id]
                      ? "border-white/30 bg-paper/10 text-paper"
                      : "border-white/10 text-mist"
                  )}
                  title={`${d.fredId} — ${d.note}`}
                >
                  <span
                    className="mr-1.5 inline-block size-1.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  {d.shortLabel}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[0.65rem] tracking-wider text-mist/80 uppercase">
              Producer (PPI) — ≠ CPI electronics
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {techPpi.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="switch"
                  aria-checked={techOverlay[d.id]}
                  onClick={() => toggleTechOverlay(d.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[0.7rem] transition-colors",
                    techOverlay[d.id]
                      ? "border-[#c9a0dc]/50 bg-[#c9a0dc]/15 text-paper"
                      : "border-white/10 text-mist"
                  )}
                  title={`${d.fredId} — ${d.note}`}
                >
                  <span
                    className="mr-1.5 inline-block size-1.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  {d.shortLabel}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.65rem] leading-relaxed text-mist/60">
              {TECH_OVERLAY_NOTE}
            </p>
          </div>

          {/* Headline + Core PCE — always visible, equally clear */}
          <div className="mt-5 rounded-xl border border-white/10 bg-ink/30 px-3 py-3">
            <p className="text-[0.65rem] tracking-wider text-mist uppercase">
              PCE headline & core (FRED) — show / hide
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={mode === "pce" ? true : showHeadlinePce}
                disabled={mode === "pce"}
                onClick={() =>
                  startTransition(() => setShowHeadlinePce((v) => !v))
                }
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs transition-colors",
                  mode === "pce" && "cursor-default border-teal/40 bg-teal/15 text-teal-soft",
                  mode === "cpi" && showHeadlinePce
                    ? "border-teal/40 bg-teal/15 text-teal-soft"
                    : mode === "cpi"
                      ? "border-white/10 text-mist hover:border-white/25"
                      : ""
                )}
                title={
                  mode === "pce"
                    ? "Headline PCE (PCEPI) is the main solid line in PCE mode"
                    : "Toggle Headline PCE y/y overlay (FRED PCEPI)"
                }
              >
                Headline PCE (PCEPI) ·{" "}
                {mode === "pce" ? "main line" : showHeadlinePce ? "on" : "off"}
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={showCorePce}
                onClick={() => startTransition(() => setShowCorePce((v) => !v))}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  showCorePce
                    ? "border-[#6a9bb8]/60 bg-[#6a9bb8]/20 text-paper"
                    : "border-white/10 text-mist hover:border-white/25"
                )}
                title="Toggle Core PCE y/y (FRED PCEPILFE — PCE excluding food & energy)"
              >
                Core PCE (PCEPILFE) · {showCorePce ? "on" : "off"}
              </button>
            </div>
            <p className="mt-2 text-[0.7rem] text-mist/70">
              Core PCE = PCE excluding food and energy. Both series lag CPI by
              about a month in the release calendar.
            </p>
          </div>

          {/* PCE category toggles — visible especially in PCE mode */}
          <div
            className={cn(
              "mt-4 rounded-xl border px-3 py-3 transition-colors",
              mode === "pce"
                ? "border-teal/30 bg-teal/5"
                : "border-white/10 bg-ink/20 opacity-90"
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[0.65rem] tracking-wider text-teal uppercase">
                PCE categories (BEA Table 2.4.4 / FRED)
              </p>
              {mode !== "pce" && (
                <button
                  type="button"
                  className="text-[0.7rem] text-ember hover:underline"
                  onClick={() => startTransition(() => setMode("pce"))}
                >
                  Switch to PCE mode to chart categories →
                </button>
              )}
            </div>
            <p className="mt-1 text-[0.7rem] text-mist">
              ON = plot category price y/y. For durables / nondurables /
              services, a separate contribution switch removes approx. share×y/y
              from headline PCE.
            </p>

            <p className="mt-3 text-[0.65rem] tracking-wider text-mist/80 uppercase">
              Aggregates — show series
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {aggregates.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="switch"
                  aria-checked={pceOverlay[d.id]}
                  disabled={mode !== "pce"}
                  onClick={() => togglePceOverlay(d.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[0.7rem] transition-colors",
                    mode !== "pce" && "cursor-not-allowed opacity-40",
                    pceOverlay[d.id] && mode === "pce"
                      ? "border-white/30 bg-paper/10 text-paper"
                      : "border-white/10 text-mist"
                  )}
                >
                  <span
                    className="mr-1.5 inline-block size-1.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  {d.shortLabel}
                </button>
              ))}
            </div>

            {mode === "pce" && (
              <>
                <p className="mt-3 text-[0.65rem] tracking-wider text-ember/90 uppercase">
                  Contribution remove (durables · ND · services)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(
                    [
                      ["durables", "Durables"],
                      ["nondurables", "Nondurables"],
                      ["services", "Services"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="switch"
                      aria-checked={pceContrib[id]}
                      onClick={() => togglePceContrib(id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-[0.7rem] transition-colors",
                        pceContrib[id]
                          ? "border-teal/40 bg-teal/10 text-teal-soft"
                          : "border-ember/40 bg-ember/10 text-ember"
                      )}
                      title={
                        pceContrib[id]
                          ? "Included in PCE path"
                          : "Removed approx. contribution from headline PCE"
                      }
                    >
                      {label} · {pceContrib[id] ? "included" : "removed"}
                    </button>
                  ))}
                </div>
              </>
            )}

            <p className="mt-3 text-[0.65rem] tracking-wider text-mist/80 uppercase">
              Detail — show series
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {details.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="switch"
                  aria-checked={pceOverlay[d.id]}
                  disabled={mode !== "pce"}
                  onClick={() => togglePceOverlay(d.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[0.7rem] transition-colors",
                    mode !== "pce" && "cursor-not-allowed opacity-40",
                    pceOverlay[d.id] && mode === "pce"
                      ? "border-white/30 bg-paper/10 text-paper"
                      : "border-white/10 text-mist"
                  )}
                  title={`${d.fredId}${d.note ? ` — ${d.note}` : ""}`}
                >
                  <span
                    className="mr-1.5 inline-block size-1.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  {d.shortLabel}
                  {d.frequency === "quarterly" ? " (Q)" : ""}
                </button>
              ))}
            </div>

            <p className="mt-3 text-[0.65rem] tracking-wider text-mist/80 uppercase">
              More BEA detail (quarterly) — apparel · recreation · food svc · finance
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {moreDetail.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="switch"
                  aria-checked={pceOverlay[d.id]}
                  disabled={mode !== "pce"}
                  onClick={() => togglePceOverlay(d.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[0.7rem] transition-colors",
                    mode !== "pce" && "cursor-not-allowed opacity-40",
                    pceOverlay[d.id] && mode === "pce"
                      ? "border-white/30 bg-paper/10 text-paper"
                      : "border-white/10 text-mist"
                  )}
                  title={`${d.fredId}${d.note ? ` — ${d.note}` : ""}`}
                >
                  <span
                    className="mr-1.5 inline-block size-1.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  {d.shortLabel} (Q)
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.65rem] leading-relaxed text-mist/60">
              {PCE_OMITTED_NOTE}
            </p>
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
              : "All contribution factors included — flip a toggle to peel one off."}
          </p>
          <p className="mt-1 text-[0.7rem] text-mist/60">
            Data window {inflationMeta.window.start} → {inflationMeta.window.end}
            · as-of {inflationMeta.fetchedAt ?? inflationMeta.builtAt} · FRED /
            BLS / BEA / SF Fed
          </p>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ShockToggles
            state={state}
            mode={mode}
            onModeChange={(m) => startTransition(() => setMode(m))}
            onToggle={toggle}
            onReset={() =>
              startTransition(() => {
                setState({ ...DEFAULT_SHOCK_STATE });
                setPceContrib({ ...DEFAULT_PCE_CONTRIBUTION_STATE });
                setPceOverlay({ ...DEFAULT_PCE_OVERLAY_STATE });
                setTechOverlay({ ...DEFAULT_TECH_OVERLAY_STATE });
                setShowHeadlinePce(true);
                setShowCorePce(true);
              })
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
