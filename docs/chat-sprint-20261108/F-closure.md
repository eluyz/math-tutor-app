# CHAT-SPRINT-F — isolated F05/b-like six-field implementation

Date: 2026-11-08 (Europe/Warsaw). Base main: `c44ef85531906c9179c529fdfc852eb0035a13b7`.
Owner: F sprint only. Scope: `src/university/graphEvenOpenRange*`, this report.

## Why this narrow production change

Existing F05 families already teach punctures, symmetry, open value limits and disconnected domains separately. What was missing as one reusable synthetic mathematical object: **both symmetric excluded x-values, two hollow endpoints at each x, an even graph, an open lower range bound, unbounded exterior tails and six graded fields together**.

This is **PUBLIC SYNTHETIC METHOD** material. No private source formula, graph geometry, worksheet answer or original keys are added to this repository. A passing test does not authorize SOURCE_PASS of any private Pxx worksheet.

## New isolated math module and figure

- `src/university/graphEvenOpenRange.ts`: validates parameters, defines a single-valued piecewise even function, exposes the pure evaluator and exact six-field oracle, builds independent answer alternatives, and supplies PL/EN hints plus six detailed reasoning steps.
- `src/university/graphEvenOpenRangeDisplay.tsx`: accessible SVG with two symmetric holes, **four** hollow circles (two heights per excluded argument), actual increasing unbounded outer tails (with arrows), sampled quadratic center, dynamic axis labels and bilingual text fallback.
- Unit tests exercise all 24 parameter choices × 3 levels, both localizations, exact six-field grading, incorrect/missing responses, noninjectivity witness, all domain holes, lower-bound exclusion, y-height attainment, symmetric values and monotonicity directions.
- SSR SVG checks validate structure, four hollow endpoints, two tails, PL/EN descriptions and exact parameter labels.

### Public geometry / proof

For synthetic integers `h >= 3`, `s >= 1`, `l >= 2` and integer `b`:

```text
f(x) = b+s(|x|-h)         when |x|>h
f(x) = b+l+2(x/h)^2       when |x|<h
f(x) undefined           when x=-h or x=h
```

Therefore:

- `D=(-∞;-h) ∪ (-h;h) ∪ (h;+∞)`.
- `W=(b;+∞)`. Outer tails realize every y>b; b itself is excluded and the inner branch stays above b.
- Increasing: `[0;h) ∪ (h;+∞)`.
- Decreasing: `(-∞;-h) ∪ (-h;0]`.
- Injectivity: **no**, since `f(-h/2)=f(h/2)` at distinct included arguments.
- Parity: **even**, since the domain is symmetric and formulas depend on `|x|` or `x²`.

Each missing x has two different hollow y-heights: exterior limit `b`, inner limit `b+l+2`. There is never a filled point at either missing x.

## Critical integration boundary — NOT LIVE / DO NOT MERGE YET

This Draft PR deliberately **does not edit shared files** which other parallel workers own. Therefore the new family does **not** appear in the student catalog or the app, and is not claimed STUDENT_READY.

A subsequent *single coordinated integration* PR must, after other F sprints stop writing to the shared files:

1. In `src/university/schema.ts`, import `EvenOpenRangeProblem` and add it to `UniversityProblem`.
2. In this owned F module, register `graphEvenOpenRangeFamilies` as `readonly UniversityFamily[]`, ID `function-even-open-range`, category `functions`, titles PL/EN, levels hard/advanced/expert and `create:makeEvenOpenRange`.
3. In `src/university/catalog.ts`, import/add that family to `universityFamilies`; import `presentEvenOpenRange` and add an exact `problem.kind === "function-even-open-range"` dispatcher arm.
4. In `src/App.tsx`, import `EvenOpenRangeDisplay` and render it for `active.university.kind === "function-even-open-range"`.
5. Verify `npm test`, `npm run build`, production preview Chromium PL/EN 375px and 1280px, all six exact expected selections, each wrong/missing input, glyph visibility/overflow, hollow/fill markers and arrows, plus main/Pages after reviewed merge.
6. Only then label family STUDENT_READY. Keep `F05_SOURCE_PASS=0/6` until **independent exact original-source** acceptance.

This is the sole proposed F05/b-like work unit. Other gaps (F05/e-like, the separate F01–F04 form gaps and any source-key correction) are deliberately excluded.

## Evidence and status

- Baseline main CI: successful on pinned main SHA, **not evidence of this branch**.
- Local runtime in Chat cannot fetch the full GitHub repository via git DNS; local `npm test`, build and Playwright are **NOT_RUN**.
- New branch CI may run automatically after Draft PR; its actual SHA and terminal results must be inspected separately. Never claim PASS from queued/running results.
- Scope: NO merge, NO shared-file modifications, NO catalog counter change, NO private content.
- Status at authoring: `MATH_IMPLEMENTED; SVG_IMPLEMENTED; TESTS_WRITTEN; CATALOG_INTEGRATION_BLOCKED; BROWSER_QA_PENDING; SOURCE_NOT_VERIFIED`.

Refs #108 (no auto-close).

## Merged-main reconciliation checkpoint (2026-11-09)

After unrelated #244 G06 reached main, the B catalog integration was reconciled with main `3a96dd5d32cc0293ab9952e228501a80fab5bfab` without force-push or discarding G06. The integrated *candidate* has 244 families and 18,597 variants (published main 243/18,525 before this PR). Exact P21 original-source witness acceptance is unchanged: 0/6. A new exact-head full GitHub Actions check is required before the owner-authorized merge; a successful run on a previous candidate SHA is not sufficient.
