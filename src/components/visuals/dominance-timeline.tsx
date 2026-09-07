"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  dominanceEvents,
  usdDominanceSeries,
  type TimelineEvent,
} from "@/lib/historical-data";

type SeriesRow = {
  year: number;
  usdShare: number;
  quality: "official" | "estimate";
};

type EventRow = {
  year: number;
  usdShare: number;
  label: string;
  description: string;
};

function shareAt(year: number): number {
  const exact = usdDominanceSeries.find((p) => p.year === year);
  if (exact) return exact.usdShare;
  const before = [...usdDominanceSeries].reverse().find((p) => p.year < year);
  const after = usdDominanceSeries.find((p) => p.year > year);
  if (before && after) {
    const t = (year - before.year) / (after.year - before.year);
    return before.usdShare + t * (after.usdShare - before.usdShare);
  }
  return before?.usdShare ?? after?.usdShare ?? 0;
}

export function DominanceTimelineVisual() {
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(
    dominanceEvents.find((e) => e.year === 1944) ?? null
  );

  const series = useMemo<SeriesRow[]>(
    () =>
      usdDominanceSeries.map((p) => ({
        year: p.year,
        usdShare: p.usdShare,
        quality: p.quality,
      })),
    []
  );

  const eventPoints = useMemo<EventRow[]>(
    () =>
      dominanceEvents.map((e) => ({
        year: e.year,
        usdShare: shareAt(e.year),
        label: e.label,
        description: e.description,
      })),
    []
  );

  const activeShare = activeEvent ? shareAt(activeEvent.year) : null;

  return (
    <div
      className="flex h-full flex-col gap-3"
      onKeyDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-steel uppercase">
            USD share of FX reserves
          </p>
          <p className="font-serif text-xl text-paper md:text-2xl">1900 → today</p>
        </div>
        {activeShare != null && activeEvent && (
          <p className="text-right font-serif text-2xl tabular-nums text-gold md:text-3xl">
            {activeShare.toFixed(0)}%
          </p>
        )}
      </div>

      {/* Explicit height — ResponsiveContainer collapses to 0 inside flex-1 alone */}
      <div className="h-[240px] w-full shrink-0 md:h-[280px]">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart margin={{ top: 16, right: 12, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="usdFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ea0b5" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#7ea0b5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgb(126 160 181 / 14%)" vertical={false} />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1900, 2025]}
              ticks={[1900, 1925, 1950, 1975, 2000, 2025]}
              tick={{ fill: "#a8c0cf", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDataOverflow
            />
            <YAxis
              dataKey="usdShare"
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: "#a8c0cf", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={42}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              cursor={{ stroke: "rgb(196 163 90 / 40%)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload as SeriesRow | EventRow;
                const ev = "label" in row ? row : null;
                if (ev) {
                  return (
                    <div className="max-w-xs rounded-lg border border-gold/40 bg-ink px-3 py-2 shadow-lg">
                      <p className="text-xs tracking-[0.14em] text-gold uppercase">
                        {ev.year} · {ev.label}
                      </p>
                      <p className="mt-1 font-serif text-lg text-paper">
                        ~{ev.usdShare.toFixed(0)}% USD
                      </p>
                      <p className="mt-1 text-sm leading-snug text-steel-soft">
                        {ev.description}
                      </p>
                    </div>
                  );
                }
                const s = row as SeriesRow;
                return (
                  <div className="rounded-lg border border-border bg-ink px-3 py-2">
                    <p className="text-xs text-steel">{s.year}</p>
                    <p className="font-serif text-lg text-paper">
                      {s.usdShare.toFixed(1)}% USD
                    </p>
                    <p className="text-[0.65rem] text-steel-soft">
                      {s.quality === "estimate"
                        ? "Scholarly estimate (pre-COFER)"
                        : "IMF/ECB compiled share"}
                    </p>
                  </div>
                );
              }}
            />
            {activeEvent && (
              <ReferenceLine
                x={activeEvent.year}
                stroke="#c4a35a"
                strokeDasharray="4 4"
                strokeOpacity={0.7}
              />
            )}
            <Area
              data={series}
              type="monotone"
              dataKey="usdShare"
              stroke="#7ea0b5"
              strokeWidth={2.5}
              fill="url(#usdFill)"
              isAnimationActive={false}
              name="USD share"
            />
            <Scatter
              data={eventPoints}
              dataKey="usdShare"
              fill="#c4a35a"
              stroke="#e8eef4"
              strokeWidth={1.5}
              name="Events"
              isAnimationActive={false}
              onClick={(state) => {
                const year = (state as { payload?: EventRow })?.payload?.year;
                const match = dominanceEvents.find((e) => e.year === year);
                if (match) setActiveEvent(match);
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {dominanceEvents.map((event) => (
          <button
            key={event.year}
            type="button"
            onClick={() => setActiveEvent(event)}
            className={`rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors ${
              activeEvent?.year === event.year
                ? "border-gold/60 bg-gold/15 text-gold"
                : "border-border bg-card/50 text-steel-soft hover:border-steel/50 hover:text-paper"
            }`}
          >
            {event.year}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card/70 px-3 py-2.5 min-h-[4.5rem]">
        {activeEvent ? (
          <>
            <p className="text-xs tracking-[0.14em] text-gold uppercase">
              {activeEvent.year} · {activeEvent.label}
              {activeShare != null ? ` · ~${activeShare.toFixed(0)}% USD` : ""}
            </p>
            <p className="mt-1 text-sm leading-snug text-paper">
              {activeEvent.description}
            </p>
          </>
        ) : (
          <p className="text-sm text-steel-soft">
            Tap a year chip or a gold point. From 1965: IMF COFER / ECB compiled
            shares. Before 1965: scholarly estimates (Eichengreen & Flandreau,
            ECB). Gold dominated reserves before WWII.
          </p>
        )}
      </div>
    </div>
  );
}
