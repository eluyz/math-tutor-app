# ST-103 — playable population variance (Draft release)

**Status:** Development branch only; NOT merged or deployed. Statistics remains **Work in progress**.

## Scope

Enable the existing exact ST-103 population-variance task and PL/EN teaching copy in the Statistics fundamentals learning track, under the existing **Measures of dispersion** category. This category currently offers **population variance only**: range and standard deviation remain planned. The Statistics course still has two tracks, fifteen categories and five visible difficulties; only Easy/Medium/Hard are playable in the three published-in-scope lesson families.

- Source: existing `varianceTasks.ts`, `descriptive.ts` and `st103Copy.ts`; no modifications to their mathematical algorithms.
- Population variance: `σ² = Σ(xᵢ − μ)²/n`, **not** sample variance with `n−1`.
- Exact Rational answer checking through the shared parser; invalid, wrong and equivalent answers handled separately.
- Deterministic 5–9-integer observations with repeats, possible negatives and fractional results; full four-step explanation.
- Locale switching preserves active exercise and draft. Track/topic/difficulty switches follow the existing confirmation policy.
- No new backend, analytics, dependencies, Mathematics progress changes, or exam changes.

## Evidence and release gates

The existing pure variance generator has fixed mathematical fixtures, 256-seed test sweeps per difficulty, invariants and an independent sum-of-squares check. This integration adds adapter-level independent arithmetic verification and PL/EN Chromium E2E scenarios at 375 and 1280 px. The wider existing Mathematics and Statistics suites must also remain green.

**Do not merge solely on local/static evidence.** Confirm full CI (unit, build, complete Playwright, B–G) on the final PR SHA, obtain owner approval, then verify main CI and GitHub Pages on the release SHA. Do not claim independent external academic review, user adoption, or a complete statistics course.

Related existing issues: #315 (pure variance generator), #317 (bilingual teaching materials), #306 (Statistics S1 roadmap).
