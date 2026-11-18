# MT-UI-001 — UI/UX audit

Historical documentation of the prototype before MT-UI-003. The screenshots and
results below describe that version. See
[MT_UI_003_NIGHT_LOG.md](MT_UI_003_NIGHT_LOG.md) for subsequent changes and
verification limitations.

Scope: `src/App.tsx`, `src/styles.css`, progress/exam modules, localization, and existing tests. Final baseline: the then-current main `d62424a` (fetched before the final implementation). A heuristic code and browser audit, rather than user research.

| Priority | Area / evidence | Issue and recommendation |
| --- | --- | --- |
| P1 | Home: `.practice`, heading and navigation | The then-current main already has a compact entry without a hero; retain this direction and improve the hierarchy. |
| P1 | Navigation: `App.tsx`, `.view-navigation` | The header and detached mode bar do not form a unified hierarchy; align them along a common axis. |
| P1 | Subjects | Mathematics and the Statistics pilot are available; Econometrics and Financial Mathematics lead to roadmaps. Retain all four entries and their explicit statuses. |
| P1 | `.category-picker` | A single horizontally scrolling row hides topics; use a wrapping grid with equal heights and spacing. |
| P1 | `.exercise-item` | Large serif labels and 114 px rows make scanning harder; use a compact, readable catalog with a clear active state. |
| P1 | Mobile | Subject tiles and scrolling topics use different layouts; organize them into equal columns and retain a compact entry. |
| P1 | Accessibility | No skip link; focus is defined for only some controls. Add global focus styles, including select/summary/textarea, and reduced motion support. |
| P2 | Typography / buttons | A mixture of serifs, small caps, and different corner radii; introduce shared tokens and a single scale. |
| P2 | Forms and hints | Good labels, statuses, feedback, and progressive hints already exist; retain them and improve the visual hierarchy. |
| P2 | Formulas | Native text, Unicode, and dedicated table/SVG renderers. Do not introduce a new engine; check long content and local scrolling. |
| P2 | Progress / exam | Separate components and safeguards already exist. Preserve features and data; undertake a full redesign only after prototype approval. |

## Before / after

Screenshots are in `screenshots/`. Measurements at four widths: [viewport-checks.json](viewport-checks.json). All reported no horizontal document scrolling in PL/EN, a working skip link and answer focus, and equal topic heights (59,69 px on mobile, 48 px on desktop). Formulas remain text and dedicated tables/SVG; the prototype does not migrate to LaTeX.

## Review material

| View | Before | After |
| --- | --- | --- |
| Mobile 375 | [before](screenshots/before-375.png) | [catalog](screenshots/after-home-375.png), [exercise](screenshots/after-exercise-375.png) |
| Desktop 1440 | [before](screenshots/before-1440.png) | [catalog](screenshots/after-home-1440.png), [exercise](screenshots/after-exercise-1440.png) |
| Mobile 390 | — | [catalog](screenshots/after-home-390.png), [exercise](screenshots/after-exercise-390.png) |
| Desktop 1280 | — | [catalog](screenshots/after-home-1280.png), [exercise](screenshots/after-exercise-1280.png) |

The “before” screenshots show the then-current main baseline without the `redesign.css` layer; “after” shows the same application with the prototype. Two static concepts: [CONCEPTS.html](CONCEPTS.html).

## Implementation review

An independent code review identified issues that were corrected: an insufficiently specific focus selector (`:where` replaced with `:is`), potential clipping of the list region outline (inset focus), and an imprecise description of the shared shell's effect on other views. React changes consist of a skip link, a focus target container, a scope class, and decorative symbols; handlers and state are unchanged.

## Tests — scope and limitations

- The production build passes; the large chunk warning remains (over 500 kB). Bundle splitting is outside this prototype's scope.
- Playwright: 78/78 acceptance tests (`ui-redesign`, `compact-practice-entry`, `subject-roadmap`, `statistics-practice`, `practice-navigation`, `localization`, `local-progress`) and 15/15 `exam.spec.ts`, using system Chromium and one worker.
- A full local `npm run test:e2e` was started but interrupted because unit tests were sharing 2 CPUs; no full-suite pass is claimed. The existing CI workflow runs the full suite on the PR.
- React duplicate-key warnings appeared during existing progress test scenarios; the tests pass. Progress logic was unchanged.
- Initial full Vitest run: 2602/2603; `src/catalogSearch.test.ts:78` exceeded 5 s under concurrent load. An isolated rerun of that file passed 7/7. The final full run with one worker and a 30 s timeout is reported below. Repository timeout settings were unchanged.

Final full Vitest run: **202/202 files, 2603/2603 tests** (`npm test -- --maxWorkers=1 --testTimeout=30000`, 217,54 s).
