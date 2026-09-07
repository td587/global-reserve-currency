"use client";

import { useMemo, useState } from "react";
import { reserveShareTimeline } from "@/lib/historical-data";

const barMeta = [
  { key: "usd" as const, code: "USD", color: "bg-steel" },
  { key: "eur" as const, code: "EUR", color: "bg-steel-soft" },
  { key: "jpy" as const, code: "JPY", color: "bg-gold/80" },
  { key: "gbp" as const, code: "GBP", color: "bg-gold/55" },
  { key: "cny" as const, code: "CNY", color: "bg-[#8fb39a]" },
  { key: "other" as const, code: "Other", color: "bg-muted-foreground/40" },
];

export function ReserveShareVisual() {
  const last = reserveShareTimeline.length - 1;
  const [idx, setIdx] = useState(last);
  const point = reserveShareTimeline[idx];

  const bars = useMemo(
    () =>
      barMeta.map((m) => ({
        ...m,
        code: m.key === "eur" && point.eurIsLegacy ? "EUR*" : m.code,
        pct: point[m.key],
      })),
    [point]
  );

  return (
    <div
      className="flex h-full flex-col justify-center gap-4"
      onKeyDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-steel uppercase">Year</p>
          <p className="font-serif text-4xl text-paper tabular-nums">{point.year}</p>
        </div>
        <p className="max-w-[14rem] text-right text-xs leading-relaxed text-steel-soft">
          Drag the slider to walk through allocated FX reserve shares
        </p>
      </div>

      <div className="space-y-2.5">
        {bars.map((s) => (
          <div
            key={s.code}
            className="grid grid-cols-[3.5rem_1fr_3.25rem] items-center gap-2 md:grid-cols-[4rem_1fr_3.5rem] md:gap-3"
          >
            <span className="font-serif text-base text-paper md:text-lg">{s.code}</span>
            <div className="h-3 overflow-hidden rounded-full bg-ink/50 md:h-3.5">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ease-out ${s.color}`}
                style={{ width: `${Math.min(100, s.pct)}%` }}
              />
            </div>
            <span className="text-right text-sm tabular-nums text-steel-soft">
              {s.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className="pt-1">
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={idx}
          aria-label="Reserve share timeline year"
          onChange={(e) => setIdx(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink/60 accent-[var(--gold)]"
        />
        <div className="mt-1.5 flex justify-between text-[0.65rem] tracking-wide text-steel/80 tabular-nums">
          <span>{reserveShareTimeline[0].year}</span>
          <span>{reserveShareTimeline[last].year}</span>
        </div>
      </div>

      <p className="text-[0.7rem] leading-relaxed text-steel/75">
        {point.eurIsLegacy
          ? "EUR* = Deutsche mark + French franc + ECU (pre-euro). "
          : ""}
        {point.source}. Figures are allocated FX reserve shares from IMF COFER /
        ECB compilations.
      </p>
    </div>
  );
}
