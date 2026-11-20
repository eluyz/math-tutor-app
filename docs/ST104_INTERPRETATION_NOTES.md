# ST-104 — statistical interpretation engine

**Status:** Unintegrated engine and educational materials; not available in the application.

**Validation date:** 2026-11-20.

**Base:** `a7c7734dbbc1f0794318bc839a29e6de2b871542` on `main`, after the shared practice interface in PR #341.

**Specification:** [Statistics S1](STATISTICS_S1_SPEC.md).

## Scope and learning outcome

Learners compare the arithmetic mean with the median, then examine how an explicitly specified replacement affects both measures. Every question has exactly one checkable answer among three mutually exclusive choices. Equality is an available answer, not an error case.

This change adds only new engine, teaching, test, verification and documentation files. It does not register ST-104 in the curriculum or practice model, change `StatisticsPractice.tsx`, or alter the existing interface, ST-101/102/103 generators, shared grading, exams or progress. PR #340 and its branch are outside this change.

## API and deterministic generation

`src/statistics/interpretationTasks.ts` exports:

- `generateInterpretationTask(difficulty, seed)`: produces an immutable task for `easy`, `medium` or `hard`. Seeds are unsigned 32-bit integers, including zero and `4294967295`. Invalid seeds and difficulties are rejected. A local xorshift32 stream and deterministic shuffling make replay independent of call order, locale, time and global random state.
- `compareCentres(values)`: compares the exact mean and median of a supplied dataset.
- `compareReplacement(values, index, to)`: replaces exactly one observation at a zero-based index, keeps the observation count fixed, and compares absolute changes in mean and median.
- `assessInterpretationAnswer(task, token)`: returns `correct`, `incorrect`, `empty` or `invalid`. Choices use language-independent IDs. Assessment derives the correct answer from observations and the specified replacement, rather than trusting cached answer metadata. This standalone assessor is not connected to the application's grading.

The pure builders accept 1–100 safe-integer observations for independent edge-case testing. Generated tasks use the S1 sizes below. Summaries reuse the existing pure descriptive-statistics helper without modifying it. Means, medians and absolute changes use exact BigInt rational arithmetic and fraction comparisons; there is no rounding tolerance.

| Level | Generated observation count | Characteristics |
|---|---|---|
| Easy | 5 | Small nonnegative integers; integer means and medians, including after replacement |
| Medium | 6–8 | Repetitions, odd/even lengths, fractional means and half-integer medians |
| Hard | 7–9 | Negative values in every original dataset, odd/even lengths, exact fractions, high and low replacements |

Six construction families cover mean below/equal to/above median, and mean changing less/median changing less/equal absolute changes. Data and answer order are shuffled deterministically. All three correct-answer positions occur at every level. Constant and unsorted datasets are included. Different seeds can produce the same mathematical scenario: this finite generator does not promise a unique problem for every seed.

## Precise interpretation, without an incorrect robustness rule

The replacement questions identify the original dataset, the one-based position and value being replaced, the replacement value, and the resulting dataset. They ask about **absolute change**, not signed change, and explicitly retain the sample size. Generated replacement values lie beyond the original minimum or maximum. This provides concrete extreme-value interventions without claiming to detect outliers by a formal rule such as IQR fences.

The median's robustness does not imply that it always changes less in every finite replacement. The engine deliberately includes counterexamples and ties:

| Original data and replacement | Mean before → after | Median before → after | Absolute-change comparison |
|---|---|---|---|
| `[1, 2, 3, 4, 5]`, replace `5` with `105` | `3 → 23` | `3 → 3` | Median changes less: `0 < 20` |
| `[0, 0, 0, 5, 5]`, replace one `0` with `15` | `2 → 5` | `0 → 5` | Mean changes less: `3 < 5` |
| `[0, 0, 0, 5, 5]`, replace one `0` with `25` | `2 → 7` | `0 → 5` | Equal changes: `5 = 5` |

