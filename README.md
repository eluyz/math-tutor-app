# Math Tutor

[![CI](https://github.com/eluyz/math-tutor-app/actions/workflows/ci.yml/badge.svg)](https://github.com/eluyz/math-tutor-app/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/eluyz/math-tutor-app/actions/workflows/pages.yml/badge.svg)](https://github.com/eluyz/math-tutor-app/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Free, open-source mathematics and introductory statistics practice for adult learners and university students.** Study in **English or Polish**, work through reproducible problems, and check your answers with guided explanations.

**[Open the learning app](https://eluyz.github.io/math-tutor-app/)** · [Report a problem](https://github.com/eluyz/math-tutor-app/issues/new) · [Contribute](CONTRIBUTING.md)

## What you can learn

| Subject | Availability | Learning scope |
| --- | --- | --- |
| **Mathematics** | **Available** | Arithmetic, algebra, equations, matrices, determinants, systems of equations, functions, limits, derivatives, integrals, and selected multivariable topics. |
| **Statistics & Probability** | **Work in progress** | The `main` baseline includes arithmetic mean (ST-101), median (ST-102), population variance (ST-103), statistical interpretation (ST-104), Mode (ST-105), and frequency tables (ST-106). The ST-107 candidate adds bar-chart interpretation. The lessons support Easy, Medium, and Hard. |
| **Econometrics** | Planned | Roadmap only; no playable exercises. |
| **Financial Mathematics** | Planned | Roadmap only; no playable exercises. |

The Mathematics catalog contains **266 exercise families** and **20,157 deterministic variants**, as recorded in the existing catalog. These are generator outputs, **not** 20,157 independently reviewed answers or proof of complete university-syllabus coverage. See the [syllabus closure audit](docs/SYLLABUS_COVERAGE_V2.md) for specific limits.

## Why Math Tutor?

- **Learn at your own pace.** Use a foundations track or explore supported university-level Mathematics topics.
- **Practice instead of only reading.** Enter answers, receive feedback, use optional hints, and open worked solutions.
- **Exact mathematics.** Supported problems are graded using explicit answer contracts; fractional answers are not accepted or rejected using an arbitrary numerical tolerance.
- **Reproducible exercises.** Deterministic generators and fixed seeds support debugging and mathematical review.
- **Study tools.** Mathematics includes practice sessions, an exam workflow, local progress history, and a scratchpad.
- **One responsive layout.** A full-width exercise card appears above the shared topic and difficulty selector on desktop and mobile.
- **Bilingual experience.** The interface and released exercises support English and Polish.

### How to start

1. Open the **[live application](https://eluyz.github.io/math-tutor-app/)** in a browser.
2. Select **Mathematics** or **Statistics & Probability**.
3. Choose an available topic and difficulty. Disabled topics are planned rather than playable.
4. Work on an exercise, check the answer, and use hints or a step-by-step solution as needed.

Five difficulty labels are visible in the shared interface, but individual lessons only enable the levels they actually support. The current Statistics pilot supports three levels.

The Mode lesson asks for every value tied at the highest frequency, provided that it occurs at least twice. Choose **No mode** when each value occurs once. See the [ST-105 lesson notes](docs/ST105_MODE_NOTES.md).

The Frequency tables lesson uses simple tables of integer values to teach counts, relative frequencies and percentage shares. [ST-106 lesson notes](docs/ST106_FREQUENCY_TABLES_NOTES.md)

The ST-107 candidate teaches learners to read vertical bar charts, compare and combine counts, and recognize what a chart can establish about a recorded snapshot. [ST-107 lesson notes and release checks](docs/ST107_CHARTS_NOTES.md)

> **Important scope note:** Statistics currently includes a *population* variance lesson, using division by **n**, not sample variance with **n − 1**. The Statistics track is **not** a complete course, and the application is not affiliated with a university or an official examination board.

## Run locally

Requirements: **Node.js 22.12+** and npm.

```bash
git clone https://github.com/eluyz/math-tutor-app.git
cd math-tutor-app
npm ci
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

Production build and preview:

```bash
npm run build
npm run preview
```

## Quality and verification

```bash
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

The repository uses **TypeScript, React, Vite, Vitest, Playwright, and GitHub Actions**. Additional Mathematics acceptance suites run as Batch B–G in CI. Independent mathematical fixtures and method-specific oracles supplement, but do not replace, browser tests and human review.

Successful CI demonstrates that the checked code and scenarios passed. It does **not** certify every possible mathematical exercise, guarantee exact correspondence with external worksheets, or establish user adoption.

## Privacy and limitations

Math Tutor runs in the browser without requiring an account, backend service, or paid AI API. Supported Mathematics progress and exam metadata are stored locally in the browser; not all exercise state survives refresh. In the current Statistics pilot, answers and lesson state are kept for the active page session and are **not** written to Mathematics progress history.

Some learning topics are unavailable; several advanced Mathematics methods are intentionally bounded. A successful test suite is not a claim of full syllabus coverage. See the [subject roadmap](docs/SUBJECT_EXPANSION_PLAN.md) and [canonical practice layout](docs/PRACTICE_LAYOUT_CONTRACT.md).

## Contribute

Bug reports, mathematical counterexamples, translations, accessibility feedback, tests, and carefully scoped lessons are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. When reporting an incorrect answer, include the exercise topic, difficulty, displayed values, entered answer, and the result you expected.

For historical development checkpoints, original mathematical-method notes, and older release evidence, consult the [previous detailed README in Git history](https://github.com/eluyz/math-tutor-app/blob/752e51524e31b642cbae3366d5d4fae95d6f2f0e/README.md). Those records are historical snapshots, **not** current release-status claims.

## License

Math Tutor is distributed under the [MIT License](LICENSE).
