import type { Metadata } from "next";
import Link from "next/link";
import { inflationMeta } from "@/lib/inflation";
import { SHOCKS } from "@/lib/shocks";

export const metadata: Metadata = {
  title: "Methodology | Inflation Shocks",
  description:
    "Data sources, contribution formula, toggle semantics, and limitations for the US inflation shock explorer.",
};

export default function MethodologyPage() {
  return (
    <div className="inflation-shell min-h-dvh px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/#explorer"
          className="text-sm text-mist hover:text-paper"
        >
          ← Back to explorer
        </Link>
        <h1 className="mt-6 font-serif text-4xl text-paper md:text-5xl">
          Methodology & sources
        </h1>
        <p className="mt-4 text-mist">
          Built for MBA Q&A: every number is from public series or a labeled
          approximation. Data window{" "}
          <span className="text-paper">
            {inflationMeta.window.start} → {inflationMeta.window.end}
          </span>{" "}
          (embedded build {inflationMeta.builtAt}).
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="font-serif text-2xl text-paper">Toggle semantics</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-mist">
            <li>
              <strong className="font-medium text-paper">ON</strong> = factor
              stays in the path (included in actual).
            </li>
            <li>
              <strong className="font-medium text-paper">OFF</strong> ={" "}
              <em>remove this component’s approximate contribution to y/y
              inflation</em> for CPI toggles.
            </li>
            <li>
              Chart always compares <strong className="text-paper">Actual</strong>{" "}
              (solid) vs{" "}
              <strong className="text-ember">Counterfactual</strong> (dashed) =
              Actual − Σ(removed contributions).
            </li>
            <li>
              <strong className="font-medium text-paper">Demand impulse</strong>{" "}
              uses the PCE lens and SF Fed Shapiro demand-driven contribution —
              not mixed into CPI algebra.
            </li>
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-serif text-2xl text-paper">
            CPI contribution formula
          </h2>
          <p className="text-sm leading-relaxed text-mist">
            For each month <em>t</em>, approximate percentage-point contribution
            of component <em>i</em>:
          </p>
          <pre className="overflow-x-auto rounded-lg border border-white/10 bg-ink/60 p-4 text-xs text-teal-soft">
            {`contribution_i(t) ≈ (RI_i / 100) × y/y_i(t)
counterfactual(t) = CPI_y/y(t) − Σ contribution_j(t)  for j toggled OFF`}
          </pre>
          <p className="text-sm leading-relaxed text-mist">
            <code className="text-paper">RI_i</code> is BLS CPI-U relative
            importance from the December table at the start of the 12-month
            window (stepped vintage in the build script). This matches the{" "}
            <em>spirit</em> of BLS contribution examples; it is{" "}
            <strong className="font-medium text-paper">not</strong> the full
            official BLS multi-step weight-update contribution table and can
            differ by a few tenths of a point.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-serif text-2xl text-paper">Series IDs</h2>
          <ul className="space-y-2 text-sm text-mist">
            {Object.entries(inflationMeta.seriesIds).map(([key, id]) => (
              <li key={key} className="flex flex-wrap gap-2">
                <span className="w-40 text-paper">{key}</span>
                <a
                  className="text-ember hover:underline"
                  href={`https://fred.stlouisfed.org/series/${id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {id}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-serif text-2xl text-paper">Shocks included</h2>
          <ul className="space-y-3 text-sm text-mist">
            {SHOCKS.map((s) => (
              <li key={s.id}>
                <span className="text-paper">{s.label}</span> — {s.episode}.{" "}
                {s.offMeans}.
              </li>
            ))}
          </ul>
          <p className="text-sm text-mist">
            Geopolitical oil risk (including Middle East / Iran scenarios) is
            not a separate toggle; it shows up only insofar as it moved{" "}
            <strong className="text-paper">energy CPI</strong>. Forward-looking
            risk premia are uncertainty, not historical contributions.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-serif text-2xl text-paper">External sources</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-mist">
            {inflationMeta.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  className="text-ember hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.name}
                </a>
              </li>
            ))}
            <li>
              Shapiro, Adam Hale. “Decomposing Supply and Demand Driven
              Inflation,” FRBSF Working Paper 2022-18.
            </li>
            <li>
              BLS:{" "}
              <a
                href="https://www.bls.gov/cpi/factsheets/contributions-effects.htm"
                className="text-ember hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Contributions and effects
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-serif text-2xl text-paper">Limitations</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-mist">
            <li>
              Accounting counterfactual ≠ structural causal model. Weights and
              other prices would have differed if a shock never happened.
            </li>
            <li>
              Component narratives overlap (energy feeds goods costs); CPI
              contributions are an additive split of the index, not independent
              causal shares.
            </li>
            <li>
              Services ex-shelter is a <em>proxy</em> (services less energy
              contribution minus shelter contribution).
            </li>
            <li>
              Shapiro labels are statistical classifications of PCE categories.
            </li>
            <li>
              Refresh path: update CSVs in <code className="text-paper">data/</code>{" "}
              then <code className="text-paper">npm run data:inflation</code>.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
