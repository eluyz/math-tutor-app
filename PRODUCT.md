# Math Tutor — Product overview

Math Tutor is a free, MIT-licensed mathematics and introductory statistics learning app for adults returning to education and university learners. It provides **English/Polish** practice tasks, exact answer checks, hints and worked solutions, without requiring accounts or paid APIs.

**Try the application:** https://eluyz.github.io/math-tutor-app/

## Learning scope

| Subject | Status | Repository learning scope |
| --- | --- | --- |
| Mathematics | Available | Bounded foundations and university topics: algebra, linear systems, matrices, functions, limits, derivatives, integrals and selected multivariable tasks |
| Statistics | Work in progress | ST-101 arithmetic mean, ST-102 median, ST-103 population variance, and ST-104 statistical interpretation on the `main` baseline. ST-105 Mode is playable in the candidate checkout. All five use Easy, Medium, and Hard. |
| Econometrics | Planned | Informational screen only |
| Financial Mathematics | Planned | Informational screen only |

The Mathematics catalog reports **266 families** and **20,157 deterministic variants**. The independent syllabus review has its own [coverage record](CURRICULUM_COVERAGE.md).

## Learning workflow

1. Choose a subject and an available topic and difficulty.
2. Work through an exercise and submit the requested numeric answer or select a choice.
3. Request a hint or a worked solution where available.
4. Mathematics provides optional ten-task sessions, a separate exam workflow, scratchpad and local progress tracking.
5. Every playable learning subject uses the same layout: heading, full-width active exercise, then topic/difficulty selector.

The five visible difficulty labels do not mean all five are playable in every lesson. Planned areas must remain honestly disabled.

## Feedback and limitations

A wrong final answer proves that the submitted result is incorrect, **not** the learner's precise reasoning error. Suggested mistake patterns are hypotheses; a verified intermediate step supports a narrower claim. See [Error taxonomy](ERROR_TAXONOMY.md).

Mathematical grading is exact within each supported answer contract; the app does not accept arbitrary symbolic input or certify an entire curriculum. It is not affiliated with a university or an examination board.

## Privacy and release

No account, backend or student telemetry is required. Supported Mathematics progress and exam metadata remain in browser storage, while the bounded Statistics pilot does not overwrite Mathematics progress. Do not promise that every unfinished draft survives refresh.

Every release needs an independently checked mathematical scope, PL/EN evidence, unit/build/browser acceptance, approval to merge, and matching main CI/Pages verification.

See [Architecture](ARCHITECTURE.md), [Roadmap](ROADMAP.md), [Curriculum coverage](CURRICULUM_COVERAGE.md), and [Contributing](CONTRIBUTING.md).

The full original Polish-language product history is preserved unchanged in [the archive](docs/archive/legacy-2026-11-20/PRODUCT.md).
