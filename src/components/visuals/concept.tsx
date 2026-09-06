"use client";

export function ConceptVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="rounded-xl border border-border bg-card/65 p-5 md:p-6">
        <p className="text-xs tracking-[0.16em] text-steel uppercase">
          Central bank balance sheet
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-ink/40 p-3">
            <p className="text-steel-soft">Assets</p>
            <p className="mt-2 font-serif text-xl text-paper">FX reserves</p>
            <p className="font-serif text-xl text-paper">Gold & SDRs</p>
          </div>
          <div className="rounded-lg bg-ink/40 p-3">
            <p className="text-steel-soft">Why hold them</p>
            <p className="mt-2 font-serif text-xl text-paper">Import cover</p>
            <p className="font-serif text-xl text-paper">Crisis buffer</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-steel/30 bg-steel/10 p-4 text-center">
        <p className="font-serif text-xl text-paper md:text-2xl">
          The currency everyone wants becomes the hub
        </p>
      </div>
    </div>
  );
}
