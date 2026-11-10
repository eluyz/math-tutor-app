# G04 — exponential function limits: student catalog integration candidate

Date: 2026-11-09. Parent staged draft: PR #287, method-only source at `19b6a0d1b6de024a87d43bf3dd2dccd312ea0580` (updated synthetic source). Parent PR remains open/draft; **do not merge it independently** if this combined integration is later merged.

## Included scope

- Imports parent staged source (24 unique hard synthetic exponential-function ratio limits at x→+∞), unit tests, and source-method audit documentation.
- Adds `ExponentialFunctionRatioProblem` to the UniversityProblem union, one `limit-exponential-function-ratio` family to `function-limits` catalog and presenter dispatch, and links G04 competency index while maintaining **partial** classification.
- New catalog unit acceptance exercises 24 variants for PL/EN, both hints, full steps, exact grading correct/incorrect/blank, and non-supported levels.
- Playwright checks PL/EN at 375px/1280px: competency search, family selection, original displayed variant, grading feedback, revealed solution and no overflow/page errors.
- Original 2026-11-09 projection at main e90d8e6: **258 families and 19,557 task variants**; superseded by the 2026-11-10 FINAL FREEZE reconciliation below. Existing 257 and 19,533 including merged fractional-root family remain intact. Excluding this new family in historical assertions preserves frozen legacy baselines.
- Mathematical categories: 8 zero; 8 finite nonzero rational; 4 positive and 4 negative infinity. The special shifted mode models A^(x+k) and a denominator with a negative lower-base term; denominator is eventually positive at positive infinity.

## Release gates

- **Draft, NO MERGE pending exact-head CI terminal SUCCESS** including full Vitest, production build, Chromium/Playwright and Batch B–G. Parent stage CI is not sufficient to certify catalog integration.
- Confirm current main and no conflicts immediately before any merge. Retain all other department updates; if main advanced, perform serialized reconciliation and rerun full exact-head CI.
- Independent mathematical, PL/EN visual and source method review; no original private worksheet numbers or keys in the public source. **METHOD_CANDIDATE, not SOURCE_PASS**.
- Owner-approved squash merge only after gates. Then verify postmerge same-SHA main CI and Pages before claiming published student-facing deployment.

## FINAL FREEZE amendment — 2026-11-10

- See `G-FINAL-FREEZE.md` in this directory for competency/source matrix, evidence, independent G04 math QA, and PR handoff.
- Latest source checked at audit checkpoint: `main@d942b0f1ec77feb7b83a228502b562df005cde14`, 263 families and 19,989 variants. Pending G04 integration would give **264 families / 20,013 variants**. Numeric counts above are historical, not the current release projection.
- Exact-head CI #42785456236 succeeded on an earlier PR head, but that is **not** CI certification for the final reconciled commit. Require fresh success after preserving other-department changes.
- PM explicit FINAL FREEZE overrides the earlier conditional owner approval: **DO NOT MERGE this PR as part of this chat's actions**, even after PASS. Leave Draft for PM independent source/PL-EN acceptance.
- Parent PR #287 and earlier root stage #268 are redundant stages, **not automatically mergeable**; do not close without PM QA.
- Original private worksheet exact coefficients and answer keys must remain private. No `SOURCE_PASS` for G01–G08 is asserted here.
