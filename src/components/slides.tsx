"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  IsFeChart,
  PhillipsChart,
  SavingInvestmentChart,
  YieldChart,
} from "@/components/charts";
import {
  INITIAL_SHOCKS,
  PARAMS,
  PRESETS,
  narrate,
  presetName,
  solve,
  type ModelLevels,
} from "@/lib/model";
import type {
  Baseline,
  CurveVisibility,
  Observation,
  Shocks,
  Solution,
} from "@/lib/types";

const SLIDES = [
  { id: "title", label: "Title" },
  { id: "timing", label: "Timing" },
  { id: "prints", label: "Baseline" },
  { id: "saving", label: "Saving–investment" },
  { id: "isfe", label: "IS–MP–FE" },
  { id: "phillips", label: "Phillips curve" },
  { id: "yield", label: "Long yield" },
  { id: "tell", label: "The line" },
  { id: "map", label: "Assumptions" },
  { id: "close", label: "Sources" },
] as const;

const PRINTS = [
  "fedfunds",
  "coreInflation",
  "outputGap",
  "rstar",
  "tips10",
  "acmYield",
] as const;

const ALL_CURVES: CurveVisibility = {
  is: true,
  mp: true,
  fe: true,
  phillips: true,
  saving: true,
  investment: true,
  expectedPath: true,
  termPremium: true,
};

const PRESET_BUTTONS = [
  ["baseline", "Baseline"],
  ["now", "Now: capex"],
  ["later", "Later"],
  ["pimco", "PIMCO"],
] as const;

function levelsFrom(baseline: Baseline): ModelLevels | null {
  const need = (key: string) => baseline.series[key]?.value;
  const i0 = need("fedfunds");
  const pi0 = need("coreInflation");
  const gap0 = need("outputGap");
  const rStar0 = need("rstar");
  const y10 = need("acmYield");
  const expected0 = need("expectedPath");
  const tp0 = need("termPremium");
  const real10 = need("tips10");
  if (
    i0 == null ||
    pi0 == null ||
    gap0 == null ||
    rStar0 == null ||
    y10 == null ||
    expected0 == null ||
    tp0 == null ||
    real10 == null
  ) {
    return null;
  }
  return { i0, pi0, gap0, rStar0, y10, expected0, tp0, real10 };
}