Conclusions concern the specified observations and replacement. A mean/median ordering alone is not presented as proof of a distribution's shape. These are synthetic, dimensionless exercises, not empirical claims. Sample variance, quartiles, formal outlier classification and inference remain outside scope.

## Bilingual educational materials

`src/statistics/st104Copy.ts` provides `interpretationCopy(task, locale)` for `pl` and `en`, with equivalent prompts, three labelled choices, two hints, feedback and worked solutions. Solutions retain every repeated observation, show the exact sum and mean, sort observations, explain one-based central positions, and calculate the median. Replacement solutions additionally show both datasets' calculations, both absolute changes and their comparison. Centre comparisons have four steps; replacement comparisons have eight.

Teaching content is derived from the data, independently of cached answer metadata. Feedback distinguishes empty, invalid and incorrect selections without diagnosing a learner's misconception from their choice alone. No existing application translations are changed.

## Validation and reproducible evidence

```sh
npm_config_cache=/tmp/math-tutor-npm npm ci
npm test -- src/statistics/interpretationTasks.test.ts src/statistics/interpretationOracle.test.ts src/statistics/st104Copy.test.ts
node scripts/verify-st104.mjs
npm test
npm run build
```

The optional verification script uses the already installed Vite package to load the actual engine and Python 3's standard-library `fractions.Fraction` as a separate oracle. It needs no new dependency, service or network connection.

| Check | Observed local result |
|---|---|
| New ST-104 Vitest cases | **836 PASS** |
| Independent TypeScript mathematical cases | **771 PASS**, included in the 836: seeds `0–255` and maximum uint32, **257 per level** |
| Independent Python oracle | **771 PASS**, **0 FAIL**; verifies **2,313** choice assessments |
| PL/EN teaching coverage | **1,536** seeded lesson checks: 256 seeds × three levels × two locales; included in the new Vitest cases |
| Full Vitest with one worker | **3,501 PASS**, **0 FAIL**, **0 skipped** (`npm test -- --maxWorkers=1`) |
| Existing history regression, run separately | **2 PASS**, **0 FAIL** |
| TypeScript and production build | **PASS** |
| Production JavaScript/CSS against the base | SHA-256 manifests identical; ST-104 is not imported into the runtime bundle |

The first full run with default worker scheduling had **3,499 PASS and 1 FAIL out of 3,500**. The existing `src/university/history-regression.test.ts` preservation test exceeded its unchanged 5,000 ms limit (observed duration 5,474.09461 ms). It passed separately, and the complete suite passed with one worker. One additional metamorphic ST-104 test accounts for the subsequent total of 3,501. No assertion, test timeout, existing test or CI configuration was changed to address this scheduling-sensitive result. Default-worker CI results on the exact commit are recorded in the PR; local serial success does not assert CI success.

Coverage also includes fixed hand-calculated witnesses, retained duplicates, all-zero and singleton data, no-op replacements, half-integer medians, 100-observation datasets, safe-integer extremes with differences beyond Number's safe range, invalid and sparse input, all answer tokens, immutable snapshots, and permutation/translation/reflection properties.

The independent Python run reports diversity separately from seed coverage, excluding IDs and option order:

| Level | Seeds checked | Distinct displayed questions | Distinct mathematical scenarios |
|---|---:|---:|---:|
| Easy | 257 | 224 | 106 |
| Medium | 257 | 248 | 203 |
| Hard | 257 | 245 | 212 |

A displayed question includes observation order and the specified replacement position. A mathematical scenario ignores observation order and replacement position, retaining the values being replaced and introduced. These counts are not a claim of 771 unique questions.

## Later interface integration

This is an engine review milestone, not a released learning feature. A separate task must coordinate with ST-103, register the curriculum/practice routing, adapt the choice-based answer model, connect PL/EN teaching content, and test answer preservation, hints, solutions, keyboard interaction, progress and mobile presentation. Existing application answer fields should not be assumed to accept these choice IDs. No deployment or merge is part of this change.
