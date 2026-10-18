import { Episodes } from "@/components/inflation/episodes";
import { HyperscalersSection } from "@/components/inflation/hyperscalers";
import { InflationExplorer } from "@/components/inflation/explorer";
import { InflationHero } from "@/components/inflation/hero";
import { RatesPanel } from "@/components/inflation/rates-panel";
import Link from "next/link";

export function InflationPresentation() {
  return (
    <div className="inflation-shell min-h-dvh">
      <header className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between px-4 py-5 md:px-8">
        <p className="font-serif text-sm text-paper/90 md:text-base">
          Inflation Shocks
        </p>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-xs text-mist md:gap-4 md:text-sm">
          <a href="#explorer" className="hover:text-paper">
            Explorer
          </a>
          <a href="#rates" className="hover:text-paper">
            Rates
          </a>
          <a href="#hyperscalers" className="hover:text-paper">
            Hyperscalers
          </a>
          <Link href="/methodology" className="hover:text-paper">
            Methodology
          </Link>
        </nav>
      </header>

      <InflationHero />
      <InflationExplorer />
      <RatesPanel />
      <HyperscalersSection />
      <Episodes />

      <footer className="border-t border-white/10 px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-serif text-lg text-paper">Inflation Shocks</p>
            <p className="mt-1 max-w-md text-xs text-mist">
              Embedded FRED / BLS CPI–PCE series, Treasury/TIPS expectations, and
              cited hyperscaler filings. Approximate accounting counterfactuals —
              see{" "}
              <Link href="/methodology" className="text-ember hover:underline">
                methodology
              </Link>
              .
            </p>
          </div>
          <p className="text-[0.65rem] tracking-wider text-mist/60 uppercase">
            Public data · MBA teaching tool
          </p>
        </div>
      </footer>
    </div>
  );
}
