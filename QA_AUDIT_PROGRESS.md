# QA-003 — independent audit coverage and evidence register

**Last evidence update:** 2026-10-29 (Europe/Warsaw). **Tracking issue:** [#106](https://github.com/eluyz/math-tutor-app/issues/106). **Proposed documentation PR:** separate; not a production release certificate.

## Explicit, non-interchangeable denominators

| Metric | Confirmed / total | Definition and evidence |
|---|---:|---|
| Current main catalogue at `afca26c7a612f5c0b6d9f3eca082acc4e2cdf471` | **220 families / 17,733 distinct task instances** | Generator catalogue on `main`; *inventory*, not correctness certification |
| Independently checked answer/classification tuples | **1,434 / 17,733 (8.09%)** | QA-003 pilot and expansion, issue [#106](https://github.com/eluyz/math-tutor-app/issues/106#issuecomment-6495501846); executed on a previously pinned main plus QA patch, **not fully rerun on this latest main** |
| Families with bounded independent answer coverage | **19 / 220 (8.64%)** | All documented supported variants of these 19 families were enumerated in the reported QA runs |
| Task tuples not covered by that independent answer audit | **16,299** | Explicit **NOT_VERIFIED**, not FAIL |
| Tasks with complete human-style teaching/step review in *both* PL and EN | **75 / 17,733 (0.42%)** | 150 localized presentations / 952 displayed steps assessed; see #106 |
| Answer-assessment **scenarios** exercised | **36,472 PASS** | Includes correct, wrong, missing, malformed and equivalence checks; **not 36,472 tasks** |
| Confirmed teaching defects in audited content | **3 distinct defects**, fixes proposed | Two PL logarithm explanations and one excluded-origin explanation in both languages; [Draft PR #137](https://github.com/eluyz/math-tutor-app/pull/137) |
| Wrong *final answer keys* in audited sample | **0 confirmed** | This is a claim limited to the sampled 1,434 tasks, not the full catalogue |
| Original six F05 source graph witnesses | **6/6 visually inspected, 0/6 complete source-to-app acceptance** | See [#122](https://github.com/eluyz/math-tutor-app/issues/122#issuecomment-6494351248); 30 source-key answer groups inspected, no exact integrated app/browser acceptance |
| CI/Playwright on current main | **PASS** | GitHub Actions [CI](https://github.com/eluyz/math-tutor-app/actions/runs/40896973501) and [Pages](https://github.com/eluyz/math-tutor-app/actions/runs/40898950945) at the same SHA; does **not** mean all mathematical explanations are verified |

**Do not combine** task tuples, locale presentations, mathematical operations, grading scenarios and source witness counts into a single misleading denominator. The 1,434 audited tuples comprise **864 + 288 + 282**; no duplicate counting.

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
- The fixes and three new negative-before/positive-after regression tests exist in [Draft PR #137](https://github.com/eluyz/math-tutor-app/pull/137). Its branch was brought forward to latest main as commit `cb9d72c9a1a6cd98edcc656f46e609c379ecd789`; **CI result and fresh owner authorization are release prerequisites**. Until release, do not claim defects are fixed in production.
- The source documents/PDF screenshots and exact coordinates of original worksheets must stay private.

## Next independent audit batches (NOT_YET_EXECUTED)

| Priority | Evidence to gather | Exit criteria |
|---|---|---|
| P0 | Latest two integrated graph families: `function-integrated-properties` (#136) and `function-integrated-jump` (#139), 72 + 72 instances | Independent oracle *separate from production implementation*, all six fields, PL/EN selected/wrong/missing answer paths, full sampled reasons; do not simply re-label existing Vitest tests as independent QA-003 |
| P0 | Confirm/retest corrected #137 on latest main; post-merge code if separately authorized | Final HEAD CI including Chromium PASS, diff review, owner approval, identical SHA post-merge CI/Pages |
| P0 | F05 six authentic source witnesses a–f | For each, same source plot → domain, range, strict increase/decrease, injectivity and parity; independent expected values, PL/EN grading, 375px and desktop browser evidence; current result **0/6 fully accepted** |
| P1 | Remaining high-risk required syllabus families across matrices/systems, sequences/limits, derivatives, integrals, two-variable calculus | Stratified exact oracle by family and boundary/degenerate cases; full pedagogical sample, source mapping and proof-linked report |
| P1 | Difficulty calibration | Demonstrate a *methodological* difference among levels rather than only coefficient changes; report independently |

### Rules for future rows / progress reporting

Each row must include **`main_sha`, `family_id`, `difficulty`, `variant_index`, `source_reference` (private pointer only), `oracle_kind`, `answer_result`, `grading_result`, `pl_steps_result`, `en_steps_result`, `reviewer`, `evidence_link`**. Use statuses `PASS`, `FAIL`, `NEEDS_FIXES`, `NOT_VERIFIED`. A family is *complete* only with evidence for all supported variants, correct and incorrect grading paths, and a separately stated semantic-review level. Never change historical scope silently when `main` advances.

**Open release/acceptance gates:** [#106 independent QA](https://github.com/eluyz/math-tutor-app/issues/106), [#122 F05 six original witness forms](https://github.com/eluyz/math-tutor-app/issues/122), [#108 64-skill syllabus acceptance](https://github.com/eluyz/math-tutor-app/issues/108). Do not start custom problem mode [#104](https://github.com/eluyz/math-tutor-app/issues/104) before #108 acceptance.
