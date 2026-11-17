# Statistics S1 independent QA matrix — Task F

Scope: internal, source-independent fixtures and algebraic property checks for
A/D/E and the exact descriptive foundation. Not external peer review, a private
source comparison, an exercise-variant count or public release acceptance.

## Fixed independently calculated results

For each row, compute S=Σx, Q=Σx², mean=S/n and population variance=(nQ−S²)/n².
Median comes from the ordered central observation(s). The test holds literal
reduced fractions; no production constructor calculates expected results.

| Data | S | Q | Mean | Median | Population variance |
|---|---:|---:|---:|---:|---:|
| [0] | 0 | 0 | 0 | 0 | 0 |
| [7] | 7 | 49 | 7 | 7 | 0 |
| [1,3] | 4 | 10 | 2 | 2 | 1 |
| [0,1] | 1 | 1 | 1/2 | 1/2 | 1/4 |
| [−1,1] | 0 | 2 | 0 | 0 | 1 |
| [1,1,1] | 3 | 3 | 1 | 1 | 0 |
| [1,2,3] | 6 | 14 | 2 | 2 | 2/3 |
| [−3,0,3] | 0 | 18 | 0 | 0 | 6 |
| [0,0,0,10] | 10 | 100 | 5/2 | 0 | 75/4 |
| [1,1,2,2] | 6 | 10 | 3/2 | 3/2 | 1/4 |
| [−5,−1,−1,3,4] | 0 | 52 | 0 | −1 | 52/5 |
| [8,−2,4,0] | 10 | 84 | 5/2 | 2 | 59/4 |
| [−4,−3,−2,−1,0,1] | −9 | 31 | −3/2 | −3/2 | 35/12 |
| [9,1,3,7,5,11] | 36 | 286 | 6 | 6 | 35/3 |
| [2,3,6,9,10] | 30 | 230 | 6 | 6 | 10 |
| [20,1,1,1,2,2] | 27 | 411 | 9/2 | 3/2 | 193/4 |

A seventeenth edge witness uses [9007199254740991,9007199254740989]. Its exact
mean/median are 9007199254740990 and variance 1. BigInt prevents catastrophic
cancellation or overflow; this large witness is excluded from Number scaling.

## Metamorphic and actual-task checks

Each of the 16 small rows is separately reversed, translated by +7 and scaled by
−3, 0 and 2. Mean and median transform linearly; variance is translation invariant
and scales by k², including negative and zero k. All transformed observations
remain small safe integers (absolute value at most 60 for scaling).

Additionally 65 seeds (0..63 plus 4294967295) per difficulty check actual A/D/E
outputs, using independent BigInt sum/sum-of-squares identities and median rank
counts, not production sorting or production Rational constructors. This is 195
sampled replay requests; they are not asserted to represent distinct data.

Sample variance uses n−1 and is out of scope. Positive-dispersion fixtures would
catch its substitution for population n; zero variance alone cannot distinguish
them. Repeated observations remain separate observations. Invalid and mutation
cases are covered by the existing A/D/E tests, which are retained unchanged.

No production files are changed to fit expected values. Remaining gates: G's
original PL/EN pedagogy, H's UI contract, complete-stack exact-HEAD CI, external
math review, and separately authorized browser integration/release acceptance.

## Delivery verification

Full `npm test`: **2577 passed**, 200 files. `npm run build`: **PASS**
(TypeScript + Vite; existing large-bundle warning). No UI/browser tests added
or run for this unintegrated task. Intermediate GitHub CI: **NOT RUN** because
the PR base is `codex/st103-variance`. Exact delivery SHA and PR URL are recorded in the PR
description and final stack handoff; complete-stack CI is a separate gate.
