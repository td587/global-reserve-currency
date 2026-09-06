"use client";

const steps = [
  { year: "1945", label: "Industrial creditor" },
  { year: "1950s", label: "Marshall & trade" },
  { year: "1970s", label: "Petrodollars" },
  { year: "Today", label: "Network lock-in" },
];

export function UsdRiseVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="relative">
        <div className="absolute top-[1.35rem] right-4 left-4 h-px bg-steel/30" />
        <ol className="relative grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-2">
          {steps.map((s, i) => (
            <li
              key={s.year}
              className="animate-slide-in text-center"
              style={{ animationDelay: `${i * 0.09}s` }}
            >
              <span className="mx-auto mb-3 block size-2.5 rounded-full bg-steel" />
              <p className="font-serif text-lg text-gold md:text-xl">{s.year}</p>
              <p className="mt-1 text-sm text-paper">{s.label}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-5">
        <p className="font-serif text-2xl text-paper md:text-3xl">
          Depth + habit + oil invoicing
        </p>
        <p className="mt-2 text-sm text-steel-soft md:text-base">
          Once everyone prices and borrows in dollars, switching costs compound
        </p>
      </div>
    </div>
  );
}
