# W02 Batch 3 — exact nonlinear elimination and complete critical-point grading

## Baseline and isolation

Started from fetched main `90342d10118b2a66bc764cb3ebeba2b42fc1e99b`, the merge of PR #186. Its CI was IN_PROGRESS at the initial check, so no baseline SUCCESS was inferred. PR #189 was OPEN/Draft at `6732d52c4770a96250c58ff280a33b01167b8955`; none of its unmerged files were used or copied. Work is isolated on `feature/w02-nonlinear-elimination`. Issues #108/#185 were read; #106, #142, old PR branches, formal counters and merge/auto-merge settings are untouched.

No private original equation or key was read in this session. A bounded workspace PDF filename search found none. Issue #185 describes point structures and method classes; it does not provide enough information to reconstruct all original polynomials. **This is synthetic METHOD evidence, not SOURCE_PASS. W02 overall remains METHOD_PARTIAL / BLOCKED_SOURCE; formal 14/64 is unchanged.**

## Four-profile audit and selection

| Profile | Required method known from public descriptions | Existing implementation | Actual gap/action | Status in this package |
| --- | --- | --- | --- | --- |
| 2c | Nonlinear minimum plus two saddles; exact monomials not specified | Quadratic, coupled-cubic and supplied-point Hessian families do not enumerate three points | Need branch/factor completeness for three candidates; private monomial comparison first | METHOD_GAP; separate authored proposal/plan |
| 2d | Cubic with mixed term, minimum plus three saddles | Existing coupled-cubic family has exactly two points | Need four-candidate enumeration without dividing away a zero-factor branch | METHOD_GAP; separate authored proposal/plan |
| 2f | x-quadratic/y-cubic with xy coupling, minimum+saddle | Coupled-cubic family instead has x³ and y³; differentiation-only W01 families do not solve stationarity | Implement linear elimination followed by an exact quadratic; positive x curvature | METHOD_PASS within the controlled family; BLOCKED_SOURCE |
| 2h | Same structural class, maximum+saddle | Same gap | Negative x curvature is an orientation of the same method, not a second family | METHOD_PASS within the controlled family; BLOCKED_SOURCE |

**One new family**, `multivar-quadratic-cubic-extrema:hard:0..23`, 24 distinct authored tasks: 12 minimum+saddle and 12 maximum+saddle. Before/after on the starting base: **238→239 families, 18,261→18,285 variants**. No redundant cubic/quadratic/bilinear family, generic CAS, new answer type, UI refactor, dependency or workflow change. Existing constrained global optimizers and quartic D=0 classification stay separate.

Remaining profiles are planned separately in [W02_NONLINEAR_FOLLOWUP_PLAN.md](W02_NONLINEAR_FOLLOWUP_PLAN.md), including full gradients, branch conditions, complete point sets, Hessians, extremum values and acceptance criteria for explicitly authored proposals. Those proposals are not guesses of the private 2c/2d equations and are not implemented here. Separate symbolic checks enumerate their full three/four-point sets and verify Hessian signs and minimum values; their source alignment is explicitly UNVERIFIED.

## Exact mathematics

The implemented original function is `f=a x²+bxy+c y³+d y²+e y+o`, with nonzero a,b,c on R². All partials exist everywhere:

`f_x=2ax+by`, `f_y=bx+3cy²+2dy+e`.

Divide only by the constant `2a≠0`: `x=−by/(2a)`. The remaining equation is exactly

`q(y)=3cy²+(2d−b²/(2a))y+e=0`.

Generation chooses two different rational numbers r<s and sets `d=b²/(4a)−3c(r+s)/2`, `e=3crs`. Only the expanded original coefficients are stored, not r/s or critical points. Then `q(y)=3c(y−r)(y−s)`, whose discriminant `9c²(r−s)²` is strictly positive. It has exactly two real roots; each has exactly one x. This proves completeness, including the ten generated critical points with zero coordinates. No division by a variable occurs.

`H=[[2a,b],[b,6cy+2d]]`, `D(y)=6ac(2y−r−s)`. The determinants at r and s are nonzero and have opposite signs. The D<0 point is a saddle. The D>0 point is a strict minimum for a>0 or maximum for a<0. Original-function substitution yields exact values at BOTH points. Alternatively completing the square gives `a(x+by/(2a))²+c y³+(d−b²/(4a))y²+e y+o`; the Schur-complement curvature explains the same determinant test. Fermat's necessary condition excludes other local extrema because the complete stationary set is exhausted on the open domain R². D=0 is explicitly described as inconclusive and rejected as outside this two-root contract, never classified as no extremum.

## Teaching and answer representation

Twelve working steps show original function/domain, full gradient, valid constant elimination, reduced quadratic, discriminant and exact root formula, complete point set, full Hessian function, both evaluated Hessians/determinants/classifications, both function values and final completeness conclusion. Both hints identify the elimination and retain both roots. PL and EN use authored explanatory text. A saddle's function value is explicitly distinguished from an extremal value.

