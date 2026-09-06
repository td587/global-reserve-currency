"use client";

export function TitleVisual() {
  return (
    <div className="relative flex h-full flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card/40 p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -right-10 size-56 rounded-full bg-steel/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-64 rounded-full bg-gold/10 blur-3xl" />
        <svg
          viewBox="0 0 400 220"
          className="absolute inset-x-0 bottom-8 h-40 w-full text-steel/40"
          aria-hidden
        >
          <path
            d="M0 160 C60 140, 90 90, 140 100 S220 170, 280 120 S360 40, 400 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-draw-line"
          />
        </svg>
      </div>
      <div className="relative z-10">
        <p className="text-xs tracking-[0.22em] text-gold uppercase">
          Educational deck
        </p>
        <p className="mt-3 max-w-sm font-serif text-3xl leading-tight text-paper md:text-4xl">
          From gold to floating dollars
        </p>
        <p className="mt-3 text-sm text-steel-soft">
          Use ← → or the controls below to move through the story
        </p>
      </div>
    </div>
  );
}
