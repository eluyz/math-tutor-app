# [CHAT-SPRINT-G] G06 infinity-form Euler — staged implementation

Date: 2026-11-08 (Europe/Warsaw). Baseline: `main@c44ef85531906c9179c529fdfc852eb0035a13b7`. Branch: `chat/closure-g-20261108` (if available). References: #108, #205, #213.

## Decision

Private P26/3a–d and matching answer-key entries were inspected locally (not copied to GitHub). All four examples request a functional Euler limit as `x→+∞`, with reciprocal and rational-linear bases, including a coefficient involving π. The current `analysis-euler-function` uses `x→0` and has **96 previously published tasks** frozen under `src/university/fixtures/mtedu014p1-baseline.json`. It must not be repurposed or changed.

A **new independent, synthetic** one-level family is staged in `src/university/analysisLimitsAsymptotesInfinity.ts`: `analysis-euler-function-infinity`, difficulty `hard`, 24 variants, two mathematical forms. The second form includes an optional constant exponent offset; the reciprocal form includes a π coefficient. This is a bounded *new form*, not a generalized algebra engine, nor a transcription of any private exercise or answer key.

For x→+∞, all generated power bases tend to 1 and are positive for sufficiently large x. In the reciprocal case `(1+a/x)^(kx)`, the limit is `exp(ka)`; when a includes π, `exp(kaπ)`. For `((mx+a)/(mx+b))^(kx+d)` with m>0, the limit is `exp(k(a−b)/m)` by logarithms and `ln(1+u)/u→1`. For a=b, the base is identically 1, and no division by u=0 occurs. Inputs and output use exact rationals and symbolic choice answers (no decimal approximation of π or e).

## Validation and honest limitations

- Local standalone TypeScript syntax/strict-check **PASS** using minimal local type shims (not the actual project build).
- Local Node mathematical/presenter smoke test **PASS**, 24 independent numerical logarithmic comparisons at large x, Polish and English, including 6 π cases and 1 exact-base-one case. These are *standalone* checks, not Vitest or actual app grading.
- Targeted Vitest unit test **added but NOT_RUN** against real project dependencies. Full project TypeScript/build/CI/Playwright **NOT_RUN** locally; use exact-HEAD GitHub CI when available. No claim of CI PASS or deployed Pages.
- Private originals were inspected to establish the exact mathematical **format**, but new production synthetic variants are **not SOURCE_PASS**; independent UI/source acceptance and owner review remain pending.
- Zero edits to existing G06 `analysis-euler-function` items, shared catalog, shared schema, app, QA registries, deployment or global syllabus maps.

## Required later integration in its own exclusive PR

This stage intentionally does **not** register the new kind, because catalog and schema are shared parallel-sprint files. As a result, **the new family is not yet selectable in Math Tutor**.

1. In `src/university/schema.ts` import `EulerInfinityProblem` from `./analysisLimitsAsymptotesInfinity` and add it to the discriminated `UniversityProblem` union. Keep old `AsymptoteProblem` unchanged.
2. In `src/university/catalog.ts`, import `eulerInfinityFamilies`, `presentEulerInfinity`; spread the family once into `universityFamilies`, and dispatch `kind === "analysis-euler-infinity"` to `presentEulerInfinity` before the existing asymptote dispatch. Do not edit or remove historical families.
3. Add new G06 family ID to the competency lookup in a serialized integration PR. Keep bounded/partial skill status pending source acceptance; do not update SOURCE_PASS counters.
4. Execute `npm test` (including the newly added `analysisLimitsAsymptotesInfinity.test.ts`), `npm run build`, and PL/EN browser checks for the new catalog entry; compare historic archive regression. Require CI and Pages success on the exact final merged main SHA before calling it deployed.

## Student-ready until integration

Use existing `analysis-euler-function` for x→0 Euler limits; for the x→+∞ source form the new family is **staged only**. Existing G01–G05 and G07–G08 families remain unmodified. Priority after integration: private-source-to-UI witness and correct/wrong/empty grading check for G06, without publishing originals.

## Addendum — G04 mixed fractional powers, 2026-11-09

- Branch: `chat/closure-g04-fractional-roots-20261109`, baseline `main@dfdb8cca1d962fc9838a7d1c201d8da9faf84f44`, Refs #108.
- Private source method gap verified: comparison of square-root and cube-root growth in a quotient at positive infinity. No original question, numerical coefficients, result, scan or key are reproduced in public files.
- Stage-only files: `functionLimitsFractionalRoots.ts` and its targeted `.test.ts`. The 24 synthetic cases classify limits as zero, positive infinity, or negative infinity, with PL/EN steps, hints and grading specs.
- Independent numerical cross-check (outside the app): 24/24 cases PASS; exactly 8 finite, 8 positive-infinite and 8 negative-infinite. Regression test authored, but project Vitest/build/Playwright and exact-HEAD CI **NOT_RUN/NOT_VERIFIED** at this checkpoint.
- No shared catalog/schema/competency edits. The stage is **not available to students** until a future serialized integration PR and browser QA.
- Remaining work: verify exact-head CI, independent QA, owner review; later integrate G04 and separately examine the source's exponential-ratio growth method. No `SOURCE_PASS` claim.
