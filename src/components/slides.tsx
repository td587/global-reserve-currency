"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

/**
 * Slide order follows AI_Presentation_Outline.docx (15 October 2026):
 * thesis and sections 1–8, with the outline's presenter split, then backup.
 */
const SLIDES = [
  { id: "title", label: "Title", tag: "Presenter 1" },
  { id: "warsh", label: "1 · The intuitive story", tag: "Section 1 · Presenter 1" },
  { id: "twist", label: "2 · The twist", tag: "Section 2 · Presenter 2" },
  { id: "build", label: "3 · One diagram", tag: "Section 3 · Presenter 2" },
  { id: "start", label: "4 · Starting point", tag: "Section 4 · Presenter 2" },
  { id: "evidence", label: "5 · Evidence today", tag: "Section 5 · Presenter 3" },
  { id: "fed", label: "6 · The Fed", tag: "Section 6 · Presenter 3" },
  { id: "markets", label: "7 · Markets", tag: "Section 7 · Presenter 4" },
  { id: "answer", label: "8 · Our answer", tag: "Section 8 · Presenter 4" },
  { id: "sandbox", label: "Backup · Sandbox", tag: "Backup" },
  { id: "model", label: "Backup · Model", tag: "Backup" },
  { id: "sources", label: "Backup · Sources", tag: "Backup" },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

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

/** The expected software-engineering gain the "Later" preset uses. */
const EXPECTED_SWE = PRESETS.later.swe;
/** The capex shock the "Now" preset uses. */
const CAPEX = PRESETS.now.capex;

/** Build steps for the section 3 diagram. Step 0 is the baseline. */
const BUILD_STEPS = [
  { label: "Start", title: "Where we are" },
  { label: "1", title: "More productive today" },
  { label: "2", title: "Investment arrives today" },
  { label: "3", title: "Both: which moves faster?" },
] as const;

function buildShocks(step: number, realizedShare: number): Shocks {
  if (step === 1) return { ...INITIAL_SHOCKS, swe: EXPECTED_SWE };
  if (step === 2) return { ...INITIAL_SHOCKS, capex: CAPEX };
  if (step === 3) {
    return {
      ...INITIAL_SHOCKS,
      capex: CAPEX,
      swe: Math.round(EXPECTED_SWE * realizedShare * 10) / 10,
    };
  }
  return { ...INITIAL_SHOCKS };
}

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
    minimumFractionDigits: obs.key === "unemployment" ? 1 : 2,
    maximumFractionDigits: obs.key === "unemployment" ? 1 : 2,
  });
}

function statusLine(obs: Observation) {
  if (obs.status === "missing" || obs.value == null) return "Missing";
  if (obs.status === "live") return `Live · ${obs.dateLabel}`;
  if (obs.status === "snapshot") return `Snapshot · ${obs.dateLabel}`;
  return `Reference file · ${obs.dateLabel}`;
}

