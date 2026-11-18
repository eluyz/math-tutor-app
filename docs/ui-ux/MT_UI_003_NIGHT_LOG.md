# MT-UI-003 — NIGHT BUILD

> Historical implementation checkpoints. For the subsequent CI failure
> investigation and English documentation migration, see
> [MT-UI-004 CI recovery](MT_UI_004_CI_RECOVERY.md).

## Plan and boundaries

Focus Studio; React/TypeScript and existing CSS, without new libraries.
Generators, answer checking, scoring, and history format remain unchanged. Work
is limited to PR #337. User authorization covers design decisions and execution
without further questions. The stash is empty; the uncommitted audit in the main
checkout is preserved.

- [x] A: preserve work when using the logo/subjects/views/PLEN; warn before leaving
  the document. No persistent answer storage. Return and cancellation tests.
- [x] B: compact entry and collapsible topic/level selection; the active exercise
  precedes the catalog. 320/375/390/768/1280/1440, long PL/EN copy.
- [x] C: form semantics, explicit outcomes, an equal action bar, and robust formulas.
- [x] D: question number + explicit answer state; clear progress hierarchy.
- [x] E: shared Mathematics/Statistics exercise tokens and patterns, without new content.
- [x] F: contrast, focus, reduced motion, localization, and visual checks.
- [x] G: independent review, at most three fix cycles, final tests, and existing CI.

## Decisions

Preserve state in memory rather than introducing a new data store; a native
reload/exit warning communicates the loss of unfinished work. No new
router/history implementation. A compact configuration panel rather than
multiple new sticky bars. Focus Studio and all features are retained.

## Baseline

Main: 307276a. Pre-sprint PR: 61e5ad6. Synchronized through a regular merge of
main, without conflicts; the merge SHA is in `git log`. Earlier audit: a
conditional 6.5/10. Known blocker: system Chromium does not launch with the
sandbox (SUID/crashpad). Another standard Playwright attempt is planned;
security safeguards will not be bypassed.

## Checkpoints

Results and SHAs are appended after each package. PASS only follows an executed
test; BLOCKED/NOT RUN does not mean passed. This log records checkpoints; the PR
description/final report provides the exact final HEAD and current CI status
(without a self-referential SHA).

### A — navigation and sessions

The logo preserves work; Mathematics and previously visited Statistics remain
mounted when switching subjects. One main target; answer, hint, solution, and
scratchpad state remain in memory. Native beforeunload protects an active
session/exam and unchecked answers (including hidden views). No answer storage
or router was added. A knowingly accepted reload still loses work; the message
is native and browser-dependent. Back does not change the internal view;
leaving the document triggers the warning.

PASS: 29 navigation draft-detection and existing Statistics tests; build.
6 E2E scenarios were added and discovered through --list; execution BLOCKED.
Baseline full Vitest: 2602 PASS / 1 FAIL (history-regression exceeded 5 s under
concurrent load); isolated rerun and final regression results appear below.
Standard Playwright browser installation failed to download Chrome for Testing;
system Chromium with the sandbox enabled is also blocked. No bypasses.

### B — exercise before catalog

Commit A: 3189cd5. Isolated history-regression rerun: 2/2 PASS, without changing
test timeouts. Package B: quick start/continue near the title, active exercise
before configuration in the DOM, family list after the exercise panel, and
collapsible native details for configuration. Open by default for
discoverability and compatibility with existing flows. The empty marketing card
was dropped. Compact header and subjects; no sticky elements or new libraries.

PASS: build/TypeScript. Added 12 PL/EN layout scenarios at six widths. Visual
execution and phone keyboard behavior BLOCKED; the visual criterion is not
reported as PASS. Existing selectors/features are preserved.

### C — forms and exercise screen

Commit B: 2e0fa09. Forms associate help with a persistent feedback region;
aria-invalid clears during editing without changing mathematical grading.
Structured forms mark a group error without incorrectly assigning it to every
field. Enter behavior and existing labels are preserved. Long formulas scroll
locally; help buttons share the same geometry.

PASS: 20 component SSR tests (10 cases initially RED, then GREEN), 20
draft-detection tests; TypeScript/build. Four PL/EN E2E scenarios for feedback
association and invalid/incorrect/correct transitions were added; runtime
BLOCKED. Quick start focuses the exercise heading without immediately opening
the phone keyboard.

### D — exam and progress

Commit C: 58d9500. A separate presentational exam navigation component shows the
number and “Wpisano odpowiedź / Brak odpowiedzi” (“Answer entered / No answer”)
state in PL/EN, independently of aria-current. It receives neither correctness
nor points, so it cannot reveal the grade. Progress and exam received Focus
Studio tokens, wrapping filters, and a clear hierarchy of values. History and
exam models and data deletion are unchanged.

PASS: six PL/EN navigation SSR tests and eight existing history tests;
TypeScript/build. Four E2E scenarios with the sandbox enabled were added;
runtime BLOCKED. Exact final combined regression counts are recorded below.

### E — Mathematics and Statistics consistency

Commit D: 66950d1. Statistics uses the existing shared learning classes,
controls, feedback, and Focus Studio tokens. Its own variants cover only the
three-level pilot layout. No changes to data, generators, answer comparisons,
or educational scope. Planned topic statuses remain unchanged.

PASS: 29 existing Statistics and draft tests; build/TypeScript for the shared
integration. Added 12 E2E checks for shared appearance/buttons/feedback at six
widths in PL/EN; execution BLOCKED. Visual confirmation is not claimed without
rendering. No new libraries were added to the repository.

### F — accessibility and refinement