function formatValue(obs: Observation) {
  if (obs.value == null) return "Missing";
  return obs.value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusLine(obs: Observation) {
  if (obs.status === "missing" || obs.value == null) return "Missing";
  if (obs.status === "live") return `Live · ${obs.dateLabel}`;
  if (obs.status === "snapshot") return `Snapshot · ${obs.dateLabel}`;
  return `Reference file · ${obs.dateLabel}`;
}

export function Slides({ initial }: { initial: Baseline }) {
  const [index, setIndex] = useState(0);
  const [baseline, setBaseline] = useState(initial);
  const [shocks, setShocks] = useState<Shocks>(INITIAL_SHOCKS);
  const [loading, setLoading] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const slide = SLIDES[index];
  const levels = useMemo(() => levelsFrom(baseline), [baseline]);
  const baseSol = useMemo(
    () => (levels ? solve(levels, INITIAL_SHOCKS) : null),
    [levels],
  );
  const sol = useMemo(
    () => (levels ? solve(levels, shocks) : null),
    [levels, shocks],
  );
  const headline = baseline.series.headlineInflation?.value ?? null;
  const unemployment = baseline.series.unemployment?.value ?? null;
  const paragraph =
    sol && baseSol
      ? narrate(shocks, sol, baseSol, { headline, unemployment })
      : "The model baseline is incomplete, so the curves are not drawn.";

  function go(next: number) {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        setIndex((current) => Math.min(SLIDES.length - 1, current + 1));
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        setIndex((current) => Math.max(0, current - 1));
      } else if (event.key === " " && tag !== "BUTTON" && tag !== "A") {
        event.preventDefault();
        setIndex((current) => Math.min(SLIDES.length - 1, current + 1));
      } else if (event.key === "Home") {
        event.preventDefault();
        setIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setIndex(SLIDES.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function refresh() {
    setLoading(true);
    setRefreshError("");
    try {
      const response = await fetch("/api/baseline?live=1", { cache: "no-store" });
      if (!response.ok) throw new Error("bad status");
      setBaseline((await response.json()) as Baseline);
    } catch {
      setRefreshError("Refresh failed. The numbers on screen are unchanged.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="deck">
      <div
        className="deck-slide"
        role="region"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${SLIDES.length}, ${slide.label}`}
      >
        {slide.id === "title" && <Title onBegin={() => go(1)} />}
        {slide.id === "timing" && <Timing />}
        {slide.id === "prints" && (
          <Prints
            baseline={baseline}
            loading={loading}
            refreshError={refreshError}
            onRefresh={() => void refresh()}
          />
        )}
        {slide.id === "saving" && (
          <ChartSlide
            kicker="Saving and investment"
            title="Capex moves investment first"
            line="Desired investment shifts right with AI capex. Precautionary saving shifts saving right and pulls r* down. The crossing is the equilibrium real rate."
            shocks={shocks}
            setShocks={setShocks}
            sol={sol}
          >
            {levels && baseSol && sol ? (
              <SavingInvestmentChart
                levels={levels}
                base={baseSol}
                shocked={sol}
                show={ALL_CURVES}
              />
            ) : (
              <Missing />
            )}
          </ChartSlide>
        )}
        {slide.id === "isfe" && (
          <ChartSlide
            kicker="IS–MP–FE"
            title="Full employment waits"
            line="Today the IS curve shifts right with capex, the Fed raises MP, and full-employment output stays put. Later, the software-engineering gain shifts FE right and MP can come down."
            shocks={shocks}
            setShocks={setShocks}
            sol={sol}
          >
            {levels && baseSol && sol ? (
              <IsFeChart
                levels={levels}
                base={baseSol}
                shocked={sol}
                show={ALL_CURVES}
              />
            ) : (
              <Missing />
            )}
          </ChartSlide>
        )}
        {slide.id === "phillips" && (
          <ChartSlide
            kicker="Inflation and policy"
            title="The gap shows up in inflation"
            line="Core inflation moves along the Phillips curve with the output gap. The funds rate follows inflation and the gap. It does not jump one-for-one with r*. The 2 percent line is the target, not a print."
            shocks={shocks}
            setShocks={setShocks}
            sol={sol}
          >
            {levels && baseSol && sol ? (
              <PhillipsChart
                levels={levels}
                base={baseSol}
                shocked={sol}
                show={ALL_CURVES}
              />
            ) : (
              <Missing />
            )}
          </ChartSlide>
        )}
        {slide.id === "yield" && (
          <ChartSlide
            kicker="The long yield"
            title="Long yields move with r*"
            line="The ACM 10-year yield is the expected path plus the term premium. The expected path moves with r*. A term-premium compression changes the long yield and leaves r* where it is."
            shocks={shocks}
            setShocks={setShocks}
            sol={sol}
          >
            {levels && baseSol && sol ? (
              <YieldChart
                levels={levels}
                base={baseSol}
                shocked={sol}
                show={ALL_CURVES}
              />
            ) : (
              <Missing />
            )}
          </ChartSlide>
        )}
        {slide.id === "tell" && (
          <Tell
            paragraph={paragraph}
            shocks={shocks}
            setShocks={setShocks}
            sol={sol}
          />
        )}
        {slide.id === "map" && <Map />}
        {slide.id === "close" && <Close asOf={baseline.asOf} />}
      </div>
      <footer className="deck-nav">
        <button
          type="button"
          className="deck-move"
          onClick={() => go(index - 1)}
          disabled={index === 0}
        >
          Back
        </button>
        <div className="deck-progress">
          <span>
            {index + 1} / {SLIDES.length}
          </span>
          <span className="deck-name">{slide.label}</span>
        </div>
        <div className="deck-dots" role="tablist" aria-label="Slides">
          {SLIDES.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              className={itemIndex === index ? "deck-dot on" : "deck-dot"}
              aria-label={item.label}
              aria-current={itemIndex === index ? "true" : undefined}
              onClick={() => go(itemIndex)}
            />
          ))}
        </div>
        <Link className="deck-brief" href="/">
          Briefing
        </Link>
        <button
          type="button"
          className="deck-move deck-next"
          onClick={() => go(index + 1)}
          disabled={index === SLIDES.length - 1}
        >
          Next
        </button>
      </footer>
    </div>
  );
}

function Title({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="deck-title">
      <p className="kicker">
        MGT 932E · Financial Markets and Macroeconomic Policy · 24 October 2026
      </p>
      <h1>The AI boom: demand today, supply tomorrow</h1>
      <p className="thesis">
        The AI boom is a demand shock today and a supply shock tomorrow.
        Capex lifts investment and inflation before productivity arrives.
        The saving–investment balance pushes the equilibrium real rate up.
        Later, the productivity gain can ease inflation enough for the Fed
        to cut, while long real yields stay high.
      </p>
      <p className="team">Rodrigo Abucham, Alex Dinh, Dan Sen, Takaaki Tanabe</p>
      <button type="button" className="deck-move deck-next" onClick={onBegin}>
        Begin
      </button>
    </div>
  );
}

function Timing() {
  return (
    <div className="deck-fill">
      <p className="kicker">The claim</p>
      <h2>Two regimes, one talk</h2>
      <div className="deck-split">
        <article className="deck-panel">
          <p className="kicker">Now</p>
          <h3>Demand</h3>
          <p>
            AI capex of 0.6 percent of GDP raises desired investment before
            the productivity gain arrives. The output gap, inflation, and the
            funds rate rise with it. Full-employment output does not.
          </p>
        </article>
        <article className="deck-panel deck-panel-later">
          <p className="kicker">Later</p>
          <h3>Supply</h3>
          <p>
            A 32.6 percent software-engineering productivity gain, weighted
            by 0.111, is about 3.6 percent of GDP. Potential output shifts
            right. Inflation can ease enough for a cut, while r* and the long
            real yield stay high.
          </p>
        </article>
      </div>
      <p className="deck-aside">
        PIMCO is the alternative on the next charts: precautionary saving of
        0.8 percent of GDP and a 50 basis point term-premium compression.
        That case lowers r*. It is not the headline.
      </p>
    </div>
  );
}

function Prints({
  baseline,
  loading,
  refreshError,
  onRefresh,
}: {
  baseline: Baseline;
  loading: boolean;
  refreshError: string;
  onRefresh: () => void;
}) {
  return (
    <div className="deck-fill">
      <div className="deck-head">
        <div>
          <p className="kicker">Baseline</p>
          <h2>Start from the prints</h2>
        </div>
        <button
          type="button"
          className="deck-move"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Pulling…" : "Refresh"}
        </button>
      </div>
      <p className="deck-lead">
        Zero shocks reproduce these numbers, as of {baseline.asOf}. Refresh
        tries a short live pull. Shock settings stay put.
      </p>
      {(baseline.failures.length > 0 || refreshError) && (
        <ul className="failures">
          {refreshError && <li>{refreshError}</li>}
          {baseline.failures.map((failure) => (
            <li key={failure}>{failure}</li>
          ))}
        </ul>
      )}
      <div className="deck-prints">
        {PRINTS.map((key) => {
          const obs = baseline.series[key];
          if (!obs) return null;
          return (
            <article key={key} className="deck-print">
              <h3>{obs.label}</h3>
              <strong>
                {formatValue(obs)}
                {obs.value != null ? "%" : ""}
              </strong>
              <p>{statusLine(obs)}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ChartSlide({
  kicker,
  title,
  line,
  shocks,
  setShocks,
  sol,
  children,
}: {
  kicker: string;
  title: string;
  line: string;
  shocks: Shocks;
  setShocks: (shocks: Shocks) => void;
  sol: Solution | null;
  children: ReactNode;
}) {
  return (
    <div className="deck-fill">
      <p className="kicker">{kicker}</p>
      <div className="deck-stage">
        <div className="deck-copy">
          <h2>{title}</h2>
          <p>{line}</p>
          {sol && <Results sol={sol} compact />}
          <Presets shocks={shocks} setShocks={setShocks} />
        </div>
        <div className="deck-chart">{children}</div>
      </div>
    </div>
  );
}

function Tell({
  paragraph,
  shocks,
  setShocks,
  sol,
}: {
  paragraph: string;
  shocks: Shocks;
  setShocks: (shocks: Shocks) => void;
  sol: Solution | null;
}) {
  return (
    <div className="deck-fill">
      <p className="kicker">What to say</p>
      <h2>Read the equilibrium</h2>
      <Presets shocks={shocks} setShocks={setShocks} />
      <p className="deck-narration">{paragraph}</p>
      {sol && <Results sol={sol} />}
      <div className="deck-sliders">
        <Slider
          title="AI capex"
          value={shocks.capex}
          min={0}
          max={1.5}
          step={0.05}
          on={shocks.capexOn}
          unit="% of GDP"
          onToggle={() => setShocks({ ...shocks, capexOn: !shocks.capexOn })}
          onChange={(capex) => setShocks({ ...shocks, capex })}
        />
        <Slider
          title="Software productivity"
          value={shocks.swe}
          min={0}
          max={70}
          step={0.1}
          on={shocks.sweOn}
          unit="%"
          onToggle={() => setShocks({ ...shocks, sweOn: !shocks.sweOn })}
          onChange={(swe) => setShocks({ ...shocks, swe })}
        />
        <Slider
          title="Precautionary saving"
          value={shocks.precautionary}
          min={0}
          max={1.5}
          step={0.05}
          on={shocks.precautionaryOn}
          unit="% of GDP"
          onToggle={() =>
            setShocks({ ...shocks, precautionaryOn: !shocks.precautionaryOn })
          }
          onChange={(precautionary) => setShocks({ ...shocks, precautionary })}
        />
        <Slider
          title="Term premium"
          value={shocks.termPremium}
          min={0}
          max={100}
          step={1}
          on={shocks.termPremiumOn}
          unit="bp"
          onToggle={() =>
            setShocks({ ...shocks, termPremiumOn: !shocks.termPremiumOn })
          }
          onChange={(termPremium) => setShocks({ ...shocks, termPremium })}
        />
      </div>
      <div className={shocks.sweOn ? "subswitch" : "subswitch dim"}>
        <button
          type="button"
          className={shocks.rnd ? "mini on" : "mini off"}
          aria-pressed={shocks.rnd}
          onClick={() => setShocks({ ...shocks, rnd: !shocks.rnd })}
        >
          {shocks.rnd ? "On" : "Off"}
        </button>
        <p>
          R&amp;D channel. Off uses γ = {PARAMS.gamma}. On uses γ ={" "}
          {PARAMS.gammaRnd}.
        </p>
      </div>
    </div>
  );
}

function Map() {
  return (
    <div className="deck-fill">
      <p className="kicker">Assumptions</p>
      <h2>A classroom map, not a forecast</h2>
      <p className="deck-lead">
        With every shock at zero, the equilibrium is the latest print. Saving
        rises {PARAMS.bS} percent of GDP per percentage point of the real
        rate, and investment falls {PARAMS.bI}. Only {PARAMS.demandShare * 100}{" "}
        percent of a potential-output gain shows up as current spending.
      </p>
      <pre className="deck-eq">{`gY = γ × software-engineering productivity
γ = 0.111, or 0.199 when the R&D channel is on
r* − r̄* = [capex + 0.12 × gY − precautionary saving] / 1.0
gap = demand − full employment
π = π0 + 0.4 × change in the gap
i = i0 + 1.5 × change in inflation + 0.5 × change in the gap
ACM 10-year = expected path + term premium`}</pre>
    </div>
  );
}

function Close({ asOf }: { asOf: string }) {
  return (
    <div className="deck-fill">
      <p className="kicker">Sources</p>
      <h2>What the talk is standing on</h2>
      <div className="deck-sources">
        <article>
          <h3>Blumenfeld, Hazell, Lian, and Schaab</h3>
          <p>
            “Macroeconomic Effect of AI: Sizing the Software Engineering
            Channel,” 14 September 2026. Software-engineering productivity is
            32.6 percent higher from November 2022 through December 2025.
            The production weight is 0.111.
          </p>
        </article>
        <article>
          <h3>Wilding and Scott, PIMCO</h3>
          <p>
            “Does AI Raise or Lower Neutral Rates?” 1 July 2026. Precautionary
            saving and a smaller term premium can lower far-forward yields.
            That is the alternative preset.
          </p>
        </article>
        <article>
          <h3>Prints as of {asOf}</h3>
          <p>
            Effective funds, PCE, unemployment, GDP, potential, TIPS, and
            breakeven come from the reference files, with a live pull on
            Refresh. r* is Holston–Laubach–Williams. The long-yield split is
            Adrian–Crump–Moench.
          </p>
        </article>
      </div>
      <p className="deck-aside">
        <Link href="/">Open the full briefing</Link> for every series, the
        curve toggles, and the equation block.
      </p>
    </div>
  );
}

function Presets({
  shocks,
  setShocks,
}: {
  shocks: Shocks;
  setShocks: (shocks: Shocks) => void;
}) {
  const active = presetName(shocks);
  return (
    <div className="regimes" aria-label="Shock presets">
      {PRESET_BUTTONS.map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={active === id ? "regime on" : "regime"}
          aria-pressed={active === id}
          onClick={() => setShocks(PRESETS[id])}
        >
          {label}
        </button>
      ))}
      {active == null && <span className="custom">Custom</span>}
    </div>
  );
}

function Results({ sol, compact = false }: { sol: Solution; compact?: boolean }) {
  const rows: [string, number][] = compact
    ? [
        ["Gap", sol.gap],
        ["Inflation", sol.inflation],
        ["Funds", sol.funds],
        ["r*", sol.rStar],
      ]
    : [
        ["Output gap", sol.gap],
        ["Core inflation", sol.inflation],
        ["Funds rate", sol.funds],
        ["r*", sol.rStar],
        ["10-year real", sol.real10],
        ["ACM 10-year", sol.y10],
      ];
  return (
    <dl className={compact ? "results deck-results compact" : "results deck-results"}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value.toFixed(2)}%</dd>
        </div>
      ))}
    </dl>
  );
}

function Slider({
  title,
  value,
  min,
  max,
  step,
  on,
  unit,
  onToggle,
  onChange,
}: {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  on: boolean;
  unit: string;
  onToggle: () => void;
  onChange: (value: number) => void;
}) {
  const id = `slide-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className={on ? "shock" : "shock dim"}>
      <div className="shock-top">
        <label htmlFor={id}>{title}</label>
        <button
          type="button"
          className={on ? "mini on" : "mini off"}
          aria-pressed={on}
          onClick={onToggle}
        >
          {on ? "On" : "Off"}
        </button>
      </div>
      <div className="slider-row">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={!on}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span>
          {value.toLocaleString("en-US", { maximumFractionDigits: 2 })} {unit}
          {on ? "" : " · off"}
        </span>
      </div>
    </div>
  );
}

function Missing() {
  return (
    <p className="chart-hidden">
      A required baseline series is missing, so the equilibrium is not drawn.
    </p>
  );
}
