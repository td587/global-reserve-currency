"use client";

const chain = ["Trust", "Liquidity", "Network", "Privilege"];

export function TakeawaysVisual() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <ol className="flex w-full flex-wrap items-center justify-center gap-2 md:gap-3">
        {chain.map((step, i) => (
          <li key={step} className="flex items-center gap-2 md:gap-3">
            <span
              className="animate-slide-in rounded-full border border-steel/40 bg-card px-4 py-2 font-serif text-lg text-paper md:px-5 md:text-xl"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {step}
            </span>
            {i < chain.length - 1 && (
              <span className="text-steel" aria-hidden>
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="max-w-md text-center font-serif text-2xl text-steel-soft md:text-3xl">
        Privilege lasts only while the network believes
      </p>
    </div>
  );
}
