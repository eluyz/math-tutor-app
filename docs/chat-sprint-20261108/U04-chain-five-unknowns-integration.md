# U04 — controlled integration of the five-unknown equality-chain method

## Dependency and release state (2026-11-09)

- Parent staging PR [#261](https://github.com/eluyz/math-tutor-app/pull/261), HEAD `9da20f8f59740fd504b388c1a4748e22425641a4`: stage-only synthetic source-SHAPE method. Full exact-head CI PASS: [#42630785473](https://github.com/eluyz/math-tutor-app/actions/runs/42630785473). This parent has **not yet been owner-authorized for merge** and has no submitted independent GitHub review at creation of this candidate.
- This integration is based on the stage branch rather than released main. It remains Draft until parent QA and owner approval. It must not be merged ahead of its parent.
- Source material is private: one original five-unknown, five-equality exercise requests x only. No original coefficients, equation text or answer key are committed. The existing legacy `system-chain-five` family is a distinct two-unknown task and stays unchanged.

## Changes

- `src/university/schema.ts`: explicit `linear-chain-five-unknowns` problem kind; no remapping of legacy `linear-chain-five`.
- `src/university/catalog.ts`: register the isolated method as one new systems family with **24 variants × four difficulties = 96 student-visible exercises**. Complete PL/EN lesson and scalar x grading. Candidate total: **248 families, 18,885 instances** on original base 247/18,789.
- `src/competencyIndex.ts`: add the family to U04 while retaining **partial**, not SOURCE_PASS.
- `src/university/chainFiveUnknowns.integration.test.ts`: all 96 stable task IDs/content keys, PL/EN questions, solutions, and scoring; verify legacy two-unknown family isolation.
- `src/qa/batchD.ts`: independent exact Cramer oracle from the new problem's raw coefficient/constant data (not production solver or task answer), ensuring all six equality values match.
- `e2e/helpers/systems.ts`: **visible-question-only** 5×5 Cramer parser and oracle. Parses the six displayed expressions from the rendered student question; checks all equalities and returns x, without using hidden generator coefficients or prepared answer.
- `e2e/u04-five-unknown-chain.spec.ts`: desktop/mobile 375/1280 PL/EN, all four levels, empty/wrong/right grading, solution steps, horizontal overflow, exact visible-text verification; two real ten-question sessions and stored progress history.
- `e2e/university.spec.ts`: existing mixed systems sessions now independently grade the new family if randomly encountered.
- `src/catalogSearch.test.ts`, `src/education/supplements.test.ts`, `src/university/integrals.test.ts`, README/GENERATORS: transparent candidate counts; historical baseline and frozen archive SHA tests remain unchanged.

## Explicit acceptance gates

1. Parent #261 exact-head full CI PASS and independent code/maths/PL/EN review. Then explicit owner approval for parent merge. **Do not auto-merge.**
2. Child PR exact-head CI full PASS including unit, build, Playwright and Batch B–G; review the independent browser oracle and preservation of sessions/historical identities.
3. Rebase/reconcile with live `main` after parent merge; rerun exact-head CI if the integration head changes. Preserve all other C/G/D/M/F/I/W work.
4. Owner approval for child merge, then postmerge CI and GitHub Pages on the actual new main commit.
5. Formal U04 SOURCE_PASS requires checking the private original worksheet algebra and answer key case, including limitations of the synthetic family. CI or a generic five-unknown shape alone does not grant this status.

No original university worksheet, numbers or answer key is included. Do not claim this PR is source-complete.
