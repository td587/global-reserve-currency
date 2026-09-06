"use client";

const pillars = [
  { title: "Trust", copy: "Credible institutions and contracts" },
  { title: "Depth", copy: "Liquid bond and money markets" },
  { title: "Openness", copy: "Convertibility at scale" },
  { title: "Network", copy: "Trade and finance already use it" },
];

export function PillarsVisual() {
  return (
    <div className="grid h-full grid-cols-2 gap-3 md:gap-4">
      {pillars.map((p, i) => (
        <div
          key={p.title}
          className="animate-slide-in flex flex-col justify-between rounded-xl border border-border bg-card/65 p-4 md:p-5"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <span className="font-serif text-2xl text-gold md:text-3xl">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="font-serif text-xl text-paper md:text-2xl">{p.title}</p>
            <p className="mt-1 text-sm text-steel-soft">{p.copy}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
