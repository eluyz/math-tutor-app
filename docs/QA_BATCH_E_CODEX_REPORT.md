# Batch E — independent integral QA

Execution: 2026-11-05 (UTC). Independent branch `qa/batch-e-integral-acceptance`, based on main `fd2db7855e35bece7925412f9742d76e6e3b39c3`. Batch C #171 is merged. Batch D #172 was Draft/unmerged at `924358c5513f2accd83c4c8e977e66be4591ee6e` at task start. The owner merged it during this task as main `cdb0ab76b20c5f176153593507cd7b9171f67cc4`. This session did not merge or modify #172; only the E branch was updated with that new main, resolving additive integration conflicts.

**Tested implementation HEAD: 594b55b0deba2a0fa2076bf7f7c94bfa22bd55bd.** The subsequent documentation-only commit supplies this report and the [compact evidence ledger](qa-batch-e/local-results.json). The exact final delivery HEAD and immutable final CI run URL are recorded together in the Draft PR validation section. This avoids a self-referential report SHA and avoids rerunning full CI just to insert its URL into itself. Resolve the delivery HEAD with `git rev-parse HEAD`; [Actions for this branch](https://github.com/eluyz/math-tutor-app/actions?query=branch%3Aqa%2Fbatch-e-integral-acceptance) supplies the associated run.

## Evidence boundary and budget

Exactly **8 competencies, 16 family–difficulty combinations, 24 variants per combination: 384 distinct tasks / 768 localized PL+EN instances**. The browser pins **32 distinct variants**, exercised in both languages at 375 and 1280 px: **128 witnesses in 64 tests**. Repeated hand controls use existing sampled IDs and do not increase these counts. No new families or catalog variants, general refactor, subagents, private-source publication or global audit. There is no exposed remaining-quota counter; no percentage is guessed.

Read: curriculum coverage and syllabus V2, Batch B/C manifests, independent tests, browser runner and reports, relevant integral generators and existing tests. #151 is a source gate, not authorization to mark synthetic tasks SOURCE_PASS. #151, #106, #142 and #172 are untouched; no PR is merged.

- METHOD_PASS means that the **selected method and application workflow** passed in the explicitly bounded matrix below.
- METHOD_PARTIAL preserves the wider competency's existing limited coverage; excluded existing methods are not automatically missing generators.
- NEEDS_FIX identifies a concrete remaining defect; fixed findings are recorded separately below.
- BLOCKED_SOURCE applies to every competency: no private original PDF was supplied or read. **Zero SOURCE_PASS and zero source-counter changes.** No SOURCE_PASS_CANDIDATE is awarded solely by these tests.

| Competency | Selected methods/workflow | Broader competency | Source gate | Distinct tasks |
| --- | --- | --- | --- | ---: |
| I01 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE | 24 |
| I02 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE | 72 |
| I03 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE | 48 |
| I04 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE | 48 |
| I05 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE | 24 |
| I06 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE | 72 |
| I07 | METHOD_PASS | METHOD_PARTIAL; previously noted unselected-template language gap fixed in post-review follow-up | BLOCKED_SOURCE | 48 |
| I08 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE | 48 |

I06 additionally reuses the 24 proper definite-substitution tasks counted under I03; they are not counted twice.

## Exact manifest and independent mathematics

Every row tests unit variant IDs **0–23 inclusive**. A complete task ID is `family:level:variant`; the last column lists only browser pins. No unpinned pool-traversal task is graded in Playwright.

| Skill | Generator and level | Independent calculation and boundary cases | UI variants |
| --- | --- | --- | --- |
| I01 | `integral-direct-product:expert` | Independently convolve linear and quadratic coefficients, integrate each coefficient, differentiate back exactly. Fractions, cancellations, both signs; domain R and +C. | 0, 1 |
| I02 | `integral-table:medium` | sin/cos chain-rule identities, including signed inner slope and antiderivative sign. | 0, 1 |
| I02 | `integral-table:hard` | exp chain factor and ln absolute-value derivative on each connected component excluding ax+b=0; independent constants on disconnected components. | 0, 1 |
| I02 | `integral-table-arctan:expert` | k/a factor; derivative a/(1+(ax+b)²), strictly positive denominator on R, both signs of inner slope. | 0, 4 |
| I03 | `integral-log-substitution:advanced` | Expand u=(ax+b)²+c, derive its coefficient vector, check numerator=k u′. c>0 proves domain R. | 0, 1 |
| I03/I06 | `integral-substitution-definite:advanced` | Expand and integrate the original polynomial independently; compare with both transformed endpoints. All transformed orientations −1/0/+1 occur; reversing original bounds negates the result. Polynomial continuity justifies the fundamental theorem, even for nonmonotone u. | 0, 3 |
| I04 | `integral-parts:expert` | Closed factorial coefficients, rather than the production recurrence; exact coefficient identity P′+aP=kx³. Includes negative a. | 0, 1 |
| I04 | `integral-parts-trig-linear:advanced` | Product/chain-rule coefficient cancellation for x sin and x cos; signed frequencies and rational coefficients. | 0, 1 |
| I05 | `integral-recurring:expert` | Solve the derivative's independent 2×2 coefficient system; verify both sine/cosine coefficients, a²+b²>0. Review the two integration-by-parts J/K equations. | 0, 1 |
| I06 | `integral-improper-infinity:expert` | Truncated primitive and tail limit for p=1,2,3,4; a>0 excludes finite poles. Finite outcomes and both infinity signs. | 0, 1 |
| I06 | `integral-improper-interior-power:advanced` | Separate left/right substitutions x=h±z² for p=1/2; integrate 2k on each side. For p=1/2,1,2 distinguish finite from each one-sided logarithmic/power divergence, with sign k. | 0, 1 |
| I06 | `integral-improper-interior-pv:advanced` | Independent cutoffs eps and delta diverge oppositely. Ordinary integral always diverges; only symmetric cutoffs yield PV=k ln(R/L). Equal/unequal endpoint distances cover zero/nonzero PV. | 0, 1 |
| I07 | `integral-area-parabolas:hard` | Expand both displayed original parabolas, subtract, verify both distinct roots and degree 2, split at every interior root and integrate signed differences with midpoint ordering. 0/1/2 interior crossings, either upper curve; every contribution nonnegative. | 0, 3 |
| I07 | `integral-area-horizontal-slices:hard` | Derive nonnegative right−left width; y=h+z² yields exact polynomial 4kz² over 0..R. Curves meet at y=h; top boundary is h+R². | 0, 1 |
| I08 | `integral-arc-length:hard` | y′=k sqrt(x−h); speed=sqrt(1+k²(x−h)). Substitute z=speed, integrate 2z²/k² over 1..m, with x≥h. | 0, 1 |
| I08 | `integral-arc-parametric:advanced` | Differentiate both coordinate polynomials independently; convolve and sum their squares, proving speed²=k²(t²+1)². k>0 gives positive speed k(t²+1); integrate on original parameter bounds, including negative and zero-crossing intervals. | 0, 3 |

All computations use normalized BigInt rational arithmetic, apart from bounded integer degree/factorial indices. No floating-point tolerance is used to establish a mathematical result. Areas have squared coordinate units; lengths have coordinate units. No physical units are specified by these tasks.

`batchECertificate` reads only task parameters, never production answer fields/options or a production integral solver. Shared rational arithmetic/formatting and task generation are infrastructure. Production answer specifications are read **only by the comparison/assessment tests** after the independent result exists. Hand-derived controls include x³eˣ coefficients (1,−3,6,−6), recurring coefficients (3/2,1/2), area 8 and arc lengths 14/3 and 5/3.

## Teaching, localization and browser checks

For all 768 localized instances: independent correct answer, independently wrong answer and empty answer; missing +C is additionally rejected for primitives. Tests compare the independently specified primitive basis, verify critical displayed coefficients and transformed bounds, both hints, explanation, every working action/reason and final-answer step. Additional anchors cover one-sided cutoffs, PV, intersections and absolute area, transformed horizontal bounds and graph/parametric speeds. Every recorded calculation is audited; these integral templates mostly encode equations as text, so that metadata audit alone is not a proof of their equations.

All selected symbolic teaching templates and their justifications were read against the independent derivations above. The package does **not** claim a generic symbolic verifier of arbitrary natural-language prose. EN checks include Polish characters/known teaching terms, the residual word `lub`, and Polish `od … do …` bound phrases.

The production browser runner uses `vite preview` on port 4573, an isolated output directory, the existing Batch B/C traversal/assessment runner and a small integral input/category adapter. It uniquely identifies displayed questions after browser whitespace normalization; titles are matched exactly to avoid substring collisions. Each pinned witness exercises blank→invalid, wrong→incorrect, both actual hint texts, correct→correct, full solution, every displayed action/reason, and viewport overflow after hints and after the solution. Console errors, pageerror, failed requests and HTTP ≥400 must all be absent. Screenshots and JSON attachments record actual IDs, locale, width and errors. Desktop/mobile are Chromium viewports, not claims of testing physical iOS/Safari or full accessibility.

## Findings and bounded fixes

Two small defect fixes; no solver, generator parameters or answer keys changed:

1. **Localized mathematical notation:** English parabola-intersection working contained Polish `lub`; English graph-arc bounds contained `od … do …`. Localized the conjunction/bounds in `twoParabolasArea.ts` and `areaArc.ts`; the bounded PL/EN tests fail before these corrections.
2. **Integration-by-parts sign reasoning:** `integrals.ts` claimed coefficient signs always alternate. For negative a in xⁿe^(ax), multiplication by −degree/a preserves the sign. Both languages now describe the actual signed factor. Exact derivative tests and a regression check cover negative a.

The first full unit run found the expected historical `integral-parts` content-hash change caused by fix 2. The original archived fixture is preserved: its regression serializer restores only the two exact PL/EN sentences for historical hashing, while Batch E tests the corrected current teaching. No answer/question/ID snapshot exemption is introduced. The targeted archive regression and full units were then repeated.

Initial browser harness failures were test infrastructure issues, not mathematical generator defects: substring title collisions and newline whitespace. A separate configuration attempt dropped inherited Chromium launch settings and failed before opening pages; the final config retains them and starts only its own preview server. These failed/interrupted attempts are excluded from successful witness counts.

## Existing inventory and gaps

| Skill | Existing families / supported difficulties outside the selected slice | Remaining bounds, not evidence of a new-family requirement |
| --- | --- | --- |
| I01 | `integral-direct`: easy/medium/hard; `integral-direct-product`: hard/advanced/expert | Arbitrary simplification is not covered. |
| I02 | `integral-table`: medium/hard; `integral-table-arctan`: hard/advanced/expert | No complete integral table; e.g. arcsine is not independently validated here. |
| I03 | `integral-substitution`: medium/hard/advanced; logarithmic/definite followups: hard/advanced/expert | Existing indefinite power substitution is outside this 16-row independent slice; arbitrary substitutions are not supported. |
| I04 | `integral-parts`, `integral-parts-definite`, `integral-parts-trig-linear`: hard/advanced/expert | Existing definite-by-parts and lower polynomial degrees are outside this slice; general products are not validated. |
| I05 | `integral-recurring`: advanced/expert | Only exponential×trigonometric recurrence, no claim about all recurring integrals. |
| I06 | `integral-definite`: all five levels; infinity/endpoint/interior-power/interior-PV: hard/advanced/expert; definite followups: hard/advanced/expert | Existing endpoint-singularity and direct-polynomial families are not additional independent rows. No arbitrary singularity detector/general integral engine. |
| I07 | area-between: easy/medium/hard; parabolas/horizontal-slices: hard/advanced/expert | No arbitrary curve pairs. **Post-review RESOLVED (localization only):** the previously identified Polish `od … do …` within the English `integral-area-between` bounds display was corrected in `areaArc.ts`. A new regression in `batchEAcceptance.test.ts` checks the exact localized bounds across all 24 variants at easy/medium/hard (72 distinct tasks, PL and EN). These checks are a supplementary localization regression, **not** new independent numerical I07 acceptance witnesses. The mathematical method for this unselected family remains outside Batch E's bounded independent oracle matrix. |
| I08 | graph arc: easy/medium/hard; parametric arc: hard/advanced/expert | Only the controlled power graph / polynomial parametric curves, no general curves or speed sign changes. |

Formal syllabus acceptance still needs the owner's direct private-original comparison and final source review for every I01–I08. Do not infer a missing generator from an excluded test row or from a broader mathematical possibility.

## Execution, CI and evidence

- E1 checkpoint `fa224e6`: 192 distinct tasks × PL/EN; targeted tests passed.
- E2 checkpoint `96a31c5`: all 384 tasks × PL/EN; targeted tests and affected-generator regressions passed.
- Pre-integration local results: **18/18 Batch E tests, 61/61 integral regression tests, 1,597/1,597 full unit tests in 125 files, production build PASS, 64/64 production Chromium tests (128 witnesses, 222.6 s), zero browser errors**. See the committed evidence ledger for exact commands, counts, source/test SHA-256 values and bundle hashes. The existing >500 kB bundle warning remains unchanged.
- Baseline main CI: [41984039327](https://github.com/eluyz/math-tutor-app/actions/runs/41984039327), **completed SUCCESS** for `fd2db7855e35bece7925412f9742d76e6e3b39c3`.
- Baseline Pages: [41986023372](https://github.com/eluyz/math-tutor-app/actions/runs/41986023372), **completed SUCCESS**, same SHA.
- After the owner merged D: D+E targeted units **43/43 PASS**, production build **PASS** (identical app bundle), repeated E production browser tests **64/64 PASS**, 128 witnesses, zero browser errors on the integrated implementation; new hashes and results are in the ledger. The final full CI additionally exercises B/C/D/E.
- Final delivery: run full existing CI once on the Draft PR's final HEAD, including all units, build, existing browser suite, Batch B/C and Batch E. A queued/in-progress run is not PASS. Its verified terminal result and immutable link belong to the Draft PR validation record.
- CI adds only the Batch E production step and 14-day `batch-e-browser-evidence` upload to the existing workflow; no timeout increase. Raw local results remain in ignored `test-results/` and `playwright-report/`; durable compact results and hashes are committed.

Reproduce with `npm ci`, `npm run test:batch-e`, `npm run build`, `npm run test:e2e:batch-e`, then the regression command in the ledger. In this cloud environment set `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`. The production config inherits that executable setting. The full default browser command deliberately excludes dedicated production batches to avoid accidental duplicate execution.

## Integration with Batch D

This PR was created independently from main while #172 was unmerged. Its owner subsequently merged D, making #173 temporarily conflict and preventing pull-request CI from starting. Merge commit `093191c` updates only E with main `cdb0ab76b20c5f176153593507cd7b9171f67cc4`; no force push or action on #172 was needed.

The five additive conflicts in `package.json`, `playwright.config.ts`, `tsconfig.node.json`, `.github/workflows/ci.yml` and `e2e/helpers/acceptance.ts` preserve both batches' scripts, dedicated exclusions/configs, CI steps and evidence uploads. D's answer/category support and matrix/radical variant identification remain intact alongside E's optional adapter, exact-title selection and whitespace normalization. Existing B/C calls remain valid. D source/test/report files have no changes against the new main. The final CI runs the existing B/C/D/E packages on the integrated delivery HEAD. No later D rebase is required; keep these additive settings when resolving future main changes.

Recommended next work: owner-led original comparison for these eight competencies, then a small bounded follow-up for excluded existing integral forms and the remaining area-template EN phrase. Do not add a general integral engine or start the next batch automatically.


## Post-review localization closure (supplement to the original Batch E report)

The owner requested that the residual `integral-area-between` English-language issue be resolved before merger. A surgical localization-only change preserves Polish wording and renders the integral bounds as `from … to …` in English, rather than Polish `od … do …`. An explicit regression samples every existing variant for all three supported difficulty levels (72 task IDs × 2 locales). This is an additional regression beyond the original 384 independently audited Batch E tasks; do **not** add these to the 384 or to the 32 pinned original Batch E browser variants. The original QA ledger and final CI #41988669134 describe the earlier delivery, not the post-review commit. The **new final HEAD must independently complete full GitHub CI** before merge approval; no formal SOURCE_PASS is assigned by localization. This report does not assert a PASS for an incomplete run.
