"use client";

export function GoldVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div className="relative mx-auto flex w-full max-w-md items-center justify-between gap-2">
        <Node label="£ notes" />
        <Arrow />
        <div className="animate-pulse-soft flex size-20 items-center justify-center rounded-full border-2 border-gold bg-gold/15 font-serif text-2xl text-gold md:size-24 md:text-3xl">
          Au
        </div>
        <Arrow />
        <Node label="$ notes" />
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-5 text-center">
        <p className="font-serif text-2xl text-paper md:text-3xl">
          Fixed weight of gold
        </p>
        <p className="mt-2 text-sm text-steel-soft md:text-base">
          Convertibility capped how much paper money a country could safely create
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs tracking-[0.12em] text-steel uppercase md:text-sm">
        <span>Mint parity</span>
        <span>Gold flows</span>
        <span>Policy bound</span>
      </div>
    </div>
  );
}

function Node({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3 text-center md:px-4">
      <p className="font-serif text-lg text-paper md:text-xl">{label}</p>
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 40 12" className="h-3 w-8 text-steel" aria-hidden>
      <path
        d="M0 6 H32 M26 1 L34 6 L26 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
