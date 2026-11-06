# W01 — controlled bivariate trigonometric partials

## Baseline and bounded original-method comparison

Based on independently inspected, owner-provided private P43 (tasks) and the associated private answer-key PDF. The original worksheet includes **squared sine of a linear form** and **cosine of a bivariate product with a squared variable**. We verified the derivative rules and answer forms without copying original coefficients, scans or results into this repository. Private source material stays outside git.

The candidate implements two **synthetic source-shaped method classes** (not replicas of original worksheet numbers): `sin²(ax+by)` and `cos(kxy²)` with independently authored varying integer parameters. Each supports x, y, xx, xy, yx, yy symbolic partials. The selected answer is represented as coefficients of explicitly stated independent function basis terms rather than the value at a point. The family is bounded to 24 variants at the hard level.

This is **METHOD_PASS for the two controlled source-shaped classes**, not full W01 or whole-worksheet SOURCE_PASS. Polynomial quotients, variable powers, and remaining original forms require separate release and exact-source review.

## Mathematics and teaching

The chain/product identities are:
- Squared sine: `f_i = sin(2u)u_i`, `f_ij = 2cos(2u)u_i u_j + sin(2u)u_ij`.
- Cosine: `f_i = -sin(u)u_i`, `f_ij = -cos(u)u_i u_j - sin(u)u_ij`.

The polynomial inner expressions are smooth on all of R², so derivatives commute. Exact rational-coefficient answers and bilingual PL/EN worked solutions include inner first/second derivatives, domains and the second chain/product term (especially for the nonzero mixed and yy inner derivative of the cosine case).

## Independent verification

The isolated `src/qa/w01Trig.ts` oracle does **sparse polynomial differentiation and multiplication** (independent of production coefficient switching), including checking that no residual monomials were discarded. The focused Vitest runs all 24 tasks in both languages, validates correct/incorrect/empty answers, each teaching step and f_xy=f_yx. Production-bundle Playwright pins all 12 mode/target pairs in PL/EN at 375/1280 widths, with correct/wrong/blank UI cases and page/console/HTTP checks. These tests must be run by CI before merge.

**Release and governance:** draft PR only; final-head CI must pass; owner must separately approve Squash merge at the exact final HEAD; same-commit main CI/Pages required after merge. No change to #151 14/64 SOURCE_PASS, #106 paused, #142 unchanged.
