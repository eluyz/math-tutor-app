# W02 nonlinear follow-up — unimplemented method profiles

## Source boundary

The descriptions/point counts for profiles 2c and 2d come from Issue #185. No original private equation/key has been inspected in this session. They do not uniquely determine a polynomial. **The models below are authored design proposals, not transcriptions or inferred original equations.** Direct source-method matching remains BLOCKED_SOURCE. Do not publish private numerical data, close #108/#185 or change the formal 14/64 count.

Batch 3 implements only the shared 2f/2h elimination method. It does not implement either proposal below. Existing quadratic stationary tasks, the coupled-cubic family, supplied-point Hessian tests and constrained rectangle/disk optimizers cannot certify these larger point sets.

## Next bounded package A: three critical points, one minimum and two saddles

Priority P1. First compare the actual source's monomial/branch structure privately; if it matches this method, use one controlled mixed-cubic family, not a general nonlinear solver.

An authored model is

`F(x,y)=(α+βy)x²+δy²+εy+o`, with `δ>0`, `β≠0` and `T=2δα−βε=β²t²>0`, `t>0` rational.

Full gradient: `F_x=2x(α+βy)`, `F_y=βx²+2δy+ε`. Keep BOTH branches of the first equation:

- `x=0` gives `Q=(0,−ε/(2δ))`.
- `y=−α/β` gives `x²=T/β²=t²`, hence `S±=(±t,−α/β)`.

These are exactly three distinct points. No division by x is permitted before preserving x=0.

`H=[[2(α+βy),2βx],[2βx,2δ]]`. At Q, `F_xx=T/δ>0` and `D=2T>0`: strict local minimum with `F(Q)=o−ε²/(4δ)`. At either S, `D=−4β²t²<0`: saddles. The branch proof plus Fermat's condition proves no other local extrema. This is a full mathematical proposal; its alignment with the private 2c equation is not established.

Deliverable: 24 rational variants only after confirming the source method. Grade every point/classification and the minimum value using ordered row fields; explicitly state the order. Independent TS factor/branch enumeration and SymPy must recover the complete three-point set. Include x=0, signed/mixed coefficients, PL/EN, both hints/all steps, wrong/blank grading and 375/1280 production Chromium. Do not grade a multiset of unrelated scalar coordinates as if it represented an unordered point set.

## Subsequent bounded package B: four critical points and a branch that vanishes

Priority P1 after package A. Confirm the private method before choosing coefficients.

An authored model is

`G(x,y)=αx³+βxy²+γx²+δx+o`, with rational `α<0`, `0<r<s`, `t>0`, `γ=−3α(r+s)/2`, `δ=3αrs<0`, `β=−δ/t²>0`.

Full gradient: `G_x=3αx²+βy²+2γx+δ`, `G_y=2βxy`. Preserve BOTH branches:

- `y=0`: `3α(x−r)(x−s)=0`, giving R=(r,0), S=(s,0).
- `x=0`: `βy²+δ=0`, giving T±=(0,±t).

All four are distinct, and the factor branches exhaust the system. `H=[[6αx+2γ,2βy],[2βy,2βx]]`. At R, `G_xx=3α(r−s)>0`, `D=6αβr(r−s)>0`: strict minimum with value `o+αr²(3s−r)/2`. At S, `D=6αβs(s−r)<0`: saddle. At T±, `D=−4β²t²<0`: two more saddles. No other extrema exist. These are synthetic design conditions, not a claim about the original 2d coefficients.

Deliverable: one 24-variant family only if the source-method review confirms the need. Keep the x=0 branch before dividing, grade/classify all four points, independently solve both factor branches, verify original gradients and Hessians, and test PL/EN/mobile/desktop. Keep D=0 cases outside this nondegenerate contract; a degenerate case requires a separate proof, never an automatic no-extremum verdict.

## Common review and representation gate

Existing fixed-size `multi-choice` fields can grade a controlled known-size rational point set with a stated canonical order, as demonstrated by Batch 3. They do not provide arbitrary symbolic coordinate entry, unordered point-row matching, irrational critical sets or stationary continua. Do not add a CAS engine to solve those unrelated generalizations. The original source gate must decide which forms are actually required.

PR #186 supplies a different two-point coupled-cubic method. PR #189 independently supplies quadratic minimum-value and bilinear no-extremum grading. Preserve those changes when integrating future packages; never edit their branches or conflate them with three/four-point branch enumeration.

Both authored proposal systems are additionally checked symbolically by `scripts/qa/w02_batch3_sympy.py`: full solution-set enumeration, gradient substitution, Hessian signs and minimum-value identities. This verifies the proposals themselves, not their correspondence with private originals. Results are included under `followup_proposals` in the CAS evidence.
