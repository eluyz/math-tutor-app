# MT-UI-004 — CI recovery and English documentation

Status: **IN PROGRESS / NO-GO**. This report supplements the historical
[night log](MT_UI_003_NIGHT_LOG.md); it does not replace its results.
This is the implementation/local-validation checkpoint. Later exact-HEAD CI
results and any remaining acceptance blockers are recorded in the
[PR description and checks](https://github.com/eluyz/math-tutor-app/pull/337).

## Starting evidence

- Audited PR HEAD: `f399abc596d4c9ffbc8658a70df09d051c9d605f`.
- [CI #1011](https://github.com/eluyz/math-tutor-app/actions/runs/44252835599):
  unit tests, production build, and browser installation succeeded; browser
  tests failed; browser acceptance batches B–G were skipped. Confirmed through
  the Jobs API. The task reports 2649 unit passes, 1118 browser passes and 63
  browser failures (48 new night tests and 15 existing tests).
- Complete log downloads return HTTP 403 from Actions log-storage hosts.
  Original annotations only expose the failed step, not individual assertions.
  Consequently, the reported 63 failures are not yet independently classified.
- Diagnostic commit `8cf44a7` adds the supported GitHub reporter alongside the
  normal list reporter, exposing assertion details through the Checks API.
  [Diagnostic CI](https://github.com/eluyz/math-tutor-app/actions/runs/44258648039)
  completed with a browser-stage failure. GitHub exposed only the first ten
  error annotations: six distinct calculus scenarios and two distinct
  rectangular-Gauss scenarios (two timeout annotations duplicate calculus
  failures). These confirm retained-answer failures, including `correct` where
  Gauss expected `invalid`; they do not expose all 63 original failures.
  A separate bounded JSON-summary notice now makes final counts and grouped
  failures inspectable without unrestricted log/artifact downloads.

## Browser configuration repair

The six `night-*` files overrode launch options with `chromiumSandbox: true`;
older tests inherited Playwright's default without that flag. Removing the flag
would silently disable Chromium's sandbox and is not an acceptable fix.

The shared configuration now explicitly enables the sandbox for **every** suite.
On CI it uses the supported `chrome` channel installed on GitHub's Ubuntu image;
an explicit local executable override still takes precedence. Per-file launch
overrides are removed. Acceptance configurations inherit the same settings.
There are no sandbox-disabling flags or AppArmor/kernel changes.

Official references supporting this choice:

- [Playwright Chrome channel support](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/browsers.md#google-chrome--microsoft-edge).
- [GitHub runner Chrome installation](https://github.com/actions/runner-images/blob/main/images/ubuntu/scripts/build/install-google-chrome.sh).
- [Chromium: Ubuntu AppArmor user-namespace restrictions](https://github.com/chromium/chromium/blob/main/docs/security/apparmor-userns-restrictions.md).
- [Canonical Chrome profile](https://github.com/canonical/apparmor/blob/5d448a0437c04cee437e76c820df8f38b558bdfc/profiles/apparmor.d/chrome),
  permitting `userns` for `/opt/google/chrome/chrome`.

These sources justify the configuration; only execution can confirm the profile
works on the actual runner. CI retains every existing test and acceptance gate,
adding evidence upload and result-summary steps. JSON results and selected current
screenshots are retained in the `ui-browser-validation` artifact for 14 days.

## Empty-answer investigation

New regression coverage checks untouched answers for every task returned by
`taskPool` across all difficulty levels in function limits, derivatives, systems,
and matrices, in both PL and EN. **4/4 tests passed.** Empty values remain
`invalid` through the existing `checkAnswer` path. No grader or generator was
changed. This is evidence about the grader, **not proof that the UI resets
correctly**; browser failures still require investigation before assigning blame
to tests or declaring the application safe.

Source inspection identifies the following compatibility issues in existing
browser scenarios. Their assertions are preserved; confirmation and reset checks
are added rather than allowing blanket dialog acceptance:

| Scenarios | Count | Cause and repair |
| --- | ---: | --- |
| Calculus state | 6 | Changing to Expert attempts to discard the retained `3/7` draft. Explicitly accept that action and verify the new run and level. |
| Rectangular Gauss forms | 4 | Scratchpad notes trigger confirmation; Playwright's default dismissal leaves the previous task and correct input intact. Confirm intentional replacement and assert every coefficient field is empty before the existing `invalid` assertion. |
| Rank classifications | 2 | Replacing the first task would clear its notes. Explicitly confirm that replacement before collecting further classifications. |
| Localization heading | 3 | The selector targets an eyebrow removed by Focus Studio. Check the actual localized heading and start action through PL → EN → PL instead. |

These counts describe the affected parameterized tests in source. The diagnostic
run confirms the calculus group and two Gauss cases; GitHub's annotation limit
prevents an independent mapping of every original failure. In particular,
the Gauss scenario must not be described as a confirmed blank-answer grader bug:
the old test never established that the fields were blank after its canceled
navigation. Two new PL/EN browser regressions separately verify cancellation
preserves the entered correct value and notes, whereas confirmed replacement
clears both and makes blank submission invalid. Independent static code review
found no actionable defect in these repairs; browser execution remains required.

## Local validation checkpoint

- `npm ci`: PASS.
- `npm test`: **2653 PASS / 0 FAIL**, including the four new regressions.
- `npm run build`: PASS; existing large-chunk warning remains.
- Supported Playwright browser installation with a writable cache: BLOCKED,
  HTTP 403 `Domain forbidden` from `cdn.playwright.dev`.
- Targeted system-Chromium run with sandbox enabled: **1 launch failure / 3
  NOT RUN / 0 PASS**. Chromium aborts because the SUID helper is not owned by
  root; crashpad also cannot initialize. No application assertion was reached.
- Browser B–G and visual acceptance: NOT RUN locally; await CI evidence.

## Separate main CI #1008

[Run 44179774907](https://github.com/eluyz/math-tutor-app/actions/runs/44179774907)
at `307276a7a4f3196f47633992b936704178d147c4` failed the historical regression
at `src/university/history-regression.test.ts:30` after 5000 ms. The user reports
2602 other passes; annotations independently confirm the timeout. Build and
browser stages were skipped.

Three isolated runs on unchanged main passed **2/2 each** with the existing
5000 ms limit. Historical-test times were **4264.6 / 4378.0 / 3022.0 ms**;
the second test took **549.1 / 686.4 / 587.3 ms**. Relevant test, fixture,
generator, locale, solution, dependency and configuration sources match the PR.
The slowest isolated run leaves only 622 ms of margin. Load sensitivity is
plausible, but a runner fault is not proven and a whole-suite performance problem
is not excluded. Observe/rerun unchanged CI first; investigate a separate,
measured stability fix only if the timeout recurs. Main was not modified.

## Documentation and visual acceptance

The five requested audit/design/night documents, concept explanations,
`.agents/UI-UX-SETUP.md` and the AGENTS UI/UX section are now English; links,
numbers, code identifiers, evidence
and historical qualifications are preserved. Raw evidence and Polish concept
labels remain unchanged. The [documentation index](README.md) explains scope.
The application's PL/EN strings are untouched.

Ten browser journeys cover 375/390/768/1280/1440 px in PL and EN. They exercise
home/navigation, Mathematics, Statistics, exam and progress, including blank
validation and document overflow checks. Eight representative captures are
requested during those journeys; no new screenshot is claimed before execution.
Automated rendering/geometry checks do not substitute for reviewing the images.
Keep **NO-GO** until the exact final HEAD passes CI and current visual evidence
has been inspected.
