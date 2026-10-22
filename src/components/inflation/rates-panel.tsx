"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useInflationData } from "@/components/inflation/data-provider";
import {
  buildRatesChartData,
  DEFAULT_RATE_STATE,
  RATE_SERIES,
  type RateKey,
  type RateState,
} from "@/lib/rates";
import { cn } from "@/lib/utils";

export function RatesPanel() {
  const { ratesObservations, ratesMeta, mode: dataMode } = useInflationData();
  const [state, setState] = useState<RateState>(DEFAULT_RATE_STATE);
  const [, startTransition] = useTransition();
  const data = useMemo(
    () =>
      buildRatesChartData(
        "2020-01",
        ratesObservations as Array<Record<string, string | number | null>>
      ),
    [ratesObservations]
  );
  const active = RATE_SERIES.filter((s) => state[s.key]);

  function toggle(key: RateKey) {
    startTransition(() => setState((s) => ({ ...s, [key]: !s[key] })));
  }

  return (
    <section
      id="rates"
      className="scroll-mt-4 border-t border-white/10 px-4 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[0.65rem] tracking-[0.22em] text-teal uppercase">
          Markets
        </p>
        <h2 className="mt-2 font-serif text-3xl text-paper md:text-4xl">
          Rates & inflation expectations
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-mist md:text-base">
          Toggle FRED series on/off. TIPS lines are <em>real</em> yields
          (DFII); breakevens and 5y5y are inflation compensation — not pure
          survey expectations.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {RATE_SERIES.map((s) => (
            <button
              key={s.key}
              type="button"
              role="switch"
              aria-checked={state[s.key]}
              onClick={() => toggle(s.key)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-xs transition-all",
                state[s.key]
                  ? "border-white/25 bg-paper/10 text-paper"
                  : "border-white/10 bg-transparent text-mist/70 hover:border-white/20"
              )}
            >
              <span
                className="mr-2 inline-block size-2 rounded-full"
                style={{
                  background: state[s.key] ? s.color : "transparent",
                  boxShadow: state[s.key]
                    ? undefined
                    : `inset 0 0 0 1px ${s.color}`,
                }}
              />
              {s.shortLabel}
            </button>
          ))}
        </div>

        <div className="mt-6 min-h-[320px] rounded-2xl border border-white/10 bg-ink/50 p-3 md:min-h-[400px] md:p-5">
          <div className="h-[300px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="rgba(232,238,244,0.08)"
                  vertical={false}
                  strokeDasharray="3 6"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9aabba", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(232,238,244,0.12)" }}
                  interval="preserveStartEnd"
                  minTickGap={48}
                />
                <YAxis
                  tick={{ fill: "#9aabba", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={42}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(8,12,18,0.95)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 11, color: "#9aabba" }}
                />
                {active.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive
                    animationDuration={600}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ul className="mt-6 grid gap-3 text-xs text-mist sm:grid-cols-2">
          {RATE_SERIES.map((s) => (
            <li key={s.key}>
              <span className="text-paper">{s.label}</span> — {s.blurb}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.7rem] text-mist/60">
          Monthly averages of daily FRED · {ratesMeta.window.start} →{" "}
          {ratesMeta.window.end} ·{" "}
          {dataMode === "live-fred" ? "live pull" : "snapshot"} as-of{" "}
          {ratesMeta.fetchedAt ?? ratesMeta.builtAt} · {ratesMeta.frequency}
        </p>
      </div>
    </section>
  );
}
