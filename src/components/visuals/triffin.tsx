"use client";

export function TriffinVisual() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="grid w-full grid-cols-2 gap-3 md:gap-4">
        <div className="rounded-xl border border-border bg-card/65 p-4 text-center md:p-5">
          <p className="text-xs tracking-[0.16em] text-steel uppercase">
            Need
          </p>
          <p className="mt-2 font-serif text-2xl text-paper md:text-3xl">
            Dollar liquidity
          </p>
          <p className="mt-2 text-sm text-steel-soft">
            World growth wants more reserve assets
          </p>
        </div>
        <div className="rounded-xl border border-gold/35 bg-gold/10 p-4 text-center md:p-5">
          <p className="text-xs tracking-[0.16em] text-gold uppercase">
            Cost
          </p>
          <p className="mt-2 font-serif text-2xl text-paper md:text-3xl">
            Confidence risk
          </p>
          <p className="mt-2 text-sm text-steel-soft">
            Supplying them can dilute trust in the dollar
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px w-10 bg-border md:w-16" />
        <p className="font-serif text-xl text-paper md:text-2xl">Structural bind</p>
        <div className="h-px w-10 bg-border md:w-16" />
      </div>
    </div>
  );
}
