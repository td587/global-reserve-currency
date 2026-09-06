"use client";

export function NixonVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Era
          title="Before"
          items={["USD ↔ gold", "Others ↔ USD", "Fixed corridors"]}
          muted
        />
        <Era
          title="After 1971"
          items={["Gold window closed", "Pegs unravel", "Managed floats"]}
          highlight
        />
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-4 md:p-5">
        <p className="text-xs tracking-[0.16em] text-steel uppercase">
          Modern FX regime
        </p>
        <p className="mt-2 font-serif text-2xl text-paper md:text-3xl">
          Markets set most rates continuously
        </p>
      </div>
    </div>
  );
}

function Era({
  title,
  items,
  muted,
  highlight,
}: {
  title: string;
  items: string[];
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 md:p-5 ${
        highlight
          ? "border-gold/40 bg-gold/10"
          : "border-border bg-card/60"
      } ${muted ? "opacity-80" : ""}`}
    >
      <p className="text-xs tracking-[0.16em] text-steel uppercase">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="font-serif text-lg text-paper md:text-xl">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
