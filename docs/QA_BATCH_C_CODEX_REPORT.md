# Batch C — Controlled Syllabus Coverage & Independent QA

Local execution: 2026-11-04 (Europe/Warsaw). Base: `376c1a31adbd05fbac3a75fb05f62b913b6e668d` (main after PR #170). Branch: `qa/batch-c-controlled-acceptance`.

**Tested implementation HEAD: `6d0fac8b80e72d58a5295198100091fa4e46fc9d`.** The following commit adds only this report. The exact final delivery HEAD and immutable Actions URL are recorded in the single Draft PR's validation section; resolve it locally with `git rev-parse HEAD`. Full CI runs once on that final delivery HEAD, rather than repeatedly for documentation edits. The committed [local evidence](qa-batch-c/local-results.json) records hashes of the tested code and test files.

## Scope, budget and acceptance boundary

Exactly four competencies, six representative family–difficulty combinations, **24 unit variants per combination (144 total / 288 PL+EN instances)**, and **16 distinct pinned browser variants (64 locale/viewport witnesses in 24 tests)**. No subagents, extra audits, new generator families, UI changes, architectural changes or generator fixes. Catalog remains **231 families / 18,093 variants**. No access to a remaining Codex quota is exposed; no quota estimate is claimed.

Read: `CURRICULUM_COVERAGE.md`, `docs/SYLLABUS_COVERAGE_V2.md`, Batch B report/manifest/unit/browser tests, Issue #151 and #108. Historical catalog checkpoints in those documents are not current release attestations. #106 remains PAUSED. F05, PR #142, formal counters, Issue #151 and its checkboxes are untouched. No merge is authorized or performed.

- **METHOD_PASS**: the selected bounded method and workflow passed independent mathematical and application checks.
- **METHOD_PARTIAL**: the broader competency still has bounds or methods outside this deliberately small sample; this is not proof of a missing generator.
- **NEEDS_FIX**: a concrete mathematical/teaching defect requiring correction. None found in this package.
- **BLOCKED_SOURCE**: direct private-original comparison was not possible in this session.
- **SOURCE_PASS_CANDIDATE**: reserved for subsequent direct original comparison and final review. Not assigned here.

No private PDF or answer key was supplied/read for Batch C. Historical source inspections are not presented as a fresh comparison. These synthetic checks award **zero SOURCE_PASS**; all four source gates remain BLOCKED_SOURCE, and existing formal counters are unchanged.

## Existing-method inventory

This is a code inventory, not an additional all-variant audit. Difficulty names below are the application's canonical IDs.

| Skill | Existing families and supported difficulties | Method and bounded limit |
| --- | --- | --- |
| C02 | `sequence-radical-ratio`: medium/hard/advanced/expert; adjacent conjugation method `sequence-conjugate`: medium/hard/advanced/expert | Ratios of square roots of positive shifted squares plus positive remainders; leading numerator cancellation supported. Not arbitrary radical expressions or a vanishing limiting denominator. |
| C04 | `sequence-geometric`: easy/medium/hard/advanced/expert; `sequence-exponential-ratio`: medium/hard/advanced/expert; `sequence-power-exponential`: hard/advanced/expert | Geometric sequences include oscillatory/negative bases. Selected families use positive bases, collect exact equal-base terms and compare exponential growth before polynomial degrees. |
| F02 | `analysis-log-domain`: easy/medium/hard; `function-log-rational-domain`: hard/advanced/expert | Linear and rational logarithm arguments, root/log denominator intersections, and a rational argument with three critical points already exist. Selected family requires strict positivity and excludes both zeros and the pole. |
| G04 | `limit-infinity`: easy/medium/hard/advanced/expert; `limit-radical-infinity`: hard/advanced/expert; `analysis-asymptote-horizontal`: medium/hard/advanced; `analysis-asymptote-oblique`: advanced/expert | Polynomial degree and sign at either infinity; higher-level rational cancellation; radical absolute-value sign and conjugate remainder; bounded horizontal/oblique asymptote methods. |

## Six selected combinations

Every row tests unit variants **0..23**, both languages, correct/wrong/empty grading, two hints, explanation and every working step/calculation. Only the listed UI variants are pinned; no unlisted variant is graded during browser pool traversal.

| Skill | Family : difficulty | Pinned UI variants | Independent proof and representative boundaries |
| --- | --- | --- | --- |
| C02 | `sequence-radical-ratio:expert` | 0, 1 | Divide by positive n; normalized roots tend to their positive leading coefficients. Check positive limiting denominator, exact numerator cancellation (0), negative result and fractional parameters. A separate numerical evaluation of the displayed normalized roots supplements the exact proof for all 24 variants. |
| C04 | `sequence-exponential-ratio:expert` | 6, 7 | Sort original bases and sum original coefficients; discard cancelled groups before selecting dominance. Pinned negative infinity and cancellation-to-zero. Unit set also includes equal-base finite ratios and both signs of infinity. |
| C04 | `sequence-power-exponential:advanced` | 1, 3, 4 | Compare positive base ratio first, then degree difference for equal bases. Pinned positive infinity, finite coefficient ratio and negative infinity; units also verify decay to zero despite polynomial factors. |
| F02 | `function-log-rational-domain:expert` | 0, 1, 2 | Evaluate the original rational argument in every open cell of its three simple critical points; build the expected open intervals directly. Pole before/inside/after the two numerator zeros; explicitly reject all three endpoints. |
| G04 | `limit-infinity:hard` | 0, 1, 4 | Independent coefficient collection, actual highest nonzero degrees and parity of their difference at negative infinity. Pinned finite nonzero, positive infinity at negative x and degree-decay zero; units include both infinity signs and both directions. |
| G04 | `limit-radical-infinity:expert` | 0, 1, 4 | Exact conjugate identity leaves a remainder tending to zero; use a|x|, then sign of (c±a)x. Pinned finite results at both directions and negative infinity; units include positive infinity too. |

| Competency | Selected method/workflow | Broader competency | Private source gate |
| --- | --- | --- | --- |
| C02 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE |
| C04 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE |
| F02 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE |
| G04 | METHOD_PASS | METHOD_PARTIAL | BLOCKED_SOURCE |

METHOD_PARTIAL here preserves the existing bounded curriculum classification. It does not override the successful checks of these specific methods, or assert an unimplemented syllabus requirement.

## Independence and reuse

`src/qa/batchC.ts` never reads production `answer.value`/`answer.values` or calls a production mathematical solver. It uses exact rational arithmetic; G04 polynomial expressions use the existing separate reference convolution/collector in `functions-audit.ts`. F02 constructs the serialized expected set directly from the sign of the original argument, without selecting a production answer option or calling `rationalLogDomain`/`setKey`. The sign is constant on every open cell because all critical factors are simple and distinct. No numerical samples alone establish a limit or domain.

The unit checks also verify all recorded arithmetic calculations, both hints and translated reasoning, final-answer step presence and no Polish teaching text in EN. Representative teaching chains were read against the exact method derivations above; this is not a generic symbolic verifier of arbitrary prose.

The existing Batch B browser runner was moved, without changing its seed/order/flow or witness list, into `e2e/helpers/acceptance.ts`; the wrong-input helper moved into `src/qa/acceptance.ts` with the old Batch B export preserved. Batch B's full regression remains in CI. Batch C adds only a manifest, oracle and thin browser entry point, plus an isolated production config reusing Batch B settings. No general refactor was performed.

Production Playwright uses `vite preview` on port 4373 and the actual built `dist`. It navigates the UI, identifies each displayed variant uniquely, traverses at most one 24-item pool and grades only pinned variants. Each witness checks invalid, incorrect and correct feedback; both actual hint texts; every action/reason in the full solution; EN text; horizontal overflow at 375/1280 px; console.error, pageerror, failed requests and HTTP >=400. Screenshots and per-test ID/locale/viewport/error JSON are attached. Physical Safari/iOS and a full accessibility audit are not claimed.

## Ordered execution and evidence

1. `npm run test:batch-c`: **PASS**, 7 tests; 144 variants / 288 localized instances. Includes a hard assertion on four skills, six combinations and sixteen distinct UI IDs.
2. `npm_config_cache=/tmp/math-tutor-npm npm ci --offline`, then `npm run build`: **PASS**. Existing large-JS-chunk warning only; production asset filenames remain unchanged because application code did not change.
3. `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-c`: **PASS**, 24/24 tests, 64 witnesses, zero skipped/flaky/unexpected and zero recorded console/network/page errors; 97.7 seconds.
4. Selected existing unit regressions in `sequenceExtensions.test.ts`, `sequenceFollowup.test.ts`, `functionFollowup.test.ts`, `limitFollowup.test.ts`: **PASS**, 5 selected tests, 33 deliberately filtered out. Filter selects the exact expert/advanced combinations above. The pre-existing polynomial-limit regression across all supported levels remains in the final full CI rather than becoming extra representative combinations in Batch C.
5. Full CI is requested only after the report-only final commit and one push. It includes all unit tests, production build, existing browser suite, Batch B (regression of the extracted helper), and Batch C. No repeated full local CI or full 18,093-variant audit was performed.

Regressions command:

```bash
npm test -- src/university/sequenceExtensions.test.ts src/university/sequenceFollowup.test.ts src/university/functionFollowup.test.ts src/university/limitFollowup.test.ts --maxWorkers=2 -t 'sequence-radical-ratio/expert|sequence-exponential-ratio/expert|sequence-power-exponential / advanced|function-log-rational-domain/expert|limit-radical-infinity/expert'
```

Base main CI: [#41926918237](https://github.com/eluyz/math-tutor-app/actions/runs/41926918237). At initial inspection and local test completion it was **IN_PROGRESS**, not PASS; same-SHA Pages was not yet available. This report does not infer success from the prior PR CI. Final base and delivery statuses are recorded with immutable Actions links in the Draft PR validation section. A failure of the base is a blocker to report, not authorization to fix unrelated code.

Final branch CI: [current Batch C workflow runs](https://github.com/eluyz/math-tutor-app/actions/workflows/ci.yml?query=branch%3Aqa%2Fbatch-c-controlled-acceptance). CI publishes `batch-c-browser-evidence` for 14 days: JSON, HTML, screenshots and failure traces. Local runner paths are `test-results/batch-c-results.json`, `test-results/batch-c/`, `playwright-report/batch-c/index.html` (Git-ignored). Committed compact evidence: `docs/qa-batch-c/local-results.json`. Raw private materials are never included.

## Fixes and next-package gaps

**Generator fixes: 0/2 allowed.** No confirmed mathematical or teaching defect was found in these selected instances. No new family or architecture change is recommended without direct evidence of a required original form.

- C02: other root scales, orders or a vanishing limiting denominator are outside the chosen bounded family. Verify a required original form before treating this as a mathematical gap; lack of a Batch C test is not proof of absent implementation.
- C04: negative bases/oscillations already exist in `sequence-geometric`, but were not selected under the six-combination budget. This is a test-scope gap for a later small package, not a missing-method claim.
- F02: log/root intersections and a logarithm in the denominator already exist in `analysis-log-domain`; they are outside this sample. Direct original matching should decide the next fixture rather than adding a redundant generator.
- G04: higher-level rational cancellation and bounded asymptote methods exist but were not added to this six-row matrix. Broader radical topologies remain unverified, not automatically required new families.
- All four: direct private-source comparison, exact source-to-variant matching and owner review remain BLOCKED_SOURCE. No SOURCE_PASS_CANDIDATE or SOURCE_PASS is awarded. After any separately authorized merge, require same-SHA main CI/Pages and owner acceptance before updating formal counters.

This completes the bounded Batch C package; it does not begin a subsequent batch or reopen #106.
