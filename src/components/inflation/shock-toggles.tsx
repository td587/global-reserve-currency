"use client";

import { SHOCKS, type ShockDef, type ShockId, type ShockState } from "@/lib/shocks";
import { cn } from "@/lib/utils";

type Props = {
  state: ShockState;
  onToggle: (id: ShockId) => void;
  mode: "cpi" | "pce";
  onModeChange: (mode: "cpi" | "pce") => void;
  onReset: () => void;
  onClearAll: () => void;
};

function ToggleRow({
  shock,
  on,
  disabled,
  onToggle,
}: {
  shock: ShockDef;
  on: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all duration-300",
        "border border-transparent",
        disabled && "cursor-not-allowed opacity-40",
        on
          ? "bg-paper/[0.06] hover:bg-paper/[0.09]"
          : "bg-ember/10 ring-1 ring-ember/35 hover:bg-ember/15"
      )}
    >
      <span
        className={cn(
          "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
          on ? "bg-teal/80" : "bg-ember/70"
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-6 rounded-full bg-paper shadow-sm transition-transform duration-300",
            on ? "translate-x-0" : "translate-x-5"
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: shock.accent }}
            aria-hidden
          />
          <span className="font-medium text-paper">{shock.label}</span>
          <span
            className={cn(
              "text-[0.65rem] tracking-[0.14em] uppercase",
              on ? "text-teal-soft" : "text-ember"
            )}
          >
            {on ? "Included" : "Removed"}
          </span>
        </span>
        <span className="mt-0.5 block text-xs text-mist">{shock.episode}</span>
        <span className="mt-1 block text-[0.7rem] leading-snug text-mist/80">
          {shock.offMeans}
        </span>
      </span>
    </button>
  );
}

export function ShockToggles({
  state,
  onToggle,
  mode,
  onModeChange,
  onReset,
  onClearAll,
}: Props) {
  const cpiShocks = SHOCKS.filter((s) => s.kind === "cpi-contribution");
  const pceShocks = SHOCKS.filter((s) => s.kind === "pce-shapiro");

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] tracking-[0.22em] text-ember uppercase">
            Shock toggles
          </p>
          <h2 className="font-serif text-2xl text-paper md:text-3xl">
            Peel the stack
          </h2>
          <p className="mt-1 max-w-md text-sm text-mist">
            <span className="text-paper/90">ON</span> keeps the factor in the
            path. <span className="text-ember">OFF</span> removes its labeled
            contribution — chart updates live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist hover:border-white/25 hover:text-paper"
          >
            Reset all on
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-lg border border-ember/30 px-3 py-1.5 text-xs text-ember hover:bg-ember/10"
          >
            Strip all CPI factors
          </button>
        </div>
      </div>

      <div
        className="inline-flex rounded-lg border border-white/10 bg-ink/40 p-1"
        role="tablist"
        aria-label="Inflation measure"
      >
        {(
          [
            ["cpi", "CPI contributions"],
            ["pce", "PCE demand lens"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => onModeChange(id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs transition-colors",
              mode === id
                ? "bg-paper/15 text-paper"
                : "text-mist hover:text-paper"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "cpi" ? (
        <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-1">
          {cpiShocks.map((shock) => (
            <ToggleRow
              key={shock.id}
              shock={shock}
              on={state[shock.id]}
              onToggle={() => onToggle(shock.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="rounded-lg border border-ember/25 bg-ember/5 px-3 py-2 text-xs leading-relaxed text-mist">
            This lens uses <strong className="font-medium text-paper">headline PCE</strong> and
            SF Fed Shapiro demand/supply classifications — not additive CPI
            math. Toggle demand OFF to subtract the published demand-driven y/y
            contribution.
          </p>
          {pceShocks.map((shock) => (
            <ToggleRow
              key={shock.id}
              shock={shock}
              on={state[shock.id]}
              onToggle={() => onToggle(shock.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
