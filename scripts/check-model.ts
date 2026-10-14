import { assemble } from "../src/lib/assemble";
import { PRESETS, solve, type ModelLevels } from "../src/lib/model";
import type { Baseline } from "../src/lib/types";

function levelsFrom(baseline: Baseline): ModelLevels {
  const v = (key: string) => {
    const value = baseline.series[key]?.value;
    if (value == null) throw new Error(`missing ${key}`);
    return value;
  };
  return {
    i0: v("fedfunds"),
    pi0: v("coreInflation"),
    gap0: v("outputGap"),
    rStar0: v("rstar"),
    y10: v("acmYield"),
    expected0: v("expectedPath"),
    tp0: v("termPremium"),
    real10: v("tips10"),
  };
}

const baseline = assemble();
const levels = levelsFrom(baseline);
const zero = solve(levels, PRESETS.baseline);
const now = solve(levels, PRESETS.now);
const later = solve(levels, PRESETS.later);
const pimco = solve(levels, PRESETS.pimco);
const off = solve(levels, { ...PRESETS.later, sweOn: false, capexOn: false });

const failures: string[] = [];
function check(name: string, ok: boolean) {
  if (!ok) failures.push(name);
  else console.log("ok", name);
}

check("funds near 3.88", Math.abs(zero.funds - 3.88) < 1e-9);
check("gap positive", zero.gap > 1 && zero.gap < 2);
check("core near 3", zero.inflation > 2.5 && zero.inflation < 3.5);
check("unemployment present", baseline.series.unemployment.value != null);
check("now raises r*", now.dRStar > 0);
check("now raises gap", now.dGap > 0);
check("now raises inflation", now.dInflation > 0);
check("now raises funds", now.dFunds > 0);
check("now leaves FE", now.potential === 0);
check("later raises potential", later.potential > 3);
check("later lowers inflation", later.dInflation < 0);
check("later lowers funds", later.dFunds < 0);
check("later raises r*", later.dRStar > 0);
check("later raises real long yield", later.dReal10 > 0);
check("pimco lowers r*", pimco.dRStar < 0);
check("pimco lowers yield", pimco.dY10 < 0);
check("pimco lowers term premium", pimco.termPremium < zero.termPremium);
check("switches off match baseline", Math.abs(off.rStar - zero.rStar) < 1e-9 && off.potential === 0);

const rnd = solve(levels, { ...PRESETS.later, rnd: true });
check("rnd amplifies potential", rnd.potential > later.potential * 1.5);

console.log(
  JSON.stringify(
    {
      gap: zero.gap,
      core: zero.inflation,
      headline: baseline.series.headlineInflation.value,
      unemployment: baseline.series.unemployment.value,
      rStar: zero.rStar,
      laterFunds: later.funds,
      laterR: later.rStar,
      pimcoR: pimco.rStar,
    },
    null,
    2,
  ),
);

if (failures.length) {
  console.error(failures);
  process.exit(1);
}
