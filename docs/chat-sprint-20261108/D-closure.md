# Chat Sprint D08 — staged smooth rational study (2026-11-08)

## Exact baseline and boundaries

- Repository: `eluyz/math-tutor-app`.
- Baseline main: `c44ef85531906c9179c529fdfc852eb0035a13b7`.
- Scoped competencies: D08 primarily, supporting D05 and D07.
- Private university material was examined locally: a source-shaped full-function study has **no real poles, one horizontal asymptote, one stationary extremum and two genuine inflection points**. The original worksheet, its answer key, and exact original expressions are not reproduced here.
- This is an independently parametrized, mathematically related candidate. **No formal SOURCE_PASS** or claim of exact source exercise replication.

## What is delivered

One isolated family in `src/university/functionStudySmoothRational.ts`:
`analysis-study-smooth-rational`, difficulty hard/advanced/expert, 24 variants per level = **72 candidate tuples**.

Parametric mathematical class, using independent parameters with q>0 and m≠0:
- `f(x)=k + m*q²/((x-a)²+q²)`.
- Domain: all real numbers; no real poles.
- Horizontal asymptote `y=k`; no vertical or oblique asymptotes.
- Symmetry about `x=a`, one stationary point `(a,k+m)`.
- First derivative `-2*m*q²*(x-a)/((x-a)²+q²)²`; sign flips at a.
- Second derivative `2*m*q²*(3*(x-a)²-q²)/((x-a)²+q²)³`; two inflections at `x=a±q/√3`, both with `y=k+3m/4`.
- Root conditions, intervals of monotonicity, convexity/concavity and qualitative paper-sketch instructions in PL/EN solution.
- Hard and advanced grade the stationary point. Expert grades global max/min on closed `[a-2q,a+2q]` using endpoints and the center. Paper sketch is self-assessed, not automatically graded.
- Correct/wrong/malformed/blank answer tests and mathematical negative parameters are included in `src/university/functionStudySmoothRational.test.ts`.

**No edits** to `src/university/catalog.ts`, `src/university/schema.ts`, `src/App.tsx`, QA registries, shared coverage documents, package files or other chapters.

## Verification and outstanding gates

Independent offline SymPy computation checked **504 exact identities** across the proposed 72 generated tuples: first derivative, second derivative, center value, two endpoint values, two inflection abscissas and ordinates. **PASS (mathematical identities).**

Until GitHub CI succeeds at this exact candidate HEAD: **Vitest/build/Playwright NOT_VERIFIED**. The candidate is not yet imported by the shared application catalog, so students cannot select it in the live app. Do not claim CI or Pages PASS before final SUCCESS.

## Integration handoff — later serialized PR, not this branch

After owner review of the candidate and independent test result, introduce a **separate integration PR**:
1. Add the new problem-kind declaration to `src/university/schema.ts` and the global `UniversityProblem` union.
2. Register a type-compatible `UniversityFamily` descriptor and localized presentation branch in `src/university/catalog.ts`. Keep the existing four D08 families unchanged.
3. Add `analysis-study-smooth-rational` to D08 in `src/competencyIndex.ts`; verify catalog search, available levels and exact total counts without changing acceptance claims.
4. Add a targeted PL/EN mobile and desktop Playwright test showing the full study prompt, sign explanations and graded coordinates. Run full GitHub Actions CI and later Pages on the exact merged SHA.
5. Compare the new method independently against source tasks **privately**, without publishing university material. Record SOURCE_PASS only after formal independent acceptance.

## Percent progress — definitions to prevent false completion

- Overall syllabus method inventory: 64/64 codes classified = **100% inventory**, not completion.
- Historical bounded coverage of generators: 14/64 = **21.9%**; remaining 50/64 partial. No conclusion can be drawn that the whole product is 21.9% complete.
- D competencies: 10/10 method status reviewed = **100% inventory**; one historically bounded and nine partial. This patch does not yet upgrade those statuses.
- D08 4-gate workstream: (1) private source shape established, (2) candidate code and independent mathematical identity checks staged, (3) CI/independent technical QA, (4) catalog integration and source/visual release acceptance. This PR completes **2/4 gates = 50% of this narrowly defined D08 workflow**, NOT 50% of all required D08 source exercises.

Refs #108
