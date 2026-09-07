"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
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

type ChartRow = {
  year: number;
  usdShare: number | null;
  eventShare: number | null;
  eventLabel?: string;
  eventDescription?: string;
  quality?: "official" | "estimate";
};

function shareAt(year: number): { usdShare: number; quality?: "official" | "estimate" } {
  const exact = usdDominanceSeries.find((p) => p.year === year);
  if (exact) return { usdShare: exact.usdShare, quality: exact.quality };
  const before = [...usdDominanceSeries].reverse().find((p) => p.year < year);
  const after = usdDominanceSeries.find((p) => p.year > year);
  if (before && after) {
    const t = (year - before.year) / (after.year - before.year);
    return {
      usdShare: before.usdShare + t * (after.usdShare - before.usdShare),
      quality: "estimate",
    };
  }
  return { usdShare: before?.usdShare ?? after?.usdShare ?? 0 };
}

export function DominanceTimelineVisual() {
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);

  const data = useMemo(() => {
    const years = new Set<number>([
      ...usdDominanceSeries.map((p) => p.year),
      ...dominanceEvents.map((e) => e.year),
    ]);
    return [...years]
      .sort((a, b) => a - b)
      .map((year): ChartRow => {
        const { usdShare, quality } = shareAt(year);
        const matchedEvent = dominanceEvents.find((e) => e.year === year);
        return {
          year,
          usdShare,
          eventShare: matchedEvent ? usdShare : null,
          eventLabel: matchedEvent?.label,
          eventDescription: matchedEvent?.description,
          quality,
        };
      });
  }, []);

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
        <p className="hidden text-right text-xs text-steel-soft sm:block">
          Hover or tap gold markers
        </p>
      </div>

      <div className="min-h-[220px] flex-1 md:min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 4 }}>
            <defs>
              <linearGradient id="usdFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ea0b5" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7ea0b5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgb(126 160 181 / 12%)" vertical={false} />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1900, 2025]}
              ticks={[1900, 1925, 1950, 1975, 2000, 2025]}
              tick={{ fill: "#a8c0cf", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: "#a8c0cf", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              cursor={{ stroke: "rgb(196 163 90 / 35%)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload as ChartRow;
                if (row.eventLabel) {
                  return (
                    <div className="max-w-xs rounded-lg border border-gold/40 bg-ink/95 px-3 py-2 shadow-lg">
                      <p className="text-xs tracking-[0.14em] text-gold uppercase">
                        {row.year} · {row.eventLabel}
                      </p>
                      <p className="mt-1 text-sm leading-snug text-paper">
                        {row.eventDescription}
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="rounded-lg border border-border bg-ink/95 px-3 py-2">
                    <p className="text-xs text-steel">{row.year}</p>
                    <p className="font-serif text-lg text-paper">
                      {row.usdShare?.toFixed(1)}% USD
                    </p>
                    <p className="text-[0.65rem] text-steel-soft">
                      {row.quality === "estimate"
                        ? "Scholarly estimate (pre-COFER)"
                        : "IMF/ECB compiled share"}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="usdShare"
              stroke="#7ea0b5"
              strokeWidth={2.25}
              fill="url(#usdFill)"
              connectNulls
              isAnimationActive={false}
            />
            <Scatter
              dataKey="eventShare"
              fill="#c4a35a"
              stroke="#071521"
              strokeWidth={1}
              r={6}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {dominanceEvents.map((event) => (
          <button
            key={event.year}
            type="button"
            onClick={() =>
              setActiveEvent((cur) => (cur?.year === event.year ? null : event))
            }
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

      <div className="rounded-xl border border-border bg-card/60 px-3 py-2.5 min-h-[4.25rem]">
        {activeEvent ? (
          <>
            <p className="text-xs tracking-[0.14em] text-gold uppercase">
              {activeEvent.year} · {activeEvent.label}
            </p>
            <p className="mt-1 text-sm leading-snug text-paper">
              {activeEvent.description}
            </p>
          </>
        ) : (
          <p className="text-sm text-steel-soft">
            From 1965: IMF COFER / ECB compiled allocated shares. Before 1965:
            rounded estimates from Eichengreen & Flandreau and ECB long-run
            research. Gold dominated reserves before WWII.
          </p>
        )}
      </div>
    </div>
  );
}
