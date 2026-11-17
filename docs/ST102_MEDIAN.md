# ST-102 deterministic median exercises — Task D

Status: unintegrated Statistics work in progress; no published exercises.
Starting gate: [full C-inclusive CI #44037069132](https://github.com/eluyz/math-tutor-app/actions/runs/44037069132)
SUCCESS on `5b25c502903277cb34b43f7e46ce3924690eb577`, independently read before D.
This supersedes C's historical stop record without modifying any A–C file.

## Design and contract

Tests are specified first, then `generateMedianTask(difficulty, seed)` reuses
Task A's bounded deterministic observations and existing exact descriptive helper.
Returns frozen `{ id, difficulty, seed, values, median }`; Rational median and
values are frozen. No array is accepted from a caller, and no source data is
mutated. The ID `st102-<difficulty>-<seed>` identifies a replay request; it is not
a claim that different seeds give different data. Seed validation and bounds are
inherited unchanged from A. No global state, randomness or new grading logic.

FOLLOW-UP #330: For easy tasks, the five values are deterministically re-ordered
by a median-specific seeded Fisher–Yates permutation. This preserves the multiset
(and the median) but no longer always displays the answer in the third position.
ST-101 mean datasets and ST-103 variance data remain entirely unchanged. Medium
and hard median tasks preserve A's original generated order. Easy data may still
contain equal values, including all-equal cases where no ordering can hide the median.
Both odd/even lengths and fractional medians occur in the tested policy sample.
Not every generated list is guaranteed unsorted.

## Independent literal witnesses

| Level/seed | Observations | Ordered observations | Median |
|---|---|---|---|
| easy/0 | [3,2,2,2,1] | [1,2,2,2,3] | 2 |
| easy/1 | [1,6,9,4,5] | [1,4,5,6,9] | 5 |
| medium/0 | [3,3,1,16,7,13] | [1,3,3,7,13,16] | (3+7)/2 = 5 |
| medium/1 | [2,2,3,10,1,7] | [1,2,2,3,7,10] | (2+3)/2 = 5/2 |
| medium/3 | [10,10,11,17,19,7] | [7,10,10,11,17,19] | (10+11)/2 = 21/2 |
| hard/0 | [−16,−13,8,17,−1,14,−9] | [−16,−13,−9,−1,8,14,17] | −1 |

Fixtures were replayed with an independent Python integer stream, then the
ordered lists and central values were checked explicitly. Expected medians are
literal rational values, never obtained from the production result. A separate
rank-count oracle checks 257 seeds per difficulty (0..255 and the upper bound),
plus reversal and translation by +7. Includes invalid seeds, repeatability,
negative and fractional answers, unchanged source observations and immutability.
These are sampled policy checks, not an exhaustive 32-bit seed audit or a count
of unique exercise variants. This is internal author QA, not external peer review.

PL/EN median teaching is reserved for G. No UI, math catalog, progress, exam,
storage, dependency, CSS or workflow files change. Public release still needs
independent math review, authorized integration, browser acceptance and owner gates.

## Delivery verification

Full `npm test`: **2531 passed**, 198 files. `npm run build`: **PASS**
(TypeScript + Vite; existing large-bundle warning). No UI/browser tests added
or run for this unintegrated task. Intermediate GitHub CI: **NOT RUN** because
the PR base is `codex/st101-learning-copy`. Exact delivery SHA and PR URL are recorded in the PR
description and final stack handoff; complete-stack CI is a separate gate.


## Post-H teaching-quality fix (Issue #330)

Review found that symmetric easy datasets from ST-101 put their common mean/median
in displayed position three for every seed. That lets a learner shortcut the
median calculation without ordering observations. The new ST-102-only deterministic
permutation breaks that *universal* pattern while retaining the exact same values
and difficulty limits. A regression test scans seeds 0..255, requires more than
100 examples where display position three does **not** equal the median, and
requires the earliest median position to vary. These are sampled pedagogy
properties, not a promise that every observation list is unique or nontrivial.

The original Task D test count above is **historical**. Follow-up #330 needs its
own exact-HEAD CI before any integration. No student-facing Statistics lesson exists
yet; owner review, UX implementation and browser acceptance remain outstanding.
