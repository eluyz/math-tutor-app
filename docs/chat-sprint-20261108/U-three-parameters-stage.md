# U06/U08 — staged 4×5 Gaussian system with three free parameters

## Scope and status
- **STAGING ONLY**: `gaussThreeParameters.ts` exports one candidate `gauss-five-three-parameters` family and an isolated presenter; it is **not registered** in `src/university/catalog.ts` or any student-facing picker. It must not increase production-family or variant counts.
- The source-form gap was observed in the owner's **private** P12 exercise/answer materials: five unknowns, `rank(A)=rank([A|b])=2`, hence `5−2=3` free parameters. The original worksheet equation coefficients and key remain **private** and are not copied into the repo.
- This is independently constructed **synthetic METHOD evidence**, **not SOURCE_PASS** and not proof that all original P12 forms are implemented.
- Separate prior U08 teaching-text fix: Draft PR #233; do not modify or merge #233 as part of this staging PR.

## Method
- 4 original equations, 5 unknowns; exact rational arithmetic only.
- Two independent echelon rows generate all four augmented equations by invertible mixing and dependent combinations; full augmented rank remains 2 and the system remains consistent.
- Four pivot patterns include free columns before a pivot. `hard`, `advanced`, `expert`: 24 variants each, **72 staging candidates**.
- Presenter computes full RREF and all five affine expressions `c + a·t1 + b·t2 + d·t3`, with **20 graded values** and explicit validation of all four original equations, both for the constant and each individual free-parameter coefficient.
- Exact PL/EN prompts, hints, row operations and verified original-equation substitutions.
- Independence: test-only 2×2/3×3/4×4 minor rank and independent 2×2 Cramer reconstruction of all 20 coefficients; zero reliance on production `classifySystem`, RREF or answer key for expected values. Negative/invalid grading also checked.

## Deferred integration prerequisites
1. Independent code, mathematics, localization and grading review for this exact staged PR SHA; full GitHub CI PASS.
2. Separate controlled integration PR for catalog/renderer registration, preserving all frozen PL/EN historical hashes, app/category selection, and mobile Chromium acceptance.
3. A future **separate source-form audit** against the private original P12 problem and key before granting U06/U08 `SOURCE_PASS`. Synthetic METHOD correctness is narrower.
4. Owner approval required for each merge. No auto-merge.

## Known limits
- Only 4×5 consistent rank-two systems are staged. The original source's other 5-unknown equation counts and the independent U04 five-unknown equalities and U07 4×3 full-answer gaps remain outside this PR.
- This code path is deliberately not called from the existing production `presentGaussParameters` routine (which supports 1–2 parameters). It is a candidate for future controlled dispatch, not a silent legacy behavior change.
