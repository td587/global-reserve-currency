"use client";

export function BrettonDailyVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <FlowStep
        n="01"
        title="Defend the peg"
        copy="Central banks buy/sell dollars to keep their rate near parity"
      />
      <FlowStep
        n="02"
        title="World needs dollars"
        copy="Growth abroad requires dollar liquidity for trade and reserves"
      />
      <FlowStep
        n="03"
        title="Gold promise strained"
        copy="Official claims on U.S. gold grow faster than the gold stock"
      />
    </div>
  );
}

function FlowStep({
  n,
  title,
  copy,
}: {
  n: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="animate-slide-in flex gap-4 rounded-xl border border-border bg-card/65 p-4">
      <span className="font-serif text-2xl text-gold">{n}</span>
      <div>
        <p className="font-serif text-xl text-paper">{title}</p>
        <p className="mt-1 text-sm text-steel-soft">{copy}</p>
      </div>
    </div>
  );
}
