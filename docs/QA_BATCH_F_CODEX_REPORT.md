# Batch F — independent derivatives and function analysis QA

Execution: 2026-11-05 UTC. Branch `qa/batch-f-derivatives-acceptance`, created from current main `cdb0ab76b20c5f176153593507cd7b9171f67cc4`. Baseline [CI 41987679333](https://github.com/eluyz/math-tutor-app/actions/runs/41987679333) and [Pages 41989875074](https://github.com/eluyz/math-tutor-app/actions/runs/41989875074) completed SUCCESS. PR #173 was Draft/unmerged at `27ccb7420a01a571805f90e0ed761cde0aa86e7c` initially and externally advanced to `360d60f7b0faacd937dc3f4b2dedc93861ee71d4` at the next check; F never used its unmerged branch as a base or modified it. During F CI the owner merged E as main `591a1d6ac0d69faeeb074a1b0c633cac3b69c4ae`; this session updated only F from that main in merge commit `2a2d479`. No E source/test/report file differs against that main.

**Tested integrated implementation HEAD: `2a2d479d0cf0c462f78ec106a60100006bf50c16`.** Pre-integration implementation: `4f0a5720ca52e16fbca9c0f133898a5f01efa942`. The next documentation-only commit updates this report and the [compact evidence ledger](qa-batch-f/local-results.json). The single Draft PR validation section pairs the exact final delivery HEAD with its immutable terminal Actions URL. This avoids a self-referential report SHA and an extra CI run solely to insert its own URL. `git rev-parse HEAD` resolves delivery locally; [Actions for the F branch](https://github.com/eluyz/math-tutor-app/actions?query=branch%3Aqa%2Fbatch-f-derivatives-acceptance) lists that run.

## Scope and acceptance boundary

Exactly **8 competencies, 16 family–level combinations, 24 variants per combination = 384 distinct tasks / 768 PL+EN instances**. Exactly **32 distinct pinned UI variants × PL/EN × 375/1280 px = 128 witnesses in 64 test scenarios**. Hand-derived controls repeat already sampled IDs. Shared D05/D07 methods in study/sketch rows do not create extra tasks. No new generators, dependencies, catalog variants, UI redesign, general symbolic engine, subagents or global audit. Catalog remains 231 families / 18,093 variants. A remaining Codex quota counter is unavailable; no percentage is inferred.

Read curriculum coverage and syllabus V2, Batch B/C/D architecture/reports/tests, relevant production generators and their existing tests. F05, #142, #106, #151 and all existing PR branches are untouched. No private PDF/key was supplied or read; no source content was published. No merge or subsequent batch is performed.

- **METHOD_PASS**: the selected representative mathematical method, displayed reasoning and application workflow passed within this manifest.
- **METHOD_PARTIAL**: the broader competency still includes forms/levels outside this bounded slice; an absent test is not proof of an absent generator.
- **NEEDS_FIX**: a concrete remaining defect. One reproduced EN localization defect was corrected; none remains in the selected matrix.
- **BLOCKED_SOURCE**: all eight competencies lack fresh direct private-original comparison and final source review. **Zero SOURCE_PASS, no source-counter changes.** Synthetic green tests do not award source acceptance.

| Competency | Selected evidence | Wider competency | Source gate | Tasks covered (overlapping rows) |
| --- | --- | --- | --- | ---: |
| D02 | METHOD_PASS — product expansion, quotient series division and target domain | METHOD_PARTIAL | BLOCKED_SOURCE | 48 |
| D03 | METHOD_PASS — nonlinear logarithm, exponential, exact trig chain values | METHOD_PARTIAL | BLOCKED_SOURCE | 72 |
| D04 | METHOD_PASS — second-order 0/0 and logarithmic ∞/∞ with hypotheses | METHOD_PARTIAL | BLOCKED_SOURCE | 48 |
| D05 | METHOD_PASS — exact derivative roots, sign cells, extrema/nonextremum | METHOD_PARTIAL | BLOCKED_SOURCE | 96 |
| D06 | METHOD_PASS — absolute corner, piecewise smooth/corner/jump, vertical tangent/cusp | METHOD_PARTIAL | BLOCKED_SOURCE | 72 |
| D07 | METHOD_PASS — no inflection at a double zero, two genuine inflections, excluded pole | METHOD_PARTIAL | BLOCKED_SOURCE | 120 |
| D08 | METHOD_PASS — both selected original full-study chains, including zeros | METHOD_PARTIAL | BLOCKED_SOURCE | 48 |
| D09 | METHOD_PASS — data, table, reference geometry and coordinate grading | METHOD_PARTIAL; paper drawing self-assessed | BLOCKED_SOURCE | 24 |

Counts in the last column overlap deliberately: D08/D09 rows also exercise D05/D07. The unique total is **384**, not their column sum.

## Exact task matrix

Every row tests **unit variants 0–23 inclusive**. Complete IDs are `family:level:variant`. The last column is the entire pinned browser list; unpinned pool traversal does not grade additional acceptance variants.

| Block / skill | Family : level | Independent computation / representative boundary | UI variants |
| --- | --- | --- | --- |
| F1 D02 | `derivative-product-point:hard` | Expand both factors by independent convolution, differentiate the resulting cubic and evaluate exactly; cross-check product identity. | 0, 1 |
| F1 D02 | `derivative-quadratic-quotient:expert` | Centered formal series division N(h+t)=D(h+t)(c₀+c₁t)+O(t²), not the production quotient helper. Derive excluded pole and prove h is allowed; exact N/N′/D values and signed numerator. | 0, 1 |
| F1 D03 | `derivative-log-quadratic:expert` | Differentiate the original quadratic coefficients; u(h)>0 proves a local domain neighborhood and u′(h)/u(h). Includes zero derivative and both coefficient signs. | 0, 1 |
| F1 D03 | `analysis-log-exp-derivative:hard` | First coefficient of exp(m t) gives m, with exact exp(0)=1 and domain R; verify displayed chain factor. | 0, 1 |
| F1 D03 | `derivative-trig-special-point:hard` | Independent unit-circle sin/cos table at 0, π, π/2, 3π/2; include inner slope and additive linear derivative. All unit variants include sin/cos/tan; tan's cosine denominator is nonzero at its selected phases. | 0, 1 |
| F1 D04 | `analysis-lhospital:expert` | Taylor coefficient m²/2 independently establishes the limit. Separately verify first and second derivative equations; original and first quotient are 0/0, analytic operands, D′=2t≠0 in the punctured neighborhood and D″=2≠0. | 0, 11 |
| F1 D04 | `analysis-lhospital-infinity:expert` | Write numerator as log x + bounded remainder, denominator as k log x + vanishing remainder: limit 1/k. Independently check derivative quotient, positive log arguments and D′>0 on x>1. Powers 2 and 3. | 0, 1 |
| F1 D06 | `derivative-absolute-one-sided:hard` | Expand the absolute value on each side; finite slopes b−a and b+a differ because a≠0. Independently validate the selected option's displayed pair. | 0, 1 |
| F1 D06 | `derivative-piecewise-point:hard` | Compute both function limits and compare with f(h); for continuous branches compare slopes. A jump creates jump/t in the right difference quotient. Units include 8 smooth, 8 corners and 8 jumps. | 1, 2 |
| F1 D06 | `derivative-vertical-cusp:expert` | Derive difference quotients from cube root / absolute 2/3 power. Same signed infinities yield vertical tangent; opposite signs yield cusp. Both continuous; neither has a finite derivative. | 0, 3 |
| F2 D05 | `derivative-extrema:expert` | Independent AST reference expansion, exact quadratic derivative roots and sign cells. Classify by actual sign transitions, cross-check f″ and original f values. Includes 6 stationary nonextrema and 18 two-extremum cases. | 0, 1 |
| F2 D07 | `analysis-concavity:advanced` | Differentiate quartic coefficients twice; f″ has a double zero and the same sign on both sides. No inflection despite f″=0; both signs of m. | 0, 11 |
| F2 D07 | `analysis-concavity:expert` | Independently differentiate the quartic+cubic, solve the quadratic f″ and evaluate exact sign cells; both simple roots change sign. | 0, 11 |
| F2 D05/D07/D08 | `analysis-study-polynomial:advanced` | Original m(t³−3t), t=x−a. Domain R; exact zeros t=0,±√3; both infinity limits and no linear/vertical asymptote; independently differentiate, solve t=±1, sign charts, original extremum values, and inflection (a,0). | 0, 11 |
| F2 D05/D07/D08 | `analysis-study-rational:advanced` | Original m(t+1/t). Domain t≠0; t²+1>0 proves no real zeros; separate pole limits; vanishing remainder m/t proves oblique asymptote. Laurent derivatives give exact signs/extrema. No inflection at excluded pole. | 0, 11 |
| F2 D05/D07/D09 | `derivative-sign-sketch:expert` | Original e(t+s²/t)+v with e=−1 in this level. Independent exact derivatives, excluded pole, extrema, monotonicity and convexity; reference oblique residual vanishes. Validate actual UI table and geometry, not hand drawing quality. | 0, 16 |

## Independence and all-step teaching control

`batchF.ts` reads only original task parameters. No production answer field, derivative/root solver, sign-chart builder or sketch-geometry helper supplies expected results. Shared BigInt rational operations and formatting are infrastructure. The pre-existing independent `functions-audit.ts` reference expansion/root implementation is reused for the cubic and concavity cases; the production calculus implementation is not called. Coefficient-level identities and root degree/multiplicity account for all roots and excluded points before signs are sampled with exact rational points on each open cell. Constant-sign cells and sign changes, not sampling alone, establish extrema and inflections.

All 768 localized instances check independently correct, wrong and empty answers; final-answer steps are independently assessed too. Every working step must have corresponding independently constructed mathematical anchors (the count must match), with exact intermediate values/equations, derivative factors, roots, domain conditions or sign entries. All structured arithmetic calculations are independently audited. Selected option labels are additionally checked for semantic consistency; a fixed option ID alone is never the mathematical proof. Both hints, explanation, reason text, localization and all steps are checked. EN rejects known Polish teaching copy, `gdy` and `lub`.

The selected explanatory templates and theorem justifications were read against these derivations. Tests are not a general natural-language proof checker: minimum reason length or arithmetic metadata alone would not establish correctness. The exact all-step anchors supplement that review and catch a wrong intermediate computation even when the final answer stays correct. ASCII/minus typography and whitespace are normalized without removing mathematical signs.

Hand controls use existing sampled IDs: m=1 second-order remainder 1/2, log-power limit 1/2, a stationary cubic nonextremum, cubic extremum coordinates (−1,2,1,−2), rational coordinates (−1,−2,1,2), and inverted sketch coordinates (−5,0,−3,−4).

## Browser evidence and responsiveness

Production `vite preview`, port 4673, inherited Chromium/evidence settings, **two workers**, no timeout increase. Reuse the existing Batch B–D runner with only roots-input support, exact title matching, whitespace normalization and an optional inspection callback. This is not another browser engine. The callback independently checks mathematical anchors in the actual rendered solution for every pin.

Each of 128 witnesses checks empty→invalid, wrong→incorrect, correct→correct, both actual hints, all solution actions/reasons, final visibility, EN and page overflow after hints/full solution. Console errors, pageerror, failed requests and HTTP≥400 must be absent. No app QA backdoor: seed fixes Date.now; UI pool traversal identifies an exact displayed variant.

D09 adds independent inspection of every displayed table interval and all f′/f″ sign cells. Its wide mobile table is intentionally scrollable inside its container: tests reach the final column and verify it remains inside the container, without page-wide overflow. Reveal the native details only if closed, then check both extremum dots, both disconnected reference branches and the oblique line. All 90 sampled branch pixels are checked against the independent function via an inverse viewport transform; tolerance <0.05 px covers two-decimal SVG rendering only. The exact calculus proof remains rational. Both captions and questions explicitly say the app grades four extremum coordinates and the drawing is self-assessed.

Screenshots/JSON attachments capture IDs, locale, width, errors and independent sketch coordinates/signs. Local visual review covered EN D09 at 375 px and rational D08 at 1280 px. Chromium viewports are not physical iOS/Safari or a full accessibility audit.

## Findings and fixes

One small production presentation fix: `derivativeFollowup.ts` emitted Polish `gdy` inside the English equation `f′(x)=u′(x)/u(x), gdy u(x)>0`. The failing PL/EN acceptance check reproduced it, then the connector was localized to `when` in EN. Answers, generator parameters, domain conditions and catalog counts are unchanged. No mathematical-answer defect was found in the selected slice; one of the two allowed production fixes was used.

Own test issues were corrected separately: remove two unused test variables caught by the production TypeScript build, and make reference-details opening idempotent. The first complete UI attempt passed 60 scenarios and failed four D09 scenarios because the first pin left native details open and the second click closed it. Only those four were rerun after correcting the test; all four passed. A final targeted D09 repeat also verifies mobile table scrolling. Successful witness totals combine the 60 unaffected passes and four corrected D09 passes; failed/interrupted attempts do not inflate counts. After E landed, a fresh complete F production run passed **64/64 in one run**, superseding the split local result; final CI runs all 64 again on the integrated delivery HEAD. The first integrated local full-unit run overlapped Chromium and timed out two historical tests at their existing 5-second limits. Chromium was allowed to finish, then units were repeated alone with `--maxWorkers=1`. No timeout, production logic or historical fixture was changed to address resource contention.

## Existing inventory and remaining gaps

| Skill | Existing families / supported levels | Scope not independently accepted here |
| --- | --- | --- |
| D02 | product/affine quotient point: easy/medium/hard; quadratic quotient: hard/advanced/expert; rational point: medium/hard/advanced/expert; derivative formula: all five levels | General symbolic products/quotients, other levels and rational-form ASTs. |
| D03 | log/exp derivative: medium/hard/advanced/expert; trig chain/special point: easy/medium/hard; log quadratic: hard/advanced/expert; derivative formula: all five | Existing ln/ln-absolute/product modes and trig-formula choices are outside this independent slice; no arbitrary transcendental compositions. Tan is unit-checked, not a pinned browser phase. |
| D04 | finite-point and infinity L’Hôpital: medium/hard/advanced/expert | Other existing one/two-step polynomial and log-linear modes excluded; not all indeterminate forms or a general theorem-applicability solver. |
| D05 | stationary/extrema/monotonicity: hard/advanced/expert; original studies: advanced/expert; quartic/rational-shift followups: hard/advanced/expert | Other polynomial degrees/targets and general functions; no inference of extrema solely from f′=0. |
| D06 | absolute/piecewise: easy/medium/hard; vertical/cusp: hard/advanced/expert | Controlled forms only, not arbitrary singular points. Infinite quotients are never accepted as finite derivatives. |
| D07 | concavity: hard/advanced/expert; study families as above | Other modes/levels, irrational quartic inflections in the followup, and arbitrary f″ singularities. |
| D08 | original polynomial/rational: advanced/expert; quartic/rational-shift: hard/advanced/expert | Global constrained extrema and the newer followups are outside this slice. The latter's source templates omit a zero-finding step; their titles alone would not establish a full-study PASS. Existing original families were chosen because they do show the complete requested chain. No new family is needed merely because those followups were excluded. |
| D09 | sign sketch: hard/advanced/expert, plus study-family qualitative data | Only the expert inverted reference model was independently sampled here; positive orientation levels remain outside this manifest. Automatic quality grading of arbitrary hand drawings does not exist and is not claimed. |

All eight still require owner-led direct private-original comparison and final source acceptance. Excluded forms are recommendations for a later bounded package, not instructions to expand this one. No source counters or curriculum status boxes were changed.

## Execution and CI

- F1 checkpoint `052ae21`: 10 combinations, 240 tasks × PL/EN; targeted tests passed after the EN fix.
- F2 checkpoint `c7c08cb`: 16 combinations, 384 tasks × PL/EN; independent unit package passed.
- Pre-integration local results: **18/18 Batch F tests; 39/39 generator regression tests; 1,622/1,622 full units in 126 files; production build PASS**. After E landed: **37/37 E+F targeted tests; **1,641/1,641 full units in 127 files, serialized with one worker**; production build PASS; a fresh complete F production browser run 64/64, 128 witnesses, zero browser errors**. The existing >500 kB bundle warning remains. Pre-integration attempts and resource-contention evidence are recorded separately, not added to the task/witness totals.
- The committed ledger stores exact commands, 32 pinned IDs, locale/viewport totals, source/test SHA-256 and production bundle hashes. Local raw JSON/HTML/screenshots are ignored artifacts, not committed bulk files.
- Final full CI executes the existing unit/build/base browser suite, production B/C/D and F (and E too if it has subsequently landed), and uploads `batch-f-browser-evidence` for 14 days. A queued/in-progress run is not PASS; the Draft PR validation section records the verified terminal result for its exact delivery SHA.

Reproduce: `npm ci`, `npm run test:batch-f`, `npm run build`, `npm run test:e2e:batch-f`, then the regression command from the ledger and `npm test`. This cloud environment uses `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`. The initial offline install lacked one cached package; normal `npm ci` completed without adding dependencies. Old-head CI [41995304740](https://github.com/eluyz/math-tutor-app/actions/runs/41995304740) was deliberately cancelled when the owner changed main by merging E; it is not a final PASS and not a retry caused by a failed mathematical test. A new full CI runs on the integrated exact HEAD. No CI is rerun solely for report-only URL edits.

## Integration with Batch E

F was created independently while #173 was unmerged. Its owner merged it during CI, requiring an update only on F. Merge commit `2a2d479` integrates main `591a1d6ac0d69faeeb074a1b0c633cac3b69c4ae` and resolves the five additive conflicts: shared acceptance helper, package scripts, base Playwright exclusions, TypeScript config list and CI steps/uploads. E's category/input adapter fields are now optional so F can supply only its optional per-pin inspector; default B/C/D calls and E's existing adapter remain supported. Roots filling is additive. Exact title matching and question whitespace normalization are preserved from the merged main.

No change to E's source/test/report files is present against the updated main. Both E/F configs, scripts and CI artifact uploads remain. Combined units, build and the complete F browser run were repeated locally; final full CI includes B/C/D/E/F on the new exact delivery HEAD. No rebase/retarget/merge action was taken on #173 and no force push was needed. Future main changes should preserve these additive settings and require fresh CI only for the resulting changed HEAD.

Stop after this package. Recommended subsequent work is source review, followed by a small explicitly scoped test slice for excluded existing modes if the owner needs it; no general derivative/function-analysis engine is proposed here.
