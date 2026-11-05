# F05-d — combined two-pole monotonicity profile

Execution: 2026-11-05 (Europe/Warsaw; raw logs UTC). Base main `37617586563300787f1964932cbd38706f918865`; isolated branch `fix/f05-d-monotonic-asymptote-profile`. Initial and pre-publication checks found no competing F05-d PR. #142/#175/#176 and Batch H #177 were open; H remained at `1fc5ee14bdfacda43c2fd20879e9bf36fec8c836`, unmerged. This branch never used or changed H, I07 work or `e2e/helpers/acceptance.ts`.

Read Issue #122 (body and 15 comments), merged PR #149 and current family/renderer/tests. **PR #149 already implements hollow pole-adjacent exterior endpoints.** None of that endpoint, SVG or answer-rule logic is reimplemented here.

**Tested implementation HEAD: `955d3406bd89e91de658867b2559c9505d4f42aa`.** The following documentation-only commit records this report and [compact SHA-256 evidence](qa-f05-d/local-results.json). The Draft PR validation section pairs the exact delivery HEAD with the immutable terminal Actions URL; it is not a self-referential commit hash. No main/workflow/Pages change or merge is performed. No private graph, original coefficients or key was read, transcribed or published.

## Minimal change

Existing profile 0 already had rising exteriors and a falling middle but odd parity. Existing profile 2 already had the required pole-adjacent hollow endpoints, decreasing middle and neither parity, but its right exterior slope was −1. Change **one slope-table entry** for profile 2 to +1.

