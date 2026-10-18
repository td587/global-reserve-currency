"use client";

export function InflationHero() {
  return (
    <section className="relative flex min-h-dvh flex-col justify-end overflow-hidden px-4 pb-16 pt-24 md:px-8 md:pb-24">
      <div className="hero-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] opacity-90"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, rgba(8,12,18,0.95) 10%, transparent), radial-gradient(ellipse 90% 70% at 70% 80%, rgba(232,163,92,0.22), transparent 55%)",
        }}
      />
      {/* Full-bleed abstract inflation wave as visual plane */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-[18%] h-[42%] w-full animate-draw-soft opacity-70 md:bottom-[22%]"
        viewBox="0 0 1200 280"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 210 C 120 190, 180 120, 280 130 S 420 220, 520 160 S 700 40, 820 90 S 980 200, 1200 70"
          fill="none"
          stroke="rgba(232,238,244,0.35)"
          strokeWidth="2.5"
          className="animate-draw-soft"
        />
        <path
          d="M0 230 C 140 210, 200 160, 300 170 S 440 240, 540 190 S 720 80, 840 120 S 1000 210, 1200 100"
          fill="none"
          stroke="rgba(232,163,92,0.55)"
          strokeWidth="2"
          strokeDasharray="8 6"
        />
      </svg>

      <div className="relative z-10 mx-auto w-full max-w-6xl animate-fade-rise">
        <p className="text-[0.7rem] tracking-[0.28em] text-ember uppercase md:text-xs">
          Macro Finance · MBA
        </p>
        <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-[1.05] tracking-tight text-paper md:text-7xl lg:text-8xl">
          Inflation Shocks
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist md:text-xl">
          The 2021–23 surge was a stack of measurable contributions — peel them
          off and watch the path change.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#explorer"
            className="inline-flex items-center rounded-lg bg-ember px-5 py-3 text-sm font-medium text-ink transition hover:bg-ember/90"
          >
            Open the shock explorer
          </a>
          <a
            href="/methodology"
            className="text-sm text-mist underline-offset-4 hover:text-paper hover:underline"
          >
            Methodology & sources
          </a>
        </div>
      </div>
    </section>
  );
}
