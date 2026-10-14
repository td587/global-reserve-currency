import type { ReactNode } from "react";
import { PARAMS, type ModelLevels } from "@/lib/model";
import type { CurveVisibility, Solution } from "@/lib/types";

type Levels = ModelLevels;

type Props = {
  levels: Levels;
  base: Solution;
  shocked: Solution;
  show: CurveVisibility;
};

function extent(values: number[], pad = 0.18) {
  const finite = values.filter((value) => Number.isFinite(value));
  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (Math.abs(max - min) < 0.4) {
    min -= 0.6;
    max += 0.6;
  }
  const extra = (max - min) * pad;
  return { min: min - extra, max: max + extra };
}

function map(
  value: number,
  min: number,
  max: number,
  start: number,
  end: number,
) {
  return start + ((value - min) / (max - min)) * (end - start);
}

function ticks(min: number, max: number, count = 4) {
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, index) => min + step * index);
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function Frame({
  title,
  note,
  children,
  hidden,
}: {
  title: string;
  note: string;
  children: ReactNode;
  hidden?: boolean;
}) {
  return (
    <figure className="chart-card">
      <figcaption>
        <h3>{title}</h3>
        <p>{note}</p>
      </figcaption>
      {hidden ? <p className="chart-hidden">Hidden</p> : children}
    </figure>
  );
}

