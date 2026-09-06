"use client";

const items = [
  {
    title: "Multipolar reserves",
    copy: "Slow diversification, not overnight replacement",
  },
  {
    title: "Institutional depth",
    copy: "Challengers need liquid safe assets at scale",
  },
  {
    title: "Capital openness",
    copy: "Convertibility still gates reserve status",
  },
  {
    title: "New rails",
    copy: "Digital money may change pipes before the unit",
  },
];

export function ChallengesVisual() {
  return (
    <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <div
          key={item.title}
          className="animate-slide-in rounded-xl border border-border bg-card/65 p-4 md:p-5"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <p className="font-serif text-xl text-paper md:text-2xl">{item.title}</p>
          <p className="mt-2 text-sm text-steel-soft">{item.copy}</p>
        </div>
      ))}
    </div>
  );
}
