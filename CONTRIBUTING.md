# Contributing to Math Tutor

Thank you for helping improve free and reliable mathematics education. Contributions are welcome, especially reproducible bug reports, independent mathematical verification, accessibility improvements, documentation, translations, and small, well-tested lesson additions.

**Public project documentation and pull request descriptions should be in English.** The learning application itself supports both English and Polish.

## Report an issue

Open a [GitHub issue](https://github.com/eluyz/math-tutor-app/issues/new) and provide enough information for someone else to reproduce the problem:

- Subject, topic, exercise family, difficulty and, if available, the exercise seed.
- Displayed problem and relevant input values.
- Your answer, what the application showed, and the expected result with a short mathematical justification.
- Browser, operating system, and viewport/device details for visual or accessibility bugs.
- Screenshots where helpful, without including personal information.

Please distinguish a confirmed mathematical error from a suspected explanation problem. Feedback inferred from an incorrect final answer is not proof of the learner's actual mistake.

## Development setup

Use **Node.js 22.12+** and npm:

```bash
git clone https://github.com/eluyz/math-tutor-app.git
cd math-tutor-app
npm ci
npm run dev
```

Before opening a pull request, run:

```bash
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

The CI workflow also checks additional Mathematics acceptance batches B–G. For relevant changes, inspect their results rather than relying on the core suites alone.

## Pull request checklist

1. Work on a separate branch. Keep changes focused and describe their user-facing effect.
2. Maintain equivalent **English and Polish** prompts, labels, hints, feedback, and step-by-step teaching content for released lessons.
3. Preserve exact mathematical grading and deterministic generation. Add independent expected-result fixtures; do not use the implementation under test as its own oracle.
4. Check correct, incorrect, empty and invalid answers; zero and sign boundaries; exact fractions; and lesson-specific edge cases.
5. Test keyboard focus, visible focus indicators, no horizontal overflow, and relevant desktop/mobile widths (including 375, 768 and 1280 px).
6. Keep the canonical **subject heading → full-width task → selector panel** layout for playable lessons. Planned subjects must not appear playable.
7. Preserve Mathematics session, exam, history, scratchpad and browser-storage behavior. Do not silently discard an unfinished answer or overwrite unknown stored data.
8. Avoid a new backend, telemetry, external API dependency, or transmission of student answers unless explicitly designed, justified and separately approved.
9. Provide reproducible evidence (test commands, exact commit SHA, screenshots where appropriate) and describe limitations honestly.
10. Do not merge without explicit maintainer approval. Passing CI is a release prerequisite, not automatic release permission.

A Chromium viewport simulation is **not** proof of testing on a physical iPhone/iPad or Safari. Report physical-device checks separately if they were actually performed.

## Lesson architecture

Mathematics exercises rely on typed answer contracts, deterministic exercise families, localization, and step-by-step solutions. Follow the existing implementation patterns and the corresponding independent QA suites. Do not silently enable unsupported difficulties or treat all generated variants as independently audited.

Statistics is a bounded pilot. Adding a pure generator or educational copy does not make a lesson available to students; user-facing registration, accessible input controls, browser tests, and approval require a separate integration step.

Useful references:

- [Subject expansion roadmap](docs/SUBJECT_EXPANSION_PLAN.md)
- [Practice layout contract](docs/PRACTICE_LAYOUT_CONTRACT.md)
- [Syllabus coverage and outstanding gaps](docs/SYLLABUS_COVERAGE_V2.md)
- [Generator notes and acceptance status](GENERATORS.md)
- [Previous detailed contributor guidance in Git history](https://github.com/eluyz/math-tutor-app/blob/752e51524e31b642cbae3366d5d4fae95d6f2f0e/CONTRIBUTING.md)

## Licensing

By submitting changes, you agree to contribute them under the project's [MIT License](LICENSE). Do not include copyrighted worksheet material, private course documents, or third-party assets unless their use and redistribution are authorized.