function Legend({
  items,
}: {
  items: { label: string; swatch: string }[];
}) {
  return (
    <div className="legend">
      {items.map((item) => (
        <span key={item.label}>
          <i style={{ background: item.swatch }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function SavingInvestmentChart({ levels, base, shocked, show }: Props) {
  const hidden = !show.saving && !show.investment;
  const rMin = Math.min(levels.rStar0, shocked.rStar, base.rStar) - 1.2;
  const rMax = Math.max(levels.rStar0, shocked.rStar, base.rStar) + 1.2;
  const quantity = (r: number, which: "s" | "i", sol: Solution) => {
    if (which === "i") {
      return -PARAMS.bI * (r - levels.rStar0) + sol.capex + PARAMS.psiProd * sol.gy;
    }
    return PARAMS.bS * (r - levels.rStar0) + sol.prec - PARAMS.psiSave * sol.gy;
  };
  const samples = [rMin, rMax];
  const qs = [
    quantity(rMin, "s", base),
    quantity(rMax, "s", base),
    quantity(rMin, "i", base),
    quantity(rMax, "i", base),
    quantity(rMin, "s", shocked),
    quantity(rMax, "s", shocked),
    quantity(rMin, "i", shocked),
    quantity(rMax, "i", shocked),
    0,
  ];
  const q = extent(qs, 0.2);
  const left = 52;
  const right = 610;
  const top = 18;
  const bottom = 248;
  const x = (value: number) => map(value, q.min, q.max, left, right);
  const y = (value: number) => map(value, rMin, rMax, bottom, top);
  const line = (which: "s" | "i", sol: Solution) => {
    const x1 = x(quantity(samples[0], which, sol));
    const y1 = y(samples[0]);
    const x2 = x(quantity(samples[1], which, sol));
    const y2 = y(samples[1]);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  };
  const qStar = (sol: Solution) =>
    PARAMS.bS * (sol.rStar - levels.rStar0) + sol.prec - PARAMS.psiSave * sol.gy;

  return (
    <Frame
      title="Saving and investment"
      note="Real rate on the vertical axis. Saving slopes up, investment slopes down. The dot is r*."
      hidden={hidden}
    >
      <svg viewBox="0 0 640 280" role="img" aria-label="Saving and investment diagram">
        <line className="axis" x1={left} y1={top} x2={left} y2={bottom} />
        <line className="axis" x1={left} y1={bottom} x2={right} y2={bottom} />
        {ticks(rMin, rMax).map((tick) => (
          <text key={tick} className="tick" x={left - 8} y={y(tick) + 4} textAnchor="end">
            {fmt(tick)}
          </text>
        ))}
        <text className="axis-label" x={16} y={132} transform="rotate(-90 16 132)">
          Real rate, percent
        </text>
        {show.saving && (
          <path d={line("s", base)} className="ghost" />
        )}
        {show.investment && (
          <path d={line("i", base)} className="ghost" />
        )}
        {show.saving && <path d={line("s", shocked)} className="solid-ink" />}
        {show.investment && (
          <path d={line("i", shocked)} className="solid-accent" />
        )}
        <circle className="dot-base" cx={x(qStar(base))} cy={y(base.rStar)} r="4.5" />
        <circle className="dot" cx={x(qStar(shocked))} cy={y(shocked.rStar)} r="5.5" />
      </svg>
      <Legend
        items={[
          { label: "Baseline", swatch: "#c2b8aa" },
          { label: "Saving", swatch: "#1c1917" },
          { label: "Investment", swatch: "#8c2f1b" },
        ]}
      />
    </Frame>
  );
}

export function IsFeChart({ levels, base, shocked, show }: Props) {
  const hidden = !show.is && !show.fe;
  const r0 = levels.i0 - levels.pi0;
  const rValues = [base.realPolicy, shocked.realPolicy, r0];
  const rExt = extent(rValues, 0.45);
  const yOf = (r: number, sol: Solution) =>
    levels.gap0 + sol.capex + PARAMS.demandShare * sol.gy - PARAMS.a * (r - r0);
  const yValues = [
    0,
    base.potential,
    shocked.potential,
    base.output,
    shocked.output,
    yOf(rExt.min, base),
    yOf(rExt.max, base),
    yOf(rExt.min, shocked),
    yOf(rExt.max, shocked),
  ];
  const yExt = extent(yValues, 0.12);
  const left = 52;
  const right = 610;
  const top = 18;
  const bottom = 248;
  const x = (value: number) => map(value, yExt.min, yExt.max, left, right);
  const y = (value: number) => map(value, rExt.min, rExt.max, bottom, top);
  const isPath = (sol: Solution) =>
    `M ${x(yOf(rExt.min, sol))} ${y(rExt.min)} L ${x(yOf(rExt.max, sol))} ${y(rExt.max)}`;

  return (
    <Frame
      title="IS and full employment"
      note="Output is measured against today's potential. The dot is the short-run policy equilibrium, not r*."
      hidden={hidden}
    >
      <svg viewBox="0 0 640 280" role="img" aria-label="IS and full employment diagram">
        <line className="axis" x1={left} y1={top} x2={left} y2={bottom} />
        <line className="axis" x1={left} y1={bottom} x2={right} y2={bottom} />
        {ticks(rExt.min, rExt.max).map((tick) => (
          <text key={tick} className="tick" x={left - 8} y={y(tick) + 4} textAnchor="end">
            {fmt(tick)}
          </text>
        ))}
        {ticks(yExt.min, yExt.max).map((tick) => (
          <text key={`x-${tick}`} className="tick" x={x(tick)} y={bottom + 16} textAnchor="middle">
            {fmt(tick)}
          </text>
        ))}
        {show.fe && (
          <line className="ghost" x1={x(base.potential)} y1={top} x2={x(base.potential)} y2={bottom} />
        )}
        {show.is && <path d={isPath(base)} className="ghost" />}
        {show.fe && (
          <line
            className="solid-ink"
            x1={x(shocked.potential)}
            y1={top}
            x2={x(shocked.potential)}
            y2={bottom}
          />
        )}
        {show.is && <path d={isPath(shocked)} className="solid-accent" />}
        <circle className="dot-base" cx={x(base.output)} cy={y(base.realPolicy)} r="4.5" />
        <circle className="dot" cx={x(shocked.output)} cy={y(shocked.realPolicy)} r="5.5" />
      </svg>
      <Legend
        items={[
          { label: "Baseline", swatch: "#c2b8aa" },
          { label: "IS", swatch: "#8c2f1b" },
          { label: "FE", swatch: "#1c1917" },
        ]}
      />
    </Frame>
  );
}

export function PhillipsChart({ levels, base, shocked, show }: Props) {
  const gapExt = extent(
    [base.gap, shocked.gap, levels.gap0 - 1.2, levels.gap0 + 1.2],
    0.2,
  );
  const piLine = (gap: number) =>
    levels.pi0 + PARAMS.kappa * (gap - levels.gap0);
  const piExt = extent(
    [piLine(gapExt.min), piLine(gapExt.max), PARAMS.piTarget, base.inflation, shocked.inflation],
    0.12,
  );
  const left = 52;
  const right = 610;
  const top = 18;
  const bottom = 248;
  const x = (value: number) => map(value, gapExt.min, gapExt.max, left, right);
  const y = (value: number) => map(value, piExt.min, piExt.max, bottom, top);

  return (
    <Frame
      title="Phillips curve"
      note="The curve does not shift. The economy moves along it. The dashed line is the Fed's 2 percent target, not a print."
      hidden={!show.phillips}
    >
      <svg viewBox="0 0 640 280" role="img" aria-label="Phillips curve">
        <line className="axis" x1={left} y1={top} x2={left} y2={bottom} />
        <line className="axis" x1={left} y1={bottom} x2={right} y2={bottom} />
        {ticks(piExt.min, piExt.max).map((tick) => (
          <text key={tick} className="tick" x={left - 8} y={y(tick) + 4} textAnchor="end">
            {fmt(tick)}
          </text>
        ))}
        <line
          className="target"
          x1={left}
          y1={y(PARAMS.piTarget)}
          x2={right}
          y2={y(PARAMS.piTarget)}
        />
        <path
          d={`M ${x(gapExt.min)} ${y(piLine(gapExt.min))} L ${x(gapExt.max)} ${y(piLine(gapExt.max))}`}
          className="solid-accent"
        />
        <circle className="dot-base" cx={x(base.gap)} cy={y(base.inflation)} r="4.5" />
        <circle className="dot" cx={x(shocked.gap)} cy={y(shocked.inflation)} r="5.5" />
      </svg>
      <Legend
        items={[
          { label: "Phillips curve", swatch: "#8c2f1b" },
          { label: "2 percent target", swatch: "#8a8175" },
        ]}
      />
    </Frame>
  );
}

export function YieldChart({ base, shocked, show }: Props) {
  const hidden = !show.expectedPath && !show.termPremium;
  const rows = [
    show.expectedPath
      ? { label: "Expected path", base: base.expected, shocked: shocked.expected }
      : null,
    show.termPremium
      ? { label: "Term premium", base: base.termPremium, shocked: shocked.termPremium }
      : null,
    { label: "10-year yield", base: base.y10, shocked: shocked.y10 },
  ].filter((row): row is { label: string; base: number; shocked: number } => row != null);

  const values = rows.flatMap((row) => [row.base, row.shocked]);
  const ext = extent(values, 0.25);
  const left = 118;
  const right = 610;
  const top = 28;

  return (
    <Frame
      title="Long yield: expected path and term premium"
      note="ACM 10-year yield on 9 October 2026. Hollow marks are the baseline. Solid marks are the shock."
      hidden={hidden}
    >
      <svg viewBox="0 0 640 220" role="img" aria-label="Long yield decomposition">
        <line className="axis" x1={left} y1={top} x2={left} y2={190} />
        {ticks(ext.min, ext.max).map((tick) => (
          <text
            key={tick}
            className="tick"
            x={map(tick, ext.min, ext.max, left, right)}
            y="208"
            textAnchor="middle"
          >
            {fmt(tick)}
          </text>
        ))}
        {rows.map((row, index) => {
          const y = 48 + index * 48;
          const x0 = map(row.base, ext.min, ext.max, left, right);
          const x1 = map(row.shocked, ext.min, ext.max, left, right);
          return (
            <g key={row.label}>
              <text className="tick" x={left - 10} y={y + 4} textAnchor="end">
                {row.label}
              </text>
              <line className="ghost" x1={x0} y1={y} x2={x1} y2={y} />
              <circle className="dot-base" cx={x0} cy={y} r="4.5" />
              <circle className="dot" cx={x1} cy={y} r="5.5" />
            </g>
          );
        })}
      </svg>
      <Legend
        items={[
          { label: "Baseline", swatch: "#c2b8aa" },
          { label: "After the shock", swatch: "#8c2f1b" },
        ]}
      />
    </Frame>
  );
}
