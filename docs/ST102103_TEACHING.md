# Original median and population-variance teaching — Task G

Unintegrated PL/EN copy only. Reuses C's read-only `TeachingCopy` type and existing
Rational operations/formatter; does not modify C, global translations or grading.

## Median contract

`medianCopy(values, locale)` preserves prompt order, sorts a copy retaining all
repeats, displays count and one-based central position(s), then selects the odd
central value or averages both even central values. Three complete calculation
steps, two original hints, conclusion and separate correct/wrong/empty/invalid
feedback. Tests include odd, even, repeated, negative and fractional medians;
[−3,−2,−1,0] gives (−2−1)/2=−3/2 with the established Unicode minus formatter.

## Variance contract

`varianceCopy(values, locale)` explicitly declares the observations to be the
population. Four complete stages: exact mean; **every** signed difference and its
square; sum of those squares; division by n, explicitly distinguishing n−1.
All operations use existing exact Rational arithmetic. Conditional unit guidance
explains squared units without inventing an economic unit for abstract data.

Fixed full-chain witnesses in both languages:

- [0,0,0,1,1,1]: mean 1/2; six squared deviations 1/4; sum 3/2; variance 1/4.
- [2,2,2,2,2]: mean 2; five zero differences/squares; variance 0.
- [−1,1]: mean 0; squares 1,1; sum 2; population variance 1 (not sample 2).
- [−5,−1,−1,3,4]: mean 0; squares 25,1,1,9,16; sum 52; variance 52/5.
- [−2,−1,0,0,0]: mean −3/5; squares 49/25,4/25,9/25,9/25,9/25;
  sum 16/5; variance 16/25. This checks subtraction of a negative fractional mean.

All numerical lines above are literal test expectations, including fraction
formatting and signs. Prompts/hints do not leak answers or retain another dataset's
answer. Invalid data/locales are rejected. Frozen source arrays check nonmutation.
Additional 16 seeds per level check PL/EN calculation parity, complete hints and
feedback. Generic wrong-answer guidance never asserts one cause from one answer.

The pure copy helpers share the descriptive utility's 1–100 integer domain; the
exercise generators still only produce 5–9 observations. A short two-value QA
witness is not a new exercise policy. No UI, external mathematical peer review,
source acceptance, unique-variant count or public release is claimed. H defines
future integration/release gates; I remains unauthorized in this session.

## Delivery verification

Full `npm test`: **2592 passed**, 201 files. `npm run build`: **PASS**
(TypeScript + Vite; existing large-bundle warning). No UI/browser tests added
or run for this unintegrated task. Intermediate GitHub CI: **NOT RUN** because
the PR base is `codex/st-s1-extended-oracle`. Exact delivery SHA and PR URL are recorded in the PR
description and final stack handoff; complete-stack CI is a separate gate.
