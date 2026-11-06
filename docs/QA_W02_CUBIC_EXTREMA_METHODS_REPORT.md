# W02 — complete source-shaped cubic local-extremum method

## Scope and source-confidence

The owner's private P43/2b and P43/2g exercises were independently inspected. Each cubic has two real stationary points: a saddle at the origin and one strict nonzero local maximum or minimum. The original answer key correctly lists the local extrema; it does not enumerate saddles (consistent with the worksheet's extrema-only request). Neither original formula nor coefficients are copied here.

The bounded `multivar-cubic-extrema-full` family uses synthetic functions `a(x³+s y³)+3akxy`, `a∈{−3,−2,2,3}`, `k∈{2,3,4}`, `s∈{−1,1}`, yielding 24 tasks at the hard level. Coefficients are intentionally distinct from original source values.

## Complete stationarity and Hessian witness

Both gradient equations are solved. The x derivative yields `y=−x²/k`; substitution into the y derivative yields `x(s x³+k³)=0`. The **two and only two** real stationary points are `(0,0)` and `(−s k,−k)`. The origin has `det(H)=−9a²k²<0` (saddle). The nonzero point has `det(H)=27a²k²>0`; `f_xx=−6sak` determines strict minimum or maximum. Its value is `f= s a k³`.

The student must provide the exact local extremum coordinates and value in a three-field `list` answer. Labels adapt to minimum vs maximum. The 9-step PL/EN solution explicitly rejects the saddle, solves the entire stationary system and validates both Hessian determinants. No general nonlinear optimizer or arbitrary symbolic parser is claimed.

## Independent tests

`src/qa/w02CubicExtremaOracle.ts` independently enumerates real candidates from the factored stationarity equation, recomputes **both original gradient equations** and evaluates the Hessian at both points. It does not read production answer or closed-form coefficient functions. All 24 variants are tested in PL/EN for two stationary solutions, valid signs, correct/wrong/empty inputs, bilingual steps and no Polish leakage. Browser witnesses pin 12 variants × PL/EN × 375/1280px; standard CI plus production-bundle acceptance B–G must pass on exact final HEAD.

**Candidate only:** this source method is **W02 partial coverage**, not complete W02 or new global SOURCE_PASS. The other source forms 2a,2c–f,2h require separate witnesses. Issue #108 remains open, #106 paused, #142 frozen. No merge without owner's exact-head authorization, followed by same-commit main CI and Pages.
