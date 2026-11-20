# Math Tutor — Technical architecture

Math Tutor is a browser-first application built with **React 19, TypeScript and Vite 8**, tested with **Vitest and Playwright** and released with GitHub Actions and Pages. Mathematical models and grading logic are kept separate from React rendering.

## Modules

| Area | Source | Responsibility |
| --- | --- | --- |
| App and subject navigation | `src/App.tsx`, `src/SubjectNavigation.tsx`, `src/subjectRoadmap.ts` | Routes among available and planned subjects |
| Exercise generation | `src/generators.ts`, `src/education/`, `src/university/` | Deterministic Mathematics families and bounded models |
| Exact grading | `src/rational.ts`, `src/answers.ts`, `src/exercises.ts` | Typed answers, rational equivalence, invalid-input detection |
| Session workflow | `src/session.ts` | Ten-task practice sessions and first-attempt accounting |
| Exam workflow | `src/exam/` | Distinct exam questions, review and local history |
| Progress | `src/progress/` | Local-only persisted Mathematics session metadata |
| Statistics | `src/statistics/` | Finite datasets, descriptive measures, statistical interpretation, exact grading and teaching copy |
| Shared practice UI | `src/ui/PracticeSelectorPanel.tsx`, `src/navigation/` | Task-first UI, focus behavior and unsaved-work protection |
| Locales | `src/locales/` | English and Polish content; language does not alter mathematical answers |

## Model-to-UI flow

An exercise family/difficulty and controlled index or seed determine reproducible problem data. The generator provides a typed expected answer and explanatory steps. A UI component displays that data, gathers input, and submits it to the matching validator. Validation distinguishes correct, incorrect and invalid input according to that lesson's declared contract.

This is **not** a universal symbolic mathematics parser. Generated variants and successful CI are not evidence of independent certification for every item.

## Statistics boundary

The `main` baseline integrates ST-101 arithmetic mean, ST-102 median, ST-103 population variance with divisor `n`, and ST-104 statistical interpretation. The ST-105 Mode candidate uses the shared native choice form and renders its counted observations in a semantic frequency table. Each lesson supports Easy, Medium, and Hard. See [ST-105 notes](docs/ST105_MODE_NOTES.md) for the exact assessment and release gates.

Do not mix Statistics exercise state with Mathematics progress history. Future Econometrics and Financial Mathematics views are currently non-playable placeholders.

## Shared UI and accessibility

Follow [the practice layout contract](docs/PRACTICE_LAYOUT_CONTRACT.md): subject heading, one full-width exercise, then a consistent selector panel below. Preserve keyboard and visible focus, pointer scroll position, unsaved answers, locale switches, and 375/768/1280 px layout.

## Verification and deployment

```sh
npm ci
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

GitHub CI runs additional acceptance batches B–G. The Pages deployment is gated on completed successful CI on `main`. Verify the exact release SHA; a prior successful PR run is not deployment proof. Emulated Chrome viewport checks are not physical Safari device evidence.

## Safety

No new backend, account system, telemetry, paid API or unsafe evaluation without explicit scope approval. Maintain independent mathematical test oracles, exact grading, local storage safeguards, and distinct exam/session state machines.

The complete historical Polish architecture record remains unchanged in [the archive](docs/archive/legacy-2026-11-20/ARCHITECTURE.md).
