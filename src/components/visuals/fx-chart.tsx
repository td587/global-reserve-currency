"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fxData = [
  { t: "Jan", rate: 1.1 },
  { t: "Feb", rate: 1.08 },
  { t: "Mar", rate: 1.12 },
  { t: "Apr", rate: 1.09 },
  { t: "May", rate: 1.05 },
  { t: "Jun", rate: 1.03 },
  { t: "Jul", rate: 1.06 },
  { t: "Aug", rate: 1.02 },
];

export function FxChart() {
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-steel uppercase">
            EUR / USD
          </p>
          <p className="font-serif text-4xl text-paper md:text-5xl">1.02</p>
        </div>
        <p className="max-w-[12rem] text-right text-sm text-steel-soft">
          Dollar demand rises → euro buys fewer dollars
        </p>
      </div>
      <div className="h-48 w-full md:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={fxData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ea0b5" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#7ea0b5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgb(126 160 181 / 15%)" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fill: "#a8c0cf", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[1, 1.15]}
              tick={{ fill: "#a8c0cf", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0d2233",
                border: "1px solid rgb(126 160 181 / 30%)",
                borderRadius: 8,
                color: "#e8eef4",
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#7ea0b5"
              strokeWidth={2.5}
              fill="url(#fxFill)"
              isAnimationActive
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
