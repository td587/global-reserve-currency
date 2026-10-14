"use client";

import { useMemo, useState } from "react";
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
  CurveKey,
  CurveVisibility,
  Observation,
  Shocks,
} from "@/lib/types";

const SERIES_ORDER = [
  "fedfunds",
  "headlineInflation",
  "coreInflation",
  "unemployment",
  "realGdp",
  "potentialGdp",
  "outputGap",
  "realPolicy",
  "rstar",
  "tips10",
  "breakeven",
  "acmYield",
  "expectedPath",
  "termPremium",
  "boardParYield",
] as const;

const CURVE_TOGGLES: { key: CurveKey; label: string }[] = [
  { key: "is", label: "IS" },
  { key: "fe", label: "FE" },
  { key: "phillips", label: "Phillips curve" },
  { key: "saving", label: "Saving" },
  { key: "investment", label: "Investment" },
  { key: "expectedPath", label: "Expected path" },
  { key: "termPremium", label: "Term premium" },
];

const ALL_CURVES: CurveVisibility = {
  is: true,
  fe: true,
  phillips: true,
  saving: true,
  investment: true,
  expectedPath: true,
  termPremium: true,
};

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
  if (obs.key === "unemployment") {
    return obs.value.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }
  if (obs.key === "realGdp" || obs.key === "potentialGdp") {
    return obs.value.toLocaleString("en-US", {
      maximumFractionDigits: 1,
    });
  }
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

