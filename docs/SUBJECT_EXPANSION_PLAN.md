# Subject expansion roadmap

**Project:** Math Tutor — free, MIT-licensed learning software  
**Status:** Implementation roadmap updated 2026-11-18  
**Current learning scope:** Mathematics and a small, exact Statistics pilot (mean, median, population variance). Econometrics and Financial Mathematics have no exercises.

## Why expand?

Math Tutor currently offers deterministic mathematics exercises, guided solutions, local progress tracking and bilingual PL/EN UI. We plan to broaden its usefulness for university students studying economics, finance, management, and related disciplines. This is a product direction, not a claim of existing adoption.

## Subject status

| Subject | Status | Honest interpretation |
| --- | --- | --- |
| Mathematics | AVAILABLE | Existing production exercises and modes; existing limitations still apply. |
| Statistics & Probability | WORK IN PROGRESS | Three bounded descriptive-statistics lessons: arithmetic mean, median and **population** variance (not sample variance), with PL/EN steps and Easy/Medium/Hard difficulty. Other topics remain unavailable. |
| Econometrics | PLANNED | Future scope after statistics foundations. |
| Financial Mathematics | PLANNED | Future scope after statistics/econometrics priorities. |

## Statistics S1 — foundation history and playable releases

- [Detailed specification and hand-checkable examples](STATISTICS_S1_SPEC.md)
- [Umbrella issue #306](https://github.com/eluyz/math-tutor-app/issues/306)
- Delivery tickets: [generator #308](https://github.com/eluyz/math-tutor-app/issues/308), [independent QA #309](https://github.com/eluyz/math-tutor-app/issues/309), [PL/EN pedagogy #310](https://github.com/eluyz/math-tutor-app/issues/310), [UI and release #311](https://github.com/eluyz/math-tutor-app/issues/311).
- Exact-arithmetic calculation helpers and deterministic exercise generators for ST-101, ST-102 and ST-103 exist; the latter is integrated with the UI in [the release candidate PR #340](https://github.com/eluyz/math-tutor-app/pull/340).
- Every published lesson requires owner approval, exact-head full CI and matching main/Pages deployment evidence. Keep the Statistics subject **Work in progress**; the rest of its syllabus is not a published course.
- Historical Mathematics family/variant counts must not be silently increased to include Statistics exercises.

## Broader roadmap (beyond the bounded Statistics pilot)

**Statistics & Probability**
- Arithmetic mean, median and **population** variance form the bounded pilot. Further descriptive topics (range, mode, standard deviation, grouped data) are planned, not shipped.
- Probability: events, conditional probability and basic combinatorics.
- Discrete distributions (including Bernoulli/binomial) and expectation/variance.
- Confidence intervals and hypothesis testing, with explicit assumptions.

**Econometrics**
- Simple OLS regression with manually verifiable small datasets.
- Parameter interpretation, residuals, R², model fit.
- Diagnostics with assumptions and meaningful caveats.
- Introductory time-series patterns and forecasting without unwarranted statistical guarantees.

**Financial Mathematics**
- Simple/compound interest and effective rates.
- Present/future value and discounting.
- Fixed-payment annuities/loans.
- NPV and introductory IRR with carefully bounded cases.

## Delivery sequence and acceptance gates

- **S0 — Public direction (now):** maintain bilingual subject navigation, accurate labels, accessible responsive UI, and this plan. No misleading disabled exercise buttons. Existing mathematics retains its workflows.
- **S1 — Statistics pilot:** one independently verified descriptive-statistics family (e.g. mean/median/variance for small finite datasets) with deterministic seeds, exact expected answers and teaching steps. Acceptance requires unit tests, independent oracle, PL/EN copy and mobile/desktop UI checks.
- **S2 — Statistics fundamentals:** expand to probability and distributions only after pilot feedback; document coverage per skill and avoid inflated variant counts.
- **S3 — Econometrics pilot:** hand-checkable OLS datasets and coefficient interpretation; avoid arbitrary regression without a robust numerical specification.
- **S4 — Financial-math pilot:** bounded present/future value and compounding with explicit rounding policy.
- **S5 — Community improvements:** CONTRIBUTING refresh, getting-started examples, beginner-friendly issues, independent feedback and release evidence.

## Engineering guardrails

- No backend, account system, telemetry, external paid API or collecting student data as part of this roadmap.
- Keep deterministic generation and assessment separate from React rendering; reuse existing generator/answer contract where feasible.
- Provide independent correctness checks. Do not count generated variants as independently audited without evidence.
- PL and EN coverage is required for every public exercise and subject route.
- Preserve progress/session and exam behavior. A running exam cannot switch subjects.
- Keep new subject exercises out of the public catalog until correctly implemented and tested.
- A project plan is not a published feature; users must see accurate availability.

## Release evidence checklist

1. PR diff reviewed for compatibility and scope.
2. TypeScript build and unit tests pass at the exact PR HEAD.
3. Playwright smoke checks on desktop and 375px mobile: navigation, labels, no broken links, mathematics exercise flow, progress and exam.
4. Accessibility checks: keyboard navigation, focus indicators, accessible subject navigation labels, contrast.
5. Owner-approved merge; main CI and Pages on the same release SHA.
6. Update release notes and Drive operating log with evidence links.

## Evidence and community

We do not claim any number of active users or external contributors. Track only verified feedback, independent bug reports and confirmed use cases. Interest in a feature is a hypothesis, not evidence of demand.

## Next actionable task

Implement the **Statistics S1 descriptive statistics pilot** in a separate PR; initially limit to one family and a well-specified grading policy. Keep other subjects marked Planned until actual work starts.
