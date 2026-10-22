"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PCE_CATEGORY_DEFS, type PceOverlayState } from "@/lib/pce-categories";
import { TECH_OVERLAY_DEFS, type TechOverlayState } from "@/lib/tech-overlays";

type Props = {
  data: Array<Record<string, unknown>>;
  showCounterfactual: boolean;
  mode: "cpi" | "pce";
  showHeadlinePce: boolean;
  showCorePce: boolean;
  pceOverlayState?: PceOverlayState;
  techOverlayState?: TechOverlayState;
};

const NAME: Record<string, string> = {
  actual: "Actual",
  counterfactual: "Counterfactual",
  headlinePce: "Headline PCE y/y (PCEPI)",
  corePce: "Core PCE y/y (PCEPILFE)",
};

for (const d of PCE_CATEGORY_DEFS) {
  NAME[`pce_${d.id}`] = `${d.label} y/y`;
}
for (const d of TECH_OVERLAY_DEFS) {
  NAME[`tech_${d.id}`] = `${d.label} y/y`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="max-h-64 overflow-y-auto rounded-lg border border-white/15 bg-ink/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="mb-1.5 font-medium text-paper">{label}</p>
      {payload.map((p) =>
        p.value == null || Number.isNaN(Number(p.value)) ? null : (
          <p key={p.dataKey} className="flex justify-between gap-6 text-mist">
            <span style={{ color: p.color }}>
              {NAME[p.dataKey] ?? p.dataKey}
            </span>
            <span className="tabular-nums text-paper">
              {Number(p.value).toFixed(1)}%
            </span>
          </p>
        )
      )}
    </div>
  );
}

export function InflationChart({
  data,
  showCounterfactual,
  mode,
  showHeadlinePce,
  showCorePce,
  pceOverlayState,
  techOverlayState,
}: Props) {
  const activeCats = PCE_CATEGORY_DEFS.filter(
    (d) => pceOverlayState?.[d.id] && mode === "pce"
  );
  const activeTech = TECH_OVERLAY_DEFS.filter(
    (d) => techOverlayState?.[d.id]
  );

  return (
    <div className="h-full min-h-[280px] w-full animate-fade-rise">
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
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="plainline"
            wrapperStyle={{ fontSize: 11, color: "#9aabba", paddingBottom: 8 }}
          />
          <ReferenceLine
            y={2}
            stroke="rgba(126,160,181,0.35)"
            strokeDasharray="4 4"
            label={{
              value: "≈2% Fed focus",
              fill: "#7ea0b5",
              fontSize: 10,
              position: "insideTopRight",
            }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name={mode === "cpi" ? "Actual CPI y/y" : "Headline PCE y/y"}
            stroke="#e8eef4"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive
            animationDuration={700}
          />
          {showCounterfactual && (
            <Line
              type="monotone"
              dataKey="counterfactual"
              name="Counterfactual (contrib. removed)"
              stroke="#e8a35c"
              strokeWidth={2.5}
              strokeDasharray="7 5"
              dot={false}
              isAnimationActive
              animationDuration={700}
            />
          )}
          {showHeadlinePce && mode === "cpi" && (
            <Line
              type="monotone"
              dataKey="headlinePce"
              name="Headline PCE y/y (PCEPI)"
              stroke="#5eb7a5"
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive
              animationDuration={700}
            />
          )}
          {showCorePce && (
            <Line
              type="monotone"
              dataKey="corePce"
              name="Core PCE y/y (PCEPILFE)"
              stroke="#6a9bb8"
              strokeWidth={2}
              strokeDasharray={mode === "pce" ? undefined : "4 3"}
              dot={false}
              connectNulls
              isAnimationActive
              animationDuration={700}
            />
          )}
          {activeCats.map((d) => (
            <Line
              key={d.id}
              type="monotone"
              dataKey={`pce_${d.id}`}
              name={`${d.shortLabel}${d.frequency === "quarterly" ? " (Q)" : ""}`}
              stroke={d.color}
              strokeWidth={1.5}
              strokeDasharray={d.frequency === "quarterly" ? "2 3" : undefined}
              dot={false}
              connectNulls
              isAnimationActive
              animationDuration={500}
            />
          ))}
          {activeTech.map((d) => (
            <Line
              key={d.id}
              type="monotone"
              dataKey={`tech_${d.id}`}
              name={`${d.shortLabel} (${d.source})`}
              stroke={d.color}
              strokeWidth={1.6}
              strokeDasharray={d.source === "PPI" ? "5 3" : "3 2"}
              dot={false}
              connectNulls
              isAnimationActive
              animationDuration={500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
