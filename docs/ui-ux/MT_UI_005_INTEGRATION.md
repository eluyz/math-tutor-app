# MT-UI-005 — Focus Studio and ST-102 integration

## Scope and checkpoint

Integration is limited to existing Draft PR #337. Main
`bf331ff52cb6a0cf31562ea99f584e687a9a1f25` contains the owner's squash merge of
ST-102. It is merged normally into the Focus Studio branch, without rebasing or
force-pushing. No PR merge, deployment, new dependency or generator/scoring change
is authorized. Final HEAD, CI conclusions and screenshot links belong to the PR
description, so recording them does not invalidate a tested commit.

Main CI [#1020](https://github.com/eluyz/math-tutor-app/actions/runs/44304295888)
was **in progress** when integration began. This checkpoint does not declare it
passed; its final status must be verified separately.

## Resolved conflicts and semantic integration

| Area | Resolution |
| --- | --- |
| `StatisticsPractice.tsx` | Retain main's mean/median adapter, actual displayed values, two tracks, 15 categories, five level controls and generic Statistics IDs. Preserve Focus Studio's shared workspace class, draft callback and retained component state. |
| `statistics-practice.spec.ts` | Keep mean grading, hints, solutions, five-level and availability assertions. Retained Statistics is hidden during an exam; its component is not expected to disappear. Preserve the localized status assertion. |
| `subject-roadmap.spec.ts` | Retain mean/median pilot availability and planned topics, with the existing Focus Studio PL status “W rozwoju”. |
| Translations | Preserve every ST-102 label and the truthful retained-view memory description; add PL/EN confirmation copy specifically for Statistics replacement. |
| Focus Studio tests | Migrate old `st101-*` selectors to main's `statistics-*` IDs, without dropping their assertions. |
| Layout | Keep the Focus Studio card, palette and tokens. Give subject/view navigation the same card inset used by Statistics, preserving ST-102's existing ≤2 px alignment assertions. Five desktop level columns match Mathematics; mobile labels can wrap. |

An unfinished nonempty answer requires confirmation before changing lesson,
track, difficulty or task. Declining preserves the dataset, selected controls,
answer, hints and solution; accepting performs the existing explicit reset.
Choosing the already selected control is a no-op. Subject/view/PL–EN navigation
retains Statistics state, and hidden drafts still protect document unload.
The grading algorithm, generators, task adapter and all mathematical teaching
remain unchanged. No new answer persistence or router is introduced.

Only implemented mean/median lessons and Easy/Medium/Hard are enabled.
Advanced/Expert, the other fundamentals topics and all university topics remain
disabled with explanations. The university track displays a roadmap with no
hidden exercise fallback. Statistics does not write Mathematics history or exam
scores.

## Independent review correction

The final reviewer confirmed a pre-existing UI-only safety gap: Mathematics
`Next`/`Finish` bypassed the replacement guard, so an unchecked answer or
auto-clear notes could be discarded immediately. The existing capture guard now
also covers `.next-button`. Cancel preserves the run, answer, session position,
notes and storage. Explicit consent uses the unchanged Next/session logic; an
empty task can still be skipped without confirmation. PL/EN copy explains that an
entered answer is not assessed automatically, existing session outcomes are kept,
and notes are cleared only with auto-clear enabled. No first-valid-attempt or exam scoring rule changes.

Four new PL/EN mobile/desktop regressions cover cancellation and consent for an
unchecked session answer and notes after a correctly assessed free-practice
answer. Session coverage completes ten deliberate skips and checks the exact
stored outcomes. Existing tests that deliberately discard retained input or
auto-clear notes now explicitly accept that single confirmation; their grading,
progress and teaching assertions are retained.

## Verification checkpoint

- Integrated full Vitest: **2665 PASS / 0 FAIL**. Production build: PASS.
- Independent Python `Fraction` check of **390 actual adapter replay requests**:
  **390 PASS / 0 FAIL**, comprising 195 mean and 195 median requests across three
  supported levels and seeds 0–63 plus 4294967295. Python independently computes
  sum/count and sorted central observations. These are requests, not a claim of
  390 unique catalog variants.
- Existing rank-counting oracle, literal odd/even/negative/fraction witnesses,
  PL/EN teaching and parser assertions remain in the full unit/browser suites.
- Full browser inventory: **1232 cases**, including the integrated ST-102 tests,
  twelve new Statistics draft/confirmation/native-reload cases and four
  Mathematics Next-button protection cases. Discovery is not a pass.
- New cases cover 375/390/768/1280/1440 px in PL/EN, retained median state across
  subjects/views/language, cancel/accept for four replacement actions, visible
  keyboard focus, unload protection and overflow. Native median reload
  cancellation checks the original document and answer.
- The targeted CI gate additionally includes all Statistics, navigation,
  keyboard/contrast/reflow and shared-layout suites before full Playwright and
  the unchanged production acceptance B–G gates. No assertion, retry or timeout
  is weakened.
- The independent final review confirmed the Next-button safety gap and reviewed
  its bounded fix. Its follow-up copy finding was also corrected: revealing a
  solution can retain `solution-viewed`, so the prompt does not promise that every
  ungraded task is recorded as skipped.
- Vercel's current Web Interface Guidelines and UI UX Pro Max's accessibility,
  touch, overflow and feedback rules guided the integration review. Impeccable
  context and its audit reference were read; the mechanical changed-file detector
  returned `[]`. No hooks or automatic agent/apply mode were enabled. This is not
  a claim of a complete WCAG audit or a new design assessment.

Local secure Chromium still aborts on the system's SUID/crashpad configuration:
**0 PASS / 1 launch failure / 11 NOT RUN** in the bounded new-suite attempt.
No application assertion is reached and no sandbox bypass is used. Actual
browser results must come from CI and be distinguished from this local limit.

### First review-fix CI result

At `0b591585d56dd0046e20fabd34d9e3f1e9517f38`,
[CI #1022](https://github.com/eluyz/math-tutor-app/actions/runs/44309206356)
passed all 2665 unit tests, the build and 111 targeted browser cases. Full
Playwright reported **1229 PASS / 3 FAIL**; B–G were consequently not run.
All three failures were the existing progress/history scenario at
1280/375/768 px: it deliberately leaves answer 4 unchecked, then attempts to
skip it without accepting the new confirmation. The browser cancels that
replacement, so the test eventually waits for Finish at the wrong position.
This is a test incompatibility with the intended safety behavior, not evidence
of a grading or storage defect.

That single deliberate skip now uses the existing confirmation helper, which
requires a native confirmation and a new task run. All original exact history,
privacy, reload, export and deletion assertions are preserved. The complete
local-progress suite is also included in the targeted CI gate before full E2E.
No assertion or timeout is weakened. Final-head results remain in the PR body.

The earlier integration-only commit `50b2cf2f052ffeac789ca982f46f547a564d3605`
passed [CI #1021](https://github.com/eluyz/math-tutor-app/actions/runs/44307116649):
2665 unit, 107 targeted, 1228 full browser and B–G 72/24/96/64/64/64. These are
historical results, not substitutes for validation of the subsequent fix.

## Current visual evidence and release gate

The ten PL/EN validation journeys request ten representative captures of home,
Mathematics, mean, median, exam and progress. Median captures show the actual
fractional dataset, equivalent input, both hints and full solution. Images stay
in `ui-browser-validation/ui-evidence` as CI artifacts rather than committed
assets. The full run must actually produce them before their existence is claimed.

Automated geometry, keyboard, contrast and rendering assertions do not replace
inspecting screenshots. Previous MT-UI-001/003/004 screenshots do not validate
this integrated version. If current artifact download or visual review remains
blocked, document that limitation and keep NO-GO for final visual acceptance.
Keep PR #337 Draft and do not merge it as part of this task.
