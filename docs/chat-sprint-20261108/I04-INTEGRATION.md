# I04 — integration gate for two-pass trigonometric integration (2026-11-08)

## Dependency and release safety
- Source/staged implementation: Draft PR #234, HEAD `1666c008cdd4a730c734dc0b8b4e3b4ccdd0a556`. This integration PR is branched from its HEAD but **temporarily targets `main` to trigger mandatory CI**, since the repository workflow only runs for PRs targeting `main` or the QA branch. While #234 is unmerged, the visible PR diff necessarily includes staged files from #234; after #234 merges, GitHub reduces the diff to integration-only changes.
- Do **not** merge this integration PR before #234 has passed all mandatory CI/browser checks, owner has explicitly approved its exact SHA and it is merged to `main`.
- After #234 merge, review the reduced integration-only diff against new main (rebase only if needed), verify fresh exact-HEAD CI, and validate Pages only **after** the owner-approved integration merge. No automatic merging.
- The fact that these tests are green on this stacked branch does **not** establish publication, or `SOURCE_PASS` for I04.

## Changes in this integration layer
- Type registration in `src/university/schema.ts`; routing and registration in `src/university/catalog.ts`.
- `src/competencyIndex.ts` extends existing `I04.familyIds` without changing `coverage: "partial"` (still not source-certified).
- Legacy `integrals` pool count baseline updates from **1512 → 1584** (+72 exact tuples). Other family IDs and previous tuple indices should be unchanged.
- English family title includes exact "integration by parts" phrase for bilingual catalog search.
- Existing search tests updated with the fourth I04 result; new catalog integration unit tests verify 24 × hard/advanced/expert, locales, three fields, strict `+C`, and competency search.
- New Playwright spec verifies actual three-input UI/feedback/solution in PL/EN, mobile and desktop, hard/expert.

## Acceptance checklist
- [ ] PR #234 exact SHA fully PASS, owner-approved squash merge + main CI/Pages
- [ ] Integration PR unit tests PASS (new + all existing)
- [ ] Integration PR production build PASS
- [ ] Integration PR Playwright (incl. new I04 and search tests) PASS
- [ ] GitHub review of source and UI evidence; independent QA check for original private form
- [ ] Owner-approved exact-SHA merge after retarget to main
- [ ] Main CI and Pages PASS; manual smoke test on live app

No private original university PDF/problem text is copied to public GitHub.