function pct(n: number, digits = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function Slides({ initial }: { initial: Baseline }) {
  const [index, setIndex] = useState(0);
  const [baseline, setBaseline] = useState(initial);
  const [shocks, setShocks] = useState<Shocks>(INITIAL_SHOCKS);
  const [rStarInRule, setRStarInRule] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [realizedShare, setRealizedShare] = useState(0.25);
  const [loading, setLoading] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const slide = SLIDES[index];
  const levels = useMemo(() => levelsFrom(baseline), [baseline]);
  const baseSol = useMemo(
    () => (levels ? solve(levels, INITIAL_SHOCKS) : null),
    [levels],
  );
  const sol = useMemo(
    () => (levels ? solve(levels, shocks, { rStarInRule }) : null),
    [levels, shocks, rStarInRule],
  );
  const headline = baseline.series.headlineInflation?.value ?? null;
  const unemployment = baseline.series.unemployment?.value ?? null;
  const paragraph =
    sol && baseSol
      ? narrate(shocks, sol, baseSol, { headline, unemployment }, { rStarInRule })
      : "The model baseline is incomplete, so the curves are not drawn.";

  function go(next: number) {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
  }

  // On the section 3 slide, the arrow keys step through the build first.
  const keyState = useRef<{ id: SlideId; step: number }>({ id: "title", step: 0 });
  useEffect(() => {
    keyState.current = { id: slide.id, step: buildStep };
  }, [slide.id, buildStep]);

  useEffect(() => {
    function forward() {
      const { id, step } = keyState.current;
      if (id === "build" && step < BUILD_STEPS.length - 1) {
        setBuildStep(step + 1);
      } else {
        setIndex((current) => Math.min(SLIDES.length - 1, current + 1));
      }
    }
    function back() {
      const { id, step } = keyState.current;
      if (id === "build" && step > 0) {
        setBuildStep(step - 1);
      } else {
        setIndex((current) => Math.max(0, current - 1));
      }
    }
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        forward();
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        back();
      } else if (event.key === " " && tag !== "BUTTON" && tag !== "A") {
        event.preventDefault();
        forward();
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

  const ruleProps = { shocks, setShocks, rStarInRule, setRStarInRule };

  return (
    <div className="deck">
      <div
        className="deck-slide"
        role="region"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${SLIDES.length}, ${slide.label}`}
      >
        {slide.id === "title" && <Title tag={slide.tag} onBegin={() => go(1)} />}
        {slide.id === "warsh" && <Warsh tag={slide.tag} />}
        {slide.id === "twist" && (
          <Twist tag={slide.tag} levels={levels} base={baseSol} />
        )}
        {slide.id === "build" &&
          (levels && baseSol ? (
            <Build
              tag={slide.tag}
              levels={levels}
              base={baseSol}
              step={buildStep}
              setStep={setBuildStep}
              realizedShare={realizedShare}
              setRealizedShare={setRealizedShare}
            />
          ) : (
            <Missing />
          ))}
        {slide.id === "start" && (
          <StartingPoint
            tag={slide.tag}
            baseline={baseline}
            levels={levels}
            base={baseSol}
            loading={loading}
            refreshError={refreshError}
            onRefresh={() => void refresh()}
          />
        )}
        {slide.id === "evidence" && <Evidence tag={slide.tag} />}
        {slide.id === "fed" && (
          <ChartSlide
            tag={slide.tag}
            title="What should the Fed do?"
            line="If demand has moved ahead of productive capacity, inflation pressure argues for a tighter stance: MP goes up. If capacity catches up with or overtakes demand, inflation eases and the Fed has room to cut: MP comes down. That makes Warsh's claim testable: is the productivity evidence strong enough today to justify easier policy?"
            plain="Demand ahead of capacity → tighter MP stance | Capacity catches up or overtakes demand → more room for Fed easing"
            sol={sol}
            {...ruleProps}
          >
            {levels && baseSol && sol ? (
              <IsFeChart levels={levels} base={baseSol} shocked={sol} show={ALL_CURVES} />
            ) : (
              <Missing />
            )}
          </ChartSlide>
        )}
        {slide.id === "markets" && (
          <Markets tag={slide.tag} sol={sol} {...ruleProps}>
            {levels && baseSol && sol ? (
              <YieldChart levels={levels} base={baseSol} shocked={sol} show={ALL_CURVES} />
            ) : (
              <Missing />
            )}
          </Markets>
        )}
        {slide.id === "answer" && <Answer tag={slide.tag} />}
        {slide.id === "sandbox" && (
          <Sandbox tag={slide.tag} paragraph={paragraph} sol={sol} {...ruleProps} />
        )}
        {slide.id === "model" && <ModelSlide tag={slide.tag} />}
        {slide.id === "sources" && <Sources tag={slide.tag} asOf={baseline.asOf} />}
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

type RuleProps = {
  shocks: Shocks;
  setShocks: (shocks: Shocks) => void;
  rStarInRule: boolean;
  setRStarInRule: (on: boolean) => void;
};

function Tag({ children }: { children: ReactNode }) {
  return <p className="kicker">{children}</p>;
}

function Plain({ children }: { children: ReactNode }) {
  return (
    <p className="deck-plain">
      <span>Plain English</span>
      {children}
    </p>
  );
}

function Chain({ steps }: { steps: string[] }) {
  return (
    <p className="deck-chain">
      {steps.map((step, i) => (
        <span key={step}>
          {i > 0 && <b aria-hidden="true">→</b>}
          {step}
        </span>
      ))}
    </p>
  );
}

function Title({ tag, onBegin }: { tag: string; onBegin: () => void }) {
  return (
    <div className="deck-title">
      <p className="kicker">
        MGT 932E · Financial Markets and Macroeconomic Policy · 24 October 2026 · {tag}
      </p>
      <h1>The AI boom: demand shock today, supply shock tomorrow?</h1>
      <p className="thesis">
        Is AI-driven productive capacity expanding fast enough to keep up with
        the demand boom it has already created?
      </p>
      <p className="deck-lead">
        Our base case: the demand effect is more visible today than the
        realized supply effect, and the productivity channel becomes more
        important over time.
      </p>
      <p className="team">Rodrigo Abucham, Alex Dinh, Dan Sen, Takaaki Tanabe</p>
      <button type="button" className="deck-move deck-next" onClick={onBegin}>
        Begin
      </button>
    </div>
  );
}

function Warsh({ tag }: { tag: string }) {
  return (
    <div className="deck-fill deck-fill-center">
      <Tag>{tag}</Tag>
      <h2>The intuitive story: grow faster without more inflation</h2>
      <div className="deck-split deck-split-auto">
        <article className="deck-panel deck-panel-later">
          <p className="kicker">Warsh, in the Financial Times</p>
          <h3>Productivity first</h3>
          <p>
            If AI is already raising productivity, firms produce more with the
            same labor and capital. Productive capacity rises, so stronger
            growth need not mean more inflation, and the Fed has more room to
            cut.
          </p>
        </article>
        <article className="deck-panel">
          <p className="kicker">The analogy</p>
          <h3>Greenspan, 1996</h3>
          <p>
            Greenspan believed official data understated productivity in the
            1990s, and let the economy run stronger. Warsh&apos;s argument is
            that the Fed may be underestimating productivity gains today in
            the same way.
          </p>
        </article>
      </div>
      <Chain
        steps={[
          "AI productivity ↑",
          "productive capacity ↑",
          "FE shifts right",
          "less inflation pressure",
          "more room for Fed easing",
        ]}
      />
      <Plain>If AI lets us produce more, the economy can grow faster without overheating.</Plain>
    </div>
  );
}

function Twist({
  tag,
  levels,
  base,
}: {
  tag: string;
  levels: ModelLevels | null;
  base: Solution | null;
}) {
  const shocked = useMemo(
    () => (levels ? solve(levels, PRESETS.now) : null),
    [levels],
  );
  return (
    <div className="deck-fill">
      <Tag>{tag}</Tag>
      <div className="deck-stage">
        <div className="deck-copy">
          <h2>The twist: what if the productivity comes later?</h2>
          <p>
            Reinhart and Kashyap: the issue is timing. Expected future output is
            rising while AI adds little to current productivity, and capital
            spending is already surging: data centers, chips, power, software,
            construction, equipment.
          </p>
          <p>
            Blumenfeld, Hazell, Lian, and Schaab fit here. Their estimate is
            evidence that markets <em>expect</em> large future gains. That
            expectation helps drive investment today. It is not evidence that
            realized productivity has already risen.
          </p>
          <Plain>
            Before AI makes the economy more productive, firms have to spend a
            lot building the infrastructure that makes those gains possible.
          </Plain>
        </div>
        <div className="deck-chart">
          {levels && base && shocked ? (
            <SavingInvestmentChart
              levels={levels}
              base={base}
              shocked={shocked}
              show={ALL_CURVES}
            />
          ) : (
            <Missing />
          )}
          <Chain
            steps={[
              "expected AI productivity ↑",
              "expected return on capital ↑",
              "investment today ↑",
              "IS shifts right",
              "current demand ↑",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function Build({
  tag,
  levels,
  base,
  step,
  setStep,
  realizedShare,
  setRealizedShare,
}: {
  tag: string;
  levels: ModelLevels;
  base: Solution;
  step: number;
  setStep: (step: number) => void;
  realizedShare: number;
  setRealizedShare: (share: number) => void;
}) {
  const shocked = solve(levels, buildShocks(step, realizedShare));
  // Horizontal shifts at today's real rate, percent of today's potential.
  const capacity = shocked.potential;
  const demand = shocked.capex + PARAMS.demandShare * shocked.gy;
  const diff = demand - capacity;
  const verdict =
    step === 0
      ? "Nothing has moved yet. Today's economy sits above potential."
      : Math.abs(diff) < 0.1
        ? "Similar shifts: higher sustainable growth with limited extra inflation."
        : diff > 0
          ? "Demand moves faster than capacity: inflationary."
          : "Capacity moves faster than demand: disinflationary.";
  // Share of the expected gain at which capacity catches up with demand.
  const catchUp = CAPEX / ((1 - PARAMS.demandShare) * PARAMS.gamma * EXPECTED_SWE);

  return (
    <div className="deck-fill">
      <Tag>{tag}</Tag>
      <div className="deck-stage">
        <div className="deck-copy">
          <h2>One diagram, both stories</h2>
          <div className="deck-steps" role="group" aria-label="Build steps">
            {BUILD_STEPS.map((item, i) => (
              <button
                key={item.label}
                type="button"
                className={i === step ? "regime on" : "regime"}
                aria-pressed={i === step}
                onClick={() => setStep(i)}
              >
                <strong>{item.label}</strong> {item.title}
              </button>
            ))}
          </div>
          {step === 1 && (
            <p>
              Productive capacity shifts right by {pct(capacity)} percent if the
              full expected {EXPECTED_SWE} percent software-engineering gain were
              realized today. Some of it shows up as spending too.
            </p>
          )}
          {step === 2 && (
            <p>
              AI capex of {CAPEX} percent of GDP shifts demand right. Productive
              capacity has not moved yet.
            </p>
          )}
          {step === 3 && (
            <div className="shock">
              <div className="shock-top">
                <label htmlFor="realized">Share of the expected gain realized so far</label>
              </div>
              <div className="slider-row">
                <input
                  id="realized"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={realizedShare}
                  onChange={(event) => setRealizedShare(Number(event.target.value))}
                />
                <span>{Math.round(realizedShare * 100)}%</span>
              </div>
              <p>
                In this model, capacity catches up with demand once about{" "}
                {Math.round(catchUp * 100)} percent of the expected gain is
                realized. The cutoff rests on the illustrative slopes.
              </p>
            </div>
          )}
          <dl className="results deck-results compact">
            <div>
              <dt>Demand shift</dt>
              <dd>+{pct(demand)}%</dd>
            </div>
            <div>
              <dt>Capacity shift</dt>
              <dd>+{pct(capacity)}%</dd>
            </div>
          </dl>
          <p className="deck-verdict">{verdict}</p>
        </div>
        <div className="deck-chart">
          <IsFeChart levels={levels} base={base} shocked={shocked} show={ALL_CURVES} />
          <p className="deck-aside">
            Say &ldquo;demand&rdquo; for IS and &ldquo;productive capacity&rdquo;
            for FE. The arrow keys step through the build.
          </p>
        </div>
      </div>
    </div>
  );
}

function StartingPoint({
  tag,
  baseline,
  levels,
  base,
  loading,
  refreshError,
  onRefresh,
}: {
  tag: string;
  baseline: Baseline;
  levels: ModelLevels | null;
  base: Solution | null;
  loading: boolean;
  refreshError: string;
  onRefresh: () => void;
}) {
  const shocked = useMemo(
    () => (levels ? solve(levels, PRESETS.now) : null),
    [levels],
  );
  const gap = baseline.series.outputGap?.value;
  const core = baseline.series.coreInflation?.value;
  const keys = ["outputGap", "unemployment", "coreInflation", "fedfunds"] as const;
  return (
    <div className="deck-fill">
      <div className="deck-head">
        <div>
          <Tag>{tag}</Tag>
          <h2>Why the starting point matters</h2>
        </div>
        <button type="button" className="deck-move" onClick={onRefresh} disabled={loading}>
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
      <div className="deck-prints deck-prints-four">
        {keys.map((key) => {
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
      <div className="deck-stage">
        <div className="deck-copy">
          <p>
            Problem Set 4, Questions 9–10: the same AI investment boom does
            different things depending on where the economy starts. With slack,
            it raises output and jobs. Near capacity, it raises prices.
          </p>
          <p>
            Today real GDP is {gap == null ? "—" : pct(gap)} percent above
            potential and core PCE is {core == null ? "—" : pct(core)} percent,
            above the 2 percent target. Ben Casselman (The New York Times, 8 May
            2026) noted that a solid jobs report made Warsh&apos;s case for cuts
            harder, because that case leaned on productivity.
          </p>
          <Plain>
            Extra spending is easier to absorb with spare capacity. If the
            economy is already running hot, the same spending is more
            inflationary.
          </Plain>
        </div>
        <div className="deck-chart">
          {levels && base && shocked ? (
            <PhillipsChart levels={levels} base={base} shocked={shocked} show={ALL_CURVES} />
          ) : (
            <Missing />
          )}
          <p className="deck-aside">
            Our Phillips curve is linear, so this argument rests on the data
            above, not on the slope.
          </p>
        </div>
      </div>
    </div>
  );
}

function Evidence({ tag }: { tag: string }) {
  return (
    <div className="deck-fill deck-fill-center">
      <Tag>{tag}</Tag>
      <h2>What does the evidence say today?</h2>
      <p className="deck-lead">
        The test is which force is more visible today, not whether both
        investment and productivity are rising.
      </p>
      <div className="deck-split deck-split-auto">
        <article className="deck-panel">
          <p className="kicker">Demand side</p>
          <h3>Is the spending here?</h3>
          <p>
            AI capex, data-center construction, compute and semiconductors,
            electricity and power infrastructure, related construction and
            equipment investment. Market-implied expected productivity gains
            help explain why firms and investors fund so much of it today.
          </p>
          <p className="deck-todo">
            To add: one chart of AI-related investment (e.g., BEA information
            processing equipment and software, Census data-center construction).
          </p>
        </article>
        <article className="deck-panel deck-panel-later">
          <p className="kicker">Supply side</p>
          <h3>Is the productivity here?</h3>
          <p>
            Realized productivity, not expectations: BLS productivity, output
            per worker, firm-level evidence on AI adoption, and the NBER firm
            survey showing limited employment effects so far. Reinhart and
            Kashyap frame the question; they are not the evidence.
          </p>
          <p className="deck-todo">
            To add: BLS nonfarm business labor productivity growth, recent
            quarters against the pre-2022 trend.
          </p>
        </article>
      </div>
      <Plain>Are the productivity gains showing up fast enough to keep pace with the investment boom?</Plain>
    </div>
  );
}

function Markets({
  tag,
  sol,
  children,
  ...rule
}: RuleProps & { tag: string; sol: Solution | null; children: ReactNode }) {
  return (
    <div className="deck-fill">
      <Tag>{tag}</Tag>
      <div className="deck-stage">
        <div className="deck-copy">
          <h2>What are financial markets telling us?</h2>
          <p>
            Long yields are expected future short rates plus a term premium,
            and AI may move r* too. PIMCO&apos;s point: long yields have often
            fallen around major AI news, which suggests investors price more
            than faster growth, including precautionary saving and a smaller
            term premium.
          </p>
          <Presets {...rule} />
          {sol && <Results sol={sol} compact />}
        </div>
        <div className="deck-chart">
          {children}
          <p className="deck-todo">
            To add (Professor Simsek&apos;s extension): two or three major AI
            announcements, with the 1–2 day moves in 2-, 10-, and 30-year
            Treasury yields and 10-year TIPS. Short rates up points to demand
            and inflation; long real yields or the term premium points to
            productivity, saving, or risk.
          </p>
          <Plain>Even if the Fed eventually cuts, long-term yields do not necessarily fall one-for-one.</Plain>
        </div>
      </div>
    </div>
  );
}

function Answer({ tag }: { tag: string }) {
  return (
    <div className="deck-fill deck-fill-center">
      <Tag>{tag}</Tag>
      <h2>Our answer</h2>
      <p className="deck-lead">
        AI is currently a stronger demand shock than a realized supply shock.
        Expectations of future productivity already drive major investment,
        while broad productivity gains are still developing.
      </p>
      <div className="deck-split deck-split-auto deck-split-three">
        <article className="deck-panel">
          <p className="kicker">Near term</p>
          <h3>Demand</h3>
          <p>
            AI expectations raise investment and demand. With the economy near
            capacity, that creates inflation pressure and leaves the Fed less
            room to ease.
          </p>
        </article>
        <article className="deck-panel deck-panel-later">
          <p className="kicker">Longer term</p>
          <h3>Capacity</h3>
          <p>
            If the expected gains arrive, productive capacity rises, growth is
            stronger, inflation pressure eases, and the Fed has more room to cut.
          </p>
        </article>
        <article className="deck-panel deck-panel-mp">
          <p className="kicker">Long rates</p>
          <h3>Ambiguous</h3>
          <p>
            Lower inflation and lower policy rates can coexist with a higher
            r*, stronger expected growth, precautionary saving, and a changing
            term premium.
          </p>
        </article>
      </div>
      <p className="deck-takeaway">
        The question is not whether AI raises productivity. It is whether
        productivity arrives fast enough to keep up with the demand boom AI has
        already created.
      </p>
    </div>
  );
}

function ChartSlide({
  tag,
  title,
  line,
  plain,
  sol,
  children,
  ...rule
}: RuleProps & {
  tag: string;
  title: string;
  line: string;
  plain: string;
  sol: Solution | null;
  children: ReactNode;
}) {
  return (
    <div className="deck-fill">
      <Tag>{tag}</Tag>
      <div className="deck-stage">
        <div className="deck-copy">
          <h2>{title}</h2>
          <p>{line}</p>
          <Presets {...rule} />
          {sol && <Results sol={sol} compact />}
        </div>
        <div className="deck-chart">
          {children}
          <p className="deck-chain deck-chain-flat">{plain}</p>
        </div>
      </div>
    </div>
  );
}

function Sandbox({
  tag,
  paragraph,
  sol,
  ...rule
}: RuleProps & { tag: string; paragraph: string; sol: Solution | null }) {
  const { shocks, setShocks } = rule;
  return (
    <div className="deck-fill">
      <Tag>{tag}</Tag>
      <h2>Read the equilibrium</h2>
      <Presets {...rule} />
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
          title="Expected software productivity, if realized"
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

function ModelSlide({ tag }: { tag: string }) {
  return (
    <div className="deck-fill">
      <Tag>{tag}</Tag>
      <h2>A classroom map, not a forecast</h2>
      <p className="deck-lead">
        With every shock at zero, the equilibrium is the latest print. Saving
        rises {PARAMS.bS} percent of GDP per percentage point of the real rate,
        and investment falls {PARAMS.bI}. Only {PARAMS.demandShare * 100}{" "}
        percent of a potential-output gain shows up as current spending. The
        Phillips curve is linear.
      </p>
      <pre className="deck-eq">{`gY = γ × expected software-engineering gain, if realized
γ = 0.111, or 0.199 when the R&D channel is on
r* − r̄* = [capex + 0.12 × gY − precautionary saving] / 1.0
IS: demand = Y0 + capex + 0.6 × gY − 0.8 × (r − r0)
MP: r = i − π0, the real policy rate the Fed sets
FE: productive capacity = gY, measured from today's potential
π = π0 + 0.4 × change in the gap
i = i0 + 1.5 × change in inflation + 0.5 × change in the gap
    [+ change in r* when the Fed tracks r*]
ACM 10-year = expected path + term premium`}</pre>
    </div>
  );
}

function Sources({ tag, asOf }: { tag: string; asOf: string }) {
  return (
    <div className="deck-fill">
      <Tag>{tag}</Tag>
      <h2>What the talk is standing on</h2>
      <div className="deck-sources deck-sources-four">
        <article>
          <h3>Blumenfeld, Hazell, Lian, and Schaab</h3>
          <p>
            &ldquo;Macroeconomic Effect of AI: Sizing the Software Engineering
            Channel,&rdquo; 14 September 2026. A market-implied estimate: the
            expected software-engineering productivity gain is 32.6 percent,
            estimated over November 2022 to December 2025. An expectation, not
            a measured gain. Production weight 0.111.
          </p>
        </article>
        <article>
          <h3>Wilding and Scott, PIMCO</h3>
          <p>
            &ldquo;Does AI Raise or Lower Neutral Rates?&rdquo; 1 July 2026.
            Precautionary saving and a smaller term premium can lower
            far-forward yields. That is the PIMCO preset.
          </p>
        </article>
        <article>
          <h3>Casselman, The New York Times</h3>
          <p>
            &ldquo;Job Market Remained Solid in April, Even as Energy Costs
            Rose,&rdquo; 8 May 2026. The starting-point hook in section 4.
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
        Also cited: Warsh (Financial Times), Reinhart and Kashyap, and Global
        Macroeconomics Problem Set 4. <Link href="/">Open the full briefing</Link>{" "}
        for every series, the curve toggles, and the equation block.
      </p>
    </div>
  );
}

function Presets({ shocks, setShocks, rStarInRule, setRStarInRule }: RuleProps) {
  const active = presetName(shocks);
  return (
    <>
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
      <div className="deck-rule">
        <span>Fed policy rule</span>
        <button
          type="button"
          className={rStarInRule ? "mini on" : "mini off"}
          aria-pressed={rStarInRule}
          onClick={() => setRStarInRule(!rStarInRule)}
        >
          {rStarInRule ? "Tracks r*" : "Lags r*"}
        </button>
      </div>
    </>
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
  const id = `slide-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
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
