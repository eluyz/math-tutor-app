# Statistics S1 UI contract and release acceptance — Task H

**Status:** architecture/acceptance plan only, not UI implementation or release.
**Owner scope:** NIGHT-STAT-01 D–H. Task I, any catalog/UI integration, merge and
production deployment are **not authorized in this session**. Statistics stays
**Work in progress**; live Statistics exercises remain **0**.

## Verified foundation and current boundary

C-inclusive [CI #44037069132](https://github.com/eluyz/math-tutor-app/actions/runs/44037069132)
succeeded at `5b25c502903277cb34b43f7e46ce3924690eb577` before D began. The earlier
C formatting-test failure is historical; the owner's corrected literal and full
CI supersede it. A–C and all Mathematics code have remained unchanged in D–H.

Pure APIs now available for a later authorized integration:

| API | Purpose / output |
|---|---|
| `generateMeanDataset(difficulty, seed)` | Frozen original-order values and exact mean |
| `generateMedianTask(difficulty, seed)` | Frozen values, exact median and replay ID |
| `generateVarianceTask(difficulty, seed)` | Frozen values, exact mean/population variance and replay ID |
| `meanCopy(values, locale)` | Three mean steps, two hints, prompt/conclusion and generic feedback |
| `medianCopy(values, locale)` | Sort → one-based central ranks → exact median |
| `varianceCopy(values, locale)` | Mean → every squared deviation → sum → divide by n |

Generated exercises have 5–9 bounded integer observations, inherited from A.
Copy/descriptive utilities accept 1–100 safe integers for QA; that wider utility
boundary is not permission to publish arbitrary-data exercises. No new catalog
families/unique-variant totals, external peer review or source acceptance are claimed.

## Proposed routing and component boundaries (future work)

1. Keep the existing `SubjectNavigation`, `subject` selection and Statistics WIP
   status. `App` currently owns Mathematics `view` (learn/progress/exam), selected
   exercise, answer and session state. Keep these independent of Statistics.
2. A future `StatisticsPractice({ locale })` would render inside the Statistics
   subject branch. It would own difficulty, uint32 seed, current task, raw answer,
   assessment, revealed hints and solution visibility. This component is proposed,
   **not created** in H. No new router, service, dependencies or API requests.
3. First approved playable slice should expose **ST-101 mean only**. Median and
   variance remain unavailable lesson choices until separately authorized and
   browser-accepted; pure generator/copy availability is not production readiness.
   No selectable placeholder may pretend to start an unsupported lesson.
4. For later approved lesson switching, a single active lesson owns its task and
   input. Switch/difficulty change creates a fresh task and clears assessment,
   hints and solution. Locale changes preserve the dataset, raw input and revealed
   state, recomputing only text. Default difficulty easy, seed 0; next increments
   seed, wrapping explicitly from 4294967295 to 0. Changing difficulty resets seed
   to 0. Replay identity is lesson/difficulty/seed, independent of locale.
5. On leaving Statistics, discard its ephemeral component state. Returning starts
   the initial pilot again; explain this behavior. Preserve all existing Math
   session/question/answer/progress behavior when switching back. No Statistics
   persistence, storage migration, new progress key, account or exam integration.

## Exact input and assessment contract

Use existing `parseAnswer(raw)` and `equalRational` without duplicating parsing or
introducing floating-point tolerance. Compare only after the parser returns valid.
The UI may choose a correct/incorrect feedback string; it must not invent a specific
error diagnosis from one scalar. All results remain exact.

| Input class | Required behavior |
|---|---|
| Empty/whitespace | `invalid: empty`; show empty guidance, no correct/wrong assessment |
| Signed integer | Parse exactly; compare Rational values |
| Finite decimal, dot/comma | Parse exactly, including `.5`, `0.50`, `0,5` |
| Integer fraction | Nonzero denominator; equivalent/reducible fractions accepted |
| Mathematical minus `−` | Existing parser normalizes it in signed numbers |
| Negative denominator | Normalize sign using existing Rational utility |
| `1/0` | Invalid division-by-zero, no scoring |
| More than 100 trimmed characters | Invalid too-long; no evaluation |
| `1+1`, `sqrt(4)`, `1e2`, NaN/Infinity text | Invalid unsupported format |
| `0.3333` for exact `1/3` | Valid numeric input but incorrect, no rounding tolerance |

The solution must use the **displayed** task's immutable values, never regenerate
with a different seed while grading. Show every calculation step and both hints,
not just the final result. Reset stale feedback when input or task changes. Render
copy as React text; no `eval`, raw HTML, user uploads, telemetry or network math API.
Abstract data are dimensionless; any future contextual dataset must explicitly
name its unit and explain squared variance units. Population variance always uses
n, never n−1; sample variance remains a separate future capability.

## Accessibility and responsive behavior

- Use native buttons/form controls with visible labels. Exact-answer input accepts
  fractions, signs and decimals; avoid a numeric-only keyboard that prevents `/`.
  Enter submits, Tab follows visual order, and every action works by keyboard.
- Heading announces the active subject/lesson on entry. On next task/difficulty or
  approved lesson switch, focus the answer input after announcing the new task.
  Keep focus stable on locale change; do not silently regenerate data.
- Associate format guidance and feedback via accessible descriptions. Use polite
  live feedback; mark syntax-invalid input as invalid. Correctness feedback must
  be distinguishable without relying on color. Progressive hint/solution controls
  expose expanded state and retain visible focus styling.
- At 375px and 1280px, observation lists, fractions and solution lines must wrap
  within the page. Long deviation lists can be vertical; never shrink equations
  to unreadability or create document-wide horizontal overflow. Prefer existing
  classes; any later necessary scoped CSS needs separate authorized tests.
- PL/EN labels, prompt, hints, all calculations/explanations and feedback remain
  equivalent. Use established Unicode fraction/minus display and unchanged exact
  parser; do not change global translations simply to pass a new assertion.

## Mathematics preservation and regression contract

Existing exam locking must continue disabling subject/view navigation and the
brand shortcut during an active exam. Statistics must not call Mathematics session
advance/completion, progress recording, answer diagnostics or exam grading. Keep
Math's learn/progress/exam state independent. Capture existing progress/storage
before Statistics activity and assert it is unchanged afterward. Do not delete or
migrate records. Verify that returning to Math preserves the prior workflow and
that Math difficulty/search, learning sessions, solution views and exam lock still
work. No new lesson can count toward Mathematics completion statistics.

## Future browser matrix (not executed or implemented by H)

Run Chromium against the production bundle at **375×812** and **1280×800**, in both
**PL and EN**. Pin explicit difficulty/seed and independently fixed answers; do not
accept an arbitrary grading outcome. Keep existing Mathematics tests intact.

| Scenario | Required evidence in all four locale/viewport combinations |
|---|---|
| Enter Statistics | Correct active subject, WIP visible, only authorized pilot playable |
| Mean easy seed 0 | [3,2,2,1,2], correct answer 2; wrong 3 rejected |
| Mean medium seed 0 | [3,3,1,16,7,13], 43/6 and 86/12 accepted; 43/5 rejected |
| Empty/invalid | Empty, `1/0`, expression and oversized input give proper feedback |
| Exact decimals | Finite equivalent accepted; rounded recurring mean rejected |
| Both hints/full solution | All original bilingual text and exact count/sum/division match witnesses |
| Next/difficulty | Seed policy replay, fresh values, cleared feedback/hints/solution, input focus |
| Language switch | Same values/answer/input/reveals, equivalent visible copy and stable focus |
| Keyboard | Tab/Enter, labels, expanded states and live feedback usable without pointer |
| Return to Mathematics | Existing question/session/progress retained; no storage changes |
| Exam active | Subject switching/brand shortcut remain locked; exam completes normally |
| Layout/runtime | No pageerror, console errors, failed HTTP requests or horizontal overflow |

Median/variance UI is deferred. Before its later release, add pinned odd/even,
negative/fractional median, zero/fractional variance and population/sample-distinction
witnesses using D/E/G's fixtures. Do not infer browser acceptance from pure tests.

## Current delivery stack and evidence

| Task | Draft PR / base | Exact HEAD | Full local tests / build |
|---|---|---|---|
| D | [#324](https://github.com/eluyz/math-tutor-app/pull/324) → `codex/st101-learning-copy` | `bb7a138f65d417c4c63e40d9d051d018752fb260` | 2531 PASS / PASS |
| E | [#325](https://github.com/eluyz/math-tutor-app/pull/325) → `codex/st102-median` | `c9155ed0466c7da0eb32ed568f0e30f85c8ba530` | 2541 PASS / PASS |
| F | [#326](https://github.com/eluyz/math-tutor-app/pull/326) → `codex/st103-variance` | `d0fd1fcd81231ca3fa97bc9cb015c859a514adec` | 2577 PASS / PASS |
| G | [#327](https://github.com/eluyz/math-tutor-app/pull/327) → `codex/st-s1-extended-oracle` | `ba1beacd050749ce408118f4eb6525e6d86f8281` | 2592 PASS / PASS |

H modifies only this new document and must run full Vitest/build again. Its final
SHA and PR URL belong in the PR description/handoff, avoiding a self-referential
commit hash. All intermediate stacked PRs have **CI NOT RUN**, not CI PASS.
At completion, create a new verification branch at the **same final H SHA**, no
extra verification code/commit, and a **Draft PR targeting main** to run full CI.
Do not retarget, merge or modify #319–#327. Recheck current main and all stack bases;
if they move, reassess evidence. Record actual final run URL/conclusion only after
observing it at the exact SHA. Preserve earlier failure history, not stale status.

## Release gates and blocker ledger

| Gate | Status / required owner action |
|---|---|
| Exact A–C CI | PASS on the C SHA/run above; not evidence for later changes |
| D–G local full tests/build | PASS as listed; internal fixtures, no external peer review |
| H local tests/build | Required before its Draft delivery; recorded below after execution |
| Complete-stack main-target CI | Pending new final-SHA verification; never substitute another SHA |
| External mathematical/pedagogical review | Outstanding; inspect generator and full PL/EN reasoning |
| UI authorization and implementation | NOT AUTHORIZED now; Task I not started |
| Pinned production browser acceptance | Future UI matrix above remains outstanding |
| Storage/exam/security/accessibility review | Required before approving UI merge |
| Owner-approved merge, main CI + same-SHA Pages | Required for release; not authorized in this session |
| Public status / counts | WIP, 0 live Statistics exercises; no invented variant/adoption totals |

Stop after H and the final verification/report. No next package, UI branch, merge,
auto-merge, deployment, workflow/queue/quota change or source-acceptance counter edit.

## Delivery verification

Full `npm test`: **2592 passed**, 201 files. `npm run build`: **PASS**
(TypeScript + Vite; existing large-bundle warning). No UI/browser tests added
or run for this unintegrated task. Intermediate GitHub CI: **NOT RUN** because
the PR base is `codex/st102103-learning-copy`. Exact delivery SHA and PR URL are recorded in the PR
description and final stack handoff; complete-stack CI is a separate gate.


## Follow-up dependency discovered in independent owner review (#330)

The initial H contract predates the median educational-QA finding: easy mean
datasets always placed the median in displayed position three. Task ST-102 now has
a separate draft fix that deterministically permutes **easy median display values**
while retaining the underlying multiset, exact answer, seed and difficulty bounds.
It does **not** modify the original mean data mapping or variance tasks. On a future
authorized Statistics UI, show and grade the **median task's own displayed values**
rather than regenerating raw ST-101 data. All-equivalent-data cases cannot hide
their median and remain permitted. Verify exact commit CI, fixed-seed replay, and
PL/EN teaching on the displayed sequence before enabling median lessons.

Original A–H delivery SHA `438201b03b9b12ce04cbbab21c4464dac581a1ee`
remains unchanged and verified by CI `44047197816`. This follow-up is a
separate PR, not a retroactive rewrite of that evidence.
