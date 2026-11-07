# QA-003 — independent two-variable limits and continuity audit

## Baseline and nonduplication

Pinned main `11d80cc022b30e0be8381fe712392f14d0769590`: 240 families / 18,333 variants, no open PRs at start. Same-SHA [CI](https://github.com/eluyz/math-tutor-app/actions/runs/42367570846) and [Pages](https://github.com/eluyz/math-tutor-app/actions/runs/42369602621) completed SUCCESS. Read QA_AUDIT_PROGRESS.md, Issue #106 including its latest #142 release comment, latest merged PR history and #108/#122/#151 states. #106/#108/#122 OPEN, #151 CLOSED. #142 is merged, with 144 geometry witnesses in a separate automated tier. The closed source batch's 14/14 does not change global 14/64 or certify these four families.

Recent W01/W02 work (#177/#179/#180/#182/#184/#188/#186/#189/#190) already supplies full method-specific exact/SymPy audits. Repeating it would not be a new coverage gain. The four selected two-variable limit/continuity families are absent from the historical 19 QA-003 families, graph witness pair and Batch H matrix (W01/W02 only). Their older unit regressions existed, but often called production `multivarLimitValue` / `polarLimitValue` / classification helpers or used finite samples. This run adds a different visible-question oracle, symbolic global proof and explicit semantic cohort, not merely a renamed green old test. The selection follows the preference for high-risk two-variable reasoning while avoiding recent W01/W02 duplication.

| Family | Levels | All audited variant indices | Distinct tuples |
| --- | --- | --- | ---: |
| multivar-path-limit | medium/hard/advanced | 0..23 each | 72 |
| multivar-continuity-point | medium/hard/advanced | 0..23 each | 72 |
| multivar-polar-homogeneous-limit | hard/advanced/expert | 0..23 each | 72 |
| multivar-angular-continuity | hard/advanced/expert | 0..23 each | 72 |

No family, variant, question, parameter recipe, answer key or grading rule is added/changed. Only a confirmed localized conclusion is corrected. Private originals/keys were not read; all new source correspondence is **BLOCKED_SOURCE**. No SOURCE_PASS, counter change, issue closure, merge, auto-merge or deployment.

## Independent mathematics — every tuple, both languages

The TS oracle `src/qa/qa003MultivariableOracle.ts` parses rational constants and the expression structure from the **visible question**, never task.university, stored modes, answer keys, hints or production solver helpers. Its fixed counterexample parabola is v=u², independently of the production solution's chosen curve. Exact leading-coefficient cancellation computes path limits. Rational arithmetic primitives are shared, calculus/classification logic is independent.

The second oracle `scripts/qa/qa003_multivariable_sympy.py` independently reparses the visible questions, constructs SymPy expressions and checks the TS answer/classification. It establishes these proof obligations rather than inferring existence from agreement on a few paths:

- `u²v²/(u²+v²)`: `(u²+v²)²−4u²v²=(u²−v²)²≥0`, so the absolute deviation is bounded by `|k|ρ²/4→0` uniformly for all paths. The denominator is positive off the origin.
- `u²v/(u⁴+v²)`: the horizontal axis gives the base, v=u² gives base+k/2; k≠0 ensures a genuine counterexample. Every displayed production parabola v=c u² is checked separately with its actual c: base+kc/(1+c²).
- `u²v²/(u²+v²)²`: axis versus diagonal gives base versus base+k/4. Distinct values disprove the limit; polar cancellation alone is not used as a general nonexistence claim.
- `(a u²+c v²)/(u²+v²)`: unequal axis limits disprove existence. When equal, the entire quotient is symbolically constant, which is the missing all-path proof that mere matching axes would not supply. Compare that limit with the separately assigned point value to distinguish continuous/removable/nonremovable.

**288 distinct tasks, 576 PL/EN presentations PASS**, including finite limits, nonexistence and all three continuity types. **336 displayed numeric path steps** were separately checked. Classification totals across localized views: finite 144, does-not-exist 144, continuous 96, removable 96, nonremovable 96. SymPy 1.14.0 was already installed; no dependency/service added. See committed summary and regenerable raw audit export.

Six grading scenarios per localized view = **3,456 executed scenarios**, not tasks: correct, legal wrong, empty, malformed fraction/unknown option, invalid numeric text/structured matrix, and wrong raw structure. All PASS. The correct expected input is independent; production answer specs are used only by the system under test. Final displayed answer specs are also checked with that independently derived input.

## Full representative semantic review

18 explicitly enumerated tuples / 36 localized presentations were reviewed at source/presentation level, using shared-template prose review plus individual exact numeric actions. All questions, both hints, **230 working actions/reasons and 36 final-answer steps** are included (266 displayed steps). This is an **agent, template-assisted semantic review**, not an external human study or automatic extension of the historical 75 reviews. The exact tuple list, review decisions and hashes are in `semantic-review.md` and the CSV ledger.

The review checked the punctured-domain restriction, translation, positivity of denominators, legitimate cancellations for nonzero path parameters, uniformity in angle/all paths, necessary versus sufficient path tests, continuity versus a merely assigned point value, and final localized feedback. Negative coefficients and zero target coordinates are represented. A finite limit was never accepted from axes alone. Other 270 tuples have independent mathematical/gradation checks but full semantic review remains NOT_VERIFIED.

### Confirmed defect QA003-MV-01

On baseline `multivar-angular-continuity`, all 72 Polish variants ended with `Klasyfikacja: continuous/removable/nonremovable`. This is an exposed internal enum in a Polish worked solution, not an incorrect numerical key. Exact affected IDs and baseline actions/source hash were saved before editing. Three witnesses: hard:0 continuous, hard:1 removable, hard:2 nonremovable; the expert:5 review additionally shows a negative-coefficient nonremovable case.

Minimal correction: use the already localized option label for this one working conclusion in `presentPolarContinuity`. Natural English conclusions are likewise reused consistently. Questions, content keys, numeric calculations, enum answer values, options and grading rules are unchanged. New regression checks all 72 variants × PL/EN against independent visible-question classifications and explicitly authored expected localized sentences. No old assertion was removed or weakened.

**Main baseline:** math PASS 288, wrong final keys 0; this teaching defect affects 72 PL task views. **Candidate:** the targeted localization check passes all 72, and the 18 full semantic samples pass after correction. The fix is **not deployed** until owner-authorized merge and matching main CI/Pages. Historical three released defects remain released; this is one additional unmerged fix.

### Suspicions / NOT_VERIFIED, not failures

Level progression mostly changes coefficient denominators/scales and a parabola parameter while retaining the same proof branches. That structural observation is confirmed; whether the difficulty labels are educationally calibrated requires a rubric/user evidence and is NOT_VERIFIED. Generic `b+a` coefficient notation in an angular explanation could be clearer because the displayed question uses literal constants; all numeric values and algebra agree. This is a notation-usability follow-up, not evidence of an incorrect limit. Physical Safari and private original-task matching are NOT_VERIFIED/BLOCKED_SOURCE.

## Execution and reproducibility

- `npx vitest run --config vitest.qa003.config.ts`: explicit audit driver, separate from automatic regression discovery and historical counts; exports questions/proofs/grade outcomes to `test-results/qa003-multivariable-export.json`.
- `python scripts/qa/qa003_multivariable_sympy.py`: independent CAS proof, writes full localized results and summary.
- Targeted regressions: `npx vitest run src/qa/qa003AngularLocalization.test.ts src/university/polarContinuity.test.ts src/university/multivarLimits.test.ts`.
- Full unit: `npm test -- --maxWorkers=1`; production TypeScript/Vite: `npm run build`.
- Production UI: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npx playwright test --config playwright.qa003.config.ts`.

The explicit UI audit has 16 scenarios, 12 distinct hard-level pins, 48 witnesses in PL/EN at 375/1280 px. It exercises blank/wrong/correct feedback, both hints and all rendered steps/reasons, plus malformed finite values `1/0` and `not-a-number`. It checks console/page/HTTP/request failures and overflow. It reuses the unchanged common harness. The explicit `.audit.ts` files are intentionally not extra automatically counted regression/standard-browser cases. Only the confirmed-defect regression is added to normal Vitest.

One new source line plus its regression, explicit reproducible audit tooling, this report/evidence and the ledger are the package. Initial strict TypeScript checks caught an unused audit import and a callback narrowing issue in new tooling; those were repaired without altering production mathematics or assertions. Terminal local/remote results, exact implementation SHA, source hashes and final delivery HEAD are recorded in the evidence/PR validation section. Generated large screenshots/JSON remain out of Git.

## Accounting and resume point

Historical 1,434 external tuples, 75 full PL/EN reviews and 36,472 scenarios remain unchanged. The 90 arithmetic and 144 graph automated witnesses stay separate. New evidence is 288 tasks / 576 localized views / 3,456 scenarios, 18 agent semantic reviews and 48 UI witnesses. These are different units and reviewer protocols, not additive counts. No global deduplicated union is claimed across all later B–H/W01/W02 method packs.

Relative to the current 18,333 inventory, this new run covers 1.57%; **18,045 are NOT_VERIFIED by this run**. Complete semantics: 18/288 selected tasks PASS after patch, 270/288 NOT_VERIFIED; historic reviews were not rerun on this SHA. The ledger separately records baseline PL localization NEEDS_FIXES and candidate semantic review; a candidate PASS must not imply released-main correction.

Resume after owner review: verify a separately approved merge's exact main CI/Pages before marking QA003-MV-01 released. Then select a new bounded scope (e.g. `multivar-anisotropic-limit`) with a visible-formula/global proof oracle, or commission difficulty calibration; do not rerun these four without a source/code change or specific defect hypothesis. Keep #106/#108/#122 open. No next audit starts automatically.


Local results at implementation `774caa18a62443d0ed6b9fe0338b1835665e3387`: **17 focused regressions PASS**, explicit audit **288/288** with SymPy **576/576 localized views PASS**, full Vitest **141 files / 1,720 tests PASS**, TypeScript/production build PASS, production Chromium **16/16 scenarios / 48 witnesses PASS**. No console/page/HTTP/request/overflow errors were recorded. The only production diff is the reviewed localization line. The subsequent delivery commit contains only ledger/report/evidence; final exact SHA and terminal full CI (standard Chromium and B–G) are recorded in the Draft PR. No success is inferred for a pending workflow.
