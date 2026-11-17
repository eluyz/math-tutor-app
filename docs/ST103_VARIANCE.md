# ST-103 exact population variance — Task E

Unintegrated, unreleased Statistics work in progress. D's local full tests/build
passed before E began. Only this document and the new variance module/tests change.

## Design and contract

`generateVarianceTask(difficulty, seed)` returns frozen
`{ id, difficulty, seed, values, mean, populationVariance }`. Reuses A's data policy
and the existing exact descriptive helper. The divisor is the observation count n,
not n−1. Both summary fractions and the original-order observation array are
frozen. Replay IDs identify requests, not unique datasets. No mutable caller array,
new random source, grading implementation or existing module modification.

Zero variance is naturally available in the existing data: easy seed 19 returns
[8,8,8,8,8]. No special-case generator or policy expansion is needed. The module
accepts only A's difficulty/seed domain; validation is inherited rather than copied.

## Independently fixed calculations

Use S=Σx and Q=Σx², so population variance is (nQ−S²)/n². This is a separate
arithmetic pathway from production's Σ(nx−S)²/n³ and uses BigInt cross-products.

| Level/seed | S | Q | n | Mean | Population variance |
|---|---:|---:|---:|---:|---:|
| easy/0 [3,2,2,1,2] | 10 | 22 | 5 | 2 | (110−100)/25 = 2/5 |
| easy/19 [8,8,8,8,8] | 40 | 320 | 5 | 8 | 0 |
| medium/0 [3,3,1,16,7,13] | 43 | 493 | 6 | 43/6 | (2958−1849)/36 = 1109/36 |
| medium/1 [2,2,3,10,1,7] | 25 | 167 | 6 | 25/6 | (1002−625)/36 = 377/36 |
| hard/0 [−16,−13,8,17,−1,14,−9] | 0 | 1056 | 7 | 0 | 1056/7 |

The data stream was independently replayed in Python; table totals and expected
fractions are explicit. Tests check 257 seeds per level, nonnegativity, zero iff
all observations equal, permutation/translation invariance, invalid seeds and
immutability. A positive-dispersion answer is explicitly distinguished from sample
variance (nQ−S²)/(n(n−1)). These are bounded policy samples, not exhaustive seeds,
unique-variant statistics, external peer review or source acceptance.

PL/EN teaching is reserved for G. There is no catalog, UI, storage, Mathematics,
progress, exam, dependency, CSS or workflow change, and no release claim.

## Delivery verification

Full `npm test`: **2541 passed**, 199 files. `npm run build`: **PASS**
(TypeScript + Vite; existing large-bundle warning). No UI/browser tests added
or run for this unintegrated task. Intermediate GitHub CI: **NOT RUN** because
the PR base is `codex/st102-median`. Exact delivery SHA and PR URL are recorded in the PR
description and final stack handoff; complete-stack CI is a separate gate.
