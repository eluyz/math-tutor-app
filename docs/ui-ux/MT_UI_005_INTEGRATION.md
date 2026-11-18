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

## Verification checkpoint

- Integrated full Vitest: **2665 PASS / 0 FAIL**. Production build: PASS.
- Independent Python `Fraction` check of **390 actual adapter replay requests**:
  **390 PASS / 0 FAIL**, comprising 195 mean and 195 median requests across three
  supported levels and seeds 0–63 plus 4294967295. Python independently computes
  sum/count and sorted central observations. These are requests, not a claim of
  390 unique catalog variants.
- Existing rank-counting oracle, literal odd/even/negative/fraction witnesses,
  PL/EN teaching and parser assertions remain in the full unit/browser suites.
- Full browser inventory: **1228 cases**, including the integrated ST-102 tests
  and twelve new draft/confirmation/native-reload cases. Discovery is not a pass.
- New cases cover 375/390/768/1280/1440 px in PL/EN, retained median state across
  subjects/views/language, cancel/accept for four replacement actions, visible
  keyboard focus, unload protection and overflow. Native median reload
  cancellation checks the original document and answer.
- The targeted CI gate additionally includes all Statistics, navigation,
  keyboard/contrast/reflow and shared-layout suites before full Playwright and
  the unchanged production acceptance B–G gates. No assertion, retry or timeout
  is weakened.

Local secure Chromium still aborts on the system's SUID/crashpad configuration:
**0 PASS / 1 launch failure / 11 NOT RUN** in the bounded new-suite attempt.
No application assertion is reached and no sandbox bypass is used. Actual
browser results must come from CI and be distinguished from this local limit.

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
