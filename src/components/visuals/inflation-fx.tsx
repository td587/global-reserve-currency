"use client";

export function InflationFxVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="grid gap-3">
        <CompareRow
          label="Inflation in A"
          value="6%"
          width="88%"
          tone="warn"
          delay="0s"
        />
        <CompareRow
          label="Inflation in B"
          value="2%"
          width="36%"
          tone="ok"
          delay="0.12s"
        />
      </div>
      <div className="flex items-center gap-3 text-steel-soft">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs tracking-[0.2em] uppercase">implies</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-5">
        <p className="text-xs tracking-[0.16em] text-steel uppercase">
          Currency of A vs B
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="font-serif text-3xl text-paper md:text-4xl">Weaker A</p>
          <svg
            viewBox="0 0 160 56"
            className="h-14 w-36 text-gold"
            aria-hidden
          >
            <path
              d="M4 8 C40 10, 60 42, 156 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="animate-draw-line"
            />
            <circle cx="156" cy="48" r="4" fill="currentColor" className="animate-pulse-soft" />
          </svg>
        </div>
        <p className="mt-2 text-sm text-steel-soft">
          Faster inflation → less purchasing power abroad
        </p>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  value,
  width,
  tone,
  delay,
}: {
  label: string;
  value: string;
  width: string;
  tone: "warn" | "ok";
  delay: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-steel-soft">{label}</span>
        <span className="font-medium text-paper">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink/50">
        <div
          className={`animate-bar-grow h-full rounded-full ${
            tone === "warn" ? "bg-gold" : "bg-steel"
          }`}
          style={{ width, animationDelay: delay }}
        />
      </div>
    </div>
  );
}
