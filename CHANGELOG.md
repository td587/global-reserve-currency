# Changelog

Changes to the briefing app (`/`) and the slides (`/slides`), newest first.
Each entry says what changed, why, and how it was checked. Commit hashes are
on the `macro-shock-app` branch.

## 15 October 2026 — Slides follow the updated outline

**Why:** the group's updated outline (`AI_Presentation_Outline.docx`) changed
the storyline, and the app still told the old one.

**Slides (`/slides`) restructured into the outline's eight sections,** with
the presenter split on each slide:

| Slide | Section | Presenter |
|---|---|---|
| Title: core question and base case | Thesis | 1 |
| The intuitive story (Warsh, Greenspan 1996) | 1 | 1 |
| The twist (Reinhart and Kashyap; saving–investment chart) | 2 | 2 |
| One diagram, both stories (3-click IS–MP–FE build) | 3 | 2 |
| Why the starting point matters (live prints, Phillips curve, Casselman) | 4 | 2 |
| What does the evidence say today? | 5 | 3 |
| What should the Fed do? (IS–MP–FE, r* toggle) | 6 | 3 |
| What are financial markets telling us? (yield split, PIMCO) | 7 | 4 |
| Our answer | 8 | 4 |
| Backup: sandbox, model, sources | — | — |

- **Section 3 build.** Start → 1 "More productive today" (FE shifts) → 2
  "Investment arrives today" (IS shifts) → 3 "Both". The arrow keys step
  through the build before leaving the slide. Step 3 has a slider for the
  share of the expected productivity gain realized so far. The slide shows the
  demand shift, the capacity shift, and the outline's verdict (inflationary,
  disinflationary, or similar). In this model, capacity catches up with demand
  once about 41 percent of the expected gain is realized; that cutoff depends
  on the illustrative slopes.
- **Section 4** uses the live output gap (+1.40 percent), unemployment, core
  PCE, and the funds rate, with Refresh. The Phillips curve stays linear (the
  lower-risk option); the slide says the argument rests on the data, not the
  slope.
- **Sections 5 and 7** have their framing but are marked "To add" in dashed
  boxes: one AI-investment chart, one BLS productivity chart, and the
  AI-news event study (2-, 10-, 30-year Treasury and 10-year TIPS moves).
  FRED and BLS could not be reached from the build environment, so no
  numbers were filled in from memory.
- **Fed policy rule (r* toggle)** is now on the slides too, on every slide
  with presets.
- Plain-English boxes and cause-and-effect chains from the outline are on
  slides 1–5, 7 and 8.

**Wording fixes (main page and slides):**
- **Blumenfeld, Hazell, Lian, and Schaab** is now described as a
  market-implied *expected* gain, not a measured one. The "Later" narration
  reads "if the expected gain is realized". Changed in `src/lib/model.ts`,
  the productivity slider on `/`, and the sources slide.
- **Thesis** on `/`, `/slides`, and `README.md` now matches the outline: the
  core question, the base case (demand more visible today than realized
  supply), and long-rate effects as ambiguous. Removed "PIMCO is not the
  headline" and "the talk's claim that the equilibrium real rate rises".

**Checked:** 25 of 25 model checks, lint, type-check, production build. All
12 slides rendered in a headless browser at 1440×900, with every build step;
nothing overflows, no console errors, no horizontal scroll at phone width.

## 14 October 2026 — Concept note uses IS-MP-FE

Not in the repo: `AI_Concept_Note.docx` in the Claude project. The framework
bullet now reads IS-MP-FE, with one sentence defining MP as the real policy
rate the Fed sets. Per Professor Simsek's comments.

## 14 October 2026 — IS–MP–FE terminology and MP line (`061b591`)

**Why:** Professor Simsek asked for IS-MP-FE rather than IS-LM-FE.

- The IS chart is titled IS–MP–FE and draws MP, the real policy rate
  (baseline dashed, after the shock solid teal). MP has its own toggle.
- The dot is described as where IS crosses MP.

**Checked:** model checks, lint, type-check, build; chart rendered for the
"Now" and "Later" presets.

## 14 October 2026 — Chart axes no longer rescale (`b4b2dc0`)

**Why:** moving AI capex from 0.65 to 0.70 shrank the IS chart's vertical
axis about fourfold, which made the IS slope look like it changed. The old
rule added fixed padding below a 0.4-point range and proportional padding
above it.

- Each chart's axes now cover a fixed envelope of slider positions (every
  preset, both policy rules), so only the curves and dots move.
- Settings beyond the normal box (productivity above 32.6, or the R&D
  channel) widen the axes smoothly, with no jump.

**Checked:** rendered all four charts at every capex step from 0 to 1.5 and
every preset with both rules: one axis scale per chart. The same test on the
old code found about 30 scales per chart.

## 14 October 2026 — r* in the Fed policy rule; group credit (`5ed5e5e`)

**Why:** the funds rate responded only to inflation and the gap, so the
"Fed cuts while long real yields rise" result depended on the Fed ignoring a
higher r*.

- New "Fed policy rule" switch. **Lags r*** (default) keeps the old results.
  **Tracks r*** adds the change in r* to the funds rate and feeds it through
  the IS curve.
- With the switch on, "Later" goes from a 50 bp cut to roughly unchanged
  (+5 bp); long real yields rise about 100 bp either way.
- Six new checks in `scripts/check-model.ts`.
- Page metadata credits the Fourward Guidance Group and all four members.
