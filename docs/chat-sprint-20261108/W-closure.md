# Chat sprint W — 2026-11-08 (bounded implementation, no merge)

## Baseline and scope
- Repository: `eluyz/math-tutor-app`.
- Base `main` SHA: `c44ef85531906c9179c529fdfc852eb0035a13b7` (2026-11-08).
- Affected skill: **W02** — 2-variable local extrema; private original source leads P43/2c, P43/2d.
- Unaffected skills: W01, W03 and all other categories. The shared `src/university/catalog.ts` is deliberately unchanged.
- This report contains no private original exercise text, formula, coefficient sets or answer-key scans.

## Demonstrated method gap and delivery
- On baseline main, W01 has 10/10 source method shapes represented (formal runtime/source QA pending).
- On baseline main, W02 has 6/8 source method shapes represented. The remaining two require finding **all 3 or all 4 real stationary points**. Their source answer key specifies extrema only, which does not invalidate omitted non-extremal saddle points.
- Existing registered family `multivar-quadratic-cubic-extrema` previously served 24 `hard` two-point variants. This PR preserves them and adds 24 **advanced** variants: 12 three-point forms (one minimum, two saddles) and 12 four-point forms (one minimum, three saddles).
- Advanced cases are **implemented and unit-tested but deliberately not enabled in `supportedDifficulties`**. The global catalog and common count assertions remain unchanged. A separately authorized integration PR must enable the level and update shared counts and docs.
- All points derived from the gradient's complete branching, including `y=0` and both nonzero roots; no divide-by-variable step drops solutions.
- Explicit exact `f`, `f_xx`, `D=det(H)`, type and ordered point coordinates, with six scored entries per point. Complete PL/EN hints and worked steps.
- Tests: all 24 staged advanced variants via the existing family's factory and presentation functions (without catalog exposure); independent gradient, Hessian and function-value substitutions; negative grading for each field, omissions, swapping; PL/EN and legacy `hard` smoke assertions.

## Verification and release constraints
- Independent offline SymPy reconstruction of all 24 authored cases: **PASS 24/24**, complete critical point sets and Hessian classifications.
- GitHub Actions targeted Vitest/build/Playwright: **not asserted as PASS until the exact PR HEAD checks complete**.
- Independent Math QA should additionally inspect a 3-point case, a 4-point case and the `y=0` branch in both locales, with correct/wrong/empty browser grading.
- Public `SOURCE_PASS`: **NOT GRANTED**. The private originals and answer key were independently checked, but end-to-end source-to-app acceptance needs exact-HEAD release evidence.
- This PR is **Draft**, with no merge approval and no auto-merge; **not STUDENT_READY until the follow-up integration is merged and verified**.

## Honest syllabus accounting
- Historical 64-skill map: 64/64 mapped = **100% mapping**, NOT completion. It labels 14/64 bounded and 50/64 partial generator coverage.
- Formal source acceptance in Issue #151: 14/64 limited-scope skills = **21.875%**, as of 2026-11-05. W01/W02/W03 are not among those 14.
- W exercise-method shapes: 16/18 verified implemented on base main = **88.9%** (W01 10/10 + W02 6/8); candidate PR covers 18/18 = **100% as a pending source-method candidate**, NOT as released or source accepted.
- W03 has working limit/continuity generators but lecture-only exam requirement is **LECTURE_SCOPE_UNCERTAIN**. Never convert that ambiguity into completed exam tasks or a fictitious numerical syllabus percentage.

## Single next gate
Independent review of this Draft PR at its final HEAD, then full GitHub CI/Playwright and owner approval to merge. **Next separate integration**: enable advanced difficulty for the existing family, update pinned global counts/README and complete browser evidence with owner approval; post-merge main CI and Pages. Complete private-source-to-application QA for W01/W02 before any SOURCE_PASS.
