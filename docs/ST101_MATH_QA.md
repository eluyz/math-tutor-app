# ST-101 independent arithmetic fixtures — Task B

Scope: original internal mathematical QA, not external peer review or private-source
acceptance. Statistics remains work in progress; there is no UI/catalog integration.
A passed [exact-HEAD CI](https://github.com/eluyz/math-tutor-app/actions/runs/44030639958)
on `cf59c3eb39f50f8f549773ca20d01042c444bd7b` before this task began.

## Fixed calculations

| Observations | Sum / count = mean | Median after ordering |
|---|---|---|
| [1] | 1/1 = 1 | 1 |
| [0] | 0/1 = 0 | 0 |
| [2,4] | 6/2 = 3 | (2+4)/2 = 3 |
| [0,1] | 1/2 | 1/2 |
| [−3,0,3] | 0/3 = 0 | 0 |
| [9,1,3] | 13/3 | 3 |
| [1,1,2,2] | 6/4 = 3/2 | 3/2 |
| [0,0,0,10] | 10/4 = 5/2 | 0 |
| [−5,−1,−1,3,4] | 0/5 = 0 | −1 |
| [8,−2,4,0] | 10/4 = 5/2 | (0+4)/2 = 2 |
| [7,7,7,7,7] | 35/5 = 7 | 7 |
| [−4,−3,−2,−1,0,1] | −9/6 = −3/2 | (−2−1)/2 = −3/2 |
| [2,3,6,9,10] | 30/5 = 6 | 6 |
| [20,1,1,1,2,2] | 27/6 = 9/2 | (1+2)/2 = 3/2 |

The test literals above are not obtained from the descriptive helper. Every fixture
is also reversed and translated by +7: location summaries translate by +7 and are
permutation invariant. The outlier example deliberately separates mean from median.

## Actual generator cross-check

For seeds 0..63 at each of the three difficulties (192 sampled seed/difficulty
pairs), independently sum the small integers and cross-multiply to check the exact
mean. Median is checked with rank counts: a value occupies rank k iff fewer than k
values are strictly below it and at least k are at most it. This differs from the
production sorting pathway and correctly retains multiplicities.

The arithmetic oracle imports no production rational-arithmetic constructor. Its
ratio check uses BigInt cross-products, with a positive-denominator condition.
Integer Number accumulation is safe only because the generator bounds imply at
most 9 observations of absolute value at most 20. This argument does not extend
to arbitrary floating-point observations.

Population variance divides by n. On [1,3], squared deviations sum to 2, yielding
population variance 1 and sample variance 2. No sample-variance exercise is added.
Parser checks include an equivalent fraction, a distinct wrong fraction, blank,
zero denominator and unsupported expressions; no diagnostic cause is inferred.

## Verification and limitations

Run `npm test` and `npm run build` before delivery. Actual totals, delivery SHA and
Draft PR are recorded in its description and the final handoff. This stacked PR
must target `codex/st101-datasets`; its automatic GitHub CI is **NOT RUN**, never
PASS. The revised coordinator permits continuing after local tests/build pass,
with complete-stack main-targeted CI required before any owner-approved merge.

No all-seed exhaustiveness, new unique-variant count, third-party review, source
acceptance, release, storage migration or live Statistics exercise is claimed.

## Delivery verification

Full `npm test`: **2515 passed**, 196 files. `npm run build`: **PASS**
(TypeScript + Vite; existing large-bundle warning). No UI/browser tests added
or run for this unintegrated task. Intermediate GitHub CI: **NOT RUN** because
the PR base is `codex/st101-datasets`. Exact delivery SHA and PR URL are recorded in the PR
description and final stack handoff; complete-stack CI is a separate gate.
