# Math Tutor — Canonical practice layout contract

**Status:** Draft implementation review. No merge or deployment claim.

## One shared interface (all playable subjects)

This contract applies to Mathematics and Statistics today and is required for
any future Econometrics or Financial Mathematics lesson.

1. Common subject navigation with PL/EN and truthful subject statuses.
2. Subject heading/intro. Lesson title lives inside the exercise card.
3. **Active exercise in one full-width card, never beside a category sidebar.**
4. One `PracticeSelectorPanel` below the exercise, with the same summary,
   layout, spacing, track buttons, category buttons and difficulty buttons.
   Subject-specific search, family selection or session actions live inside
   this panel, **never in a right-hand column**.
5. Planned, unavailable lessons show truthful copy and usable navigation, but no
   simulated exercise, grading or fake active controls.

A Mathematics exercise can require multiple input fields or mathematical
diagrams, while Statistics may require one exact result; the *structure and
position* of navigation, exercise and controls stay the same.

## Invariants

- Track switches do not jump the page; explicit next exercise may focus its
  answer. Keep keyboard and visible focus intact.
- Unsubmitted answers, Mathematics sessions, exam locks and local progress must
  not be discarded without the existing confirmation policy.
- Keep exact mathematical generators and grading untouched.
- On 375/390/768/1280px and PL/EN, both task cards have equal width and left
  alignment, and selector panels occur below them. No horizontal overflow.
- Progress dashboards and exams are distinct workflows, not lesson-selector
  pages. They retain the same global navigation/theme but keep their
  appropriate workflow-specific UI.
- No lesson-specific CSS reorders focus or DOM independently of this contract.

## Acceptance

Playwright `e2e/shared-practice-layout.spec.ts` and
`e2e/statistics-task-first-layout.spec.ts` validate placement. Existing
browser suites and exact-head Vitest/build/Batch B–G must pass before release.
Maintainer approval, main CI and Pages verification are separate gates.

**ST-103** is a separate draft PR #340. Integrate it only after both PRs pass
on their own heads and the combined branch is independently verified.
