"use client";

export function MoneySupplyVisual() {
  return (
    <div className="grid h-full grid-cols-2 gap-4 md:gap-6">
      <div className="flex flex-col justify-end gap-3 rounded-xl border border-border bg-card/60 p-4 md:p-5">
        <p className="text-xs tracking-[0.16em] text-steel uppercase">
          Money supply
        </p>
        <div className="relative flex h-40 items-end justify-center md:h-52">
          <div className="absolute inset-x-6 bottom-0 top-4 rounded-t-md border border-steel/30 bg-ink/40" />
          <div className="animate-fill-up relative z-10 h-full w-16 rounded-t-md bg-gradient-to-t from-steel to-steel-soft md:w-20" />
        </div>
        <p className="font-serif text-2xl text-paper">Rising M</p>
        <p className="text-sm text-steel-soft">Credit + policy expand cash</p>
      </div>
      <div className="flex flex-col justify-end gap-3 rounded-xl border border-border bg-card/60 p-4 md:p-5">
        <p className="text-xs tracking-[0.16em] text-gold uppercase">
          Price level
        </p>
        <div className="relative flex h-40 items-end gap-2 md:h-52">
          {[40, 55, 70, 88].map((h, i) => (
            <div
              key={h}
              className="animate-fill-up flex-1 rounded-t-sm bg-gradient-to-t from-gold/70 to-gold"
              style={{
                height: `${h}%`,
                animationDelay: `${0.15 * i}s`,
              }}
            />
          ))}
        </div>
        <p className="font-serif text-2xl text-paper">Rising P</p>
        <p className="text-sm text-steel-soft">Same goods, higher tags</p>
      </div>
    </div>
  );
}
