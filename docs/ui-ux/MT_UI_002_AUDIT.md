# MT-UI-002 — Focus Studio audit

**Decision: IMPROVE. Expert assessment: 6,5/10. Retain Focus Studio, improve the hierarchy, and complete accessibility work before extending the prototype.**

The assessment covers the available screens and code, with moderate confidence. It is not the result of user research, a WCAG certification, or approval of the entire application. No confirmed P0 was found; this does not rule out problems in untested flows. The largest obstacle is the dominance of catalog configuration over starting a short exercise, rather than the palette.

## 1. Scope and confidence

- Date: 17.11.2026. Skills were read from the then-current `main` **307276a**.
- The exact head of [PR #337](https://github.com/eluyz/math-tutor-app/pull/337) was audited: **61e5ad6859e8707dab3116abe373a76074bc3733**, in a separate detached worktree. The branch was not updated, rebased, or merged.
- Two independent assessments: A — Product Designer/UX Researcher, without detector results; B — Frontend/Accessibility/QA, with independent code analysis and the detector. Results were combined only after A was complete. Here, research means heuristic persona analysis, rather than interviews or participant usability testing.
- `npm ci`, production build, and running the actual application as a preview: **OK, HTTP 200**. The build retains the large chunk warning. The test server was stopped after the audit.
- **The sandboxed browser failed to launch.** Playwright was run with `chromiumSandbox: true`; SUID helper/crashpad error. The sandbox was not disabled and system permissions were unchanged. No shared desktop control tool was available despite the environment's declared capability. [Attempt log](mt-ui-002-evidence/browser-launch-error.txt).
- All 11 existing PR screenshots were visually inspected: before/after, catalog/exercise, and concepts. This is a **previously rendered interface**, rather than new screenshots from this audit. The author describes the “before” versions as a variant without `redesign.css`; they are not treated as an independently reproduced baseline of the entire main branch.

### Coverage matrix

| Width | Available visual material | Actual interaction in this audit |
| --- | --- | --- |
| 375 px | [catalog](screenshots/after-home-375.png), [exercise](screenshots/after-exercise-375.png), PL | not performed — sandbox |
| 390 px | [catalog](screenshots/after-home-390.png), [exercise](screenshots/after-exercise-390.png), PL | not performed — sandbox |
| 768 px | no screenshots; CSS rule analysis only | **not visually verified** |
| 1280 px | [catalog](screenshots/after-home-1280.png), [exercise](screenshots/after-exercise-1280.png), PL | not performed — sandbox |
| 1440 px | [catalog](screenshots/after-home-1440.png), [exercise](screenshots/after-exercise-1440.png), PL | not performed — sandbox |

[The author's inherited measurements](mt-ui-002-evidence/inherited-viewport-checks.json) report no horizontal overflow in PL/EN, focus, and equal buttons at four widths. They are not new findings from this audit. EN runtime behavior, 768 px, zoom, screen reader use, and complete keyboard navigation are unconfirmed.

## 2. TOP 10 priorities

**Evidence:** W — observed in a screenshot; K — confirmed in code; O — design judgment, rather than an objective defect. P0 blocks the task; P1 is a significant difficulty or AA issue; P2 is an impediment; P3 is refinement. Debt predating the PR is not attributed to the prototype as a regression.

| # | Severity / evidence | Issue, impact, and specific recommendation |
| --- | --- | --- |
| 1 | **P1 · W/K + O** | **Starting an exercise loses out to the catalog.** At [375 px](screenshots/after-home-375.png), the family list begins around y1232 and the “Zacznij…” (“Start…”) CTA around y1905; on desktop, the panel begins around y763. The first phone screen mainly shows navigation and configuration. Place a clear action to start one exercise near the title; after an exercise is selected, collapse configuration to “Zmień temat/poziom” (“Change topic/level”). Keep buttons equal within groups. |
| 2 | **P1 · W/K** | **Insufficient contrast in the small footer text.** `styles.css:358–360`: 12 px, `#718276` on `#f5f7f8` produces **3,79:1**, below 4,5:1 for normal text (WCAG 1.4.3). [View](screenshots/after-home-1440.png). This is an inherited color; the result is calculated from CSS, rather than measured from live pixels. Use a suitable muted token — here 5,81:1 — and check the result in the browser. |
| 3 | **P2 · K** | **The logo abandons the active learning session without warning.** `App.tsx:308–312` resets the exercise and answer and calls `updateSession(null)`. An accidental click may lose an unfinished session. Preserve current work or confirm abandonment. Existing behavior; the live scenario was not executed. |
| 4 | **P2 · K** | **The exam communicates “answered” poorly.** `ExamMode.tsx:239–244` includes the exercise number in the accessible name, while `exam.css:30` changes only border thickness. Add a visible marker and answered/unanswered text to the accessible name. Keep the current-exercise state separate. Existing debt; no screen reader session was performed. |
| 5 | **P2 · K** | **Reduced motion does not cover explicit JS smooth scrolling.** `App.tsx:312` sets `behavior: "smooth"`; the reduction in `redesign.css:106–107` covers CSS. Adapt this action to motion preferences. This is a remnant of an existing action, rather than a claim of an AA violation or a live observation of animation. |
| 6 | **P2 · W + O** | **Repeated levels make scanning harder.** Each of three families on [desktop](screenshots/after-home-1280.png) repeats five levels, although a level selector already appears above the list. Show a current-level summary, with full lists only for exceptions; label the group “Poziom” (“Level”). Reduce redundancy while retaining touch target sizes. |
| 7 | **P2 · W/K + O** | **Search wording assumes familiarity with the catalog.** “Rodzina zadań” (“Exercise family”), M03/D09/W03 (`locales/ui.ts:39–40`) are less direct than topic names; the end of the placeholder is not visible on a phone. Use “Szukaj tematu” (“Search topics”), e.g. “ułamki, granice, macierze” (“fractions, limits, matrices”); retain code search as an additional option. Inherited copy. |
| 8 | **P3 · W/K** | **English status in the Polish interface.** “Work in progress” appears beside Statistics in every PL screenshot. Localize the status, e.g. “W rozwoju”; preserve the explicit distinction from planned entries. This is not evidence that Statistics itself is unavailable. |
| 9 | **P3 · W/K + O** | **Microtypography adds noise.** The brand tagline is 8 px (`redesign.css:27`), and status labels are 11 px. On [mobile](screenshots/after-home-390.png), they provide little information relative to the header space they occupy. Remove the unnecessary tagline or improve readability; limit small caps. No general WCAG rule mandates a 16 px font — this is a readability judgment. |
| 10 | **P2 · W + O** | **Supporting surfaces use a different visual language.** In the [exercise](screenshots/after-exercise-1440.png), a cool card and emerald formula sit beside a cream scratchpad and legacy solution borders. In a future phase, align their tokens and button variants without changing functionality. This was explicitly deferred from the prototype's scope, rather than an unsuccessful implementation of a promised migration. |

**Important qualification for #1:** a full-page screenshot shows content order, rather than the actual viewport position after selection. `App.tsx:132–137` moves focus to the answer or title after searching. We do not claim that users must manually scroll through three screens after every exercise; a possible jump past the formula needs a live test.

## 3. Strengths and weaknesses

| Strengths — retain | Weaknesses / risks |
| --- | --- |
| Calm palette without gradients or unnecessary effects; suitable for adults. | High decision density across the screen, despite a readable local panel. |
| Equal category and subject tiles, with wrapping names instead of hiding topics in a horizontal strip. | Equal cells need not give every group the same height or prominence; the mobile layout becomes long. |
| Readable short formulas: mathematical serif is distinct from the interface's sans-serif. | No visual material for long formulas, matrices, or multi-field forms. `overflow-wrap:anywhere` needs testing with such content; the rule alone does not prove a defect. |
| Visible answer focus in screenshots; global focus, skip link, and pressed/current in code. | No fresh keyboard, zoom, or status announcement checks. |
| Supportive copy about learning from mistakes; access to scratchpad, hints, and solutions. | Legacy tokens and state semantics remain in other flows. |

Focus Studio appears more orderly than the “before” version. White cards and emerald are a fairly generic combination, but that is not inherently a drawback for a work tool. “Looks like AI” is not a measurable diagnosis; the actual issues are unnecessary configuration exposure and incomplete consistency, rather than rounded corners themselves.

## 4. Screen and state coverage

| Area | Finding and evidence limitation |
| --- | --- |
| Home and header | Visually assessed: alignment and equal cards are better; exercise entry is too low. |
| Subjects | All four entries and statuses are visually preserved. Transitions were analyzed in code; no clicking was performed. |
| Topics and difficulties | “Powtórka podstaw” (“Basics review”) and five levels were visually assessed. The larger university-level catalog and long EN copy need testing. |
| Mathematical exercise | Simple arithmetic is readable at four widths. Do not extend this conclusion to all families. |
| Answers and messages | Labels, textual outcomes, and `role=status` in `App.tsx:667–704`; matrices have row/column labels. No fresh invalid/incorrect/correct states were observed. |
| Hints and solutions | Code preserves progressive disclosure and focus movement to new headings (`solutions/SolutionPanel.tsx:103`). No screenshots of expanded states. |
| Statistics | `StatisticsPractice.tsx:62–84`: label, `aria-invalid`, persistent live region, and expanded/controls. No screenshot; visual consistency with mathematics is unconfirmed. Retaining its own styles is an explicit prototype boundary. |
| Progress | Code includes modal deletion confirmation and focus restoration (`ProgressDashboard.tsx:235–277`). Empty/saved/filtered states need rendering. |
| Exam | The answered state needs improved semantics; timer handling and the no-hints mode are preserved in code. Start, navigation, submission, and results were not tested live. |
| Mobile / typography | Four inherited widths were inspected; 768 px, zoom, touch, the on-screen keyboard, and long content remain open. |

## 5. Visual direction

[The concept comparison](screenshots/concepts.png) is a static mockup, rather than a test of two working applications.

| Criterion | Focus Studio | Editorial Academy |
| --- | --- | --- |
| Character | Calm learning tool with a clear distinction between UI and formulas. | Warmer and book-like; paper, terracotta, and serifs. |
| Dense catalog | Consistent sans-serif is a reasonable practical choice. | Heading density needs refinement; slower use of serifs has not been demonstrated. |
| Demonstrated maturity | Existing prototype, screenshots at four widths. | A simplified static concept only. |
| Decision | **Continue while improving structure.** | Retain as an alternative; do not migrate without a clear benefit. |

A third direction is currently unjustified. Changing the palette will not resolve the excess decisions before an exercise. Both mockups omit a substantial part of the actual catalog's complexity.

## 6. Plan — at most three phases, without implementation in this task

1. **Hierarchy and safe entry.** Shorten the mobile entry, emphasize one short exercise, reduce level redundancy, and simplify search wording. Preserve access to all subjects and topics. Agree on catalog behavior after entering an exercise; retain existing focus and work state.
2. **Accessibility and consistent components.** Fix footer contrast, answered-state communication, reduced motion, and unfinished-session protection. Gradually move the scratchpad, solutions, and remaining screens onto the approved tokens. Do not rebuild mathematics or statistics, and do not add a UI library solely for appearance.
3. **Acceptance gate.** In a working sandboxed browser, check 375/390/768/1280/1440 in PL/EN: home, university-level catalog, short and long formulas, a matrix, empty/incorrect/correct answers, hints, solutions, scratchpad, Statistics, progress, and exam. Include screenshots, 200%/400% reflow, Tab/Shift+Tab/Enter/Escape, skip/focus, screen reader checks, contrast in all states, and absence of document overflow. Run the required tests and a short task-based test with adult/returning users. Do not assign ACCEPT to the entire application before this gate is met.

Hierarchy acceptance criterion: a person starting to learn finds the first-exercise action without browsing the entire catalog; after selecting it, they see the question context, answer, and help without a disorienting jump. Define the precise time/click measure through testing, rather than deriving it from a screenshot.

## 7. Skills used and evidence checks

- **UI UX Pro Max:** read `SKILL.md` and the review checklist; local searches for “focus not obscured”, “error summary validation”, and “minimalism functional workspace”. Applied interaction, hierarchy, and approved-system criteria; an automatic style proposal was not adopted as a design decision.
- **Impeccable:** read instructions, `context` for the PR checkout, critique/rubric and audit; independent Assessment A/B; source detector. **5 warnings, 0 errors**, exit 2: four `side-tab` findings and Arial in legacy `styles.css`. Arial is overridden, and question/feedback borders serve a purpose. These warnings are not considered evidence of “AI design” or a blocker. [Detector result](mt-ui-002-evidence/impeccable-detector.json).
- **Vercel Web Design Guidelines:** read the skill and fetched [the current rules used for the audit](mt-ui-002-evidence/vercel-guidelines-used.md); applied them to contrast, navigation, state, motion, and forms.
- **Superpowers:** available in the host; used `using-superpowers` and the verification-before-completion principle: independent evidence, separate scopes, and no claims for tests that were not run.
- Token contrast was independently recalculated: text/white 14,65:1, muted/background 5,81:1, accent/white 7,18:1, focus/white 6,00:1. These are selected pairs, rather than an audit of all states.

The earlier 78+15 test results and 2603 unit tests in the PR description are the author's report; they are not presented as this audit's own run. This task performed installation, build, a sandboxed-browser launch test, an HTTP preview check, detector execution, and source/screenshot analysis. No new E2E test, overlay, or live measurements were performed. [Build](mt-ui-002-evidence/audit-build.log), [source PR screenshots](screenshots/).

Code references point to [the immutable PR tree](https://github.com/eluyz/math-tutor-app/tree/61e5ad6859e8707dab3116abe373a76074bc3733/src). Line numbers in this report refer to that revision. The original MT-UI-002 report was produced locally without GitHub changes; it was retained as a reference point in the MT-UI-003 sprint. Implementation of the fixes had not started.
