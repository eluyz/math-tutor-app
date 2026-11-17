# ST-101 original PL/EN teaching — Task C

**Status: TEST ASSERTION FIXED / awaiting complete verification. The first full verification failed; see the historical stop record and maintainer checkpoint below.**

`meanCopy(values, locale)` produces a prompt, two hints, three ordered steps,
conclusion and four feedback messages. Both languages use the same dataset-derived
calculation lines: count every observation (including repeats), sum with explicit
negative signs, then divide the exact sum by n. Rational formatting reuses the
existing formatter; no decimal approximation is presented as an exact result.

Plan: specify literal whole/fractional/negative/zero examples in tests, implement
the isolated copy function, then run full Vitest and the production build before
creating the stacked Draft. No global translations or UI are edited.

Fixed witnesses: [3,2,2,1,2] gives 10/5=2; [3,3,1,16,7,13] gives 43/6;
[−5,−1,−1,3,4] gives 0/5=0; [−2,−1,0,0,0] gives −3/5. A subsequent 3/6=1/2
case checks that an earlier answer is never leaked or reused. Prompts/hints do not
reveal the fractional answer. Every numerical line, both hints, all step titles
and explanations, feedback parity and source immutability are covered in PL/EN.
Invalid source data/locales are rejected rather than receiving fabricated content.

A wrong scalar answer has many possible causes. Feedback asks learners to revisit
counting, addition and division without asserting which error occurred. Empty and
invalid input have separate messages. This function provides text only: parsing
and actual grading remain separate, using existing Rational conventions in any
future authorized UI. No integration is authorized in this B–H session.

All teaching text is original. Internal mathematical fixtures are not an external
review, formal syllabus/source acceptance, release approval or a count of variants.


## Stop record — first failed verification

Full `npm test`: **1 failed / 2520 passed**, 197 files. The new C file has
**1 failed / 5 passed**; the failing assertion is at `st101Copy.test.ts:23`.
For data [−2,−1,0,0,0], the expected text incorrectly uses an ASCII minus in
`μ = (-3)/5 = -3/5`; the existing formatter correctly returns the mathematical
minus `μ = (-3)/5 = −3/5`. The numerical result −3/5 agrees. This is an author
mistake in the new test's literal formatting expectation, not a demonstrated
arithmetic or production formatter defect. The assertion is intentionally left
unchanged in this stopped checkpoint; no test has been weakened or hidden.

Per the coordinator's explicit first-failed-test stop rule, no repair, rerun or
later task was started. Build for C is **NOT RUN** (verification script stops on
nonzero Vitest exit). C GitHub CI is **NOT RUN**. D–H are **NOT STARTED**; I is
**NOT AUTHORIZED**. Complete negative-fixture PL/EN semantic acceptance is not
claimed, because the assertion interrupted those checks.

The last passing stack is B, `46650229e94bf11c4e4321e5beac83ed8d7c9754`, Draft
[PR #320](https://github.com/eluyz/math-tutor-app/pull/320): full Vitest 2515/2515,
build PASS. A separate main-targeted verification Draft is to point exactly to
that B commit, excluding all C changes. The failing C Draft must not be merged.

Next resumed step: correct the negative-result literal to the established Unicode
format, retaining exact equality assertions; rerun full Vitest/build for C, then
continue D–H only under the owner's resumed instruction. No Mathematics, A, B,
foundation, UI, catalog, grading, storage, package or workflow changes are needed
for that formatting correction.


## Maintainer correction — 2026-11-17 (after stopped session)

- Reviewed current Draft PR #321 head and exact failing test file; confirmed the established `formatRational` emits Unicode minus U+2212 for negative fractions.
- Changed **one fixture literal only** in `src/statistics/st101Copy.test.ts`: expected mean `-3/5` → `−3/5`. Existing exact-equality tests and production formatter remain unchanged.
- The first failure above is retained as historical evidence, not the current state of the source line.
- No new `npm test`, `npm run build` or full GitHub CI success is claimed by this document. Run them on the latest HEAD before starting Task D.
- The owner authorized tasks B–H only; I and all public UI integration are still forbidden in the resumed session. No merge or production deployment.
