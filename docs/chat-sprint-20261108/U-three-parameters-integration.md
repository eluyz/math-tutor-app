# CHAT-SPRINT-U: controlled catalog integration for 3 free parameters (2026-11-09)

## Dependency
- **Parent staged method:** Draft PR #250, HEAD `5ecbc842bdb1d30b06ab4be9b1d059d567ce9049`; full unit/build/953 generic Chromium/384 Batch B–G tests **PASS** on Actions run #42573795312. Method math includes two 3×5/4×5 families, with an independent test-only minor/Cramer oracle.
- This **integration branch was forked from parent PR #250**, not from released `main`; its PR may temporarily show both staged source and registration commits while parent remains unmerged. Do not merge the integration branch before the parent is independently reviewed and owner-approved.
- Prior U08 pedagogical PR #233 is a **separate** one-parameter hint correction; this integration does not contain, alter or authorize #233.

## Changes and risk isolation
- `src/university/schema.ts`: add an **explicit method tag** `"parameters-three"` to `linear-system`; unlike dispatch by matrix shape alone, this cannot misroute existing five-unknown `gauss-five-3x5`/`gauss-five-4x5` two-parameter cases.
- `src/university/gaussThreeParameters.ts`: new family producer and presenter use that explicit method marker; the mathematical model, coefficients and question forms from #250 remain unchanged.
- `src/university/catalog.ts`: register 2 families; dispatch **only** the new method to `presentGaussThreeParameters`.
- **+144 student-selectable tasks**: 3×5 and 4×5 × [hard, advanced, expert] × 24; 20 exact graded coefficients per task and full PL/EN solutions.
- `src/university/gaussThreeParameters.integration.test.ts`: all 144 stable IDs, unique Polish content keys, PL/EN full answer fields and grading, explicit old 3×5/4×5 family regression.
- `e2e/gauss-three-parameters.spec.ts`: original visible-matrix-only Cramer/minor answer oracle (no reading hidden answer/task); 375 and 1280 px, PL/EN, 3 levels, both shapes; empty/wrong/right scoring, solution and mobile no-overflow; 10-task category session on 375 px and exported local history metadata. No sensitive source material embedded.

## Acceptance requirements
1. Exact-head **CI full PASS**: unit test + production build + Playwright + production-bundle Batch B–G.
2. Independent mathematical, localization, grading and historical identity review for both PRs. Parent must be reviewed separately and merged first with owner consent.
3. Confirm no changes to 10,389 archived exercises or historical SHA fixtures; no broad catalog UI changes.
4. A source-specific audit remains mandatory before declaring `SOURCE_PASS` for U06/U08. The **3×5 rank-two source shape** was observed in private P12 material; 4×5 is additional synthetic method coverage, not a proven original 4×5 worksheet.
5. No auto-merge, Pages publication, or source acceptance solely on the basis of this candidate PR.
