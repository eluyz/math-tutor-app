# QA-003 — independent audit coverage and evidence register

## Current checkpoint — review 2, 7 November 2026 (Europe/Warsaw)

**Review 1 at `ace2e815b33320c60dc6e1573c9ad927000f11c2` is NEEDS_FIXES / NOT_READY per Work. Its unconditional semantic PASS is withdrawn.** All 72 angular-continuity questions in both languages omitted the relation f=g off the assigned point (QA003-MV-02); previous oracles silently assumed it. Review 2 repairs the visible definition and rejects missing/inconsistent definitions in both TS and SymPy. The SAME 288 tasks / 18 semantic samples are revalidated; counters are NOT increased by re-execution. See [revision report](docs/QA003_MULTIVARIABLE_20261107_REPORT.md) and [review-2 evidence](docs/qa003-multivariable-20261107/review2/README.md).

Baseline **main `11d80cc022b30e0be8381fe712392f14d0769590`**, **240 families / 18,333 variants**. [CI #42367570846](https://github.com/eluyz/math-tutor-app/actions/runs/42367570846) and [Pages #42369602621](https://github.com/eluyz/math-tutor-app/actions/runs/42369602621) completed SUCCESS on this exact SHA. No PRs were open at task start. PRs #186/#189/#190 and #142 are merged. Issues #106/#108/#122 remain OPEN; #151 is CLOSED with its 14/14 source batch, global formal count 14/64 unchanged. This explicit owner-requested batch resumes bounded #106 work; older PAUSED notes in other issues are historical, not permission to expand the whole audit.

### Evidence classes — never add these columns together

| Class | Cases / current 18,333 | What is actually established |
| --- | ---: | --- |
| Historical external independent answers | **1,434 (7.82%)** | Retained historical evidence; original per-case archive is not imported or fully revalidated at this main. Historical count unchanged; 16,899 current tasks lie outside this evidence class |
| Historical complete PL/EN reviews | **75 (0.41%)** | Unchanged original review protocol/IDs; not converted into current-main certificates |
| Historical grading scenarios | **36,472** | Scenarios, not distinct tasks; unchanged |
| Released signed-arithmetic independent regression (#141) | **90 (0.49%)** | Separate in-repository visible-question arithmetic tier |
| Released graph witness (#142) | **144 (0.79%)** | Separate automated independent geometry tier; not 144 new external or complete pedagogical reviews |
| NEW QA-003 visible-formula + symbolic audit | **288 (1.57%)** | Four previously unlisted QA-003 families, every supported level/variant; 576 localized views, 3,456 grading scenarios and 336 displayed numeric path calculations. Review-2 complete-definition checks plus exact all-path bounds/counterexamples; same cohort, not new coverage |
| NEW agent semantic-review cohort | **18 (0.10%)** | 36 PL/EN presentations, all 230 working steps + 36 final steps, questions and both hints, re-reviewed after explicit f=g repair. Review 1 was 13 PASS / 5 NEEDS_FIXES among these 18, not 18 PASS. Separate from the historic 75 external reviews |
| NEW production browser audit | **56 witnesses / 14 distinct tasks** | PL/EN × 375/1280; a UI witness is not an additional independent task. Terminal result recorded in the batch report/PR |
| Private originals for the new four families | **0 checked — BLOCKED_SOURCE** | No original worksheet/key inspected, no SOURCE_PASS inference |

The corrected review-2 answer cohort has **288 PASS / 0 FAIL** after complete-definition validation. Before the repair 72 angular tasks were under-defined in both languages; correct g calculations were insufficient to certify the f task. **18,045** current tasks are NOT_VERIFIED *by this new run*, not mathematical failures. The repeated review-2 candidate semantic cohort has **18 PASS / 270 NOT_VERIFIED** within the 288 tasks; the remaining current catalogue was not semantically reviewed in this run. Existing method-specific B–H/W01/W02 packages remain their own evidence; no global union/deduplicated total is invented across different protocols. In particular **do not relabel 1,434 as 1,722**, or 75 as 93, merely because this audit ran.

### New batch and confirmed finding

| Family | Levels | Variants | Fresh mathematical result |
| --- | --- | ---: | --- |
| `multivar-path-limit` | medium, hard, advanced | 0..23 each = 72 | PASS: uniform bound or line/parabola counterexample |
| `multivar-continuity-point` | medium, hard, advanced | 0..23 each = 72 | PASS: punctured limit plus comparison to assigned point value |
| `multivar-polar-homogeneous-limit` | hard, advanced, expert | 0..23 each = 72 | PASS: uniform angular bound or axis/diagonal counterexample |
| `multivar-angular-continuity` | hard, advanced, expert | 0..23 each = 72 | PASS: unequal axes, or exact constant quotient then point-value comparison |

**QA003-MV-01 — confirmed PL teaching/localization defect:** all 72 angular-continuity variants print an English internal code in the last Polish working step (`continuous`, `removable`, `nonremovable`). Final answer keys and calculations are correct. Baseline proof and exact affected IDs are preserved in `docs/qa003-multivariable-20261107/finding-before.json`. A one-line presenter correction uses the existing localized option label; independent 72-variant PL/EN regression checks it. **FIXED_IN_DRAFT, not yet released**; production main still has the defect until separately approved merge + same-SHA CI/Pages. The historical three released teaching defects remain three released defects; this is one additional candidate correction.

**QA003-MV-02 — Work-confirmed definition defect:** all 72 angular-continuity tasks / 144 PL/EN questions at the reviewed HEAD define g and f(a,b), but omit f(x,y)=g(x,y) off that point. Thus f continuity is underdetermined. Fixed in the candidate question AND definition step; stable IDs, parameters and full PL/EN answer specs are checked against hashes captured before this repair. The question-derived contentKey intentionally changes. TS/SymPy now require the explicit relation and matching coordinates, and reject the actual old questions and deletion/inconsistency mutations. Current main still has MV-02; FIXED_IN_DRAFT is not a released correction. Two defects are pending in this PR: MV-01 localization and MV-02 definition.

The other three families were checked across all variants: the other continuity family already defines f=g explicitly; the two limit families ask directly about the sole displayed g and do not need a separately assigned extension f. No similar ambiguity was found there.

No new numerical/key defect was found. Difficulty progression (mostly coefficient changes) and potentially ambiguous generic coefficient notation remain **NOT_VERIFIED educational/usability follow-ups**, not invented answer-key failures. See [full report](docs/QA003_MULTIVARIABLE_20261107_REPORT.md), the 288-row ledger and 18-case semantic review record under `docs/qa003-multivariable-20261107/`. Rerun instructions and source SHA-256 are retained; exact final delivery HEAD/CI live in the Draft PR validation section.

Next action: Work re-reviews the corrected definition and strengthened evidence; owner reviews the two narrow corrections; merge/deploy require separate authorization. Afterwards consider a bounded independent audit of `multivar-anisotropic-limit` and a separate difficulty-calibration rubric. Do not close #106/#108/#122 or unlock custom input. No next batch starts automatically.

## Historical register — 30 October snapshot retained below

The following denominators and release-status notes describe their original checkpoint; use the current section above for current inventory and release evidence.

**Historical checkpoint update:** 2026-10-30 (Europe/Warsaw), following the owner-authorized merge of PR #141; post-merge CI/Pages verification remains a separate gate. **Tracking issue:** [#106](https://github.com/eluyz/math-tutor-app/issues/106). **Proposed documentation PR:** separate; not a production release certificate.

## Explicit, non-interchangeable denominators

| Metric | Confirmed / total | Definition and evidence |
|---|---:|---|
| Historical main catalogue at `01ea8ad2989ca05b539354064eeeca417a8d077f` | **220 families / 17,733 distinct task instances** | Generator catalogue on `main`; *inventory*, not correctness certification |
| Independently checked answer/classification tuples | **1,434 / 17,733 (8.09%)** | QA-003 pilot and expansion, issue [#106](https://github.com/eluyz/math-tutor-app/issues/106#issuecomment-6495501846); executed on a previously pinned main plus QA patch, **not fully rerun on this latest main** |
| Families with bounded independent answer coverage | **19 / 220 (8.64%)** | All documented supported variants of these 19 families were enumerated in the reported QA runs |
| Task tuples not covered by that independent answer audit | **16,299** | Explicit **NOT_VERIFIED**, not FAIL |
| Tasks with complete human-style teaching/step review in *both* PL and EN | **75 / 17,733 (0.42%)** | 150 localized presentations / 952 displayed steps assessed; see #106 |
| Answer-assessment **scenarios** exercised | **36,472 PASS** | Includes correct, wrong, missing, malformed and equivalence checks; **not 36,472 tasks** |
| Confirmed teaching defects in audited content | **3 distinct defects**, corrected and released | Two PL logarithm explanations and one excluded-origin explanation in both languages; [merged PR #137](https://github.com/eluyz/math-tutor-app/pull/137) with exact-SHA main CI/Pages PASS |
| Wrong *final answer keys* in audited sample | **0 confirmed** | This is a claim limited to the sampled 1,434 tasks, not the full catalogue |
| Original six F05 source graph witnesses | **6/6 visually inspected, 0/6 complete source-to-app acceptance** | See [#122](https://github.com/eluyz/math-tutor-app/issues/122#issuecomment-6494351248); 30 source-key answer groups inspected, no exact integrated app/browser acceptance |
| Main CI and Pages on latest #141 commit | **PENDING post-merge verification** | PR #141 HEAD [CI #40958795298](https://github.com/eluyz/math-tutor-app/actions/runs/40958795298) PASS; [post-merge main CI #41016852447](https://github.com/eluyz/math-tutor-app/actions/runs/41016852447) started for `01ea8ad2`; Pages on that same SHA remains NOT_VERIFIED in this checkpoint. Prior #137 release CI and Pages PASS at SHA `e670b6f9`. This does not certify mathematical explanations |

**Do not combine** task tuples, locale presentations, mathematical operations, grading scenarios and source witness counts into a single misleading denominator. The 1,434 independently audited tuples comprise **864 + 288 + 282**; no duplicate counting. The **90 in-repository signed-arithmetic regression cases in merged PR #141** have passed exact-HEAD CI, but remain a **separate automated-oracle evidence tier**. They have **not** been added to the historical external independent-auditor count of 1,434 or to the 75 pedagogical reviews.

## Audited families and batch boundaries

**Batch A — 864 tuples:** 12 families × 3 levels × 24 variants, independent exact expected answer and PL/EN answer-spec comparison:

```text
determinant-gaussian-pivot-five
inverse-four-xa-equation
gauss-five-4x5
cramer-four-singular-minors
sequence-power-exponential
function-log-rational-domain
function-disconnected-range
limit-oscillatory-heine
derivative-vertical-cusp
integral-log-substitution
integral-improper-interior-power
multivar-degenerate-quartic
```

**Batch B — 288 tuples:** 4 families × 3 levels × 24 variants, independent answer, arithmetic and selected displayed-step checks:

```text
function-disconnected-monotonicity
function-punctured-symmetry
function-asymptote-range
Möbius inverse function family — exact registered family ID should be verified against the private evidence archive before importing per-task rows
```

**Batch C — 282 tuples:** all supported variants and supplemental instances across five difficulty levels in **three** legacy families:

```text
fraction-add
fraction-subtract
fraction-product
```

The independent checker reported **75 distinct tuples** fully reviewed for question wording, both hints, every worked step, reasons and localized final answers. For the **other 1,359** checked tuples, answer correctness was tested but a complete semantic explanation review remains **NOT_VERIFIED**. The exact 75 tuple keys and per-case details are in the original audit evidence archive reported in [#106](https://github.com/eluyz/math-tutor-app/issues/106#issuecomment-6495501846); do not invent individual reviewed flags here.

## Confirmed defects and merge gate

- **F01 / F02 — `function-log-rational-domain`:** incorrect Polish wording implied three numerator zeros and incorrectly ruled out `ln(1)=0`. All 72 Polish task presentations share the relevant explanation template. Expected result/grading remained correct in the audited scope.
- **F03 — `function-punctured-symmetry`:** six level/variant tuples incorrectly referred to `f(0)` at an excluded origin; PL and EN wording repaired without changing the parity key.
- **Fixed and published:** [PR #137](https://github.com/eluyz/math-tutor-app/pull/137) was explicitly approved at HEAD `cb9d72c9a1a6cd98edcc656f46e609c379ecd789` and Squash-merged as `e670b6f9f532c8aff83b4f6e0538886cc38b127f`. Its three focused regression tests passed, followed by same-SHA [main CI](https://github.com/eluyz/math-tutor-app/actions/runs/40948126630) and [GitHub Pages](https://github.com/eluyz/math-tutor-app/actions/runs/40950464164) SUCCESS. No answer keys, variant IDs or generator logic were changed. Historic defects remain in the findings ledger but their **release status is FIXED**.
- The source documents/PDF screenshots and exact coordinates of original worksheets must stay private.

## Next independent audit batches (NOT_YET_EXECUTED)

| Priority | Evidence to gather | Exit criteria |
|---|---|---|
| P0 | Latest two integrated graph families: `function-integrated-properties` (#136) and `function-integrated-jump` (#139), 72 + 72 instances | Independent oracle *separate from production implementation*, all six fields, PL/EN selected/wrong/missing answer paths, full sampled reasons; do not simply re-label existing Vitest tests as independent QA-003 |
| DONE | #137 three teaching fixes | Owner-authorized Squash, full PR and post-merge main CI including Chromium PASS, same-SHA Pages SUCCESS, commit `e670b6f9` |
| CODE MERGED; RELEASE GATE PENDING | [PR #141](https://github.com/eluyz/math-tutor-app/pull/141): 90 signed-arithmetic tuples across 3 families × 3 levels | Owner-authorized Squash at approved HEAD `1a7d500195a817142091ef925c06a0efc9ebc22a` created main `01ea8ad2989ca05b539354064eeeca417a8d077f`. In-repo BigInt test derives expected results from the **visible problem statement** and checks the answer, calculation, intermediate step and grading cases; PR CI #40958795298 PASS. **Matching-SHA main CI/Pages must be checked before calling this deployed.** Do not add these 90 to 1,434 external QA tuples. |
| P0 | F05 six authentic source witnesses a–f | For each, same source plot → domain, range, strict increase/decrease, injectivity and parity; independent expected values, PL/EN grading, 375px and desktop browser evidence; current result **0/6 fully accepted** |
| P1 | Remaining high-risk required syllabus families across matrices/systems, sequences/limits, derivatives, integrals, two-variable calculus | Stratified exact oracle by family and boundary/degenerate cases; full pedagogical sample, source mapping and proof-linked report |
| P1 | Difficulty calibration | Demonstrate a *methodological* difference among levels rather than only coefficient changes; report independently |

### Rules for future rows / progress reporting

Each row must include **`main_sha`, `family_id`, `difficulty`, `variant_index`, `source_reference` (private pointer only), `oracle_kind`, `answer_result`, `grading_result`, `pl_steps_result`, `en_steps_result`, `reviewer`, `evidence_link`**. Use statuses `PASS`, `FAIL`, `NEEDS_FIXES`, `NOT_VERIFIED`. A family is *complete* only with evidence for all supported variants, correct and incorrect grading paths, and a separately stated semantic-review level. Never change historical scope silently when `main` advances.

**Open release/acceptance gates:** [#106 independent QA](https://github.com/eluyz/math-tutor-app/issues/106), [#122 F05 six original witness forms](https://github.com/eluyz/math-tutor-app/issues/122), [#108 64-skill syllabus acceptance](https://github.com/eluyz/math-tutor-app/issues/108). Do not start custom problem mode [#104](https://github.com/eluyz/math-tutor-app/issues/104) before #108 acceptance.