This reuses existing variants **2,8,14,20 at hard/advanced/expert** (12 of this family's 72). The other 60 variants retain their geometry. Both domain endpoints, poles, left segment, middle curve, scale/shift and exclusion logic stay unchanged. Only the right far-end height and dependent increase/decrease answers change. Family count remains **231**, total catalog **18,093**, family **72**; no extra IDs or new generator.

The public source-proxy ledger now points to hard:2 for the combined d-like method, retaining SOURCE_NOT_VERIFIED. Its old P0M candidate text is explicitly marked historical by the new note referencing merged #149. New production Playwright config is type-checked by the additive tsconfig entry; no common harness, package script or CI workflow change.

## Exact independent six-field fixture

Public authored ID: **`function-integrated-asymptotes:hard:2`**. These data come from the pre-existing synthetic parameter scheme plus the single slope change, not an original diagram.

- Left line: from (−3,−3), included, to (−1,−1), excluded; equation y=x.
- Middle: `f(x)=1+2(x−1)/((x−1)²−4)` on (−1,3).
- Right line: from (3,2), excluded, to (5,4), included; equation y=x−1.
- Poles x=−1 and x=3, with existing hollow endpoints exactly at those arguments.

| Assessed field | Independent correct value |
| --- | --- |
| Domain | `[−3; −1) ∪ (−1; 3) ∪ (3; 5]` |
| Range | `ℝ` |
| Strict increase | `[−3; −1) ∪ (3; 5]` |
| Strict decrease | `(−1; 3)` |
| Injectivity | No / Nie |
| Parity | Neither / Ani parzysta, ani nieparzysta |

Independent proof: both line slopes are exactly +1. With t=x−1 the middle derivative is `−2(t²+4)/(t²−4)²<0`. Its denominator is nonzero in the open middle interval; the one-sided limits at −1+ and 3− are +∞ and −∞. Continuity and the intermediate-value theorem give all real y-values; finite exterior pieces do not enlarge the range.

A fully rational noninjectivity witness is x=−1/2 in the middle and x=26/7 on the right: both give **19/7**, checked with exact rational arithmetic. The domain contains 5 but not −5, excluding both evenness and oddness. Boundary membership follows the existing included far ends and excluded pole arguments, without filling either missing x.

For all 12 modified variants, exact slopes are +1; middle derivative generally is `−scale·radius·(t²+radius²)/(t²−radius²)²<0` with positive scale/radius. Opposite pole limits again prove W=R and overlap with each nonempty exterior image proves noninjectivity. All their finite domain extrema have sum 2, not 0, so the domain is nonsymmetric. The test oracle derives interval endpoints from original coordinates and theorem conditions; **no production answer value, graph oracle or production middle evaluator determines expected results**. Expected labels are mapped to option IDs only after the mathematics is established; `field.value` is never an oracle input.

## Tests and didactic checks

New unit package: 12 variant/level cases × PL/EN plus one pinned geometry/exact-rational control = **13 tests**. All 13 fail on the original profile, then pass after the single entry change. Each localization checks six exact correct labels, wrong answers in each field, empty response, each single-field incomplete response, both hints, all six working steps and final answer. Step checks cover open boundaries, surjectivity, derivative sign, component separation, noninjectivity and parity reasoning. Original templates were read against the independent proof; no symbolic/natural-language proof checker is claimed.

Existing family regressions still check all 72 task geometries, unique content keys, PL/EN grading, open-end semantics and the other profiles. Full units additionally preserve catalog totals.

The new strict browser spec pins hard:2 by its exact four SVG endpoint coordinates after deterministic seeding and bounded traversal of the 24 existing variants. It never submits a production answer or accepts `correct|incorrect` as an unspecified outcome. It requires **all six exact expected responses → correct**, then checks each field wrong → incorrect with exactly one failed field, and each field omitted → invalid with exactly one missing field. Both actual hints are revealed before correct submission; complete solution and six correct per-field verdicts are required.

Graph checks require poles x=−1 and x=3, exterior slopes +1/+1, marker openness false/true/true/false and genuine hollow-circle styling. Every one of 199 middle SVG samples is compared against the independent original function and viewport transform. Floating tolerance here checks rendering only; the monotonicity/range proofs above are exact. Mobile PL screenshot was also visually reviewed. No console.error/pageerror/requestfailed/HTTP≥400 or page-wide overflow is allowed.

**Production runner:** `playwright.f05-d.config.ts` uses `vite preview`, port 5073, two workers and the existing production browser settings. It runs four strict pinned tests (PL/EN × 375/1280 px) and 12 unchanged renderer regressions. The old renderer tests retain their broad answer smoke check; they are not counted as exact-response evidence. The existing default CI browser suite also discovers the four new strict tests; no CI mutation or separate artifact upload is added.

## Results and reproducibility

- Targeted: **24/24 PASS**, 4 files (13 new + 11 existing).
- Full units: **1,654/1,654 PASS**, 128 files, one worker and no overlapping Chromium run.
- Production build: **PASS**, existing >500 kB chunk warning unchanged. It was repeated after adding the config to TypeScript checking; no unnecessary full-unit rerun.
- Production Chromium: **16/16 PASS in 35.82 seconds**: four strict exact hard:2 witnesses plus 12 existing renderer tests; zero errors/flaky/skipped tests.
- [Evidence ledger](qa-f05-d/local-results.json): exact changed IDs, commands, four decoded six-field witnesses, screenshot/source/test SHA-256 and production asset hashes. Raw local JSON/screenshots stay ignored.

```sh
npx vitest run src/university/f05DProfile.test.ts src/university/graphIntegratedAsymptotes.test.ts src/university/f05MethodProxyEvidence.test.ts src/university/graphAsymptoteRange.test.ts --maxWorkers=1
npm test -- --maxWorkers=1
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npx playwright test --config playwright.f05-d.config.ts
```

Final full CI status and exact delivery HEAD are recorded in the Draft PR validation section after terminal verification. Queued/running CI is not PASS. No existing PR branch was modified, no #106 audit started and no source acceptance counter changed. If H lands before integration, retain its changes on this branch and rerun appropriate regressions on the new exact base; never modify #177 itself.

## Remaining boundary

**METHOD_PASS** for the requested synthetic combined topology and six-field workflow. **SOURCE_NOT_VERIFIED / BLOCKED_SOURCE** for original F05-d acceptance: original-source comparison and final independent source review remain. No SOURCE_PASS, no claim of matching original coordinates or all six source figures. Chromium viewports do not establish physical mobile/Safari or full accessibility acceptance. Next step is owner review of this bounded method change, followed separately by private source acceptance; no automatic merge or further graph expansion.
