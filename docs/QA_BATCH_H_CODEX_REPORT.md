# Batch H — W01/W02 independent mathematical and technical QA

Execution: 2026-11-05 (Europe/Warsaw; raw machine timestamps UTC). Base is current main `37617586563300787f1964932cbd38706f918865`. Work is isolated on `qa/batch-h-partials-hessian-acceptance`. Existing PR #175, #176, #142, I07 work and F05 work are untouched. No main, workflow or Pages changes, no merge, no global #106 audit and no new generator/catalog variants.

**Tested implementation HEAD: 76edf5f08ca844abe31ad4713eadbac4a0e88724.** The following documentation-only commit records this report and [SHA-256 evidence](qa-batch-h/local-results.json). The Draft PR validation section pairs the exact final delivery SHA with the immutable terminal Actions URL. This avoids a circular self-referential report SHA or a fresh CI run solely to insert its own URL. The base already contains E/F; no unmerged QA branch was used. Baseline [CI](https://github.com/eluyz/math-tutor-app/actions/runs/42022441279) and [Pages](https://github.com/eluyz/math-tutor-app/actions/runs/42025457341) previously completed SUCCESS for that exact main.

## Result and source boundary

| Skill | Selected mathematical evidence | Wider competency / remaining scope | Private source |
| --- | --- | --- | --- |
| W01 | METHOD_PASS — polynomial first/second/mixed partials, gradients and polynomial chain rule | METHOD_PARTIAL — no two-variable trig, logarithmic or radical derivative family in the inspected catalog; chain family asks only for a first-order gradient | BLOCKED_SOURCE |
| W02 | METHOD_PASS — stationary systems, all Hessian test outcomes, actual degenerate quartic classification, controlled bounded extrema | METHOD_PARTIAL — not a general nonlinear stationary-system or constrained-optimization solver | BLOCKED_SOURCE |

One confirmed didactic defect was reproduced and corrected. No remaining numerical defect was found in the selected matrix. The wider W01 elementary-function gap is a verified catalog limitation, **not** fresh evidence of which exact private P43 form to implement. P43/1a–j and P43/2a–h were not read. No private task/key was copied, no SOURCE_PASS is declared and no acceptance counter/issue is updated. Curriculum V2's mixed elementary partials requirement remains open; single-variable trig/log/root generators do not satisfy it.

## Existing inventory and exact independent matrix

All ten inspected families currently support three levels. The independent H oracle samples **one representative level per family, variants 0–23 inclusive**: 10 combinations, **240 distinct mathematical tasks / 480 PL+EN instances**. Complete IDs are `family:level:variant`. Additional hand controls repeat those IDs. A supplemental hint regression checks all 72 existing cubic-family tasks across three levels (30 first-order requests); 24 overlap H, 48 are additional localization-only IDs, not additional independent mathematical acceptance witnesses.

| Skill / family | All supported levels | H level | UI variants |
| --- | --- | --- | --- |
| W01 `multivar-partial-point` | easy, medium, hard | hard | 0,1,2,3,4 |
| W01 `multivar-gradient-point` | easy, medium, hard | hard | 0 |
| W01 `multivar-cubic-partial` | hard, advanced, expert | expert | 0,1,2,3,4 |
| W01 `multivar-chain-gradient` | hard, advanced, expert | expert | 0,1 |
| W02 `multivar-stationary-point` | easy, medium, hard | hard | 0,1,2 |
| W02 `multivar-hessian-classify` | easy, medium, hard | hard | 0,1,2,3 |
| W02 `multivar-degenerate-quartic` | hard, advanced, expert | expert | 0,1,3 |
| W02 `multivar-rectangle-extrema` | hard, advanced, expert | hard | 0,3 |
| W02 `multivar-disk-linear-extrema` | hard, advanced, expert | expert | 0 |
| W02 `multivar-diagonal-quadratic-disk` | hard, advanced, expert | expert | 0,1 |

W01: 96 tasks; W02: 144 tasks. The 28 pinned IDs × PL/EN × 375/1280 px produce 112 witnesses in 40 scenarios. Existing family regressions additionally traverse all supported levels; those older checks are not relabeled as 720 new independent H acceptance tasks.

## Independent computation and all-step review

`batchHCertificate` reads only original parameters. No production derivative/Hessian/extrema solver, hint, solution, answer or option key supplies expected results. Shared exact rational arithmetic in unchanged `batchFMath.ts` is infrastructure. New test-only sparse bivariate polynomials represent terms as (x exponent, y exponent, rational coefficient); products and powers are expanded first, then differentiated by generic exponent rules. This is separate from production's direct point formulas.

### W01

- Original quadratic/cubic coefficients are differentiated generically. First partials, f_xx, f_xy, f_yy and both differentiation orders are independently evaluated. Equality f_xy=f_yx is checked as a coefficient identity before point evaluation, not inferred from one numeric match.
- For k(ax+by+c)^3+dxy, independently expand the original cube, then differentiate it. Cross-check the displayed chain identities against the expanded coefficient result. Both factors a and b, the multiplier 3k, mixed dxy term, sign and component order are retained.
- All selected functions are polynomials on R² and are C∞; no unverified log positivity, radical boundary or general Clairaut hypothesis is assumed. The chain family's UI shows/grades the first-order gradient, not second mixed derivatives of arbitrary compositions.
- Hand controls: quadratic hard v0 f_x=−3; cubic expert v3 f_xy=−2/3; chain expert v0 gradient=(115/243,115/243).
- There are no W01 sine/cosine, logarithmic or square-root expressions in these four catalog families. The square root in the disk gradient norm is a scalar geometric norm, not a radical two-variable partial-derivative exercise. Elementary and domain-sensitive mixed partials therefore remain unverified/missing in the catalog slice; no source coefficients or new family was invented.

### W02

- Stationary points: independently eliminate the 2×2 gradient system, require a nonzero determinant and substitute the result into both original equations. Stored center h/k is not used as the answer oracle. Hard v0 gives (−11/3,−1).
- Hessian classification: independently differentiate the original centered polynomial (including the fourth-power term when present), establish stationarity, and compute A=f_xx, B=f_xy, C=f_yy, D=AC−B². Completion of squares gives `(A/2)(u+Bv/A)^2 + (D/(2A))v²` when A≠0. D>0 with A>0/<0 gives minimum/maximum; D<0 is indefinite and gives a saddle. All four outcomes occur.
- For D=0 in the Hessian-test family, the original is a·u²+v⁴+c, a>0. It actually has a strict minimum, but the requested **test result** is correctly `inconclusive`. Answering “minimum” would answer a different question. Hard v3 is pinned in the UI.
- The separate quartic family asks for the **actual** classification of a·u⁴+b·v⁴+c. Independent differentiation proves zero gradient and zero Hessian at the target. Equal positive/negative signs give a strict min/max because fourth powers are nonnegative and vanish together only at the origin. Opposite signs give opposite values along arbitrarily short axis paths: saddle. All three outcomes occur; expert v3 is a maximum despite D=0.
- Rectangle extrema: enumerate all Cartesian combinations of allowed vertices/endpoints, evaluate the original function and compare exact values/lexicographic ties. Separability and one-variable quadratic derivatives prove this candidate set exhaustive, including edges, corners and interior/outside stationary centers.
- Linear disk: independently verify the supplied positive norm by squaring; Cauchy–Schwarz proves global value bounds center value ±R||gradient||. Construct equality points and compare displayed coordinates/values; nonzero gradient excludes interior extrema.
- Diagonal quadratic disk: squared displacements form the simplex s,t≥0, s+t≤R². A linear objective on it attains extremal values at vertices. Enumerate center and both axis directions, evaluate and choose lexicographically smallest attaining points. This is a global bounded-domain proof, not an unqualified Hessian inference. Rectangle ties are exercised. The current diagonal-disk factory's magnitudes never have a=b; its continuum-of-ties wording describes an algorithmic extension, not a generated equal-coefficient case verified here.

All 480 localized instances check independently correct, incorrect and empty responses, final-answer steps, both hints, explanation and every working action/reason. Each working step must have corresponding mathematical anchors; exact step counts must match. Intermediate coefficients, derivative factors, stationarity, determinants, extrema and domain bounds are checked. Every structured calculation is audited. The original templates and prose justifications were also read against these derivations; minimum string lengths alone are not a proof checker. Fixed output vocabulary and formatting are not used to determine the mathematics.

## Reproduced defect and minimal repair

`multivar-cubic-partial:hard:0` asks for f_x. Its Polish second hint nevertheless said: “Oblicz odpowiednią pochodną drugiego rzędu i podstaw punkt.” English already qualified this with “if needed”. The new order-sensitive regression failed on the original code (1 failed / 11 passed); it passes after the one-line change:

> Oblicz pochodną drugiego rzędu, jeśli jest potrzebna, i podstaw punkt.

This affects the 30 first-order requests across hard/advanced/expert. No answer, coefficient, solver, supported level or catalog count changes. The corrected hint also remains valid for second-order requests. No broader refactoring or new mathematical family was added.

## Browser evidence and existing test limitations

Existing `partialGradient`, `multivarDerivativeFollowup`, `hessian`, `degenerateDisk` and `multivarExtrema` Playwright files exercise PL/EN, mobile/desktop and grading. They derive submitted answers from production answer fields and often observe whichever variant is randomly rendered; those tests alone are not independent mathematical or pinned-coverage proof.

H reuses the unchanged common acceptance runner with an independent oracle. The new spec is discovered by the existing base browser suite; **no CI/config/package-script mutation** is needed. An ignored local configuration additionally runs the same spec against `vite preview` at port 4973, two workers, production build, existing timeout. The callback checks independent mathematical anchors in the rendered solution; the common runner checks both real hints before the correct submission, including the repaired Polish hint.

For all 112 pinned witnesses: empty→invalid, wrong→incorrect, correct→correct, both hints, all solution steps/reasons/final display, no page overflow after hints/solution, no console.error/pageerror/HTTP≥400/requestfailed. Exact same 28 IDs per locale/viewport pair. Screenshots and JSON witnesses are attached. Viewports are not a physical mobile/Safari or full accessibility audit.

## Execution and evidence

- Targeted H and five existing family regressions: **41/41 PASS in 6 files** (13 H + 28 existing).
- Full units, run alone with one worker: **1,654/1,654 PASS in 128 files**.
- Production build: **PASS**, existing >500 kB bundle warning unchanged.
- Production H Chromium: **40/40 PASS**, 112 witnesses / 28 distinct pins, PL+EN × 375+1280 px, zero errors, zero flaky scenarios; fresh complete run in 131.87 seconds..
- The first local browser attempt exposed a redundant inspector lookup after the correct submission had hidden the second hint. That attempt was interrupted, the extra lookup removed, and the complete H suite repeated. The common runner already checks the second hint before submission. No app state or timeout was changed to address this test-only error.
- No quota counter is available; no remaining percentage is guessed. No subagents or parallel audit were used. Unit and browser suites ran serially.

The compact ledger stores commands, pinned IDs, locale/viewport totals, source/test SHA-256, raw local report digests and production asset hashes. Large local JSON/screenshots remain ignored. The Draft PR validation section records terminal CI for the final delivery HEAD; queued/running is not PASS. Existing CI runs full units, build, base browser suite (including H) and B–F acceptance. H has no new CI artifact upload: terminal job logs prove its CI result; decoded local JSON/screenshots and their digests provide the separate production evidence. No other PR was modified and no workflow timeout was raised.

Reproduce:

```sh
npx vitest run src/qa/batchHAcceptance.test.ts
npx vitest run src/university/partialGradient.test.ts src/university/multivarDerivativeFollowup.test.ts src/university/hessian.test.ts src/university/degenerateDisk.test.ts src/university/multivarExtrema.test.ts
npm run build
npx playwright test e2e/batchHAcceptance.spec.ts --workers=2
npm test -- --maxWorkers=1
```

For this cloud environment set `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`. The ignored production-run configuration is captured verbatim in the evidence ledger so the additional preview run can be recreated without changing tracked configuration. No dependencies were added.

## Recommended next step

Owner-led direct comparison with P43/1a–j and P43/2a–h and required source acceptance. Then, if authorized, a small method-focused extension for the actual required two-variable elementary functions and mixed partials, with domain and smoothness conditions. The known absence is documented; its exact original forms are not guessed. General nonlinear stationary systems/nonisolated critical sets and arbitrary constrained domains are outside this bounded package. Do not automatically begin another batch.
