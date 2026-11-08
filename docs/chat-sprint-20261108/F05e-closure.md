# F05/e — synthetic single excluded argument with two recovered heights

> **Stacked integration update (2026-11-08):** This file originally documented the isolated Draft #246. A separate descendant branch `chat/integrate-f05e-on-b-20261108` now registers this family in the model, catalog, app SVG and F05 search, adds an exact PL/EN mobile/desktop browser witness, and updates **candidate-only** totals to 242 families and 18,477 variants. That branch is explicitly *stacked on* integrated F05/b Draft #243; it is **not merged** or deployed and original source acceptance is still 0/6. The staging limitations and integration checklist below describe the isolated precursor, not the later stacked candidate.

Date: 2026-11-08 (Europe/Warsaw). Branch: `chat/closure-f05e-20261108`. Base: `main@c44ef85531906c9179c529fdfc852eb0035a13b7`.

## Purpose / source privacy

This **standalone public synthetic method** covers one excluded input, *two distinct hollow one-sided limits at that same input*, and both limiting heights present elsewhere in the value set. The left tail is unbounded below; the right side reaches a maximum and finishes at a closed finite point. All six graph properties have distinct choice grading and full PL/EN explanations. This graph is *not* an exact reproduction or `SOURCE_PASS` of any private university drawing; no original coordinates or answer key are published.

## Exact contract

Parameters are safe integers. Let `c` be the excluded x, `B` the right hollow limit, `sep>=2`, `A=B+sep` the left hollow limit, `rise>=2`, `H=A+rise` the attained right maximum, `s>=1`, `t=c+upSpan`, `R=t+downSpan`, and `E=H-drop` where `0<drop<sep+rise`.

```text
f(x) = A+s(x-c),                  for x<c
f(x) = B+(H-B)(x-c)/(t-c),        for c<x<=t
f(x) = H-drop*(x-t)/(R-t),        for t<x<=R
undefined for x=c and x>R
```

Proof by inequalities, not by reading pixels:

- `D=(-infty,c) union (c,R]`: only one missing x=c, no filled point there.
- Left y-image `(-infty,A)`, right first segment `(B,H]` with `B<A<H`, decreasing right segment stays inside `(B,H]`; therefore `W=(-infty,H]`.
- `increasing=(-infty,c) union (c,t]`, `decreasing=[t,R]`: strict positive left/up slopes, strict negative right fall; do not connect across x=c.
- `injective=no`: the shared height `y=(A+B)/2` occurs both for `x_left=c-sep/(2s)<c` and `x_right=c+upSpan*sep/(2(sep+rise))` with `c<x_right<t`.
- `parity=neither`: domain is unbounded left but bounded right and therefore not invariant under x→-x.
- Hollow heights are both recovered: `y=B` occurs at `x=c-sep/s<c` on the left, and `y=A` at `x=c+upSpan*sep/(sep+rise)` on the right.
- Display has exactly two open circles at x=c and y=A/y=B, one arrow at the left tail, one full maximum at x=t, one full endpoint at x=R. All coordinates come from synthetic parameters and exact branch definitions.

## Files owned by F sprint

- `src/university/graphSingleHoleRecovery.ts` — safe parameter generator (24 variants each hard/advanced/expert), mathematical evaluator/validation, independent recovery and noninjectivity witnesses, six-field answer and localized step-by-step proof.
- `src/university/graphSingleHoleRecoveryDisplay.tsx` — accessible bilingual SVG with exact branches and two hollows at a shared x.
- `src/university/graphSingleHoleRecovery.test.ts` — checks all 72 geometries, one-sided limits, recovery on other branches, exact domains/ranges, all six fields and correctness/wrong/missing grading in PL/EN.
- `src/university/graphSingleHoleRecoveryDisplay.test.ts` — structural accessible SVG checks with PL/EN and three levels, multiple variants.
- This file as the owned report. Shared app/catalog/README/docs/QA are not modified.

## Deliberate staging boundary

**This staged PR is NOT student-accessible and is NOT MERGE_READY.** After F05/b integration PR #243 and other overlapping projects (#239 I04, #242 C02, #244 G06) are reconciled, one coordinated follow-up integration must:

1. Add `SingleHoleRecoveryProblem` to `UniversityProblem` in `src/university/schema.ts`.
2. Export a `readonly UniversityFamily[]` from this F module for ID `function-single-hole-recovery`, category `functions`, levels hard/advanced/expert, PL/EN titles.
3. Register in `src/university/catalog.ts`: family and `presentSingleHoleRecovery` dispatcher, and graph content key `JSON.stringify(university)` for all distinct variants.
4. In `src/App.tsx`, render `SingleHoleRecoveryDisplay` for exactly that problem kind.
5. In `src/competencyIndex.ts`, add it to F05 search; update candidate counts and historical exclusion classifiers, README, GENERATORS. Rebase only after checking the actual new main SHA; never overwrite other departments.
6. Run production build, unit tests, Chromium tests for six-field grading and SVG at 375/1280 PL/EN, full Batch B–G, independent visual and exact-math review, then owner review. Keep public source acceptance counter **0/6** unless separately proven against original figures.

## Status at authoring

`MODEL_COMPLETE; SVG_COMPLETE; MATH_TESTS_WRITTEN; BROWSER_QA_NOT_RUN; CATALOG_NOT_INTEGRATED; NOT_STUDENT_READY; SOURCE_EXACT_NOT_ACCEPTED`.

No code from private university worksheets, no merge, no changes to other sprint branches. Refs #108 and #122.
