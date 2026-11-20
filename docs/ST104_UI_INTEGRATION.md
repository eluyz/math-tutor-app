# ST-104 — playable interpretation integration

## Scope

This integration starts from main `722d31023f2fdb6817f6454ad79ffaf4023730e7`, including the ST-103 population-variance release. The seven files from [engine Draft PR #342](https://github.com/eluyz/math-tutor-app/pull/342) at `e3b908d35ce6f09384ea1ca7e6ae07e42554dec9` are copied byte for byte. Their [original engine notes](ST104_INTERPRETATION_NOTES.md) describe that earlier, unintegrated milestone; this document describes its playable integration.

ST-104 is a separate Fundamentals lesson with Easy, Medium and Hard exercises. A new sixteenth topic preserves all original fifteen topic IDs and availability. In particular, Charts & interpretation remains unavailable; publishing ST-104 does not publish chart exercises or any university-track topics. Advanced and Expert remain disabled.

The existing Focus Studio subject heading, full-width task card, and selector below the task are preserved. Three native radio inputs share a labelled fieldset/radiogroup and clickable labels of at least 44 CSS px. Browser arrow, Space and Tab behavior is retained. Selected controls have both native checked semantics and the existing selected-surface/border treatment. Errors have text, an invalid group state, descriptions and the existing live feedback region.

## State and exact assessment

`interpretationPractice.ts` is the only new grading adapter. It creates the unchanged engine task, preserves its ID and displayed observations, rejects malformed three-choice sets and delegates exact assessment to the verified engine. Empty, invalid, incorrect and correct responses remain separate states. Existing numeric Statistics assessment is unchanged; `practiceModel.ts` only narrows its return type to the three numeric lessons it actually creates.

The local practice state stores a language-independent choice ID. Changing PL/EN recomputes teaching content only, preserving task identity, selected response, hints, solution visibility and assessment. Changing the response clears the previous assessment. Both progressive hints and the complete four/eight-step solutions come from the verified teaching module.

Next Exercise uses the existing uint32 seed increment, including maximum-to-zero wrap, and clears the previous response and teaching controls. Replacing an unsubmitted choice through next, lesson, difficulty or track controls uses the existing discard confirmation. Ordinary subject switching preserves the mounted Statistics state. The existing pointer track-scroll policy is reused; a shorter document may naturally clamp an old offset to its new maximum. No global focus or scroll suppression is introduced.

Mathematics generators, numeric grading, exams and saved progress are outside this change. No storage, dependency, backend, telemetry or API is added. PR #342 and PR #344 are not modified. README, CONTRIBUTING and unrelated technical documentation are not rewritten.

## Verification

- Adapter TDD: 22 failing tests observed against the initial scaffold, then all 22 passed. Coverage includes all six answer families at all three levels, replay, empty/invalid/wrong/correct responses, unavailable levels, uint32 boundaries and incomplete/duplicate/cross-kind choices.
- Curriculum TDD: the original six-topic Fundamentals catalog failed the new seven-topic assertion; the completed catalog retains the original fifteen IDs and exactly four available lessons.
- Original ST-104 tests: 838 PASS. Independent Python Fraction oracle: 771 PASS, 257 seeds per level and 2,313 choice assessments. The original PL/EN teaching sweep covers 1,536 seeded lessons plus sign-change regressions.
- Full local Vitest after review corrections: **3,530 PASS, 0 FAIL, 0 skipped** with `--maxWorkers=1`. The initial default-worker suite passed all 3,528 tests; after adding two bilingual subject-scope regressions, a later default-worker run had 3,529 PASS and one timeout in the unchanged university history-preservation test (5,000 ms limit). That existing test passed separately (2/2), followed by the green complete serial suite. No assertion or timeout was changed. Production build: **PASS**. The existing large-bundle warning remains; no threshold is changed.
- Browser coverage: 24 new Playwright cases, PL/EN at **375, 768 and 1280 CSS px**. Cases cover all difficulty/family answers, empty/invalid input, native keyboard selection and focus, two hints and full solutions, locale/subject state preservation, discard cancellation/confirmation, existing ST-101/102/103 answers, storage isolation, touch size, computed text contrast, shared card placement, document overflow and track-scroll behavior. Representative captures are written to `test-results/ui-evidence/st104-*.png` for the existing CI artifact upload.
- The existing early browser recovery gate includes ST-104 in addition to all prior tests. Full Playwright and Batch B–G remain unchanged and mandatory. Exact final HEAD and remote results are recorded in the integration PR description; authored/collected browser cases are not claimed as executed until CI completes.

Local browser execution is blocked before the app renders: `/usr/bin/chromium` aborts on its misconfigured SUID sandbox and crashpad setup. The standard supported Playwright browser installation also returns HTTP 403 (`Domain forbidden`) from the download service. No sandbox bypass, permission changes or launch overrides are used. GitHub Actions provides the existing supported Chrome environment.

Independent review identified a stale three-lesson Statistics subject description and a legacy CSS label rule overriding the new radio layout. The description and next milestone now include ST-104 in both locales; two new unit cases failed before that correction and passed afterward. A narrowly scoped choice selector restores body-sized text, radio/text spacing and alignment without restyling numeric lessons. Browser assertions check actual geometry and font size, translated accessible labels/hints/step titles, and scroll samples across six animation frames. No critical mathematical issue was found. Local sandbox restrictions prevented observing a browser RED/GREEN cycle for the CSS correction; its rendered regression runs in CI.

## Reproduction

```sh
npm_config_cache=/tmp/math-tutor-npm npm ci
npm test
node scripts/verify-st104.mjs
npm run build
npm run test:e2e -- e2e/statistics-interpretation.spec.ts --workers=2
npm run test:e2e
# Run the existing test:e2e:batch-b through test:e2e:batch-g scripts.
```

UI UX Pro Max's focused keyboard/focus recommendations, Impeccable's incumbent-design and audit guidance, and freshly fetched Vercel Web Interface Guidelines inform the scoped implementation. The Impeccable context runtime did not load; the existing design-system document and tokens were read directly. No new design direction or hooks are introduced.

Automated test results are regression evidence, not feedback from students or a claim of full-application WCAG certification. No real-world student usability study has been conducted for this integration. Maintainer review, merge authorization and any later deployment are separate steps.
