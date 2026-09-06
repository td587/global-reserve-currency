"use client";

const shares = [
  { code: "USD", pct: 58, color: "bg-steel" },
  { code: "EUR", pct: 20, color: "bg-steel-soft" },
  { code: "JPY", pct: 6, color: "bg-gold/80" },
  { code: "GBP", pct: 5, color: "bg-gold/55" },
  { code: "CNY", pct: 3, color: "bg-[#8fb39a]" },
  { code: "Other", pct: 8, color: "bg-muted-foreground/40" },
];

export function ReserveShareVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      {shares.map((s, i) => (
        <div key={s.code} className="grid grid-cols-[4rem_1fr_3rem] items-center gap-3">
          <span className="font-serif text-lg text-paper">{s.code}</span>
          <div className="h-3 overflow-hidden rounded-full bg-ink/50 md:h-3.5">
            <div
              className={`animate-bar-grow h-full rounded-full ${s.color}`}
              style={{
                width: `${s.pct}%`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          </div>
          <span className="text-right text-sm text-steel-soft">{s.pct}%</span>
        </div>
      ))}
      <p className="pt-1 text-center text-xs text-steel/80">
        Educational approximation of allocated FX reserve shares
      </p>
    </div>
  );
}
