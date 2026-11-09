# G04 — exponential function limits: student catalog integration candidate

Date: 2026-11-09. Parent staged draft: PR #287, method-only source at `19b6a0d1b6de024a87d43bf3dd2dccd312ea0580` (updated synthetic source). Parent PR remains open/draft; **do not merge it independently** if this combined integration is later merged.

## Included scope

- Imports parent staged source (24 unique hard synthetic exponential-function ratio limits at x→+∞), unit tests, and source-method audit documentation.
- Adds `ExponentialFunctionRatioProblem` to the UniversityProblem union, one `limit-exponential-function-ratio` family to `function-limits` catalog and presenter dispatch, and links G04 competency index while maintaining **partial** classification.
- New catalog unit acceptance exercises 24 variants for PL/EN, both hints, full steps, exact grading correct/incorrect/blank, and non-supported levels.
- Playwright checks PL/EN at 375px/1280px: competency search, family selection, original displayed variant, grading feedback, revealed solution and no overflow/page errors.
- Expected catalog after merge onto main at e90d8e6: **258 families and 19,557 task variants**. Existing 257 and 19,533 including merged fractional-root family remain intact. Excluding this new family in historical assertions preserves frozen legacy baselines.
- Mathematical categories: 8 zero; 8 finite nonzero rational; 4 positive and 4 negative infinity. The special shifted mode models A^(x+k) and a denominator with a negative lower-base term; denominator is eventually positive at positive infinity.

## Release gates

- **Draft, NO MERGE pending exact-head CI terminal SUCCESS** including full Vitest, production build, Chromium/Playwright and Batch B–G. Parent stage CI is not sufficient to certify catalog integration.
- Confirm current main and no conflicts immediately before any merge. Retain all other department updates; if main advanced, perform serialized reconciliation and rerun full exact-head CI.
- Independent mathematical, PL/EN visual and source method review; no original private worksheet numbers or keys in the public source. **METHOD_CANDIDATE, not SOURCE_PASS**.
- Owner-approved squash merge only after gates. Then verify postmerge same-SHA main CI and Pages before claiming published student-facing deployment.
