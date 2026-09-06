"use client";

const eras = [
  { year: "1914", label: "War finance", detail: "Gold convertibility suspended" },
  { year: "1920s", label: "Fragile return", detail: "Uneven gold stocks" },
  { year: "1930s", label: "Breakdown", detail: "Devaluations & controls" },
];

export function CollapseVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="relative">
        <div className="absolute top-5 right-2 left-2 h-px bg-border md:top-6" />
        <ol className="relative grid grid-cols-3 gap-2">
          {eras.map((era, i) => (
            <li
              key={era.year}
              className="animate-slide-in flex flex-col items-center text-center"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="mb-3 size-3 rounded-full bg-gold shadow-[0_0_0_6px_rgb(196_163_90/20%)] md:mb-4" />
              <p className="font-serif text-xl text-paper md:text-2xl">{era.year}</p>
              <p className="mt-1 text-sm font-medium text-steel">{era.label}</p>
              <p className="mt-1 text-xs text-steel-soft md:text-sm">{era.detail}</p>
            </li>
          ))}
        </ol>
      </div>
      <p className="rounded-xl border border-border bg-card/70 p-4 text-center text-sm text-steel-soft md:text-base">
        Fixed gold pegs could not survive politics that demanded deficit spending
      </p>
    </div>
  );
}