export function Presentation({ initial }: { initial: Baseline }) {
  const [baseline, setBaseline] = useState(initial);
  const [shocks, setShocks] = useState<Shocks>(INITIAL_SHOCKS);
  const [curves, setCurves] = useState<CurveVisibility>(ALL_CURVES);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  async function refresh() {
    setLoading(true);
    setRefreshError("");
    try {
      const response = await fetch("/api/baseline?live=1", { cache: "no-store" });
      if (!response.ok) throw new Error("bad status");
      const next = (await response.json()) as Baseline;
      setBaseline(next);
    } catch {
      setRefreshError(
        "Refresh failed. The numbers on screen are unchanged.",
      );
    } finally {
      setLoading(false);
    }
  }

  const levels = useMemo(() => levelsFrom(baseline), [baseline]);
  const baseSol = useMemo(
    () => (levels ? solve(levels, INITIAL_SHOCKS) : null),
    [levels],
  );
  const sol = useMemo(
    () => (levels ? solve(levels, shocks) : null),
    [levels, shocks],
  );
  const activePreset = presetName(shocks);

  const headline = baseline.series.headlineInflation?.value ?? null;
  const unemployment = baseline.series.unemployment?.value ?? null;
  const paragraph =
    sol && baseSol
      ? narrate(shocks, sol, baseSol, { headline, unemployment })
      : "The model baseline is incomplete, so the curves are not drawn.";

  function shown(key: string) {
    return visible[key] !== false;
  }

  return (
    <main className="page">
      <header className="mast">
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
        <p className="team">
          Rodrigo Abucham, Alex Dinh, Dan Sen, Takaaki Tanabe
        </p>
      </header>

      <section className="strip" aria-label="Current data">
        <div className="section-head">
          <div>
            <h2>Baseline</h2>
            <p>
              Prints as of {baseline.asOf}. Refresh tries a short live pull
              and keeps the reference file when a series does not return.
              Shock settings stay put.
            </p>
          </div>
          <button
            type="button"
            className="refresh"
            onClick={() => void refresh()}
            disabled={loading}
          >
            {loading ? "Pulling…" : "Refresh"}
          </button>
        </div>
        {(baseline.failures.length > 0 || refreshError) && (
          <ul className="failures">
            {refreshError && <li>{refreshError}</li>}
            {baseline.failures.map((failure) => (
              <li key={failure}>{failure}</li>
            ))}
          </ul>
        )}
        <div className="cards">
          {SERIES_ORDER.map((key) => {
            const obs = baseline.series[key];
            if (!obs) return null;
            const on = shown(key);
            return (
              <article
                key={key}
                className={on ? "card" : "card card-off"}
              >
                <div className="card-top">
                  <h3>{obs.label}</h3>
                  <button
                    type="button"
                    className={on ? "mini on" : "mini off"}
                    aria-pressed={on}
                    onClick={() =>
                      setVisible((current) => ({ ...current, [key]: !on }))
                    }
                  >
                    {on ? "On" : "Hidden"}
                  </button>
                </div>
                {on ? (
                  <>
                    <p className="value">
                      {formatValue(obs)}
                      {obs.value != null && (
                        <span> {obs.units.startsWith("percent") ? "%" : ""}</span>
                      )}
                    </p>
                    <p className="meta">{statusLine(obs)}</p>
                    {obs.fredId && <p className="meta">{obs.fredId}</p>}
                  </>
                ) : (
                  <p className="meta">Hidden</p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="regimes" aria-label="Timing">
        {(
          [
            ["baseline", "Baseline"],
            ["now", "Now: capex"],
            ["later", "Later: productivity"],
            ["pimco", "PIMCO: r* down"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={activePreset === id ? "regime on" : "regime"}
            aria-pressed={activePreset === id}
            onClick={() => setShocks(PRESETS[id])}
          >
            {label}
          </button>
        ))}
        {activePreset == null && <span className="custom">Custom</span>}
      </section>

      <div className="workspace">
        <div className="charts">
          <div className="toggles" aria-label="Curve visibility">
            {CURVE_TOGGLES.map((curve) => (
              <button
                key={curve.key}
                type="button"
                className={curves[curve.key] ? "chip on" : "chip off"}
                aria-pressed={curves[curve.key]}
                onClick={() =>
                  setCurves((current) => ({
                    ...current,
                    [curve.key]: !current[curve.key],
                  }))
                }
              >
                {curve.label}
                {curves[curve.key] ? "" : " · hidden"}
              </button>
            ))}
          </div>
          {levels && baseSol && sol ? (
            <div className="chart-grid">
              <SavingInvestmentChart
                levels={levels}
                base={baseSol}
                shocked={sol}
                show={curves}
              />
              <IsFeChart
                levels={levels}
                base={baseSol}
                shocked={sol}
                show={curves}
              />
              <PhillipsChart
                levels={levels}
                base={baseSol}
                shocked={sol}
                show={curves}
              />
              <YieldChart
                levels={levels}
                base={baseSol}
                shocked={sol}
                show={curves}
              />
            </div>
          ) : (
            <p className="chart-hidden">
              A required baseline series is missing, so the equilibrium is not drawn.
            </p>
          )}
          {sol && (
            <dl className="results">
              <div>
                <dt>Output gap</dt>
                <dd>{sol.gap.toFixed(2)}%</dd>
              </div>
              <div>
                <dt>Core inflation</dt>
                <dd>{sol.inflation.toFixed(2)}%</dd>
              </div>
              <div>
                <dt>Funds rate</dt>
                <dd>{sol.funds.toFixed(2)}%</dd>
              </div>
              <div>
                <dt>r*</dt>
                <dd>{sol.rStar.toFixed(2)}%</dd>
              </div>
              <div>
                <dt>10-year real</dt>
                <dd>{sol.real10.toFixed(2)}%</dd>
              </div>
              <div>
                <dt>ACM 10-year</dt>
                <dd>{sol.y10.toFixed(2)}%</dd>
              </div>
            </dl>
          )}
          <p className="interpretation">{paragraph}</p>
        </div>

        <aside className="controls" aria-label="Shocks">
          <h2>Shocks</h2>
          <p className="aside-note">
            Zero is the baseline. Off drops the channel out of the
            equilibrium and out of the paragraph. The slider keeps its place.
          </p>
          <Shock
            title="AI capex"
            detail="Desired investment, percent of GDP. The near-term demand shock: data centers, compute, power, and software, before productivity shows up in FE."
            value={shocks.capex}
            min={0}
            max={1.5}
            step={0.05}
            on={shocks.capexOn}
            unit="% of GDP"
            onToggle={() =>
              setShocks((current) => ({ ...current, capexOn: !current.capexOn }))
            }
            onChange={(capex) => setShocks((current) => ({ ...current, capex }))}
          />
          <Shock
            title="Software-engineering productivity"
            detail="Percent. 32.6 is the Blumenfeld, Hazell, Lian, and Schaab present-value gain from November 2022 through December 2025. It shifts FE by gamma times this number."
            value={shocks.swe}
            min={0}
            max={70}
            step={0.1}
            on={shocks.sweOn}
            unit="%"
            onToggle={() =>
              setShocks((current) => ({ ...current, sweOn: !current.sweOn }))
            }
            onChange={(swe) => setShocks((current) => ({ ...current, swe }))}
          />
          <div className={shocks.sweOn ? "subswitch" : "subswitch dim"}>
            <button
              type="button"
              className={shocks.rnd ? "mini on" : "mini off"}
              aria-pressed={shocks.rnd}
              onClick={() =>
                setShocks((current) => ({ ...current, rnd: !current.rnd }))
              }
            >
              {shocks.rnd ? "On" : "Off"}
            </button>
            <p>
              R&amp;D channel. Off uses the production weight 0.111, about
              3.6 percent of GDP at a 32.6 percent productivity gain. On uses
              0.199, about 6.5 percent.
            </p>
          </div>
          <Shock
            title="Precautionary saving"
            detail="Extra saving, percent of GDP. PIMCO's labor-disruption channel: job risk and concentrated gains raise saving and lower r*."
            value={shocks.precautionary}
            min={0}
            max={1.5}
            step={0.05}
            on={shocks.precautionaryOn}
            unit="% of GDP"
            onToggle={() =>
              setShocks((current) => ({
                ...current,
                precautionaryOn: !current.precautionaryOn,
              }))
            }
            onChange={(precautionary) =>
              setShocks((current) => ({ ...current, precautionary }))
            }
          />
          <Shock
            title="Term-premium compression"
            detail="Basis points. PIMCO's fiscal channel: higher expected productivity improves the tax base and compresses the term premium. It does not move r* by itself."
            value={shocks.termPremium}
            min={0}
            max={100}
            step={1}
            on={shocks.termPremiumOn}
            unit="bp"
            onToggle={() =>
              setShocks((current) => ({
                ...current,
                termPremiumOn: !current.termPremiumOn,
              }))
            }
            onChange={(termPremium) =>
              setShocks((current) => ({ ...current, termPremium }))
            }
          />
        </aside>
      </div>

      <section className="assumptions" id="assumptions">
        <h2>Assumptions, equations, sources</h2>
        <p>
          The slopes are a classroom map of the concept note, not a forecast.
          With every shock at zero, the equilibrium is the latest print. The
          Fed&apos;s 2 percent target is a reference line. It is not a measured
          inflation rate.
        </p>
        <pre>{`gY = γ × (software-engineering productivity)
γ = 0.111, or 0.199 when the R&D channel is on
r* − r̄* = [capex + 0.12 × gY − precautionary saving] / 1.0
Y = Y0 + capex + 0.6 × gY − 0.8 × (r − r0)
FE = gY, measured from today's potential
gap = Y − FE
π = π0 + 0.4 × (gap − gap0)
i = i0 + 1.5 × (π − π0) + 0.5 × (gap − gap0)
r = i − π0
ACM 10-year = expected path + term premium
expected path moves with r* and with 0.25 × the inflation change
term premium falls one-for-one with the fiscal shock
10-year TIPS moves with r* and with the fiscal shock`}</pre>
        <p>
          Saving rises 0.4 percent of GDP per percentage point of the real
          rate, and investment falls 0.6. A 1 percent of GDP potential-output
          gain raises desired investment by {PARAMS.psiProd} percent of GDP
          and lowers desired saving by {PARAMS.psiSave}. Only{" "}
          {PARAMS.demandShare * 100} percent of the potential-output gain
          shows up as current spending. The rest opens slack relative to the
          new full-employment line until demand catches up. The funds rate
          responds to inflation and the gap. It does not jump one-for-one
          with r*. Long yields do.
        </p>
        <ul className="sources">
          {SERIES_ORDER.map((key) => {
            const item = baseline.series[key];
            if (!item) return null;
            return (
              <li key={key}>
                <strong>{item.label}.</strong> {item.source}{" "}
                {item.detail} {item.fredId ? `Series ${item.fredId}.` : ""}{" "}
                {item.value == null
                  ? "Missing."
                  : `${formatValue(item)} on ${item.dateLabel}.`}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function Shock({
  title,
  detail,
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
  detail: string;
  value: number;
  min: number;
  max: number;
  step: number;
  on: boolean;
  unit: string;
  onToggle: () => void;
  onChange: (value: number) => void;
}) {
  const id = title.replace(/\s+/g, "-").toLowerCase();
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
      <p>{detail}</p>
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
