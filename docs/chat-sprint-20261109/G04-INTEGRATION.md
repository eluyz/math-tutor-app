# G04 fractional-root method — catalog integration candidate (2026-11-09)

- **Stage parent:** Draft PR #268, exact head `45a3c95189c5ca8f66cef520ce4336c1dbc8b668`, full [CI #42661496237](https://github.com/eluyz/math-tutor-app/actions/runs/42661496237) SUCCESS (unit/build/Chromium/Batch B–G). Stage is NOT merged and is not yet student-visible.
- **Integrated candidate:** standalone synthetic constructor/presenter and 24-case stage QA from #268 plus one `UniversityProblem` discriminator, catalog registration/dispatcher, G04 competence search entry, independent 24-case catalog test, and 4 PL/EN mobile/desktop browser checks. No original university questions or answer keys are committed.
- **Bounded mathematics:** 24 hard variants; compare x^(1/2) with x^(1/3) in a quotient at +infinity; eight limits 0, eight +infinity and eight −infinity. Existing G04 families are preserved. This does not supply exponential-ratio limit methods or full SOURCE_PASS.
- **Catalog gate:** CI must pass on the new integrated exact HEAD; stage CI is not proof of integrated CI. Independently validate real rendered problem, correct/wrong/blank choices, both hints and all steps in PL/EN 375px and 1280px.
- **Coordination:** Other open PRs (#269 I02, #266 C01/C03, #262 U04) may also edit schema/catalog/competency. Check current main, reconcile conflicts without dropping other families, then run fresh exact-head CI.
- **No auto-merge:** treat this as the combined integration candidate; do not merge both stage and integrated PR separately. Explicit owner approval, same-SHA postmerge CI and Pages required before claiming the new tasks are deployed. Refs #108.

## CI scheduler follow-up — 2026-11-09

After the first integrated CI failed on four stale inventory/doc assertions (since fixed), the reconciled exact-head `47c75b3b16d0b264e35111ebd52a854347f26ac3` produced [GitHub CI #42671507893](https://github.com/eluyz/math-tutor-app/actions/runs/42671507893): conclusion FAILURE, but **zero jobs were created** according to both the Actions run jobs endpoint and attempt 1 jobs endpoint. It elapsed exactly 60,000 ms, with no Vitest, build, Playwright or Batch B–G attempts; therefore it is **NOT a project-test verdict**. GitHub rejected rerun-failed-jobs with 403 "This workflow run cannot be retried". This documentation update creates a new SHA to request a clean GitHub Actions run. Until a full run reaches terminal SUCCESS, the PR remains Draft and not merge-ready.

## 2026-11-09 latest-main reconciliation and CI retry

- Previous exact HEAD `ac45be2821c5642a2eab228b0b0e98ca482553ac`: CI [#42672381358](https://github.com/eluyz/math-tutor-app/actions/runs/42672381358) concluded failure **without creating any verify job** (Actions jobs endpoint returned `total_count: 0`). GitHub rejected rerun-failed-jobs with HTTP 403. Therefore its conclusion does **not** demonstrate code/test failure.
- Merged current `main@91f77b8ffb1298e0ccbe51b7008ae5712bb5e1b8` (includes F05/e) without losing other lanes, rechecked 14 G04-related file changes and clean mergeability. Updated expected catalog inventory to **254 families / 19,245 tasks**; outside integral category **231 families / 17,637 tasks**. Kept historical MT-EDU-005 and integral baseline exclusions scoped to `limit-mixed-fractional-roots`.
- This documentation commit is intended to trigger a **fresh actual test run** on the latest integrated code. Retain Draft and block merge until exact SHA unit/build/Chromium/Batch B–G SUCCESS, independent code review, then owner authorization. Do not infer this from the staged PR #268 PASS.
