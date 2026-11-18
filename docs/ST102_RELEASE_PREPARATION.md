# ST-102 — final release preparation

## Integration checkpoint

The existing PR is [#336](https://github.com/eluyz/math-tutor-app/pull/336), branch
`feature/st102-median-navigation`. Its previously verified head was
`35b8ae39fbac5d21c907288c5013c66357d1272c`.

Current main `307276a7a4f3196f47633992b936704178d147c4` was integrated through
ordinary merge commit `6453f25`. No rebase, force-push or merge into main was
performed. The main update adds project skills and guidance; application,
generator, grading, dependency and workflow files are unchanged relative to the
previously verified ST-102 implementation. Existing local audit files are retained.

The final HEAD, complete CI results and readiness decision are recorded in the
PR description after execution. Earlier results in
[the implementation report](ST102_UI_CODEX_REPORT.md) remain historical evidence.

## Preserved release contract

- ST-101 arithmetic mean and ST-102 median remain playable through the existing
  generators and exact Rational comparison. No scoring or Mathematics state,
  history, exam or progress-storage changes.
- Two tracks contain 15 distinct categories: six fundamentals and nine planned
  university topics. Only mean and median are playable.
- All five canonical difficulty controls remain visible. Easy, Medium and Hard
  are available for playable lessons; Advanced and Expert are disabled with
  explanations. All topics and levels in the university roadmap are unavailable;
  no exercise fallback is generated. Variance remains unavailable.
- PL/EN switching preserves the dataset, input and revealed teaching. Topic,
  track and difficulty changes retain their documented reset behavior.
- Exact median verification covers odd/even lengths, ties, negative values,
  fractional results, equivalent fractions, malformed/empty input, both hints
  and every solution step. The adapter preserves the median generator's actual
  displayed permutation instead of reconstructing mean data.

Permanent adapter tests independently count ranks and cross-multiply exact
fractions for 195 median and 195 mean replay requests. Literal witnesses include
`[1,6,9,4,5] → 5`, `[3,3,1,16,7,13] → 5`,
`[2,2,3,10,1,7] → 5/2` and `[-16,-13,8,17,-1,14,-9] → -1`.
These checks do not constitute a complete Statistics course or external approval.

## Compatibility with the separate Focus Studio PR

Read-only comparison uses PR #337 at
`17897ba119c3bf0b4f4e05b019d13b026fc82e70`. A local `git merge-tree` simulation
does not change either working tree or remote branch. It reports three content
conflicts:

| File | Integration requirement |
| --- | --- |
| `src/statistics/StatisticsPractice.tsx` | Preserve ST-102's mean/median adapter, taxonomy and availability rules while incorporating Focus Studio's draft callback, replacement confirmation and shared presentation. Selecting either whole file would lose required behavior. |
| `e2e/statistics-practice.spec.ts` | Reconcile the five-level/median controls and new Statistics element IDs with retained-view and draft-preservation expectations. Keep grading, hints and solution assertions. |
| `e2e/subject-roadmap.spec.ts` | Preserve truthful mean/median availability and planned topics while reconciling hidden retained Statistics with earlier unmount/count assumptions. |

`src/locales/statistics.ts` and `src/subjectRoadmap.ts` merge automatically in
this simulation. Their descriptions must still reflect both lessons and the
eventual navigation-retention behavior; a clean textual merge is not semantic
verification. Shared CSS gutter alignment must also be retested after combining
the branches.

Focus Studio's newer Statistics tests still reference `st101-answer`,
`st101-feedback` and the earlier mean-only structure. ST-102 uses
`statistics-answer` and `statistics-feedback`; those tests will need intentional
selector updates and coverage of both lessons during the later integration.
Retain both sets of mathematical and session-safety assertions.

These are conflicts between two unmerged feature branches, not conflicts between
#336 and current main. They require a separate integration and full revalidation
before #337 can follow #336. PR #337 is not modified by this task.

## Verification and handoff

Local checks after the main integration: dependency installation PASS, full
Vitest **2615/2615 PASS** (204 files), and production build PASS. The focused
adapter/curriculum subset passed **12/12**; it is included in the full total.
The existing chunk-size advisory remains.

A targeted local browser attempt explicitly kept Chromium's sandbox enabled.
It stopped at a launch failure because the system SUID helper is not correctly
owned/configured; crashpad initialization also failed. **0 browser cases passed,
1 launch failed and 21 were not run**; no application assertion was reached.
No sandbox workaround was used. The complete browser and B–G checks therefore
require execution through the existing GitHub Actions environment, with their
actual results recorded separately in the PR. Historical screenshot observations
are not presented as a new visual review; the application code is unchanged by
this integration.

Run `npm ci`, full `npm test`, `npm run build`, the complete Playwright suite and
production acceptance B–G. Do not weaken assertions, skip failed tests, alter
grading or disable browser security to obtain a pass. Browser restrictions in
the local environment must be distinguished from tests actually executed in CI.

Only after successful verification on the exact final HEAD and a fresh branch
review may #336 be marked Ready for review. This is permission for owner review,
not authorization to merge, deploy or modify #337. The squash-merge recommendation
is bounded to mean/median and the truthful navigation described above.
