"use client";

const rails = [
  { label: "Trade invoices", share: "Often USD-priced" },
  { label: "Commodities", share: "Oil & metals in $" },
  { label: "Safe asset", share: "U.S. Treasuries" },
  { label: "Bank funding", share: "Dollar credit cycle" },
];

export function PlumbingVisual() {
  return (
    <div className="grid h-full grid-cols-2 gap-3 md:gap-4">
      {rails.map((r, i) => (
        <div
          key={r.label}
          className="animate-slide-in flex flex-col justify-between rounded-xl border border-border bg-card/65 p-4 md:p-5"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <p className="text-xs tracking-[0.14em] text-steel uppercase">
            Rail {String(i + 1).padStart(2, "0")}
          </p>
          <div>
            <p className="font-serif text-xl text-paper md:text-2xl">{r.label}</p>
            <p className="mt-1 text-sm text-steel-soft">{r.share}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
