"use client";

export function BrettonVisual() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="grid w-full max-w-lg grid-cols-3 gap-2 text-center text-sm md:gap-3">
        {["£", "¥", "₣"].map((c) => (
          <div
            key={c}
            className="rounded-lg border border-border bg-card/70 py-4 font-serif text-2xl text-paper"
          >
            {c}
          </div>
        ))}
      </div>
      <svg viewBox="0 0 220 48" className="h-10 w-48 text-steel" aria-hidden>
        <path
          d="M30 0 V20 H110 M190 0 V20 H110 M110 20 V40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="animate-draw-line"
        />
      </svg>
      <div className="rounded-xl border border-steel/40 bg-steel/10 px-8 py-5 text-center">
        <p className="text-xs tracking-[0.2em] text-steel uppercase">Hub</p>
        <p className="font-serif text-4xl text-paper">USD</p>
        <p className="mt-1 text-sm text-steel-soft">Pegged to gold @ $35/oz</p>
      </div>
      <svg viewBox="0 0 80 36" className="h-8 w-16 text-gold" aria-hidden>
        <path
          d="M40 0 V24 M28 14 L40 28 L52 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <div className="rounded-full border border-gold/50 bg-gold/15 px-6 py-2 font-serif text-xl text-gold">
        Gold
      </div>
    </div>
  );
}
