# W01 — source-shaped rational function partials

## Private source review and scope

Original privately supplied P43 tasks and answer key were inspected. Four structural methods (1b,1d,1h,1i) require bivariate rational differentiation: a polynomial plus an inverse-cubic term, a nonconstant linear-fractional quotient, a simple variable quotient, and a bilinear-over-linear quotient. **No source coefficients, exercise texts, scans or key formulas are included here.** All variants use newly authored synthetic integer parameters.

The new family `multivar-rational-partial` has four modes × six target partials (`x,y,xx,xy,yx,yy`) = **24 distinct hard variants**. Answers are **functions** represented by exact coefficients in a declared independent basis; they are not values at points and they are not freely parsed algebraic strings.

## Domains and mathematical method

| Mode | Synthetic method | Domain |
| --- | --- | --- |
| inverse-cubic | polynomial + inverse cubic term | `y != 0` |
| linear-quotient | independent linear forms, determinant nonzero | `cx+dy != 0` |
| simple-quotient | one variable divided by the other | `x != 0` |
| bilinear-quotient | bilinear numerator, nontrivial linear denominator | `bx-cy != 0` |

Every lesson shows `f=N/v^m`, real domain, inner partials of N and v, two applications of the quotient rule and a selected, expanded function-basis result, with localized PL/EN hints:

`A_i=N_i v−m N v_i`,
`f_i=A_i/v^(m+1)`,
`f_ij=((A_i)_j v−(m+1)A_i v_j)/v^(m+2)`.

Mixed derivatives commute on the open domain. A zero second y derivative in the simple quotient is explicitly represented as a zero coefficient of the constant function `1`. For the linear quotient, the positive parameter determinant prevents degeneration into a constant and makes the two-term mixed-derivative basis unique.

## Independent QA and release boundaries

The independent `src/qa/w01Rational.ts` oracle symbolically differentiates a numerator over a power of a linear denominator using sparse-polynomial arithmetic, then solves an exact-integer coefficient problem after clearing denominators; it **never calls production coefficient functions or reads the answer data**.

Unit checks: 24/24 modes/targets × both locales, answer validation for correct/wrong/empty, seven teaching steps, denominator-domain restriction, language and mixed symmetry. Browser acceptance: 12 pinned variants selected across all four shapes at PL/EN × 375/1280 px (48 witnesses), including actual production answer grading, full solutions and error/overflow checks. **Do not mark PASS until final-head GitHub Actions completes successfully**, including standard Playwright and Batch B–G.

This is a bounded method package, not a general CAS. Overall W01 remains METHOD_PARTIAL and SOURCE_NOT_VERIFIED pending actual source-to-app acceptance; global SOURCE_PASS **14/64 unchanged**. Keep #106 paused, #142 unmerged, and #108 open. No merge or auto-merge without owner's separate exact-HEAD authorization. The original P43 answer key has separately documented mathematical errors in 1g and 1j, so independent derivation remains mandatory.
