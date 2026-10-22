import data from "@/data/hyperscalers.json";

export function HyperscalersSection() {
  return (
    <section
      id="hyperscalers"
      className="scroll-mt-4 border-t border-white/10 px-4 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[0.65rem] tracking-[0.22em] text-ember uppercase">
          Credit & capacity
        </p>
        <h2 className="mt-2 max-w-3xl font-serif text-3xl text-paper md:text-5xl">
          Hyperscalers & neoclouds
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist md:text-base">
          AI infrastructure spend shows up in PP&E, contractual commitments, and
          — for neoclouds — high-yield funding. Numbers below are filing- or
          press-cited; CDS is mostly unavailable as free public time series.
        </p>
        <p className="mt-2 max-w-2xl text-xs text-mist/70">{data.meta.disclaimer}</p>

        <h3 className="mt-14 font-serif text-2xl text-paper">Hyperscalers</h3>
        <div className="mt-6 space-y-10">
          {data.hyperscalers.map((co) => (
            <article
              key={co.id}
              className="border-t border-white/10 pt-8 md:grid md:grid-cols-[10rem_1fr] md:gap-8"
            >
              <div>
                <p className="font-serif text-xl text-paper">{co.name}</p>
                <p className="text-xs tracking-wide text-mist uppercase">
                  {co.ticker} · {co.role}
                </p>
                <p className="mt-3 text-sm text-ember">
                  {co.rating.agency} {co.rating.rating}
                </p>
              </div>
              <div className="mt-4 space-y-4 md:mt-0">
                {co.capex.length > 0 && (
                  <div>
                    <p className="text-[0.65rem] tracking-wider text-mist uppercase">
                      Capex / PP&E
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-mist">
                      {co.capex.map((c) => (
                        <li key={c.period + String(c.valueUsdB)}>
                          <span className="text-paper">
                            {c.valueUsdB != null
                              ? `$${c.valueUsdB.toFixed(1)}B`
                              : "See source"}
                          </span>{" "}
                          · {c.period}
                          <span className="block text-xs text-mist/70">
                            {c.metric} —{" "}
                            <a
                              href={c.url}
                              className="text-ember/90 hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {c.source}
                            </a>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {co.commitments.length > 0 && (
                  <div>
                    <p className="text-[0.65rem] tracking-wider text-mist uppercase">
                      Commitments
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-mist">
                      {co.commitments.map((c) => (
                        <li key={c.label}>
                          <span className="text-paper">
                            ${c.valueUsdB.toFixed(1)}B
                          </span>{" "}
                          · {c.label}{" "}
                          <span className="text-mist/60">({c.asOf})</span>
                          <span className="block text-xs text-mist/70">
                            <a
                              href={c.url}
                              className="text-ember/90 hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {c.source}
                            </a>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-mist/80">
                  CDS:{" "}
                  {co.cds.available
                    ? "see note"
                    : co.cds.note || "Not in free public FRED feeds."}
                </p>
              </div>
            </article>
          ))}
        </div>

        <h3 className="mt-16 font-serif text-2xl text-paper">Neoclouds</h3>
        <div className="mt-6 space-y-10">
          {data.neoclouds.map((co) => (
            <article
              key={co.id}
              className="border-t border-white/10 pt-8 md:grid md:grid-cols-[10rem_1fr] md:gap-8"
            >
              <div>
                <p className="font-serif text-xl text-paper">{co.name}</p>
                <p className="text-xs tracking-wide text-mist uppercase">
                  {co.ticker} · {co.role}
                </p>
                <p className="mt-3 text-sm text-ember">{co.rating.rating}</p>
              </div>
              <div className="mt-4 space-y-3 md:mt-0">
                <ul className="space-y-2 text-sm text-mist">
                  {co.metrics.map((m) => (
                    <li key={m.label}>
                      <span className="text-paper">{m.value}</span> · {m.label}{" "}
                      <span className="text-mist/60">({m.asOf})</span>
                      <span className="block text-xs text-mist/70">
                        <a
                          href={m.url}
                          className="text-ember/90 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {m.source}
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
                {"snapshot" in co.cds && co.cds.available === "press-snapshot" ? (
                  <p className="rounded-lg border border-ember/25 bg-ember/5 px-3 py-2 text-xs text-mist">
                    <span className="text-ember">CDS snapshot:</span>{" "}
                    {co.cds.snapshot} (as of {co.cds.asOf}). {co.cds.note}{" "}
                    <a
                      href={co.cds.url}
                      className="text-ember hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {co.cds.source}
                    </a>
                  </p>
                ) : (
                  <p className="text-xs text-mist/80">
                    CDS: {co.cds.note || "Not publicly available in this build."}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        <h3 className="mt-16 font-serif text-2xl text-paper">Key dates</h3>
        <ol className="mt-6 space-y-6">
          {data.timeline.map((t) => (
            <li
              key={t.date + t.title}
              className="grid gap-1 border-t border-white/10 pt-5 md:grid-cols-[8rem_1fr] md:gap-6"
            >
              <p className="text-sm tabular-nums text-ember">{t.date}</p>
              <div>
                <p className="font-medium text-paper">{t.title}</p>
                <p className="mt-1 text-sm text-mist">{t.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
