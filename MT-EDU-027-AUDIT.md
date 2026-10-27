# MT-EDU-027 — 64-competency coverage refresh

Audited: 2026-10-27. Source: `CURRICULUM_COVERAGE.md` at `main` `e224def739634525c10ab2836607b07270751f55` before the P3A changes. The source records *bounded families*, **not exhaustive solution-space completeness**; having a generator does not imply support for every expression.

## Inventory

| Scope | Number | IDs |
| --- | ---: | --- |
| Covered **within declared bounded scope** | **15** | M01, M02, M06, M07, M08, U02, U05, C01, C03, F01, G01, G02, G03, G05, D01 |
| Partially covered | **49** | See grouping below |
| No corresponding generator / absent | **0** | — |
| Total | **64** | — |

Partially covered by segment:

| Segment | IDs | Count |
| --- | --- | ---: |
| Matrices and determinants | M03, M04, M05, M09, M10, M11, M12, M13, M14 | 9 |
| Linear systems | U01, U03, U04, U06, U07, U08 | 6 |
| Sequences | C02, C04, C05, C06 | 4 |
| Functions | F02, F03, F04, F05, F06, F07 | 6 |
| Limits | G04, G06, G07, G08 | 4 |
| Derivatives and function studies | D02, D03, D04, D05, D06, D07, D08, D09, D10 | 9 |
| Integrals and applications | I01, I02, I03, I04, I05, I06, I07, I08 | 8 |
| Functions of two variables | W01, W02, W03 | 3 |

## Reconciled backlog

- [Issue #55](https://github.com/eluyz/math-tutor-app/issues/55) is a completed **historical audit**, superseded by this updated inventory. Its earlier counts (15 covered/42 partial/5 absent/2 theory) are no longer current. Since then, controlled generator subsets were implemented; this does **not** upgrade any of the 49 partial competencies to fully supported.
- [Issue #49](https://github.com/eluyz/math-tutor-app/issues/49) corresponds mainly to **merged** PRs #50–#54 for F04/F05/F06. Remaining qualification: old acceptance criteria asked for an independent Work reviewer; that reviewer is disabled, so CI and maintainer review cannot be characterized as independent external sign-off. Do not needlessly duplicate its completed generator work.
- [Issue #32](https://github.com/eluyz/math-tutor-app/issues/32) is a separate diagnostic and remedial learning system, not a syllabus-generator gap. Keep it in its own workstream.

## Prioritization rationale

1. **P3A now: D06**: already has finite one-sided corner and piecewise jump cases, but lacks a clear distinction between continuous *vertical tangents* (same signed infinite difference quotients) and *cusps* (opposite signed infinities). The new family covers these carefully.
2. **P3A now: G08**: currently has finite piecewise Heine examples, but no genuinely *oscillating* sin(1/(x−h)) counterexamples versus squeeze-controlled (x−h)sin(1/(x−h)). The new family handles both.
3. **Later, separate reviewable PRs**: I06 (internal improper singularities), D09 (drawn-sketch assessment with valid accessibility fallback), M03 (broader compatible rectangular dimensions), W03 (general 2D continuity). These remain partial and require new mathematics, design, and tests.
4. Keep general symbolic parsers, OCR, automatic testing mode or institution-specific content out of scope.

## P3A governance

[Issue #96](https://github.com/eluyz/math-tutor-app/issues/96) / [draft PR #97](https://github.com/eluyz/math-tutor-app/pull/97): two families × three supported difficulties × 24 deterministic variants = **144** new variants. Target after an independently owner-approved merge: **200 families / 16,293 variants**. Mathematical examples, PL/EN explanations, independent audit and Playwright must pass on the final PR HEAD. No auto-merge.