Existing `multi-choice` fields grade ten exact answers: x,y,f,D and type for each point. Canonical order `y₁<y₂` is stated in both questions. Both coordinates, function values and determinant fractions are independently expected values; classification offers minimum, maximum, saddle and inconclusive. Numeric choices are rotated, and each wrong/omitted field is checked. Reversing rows is rejected under the stated order (invalid if the swapped value is not a legal option, otherwise incorrect). This is bounded exact-choice grading, not arbitrary symbolic input or a general unordered point-set grader.

## Independent audits

**TypeScript:** `src/qa/w02NonlinearOracle.ts` builds the original monomial polynomial, reuses existing test-only formal dx/dy/evaluation, eliminates x by substituting into independently differentiated terms, and uses the rational-root theorem on integer-scaled coefficients. It does NOT call the production solver, quadratic-root/square-root helpers, read correct-answer fields, hints, solution steps or stored critical coordinates. Finding two distinct roots and reconstructing all quadratic coefficients proves exhaustiveness. Both original gradient equations, all Hessian entries/mixed agreement, determinant, classification and original function value are checked at every point.

**SymPy:** `scripts/qa/w02_batch3_sympy.py` reconstructs each original polynomial, differentiates it, solves the full system, compares the complete sorted solution set and checks every Hessian entry/determinant/classification/value against the TypeScript certificate. **24/24 tasks and 48/48 points PASS: 12 minima, 12 maxima, 24 saddles, including 10 points with zero coordinates.** Result: `docs/qa-w02-batch3/sympy-results.json`. Run the new Vitest audit first to export `/tmp/w02-batch3-symbolic-input.json`, then the Python script; SymPy 1.14.0 was already installed, no application dependency added.

Unit tests cover all 24 variants × both languages, all 12 working actions against independent mathematical certificates, both hints, exact answer labels, correct/wrong/empty and every omitted field, final answer and absence of Polish learning text in EN. Existing Hessian/quartic/global-extrema/coupled-cubic regressions are retained. An initial test-only assumption that all swapped dropdown values were selectable was corrected to assert the exact valid/invalid contract, rather than accepting a wrong grade. The global locale regression also caught missing central English field/option mappings; explicit mappings were added while preserving the equality assertion. Unused test imports were removed after the first TypeScript check. No existing mathematical assertion or test was disabled or relaxed.

Production Chromium pins `0,1,4,5,8,9,12,13` in PL/EN at 375 and 1280 px: eight distinct tasks, 32 witnesses across four scenarios. The unchanged common browser runner verifies actual blank/wrong/correct feedback, both hints, all rendered steps/reasons, final answer, console/page/request/HTTP errors and document overflow. A local adapter supplies independently computed exact option values, and the inspector verifies each selected point classification. Production config: `playwright.w02-nonlinear.config.ts`.

## Integration and final validation

Minimal shared changes register the family/type, add its catalog row and update current counts by +1/+24. Historical cohorts remain fixed and explicitly exclude the new family; existing assertions are preserved. `e2e/helpers/acceptance.ts`, all workflows/timeouts, Pages and unrelated source families are unchanged. The default browser suite also picks up the new spec; remote CI runs its standard suite and production B–G. Batch H and W01/W02 existing specs remain in the standard suite.

PR #189 may subsequently change the same catalog/schema/current-count files. This independent branch must retain its quadratic advanced and bilinear changes after that PR is separately approved/merged, preserve the existing coupled-cubic family, and derive combined counts from `taskPool`. Do not edit #189 or reuse its unmerged branch. Any update of this branch's code requires CI for the new exact HEAD.

Compact local result records, witnesses and source SHA-256 values are in `docs/qa-w02-batch3/local-results.json`. Final delivery HEAD and terminal GitHub Actions evidence are recorded in the Draft PR validation section, avoiding a self-referential report commit hash. No full source-worksheet acceptance, issue closure, global audit, custom-input implementation or automatic next package is authorized by this work.


Local results at implementation commit `e19bc8fb6e111a584985f6349e5a21fe054ebdcb`: **138 files / 1,715 unit tests PASS**, TypeScript/production build PASS, production Chromium **4/4 scenarios / 32 witnesses PASS**, PL/EN at 375/1280 px, with no console/page/request/HTTP/overflow errors. Targeted W02 regressions passed 21/21; focused locale/new-family regression passed 255/255. SymPy passed all 24 tasks / 48 points and both explicitly authored follow-up proposal identities. No existing mathematical defect was found within the inspected W02 methods. Existing bundle-size advisory remains.

The subsequent delivery commit contains only reports/evidence. Its exact final SHA, terminal CI URL and standard/B–G counts are recorded in the Draft PR, rather than claiming unobserved remote success here or embedding a self-referential commit hash. Raw generated browser/screenshot JSON is excluded from Git; compact witnesses and SHA-256 digests are retained.

Verdict: **READY_FOR_OWNER_REVIEW for the bounded 2f/2h method once exact-head full CI is verified.** Formal original-source acceptance remains BLOCKED_SOURCE, and W02 overall METHOD_PARTIAL. No merge or automatic next package.