Commit E: 2f72864. The footer uses muted instead of #718276 (calculated 5.81:1
instead of 3.79:1). JS scrolling respects reduced motion; global focus and local
scroll regions are retained. The Polish status “W rozwoju” preserves the
in-progress meaning, while the placeholder gives topics instead of codes.
Small-header sizing was adjusted for 320 px; the rendered result is not yet
confirmed. Scratchpad/solutions use shared tokens. Rendering verification is
required.

Additional A fix: changing exercises with an unsubmitted draft in Mathematics or
Statistics requires confirmation; cancellation stops the handler before reset.
Scratchpad notes are protected when leaving the document. They are not stored
persistently. Added E2E scenarios for cancelling/accepting a change and
cancelling reload.

PASS: 42 targeted unit/SSR tests (including localization RED→GREEN),
build/TypeScript. Added tests for Tab/skip, calculated contrast, reduced motion,
reflow, and enlarged text. Text enlargement testing does not replace manual
200% browser zoom. Runtime and new screenshots BLOCKED. Another standard
Chromium installation attempt, including explicit network access, still returns
403 Domain forbidden. Neither the sandbox nor network policy was changed.

### G — red team and fixes (at most three cycles)

Commit F: 41f7cf8. The first independent review found scratchpad loss at an
unavailable level: conditional panel unmounting removed notes even with
auto-clear disabled. The panel now remains mounted and is only hidden.
Confirmation covers notes at risk of automatic clearing; continuing the
exercise does not trigger confirmation. The existing auto-clear option is
preserved.

Corrected tests that assumed the logo cleared sessions, Statistics unmounted,
and navigation to other exercises proceeded without informed consent. Hidden
Mathematics and Statistics selectors were distinguished. Added a scenario for
preserving notes after an unavailable level. The second cycle also found an
incorrect attempt to reopen a preserved scratchpad and missing confirmations
in an existing test; these were fixed. The third cycle is the final review of
the same defects, without expanding functionality.

PASS: 50 helper/SSR/scratchpad-model tests; build. 48 new E2E scenarios were
discovered, but runtime was not passed. Models, generators, grading algorithms,
history, and dependencies were unchanged. Progress data was not deleted.

### Resumption after the usage limit reset

Local changes after G are preserved; `main` remains 307276a. CI 41f7cf8:
[run 44189147021](https://github.com/eluyz/math-tutor-app/actions/runs/44189147021)
FAIL at the browser stage; earlier unit/build/Chromium installation stages PASS;
B–G SKIPPED. Detailed logs are blocked by the results-receiver domain (403),
including after a standard tool attempt with approval-controlled access. The G
fixes alone are not assumed to resolve all CI failures. Repeated local
Playwright installation is still blocked by domain policy. Final regression
results on a new commit will be recorded below; until then, status is
PARTIAL / NO-GO.


Third and final review: no remaining issues among the reported defects;
46/46 tests across three targeted suites PASS. This accepts the code fixes,
rather than granting full UI/UX approval. No 8–9/10 rating was assigned without
rendering evidence.


## Final validation of code 8db7a35

| Local check | Result |
| --- | --- |
| npm ci | PASS |
| npm test | **2649 PASS / 0 FAIL, 205 files** |
| npm run build | PASS; existing chunk-size warning |
| Unit B / C / D / E / F / G | **87 / 7 / 26 / 19 / 18 / 18 PASS**, 0 FAIL |
| New night-* scenarios | 48 discovered, runtime NOT RUN |
| Full local E2E | 1181 discovered: 1 Chromium launch error, 1180 NOT RUN |
| E2E B / C / D / E / F / G | 72 / 24 / 96 / 64 / 64 / 64 discovered; 1 launch error each, remainder NOT RUN |

Unit B–G are subsets of the full 2649 tests, rather than additional unique cases.
All 7 local browser attempts ended before application assertions
(SUID/crashpad). Total: 7 environment errors and 1558 NOT RUN. Temporary
configurations outside the repository preserved testMatch, webServer, and
explicit chromiumSandbox:true; stopping after the first error prevented
repeating the same failure. The initial webServer list-adaptation error in B–D
was corrected and all three attempts were repeated. CI configuration is unchanged.

Impeccable: 5 existing warnings / 0 errors, exit 2; four borders and an overridden
Arial declaration in legacy styles.css, with no new blocker. Working elements
were not changed merely to satisfy a mechanical warning. Results and CI snapshot
for this code: [MT_UI_003_VALIDATION.json](MT_UI_003_VALIDATION.json). Detailed
local logs remain in /workspace/mt-ui-003-results outside the repository.

GitHub Actions 8db7a35: unit/build/browser installation PASS; full E2E was in
progress when checked; B–G had no result yet.
[Run](https://github.com/eluyz/math-tutor-app/actions/runs/44251597661).
The PR description and final report provide CI status for the later documentation
commit; do not equate results from different SHAs. Full final-HEAD results are
checked separately.

### Limitations and continuation

**STATUS PARTIAL, readiness NO-GO.** Code for packages A–F and G fixes is saved;
no confirmed blocker remains from the limited red team review. P1 items remain:
a fully green E2E/B–G run on the current HEAD and an actual view review in a
secure browser, including 200% zoom, keyboard/screen reader, and PL/EN.
There are no new screenshots; [baseline screenshots](screenshots/) show
MT-UI-001, rather than the current implementation. The 6.5/10 rating is the
baseline; no new rating was assigned. P2: large chunk and any refinements
identified by reviewing the rendered UI. No dependencies or mathematical
changes were added.

Next step: run the 48 new scenarios and the full existing E2E suite in an
environment with a working sandbox, capture six representative screens, and
analyze final CI for the exact SHA. Do not introduce a new style or educational
content. The stash and earlier materials in the main checkout are preserved.
No merge.
