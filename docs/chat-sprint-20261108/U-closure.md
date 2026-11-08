# CHAT-SPRINT-U — U01–U08 closure (2026-11-08)

## Snapshot and restrictions
- Baseline production main: `c44ef85531906c9179c529fdfc852eb0035a13b7` (2026-11-08).
- Scope: only systems / Cramer / Gauss, IDs U01–U08. No shared catalog, QA registry or syllabus-map edits.
- Existing open PRs inspected for overlapping files: #199 (QA inventory) and #231 (automation/credit saver); neither changes U source modules.
- Private P12 task and answer PDFs were inspected *locally only* from the owner's supplied archive. **No worksheet text, matrices, numbers, scans or answer key are committed here.**
- `SOURCE_PASS` is not being granted by this sprint; bounded SOURCE_PASS claims for U02/U05 predate it (Issue #151). Existing CI test source is evidence of test design, not proof of a new successful run.

## Coverage / status at baseline

| ID | Exam skill | Registered main family IDs (examples) | Status | Future work |
| --- | --- | --- | --- | --- |
| U01 | Cramer applicability and D=0 | `cramer-applicability`, `cramer-four-forced-pivot` | BOUNDED_METHOD, SOURCE_REVIEW_PENDING | Compare all source input shapes; do not infer inconsistency solely from D=0 |
| U02 | Cramer 3×3 | `system-cramer-three`, `cramer-eligibility-solve-three` | IMPLEMENTED, HISTORICAL_SCOPED_SOURCE_PASS | No duplicate generator; any additional full-form audit later |
| U03 | Cramer 4×4, D and D1–D4, D=0 | `cramer-four`, `cramer-four-singular-minors`, `cramer-four-forced-pivot` | BOUNDED_METHOD, SOURCE_REVIEW_PENDING | Independent source sample 4×4 D and four column minors cross-checked; full source QA later |
| U04 | Five equalities, requested unknown | `system-chain-five`, `system-substitution` | BOUNDED_METHOD, SOURCE_REVIEW_PENDING | Confirm source-to-generator breadth; nonlinear forms not generalized |
| U05 | Solution count from supplied ranks | `capelli-given-ranks`, `capelli-free-parameters` | IMPLEMENTED, HISTORICAL_SCOPED_SOURCE_PASS | No duplicate generator |
| U06 | Calculate ranks and classify | `capelli-matrices`, `gauss-four-dependent-diagnostic`, `gauss-five-3x5` | PARTIAL, CONFIRMED_SOURCE_GAP | A source 5-unknown consistent rank-2 example requires counting 3 parameters |
| U07 | Gauss, unique solution and row swaps | `gauss-unique`, `gauss-four-forced-pivot` | BOUNDED_METHOD, SOURCE_REVIEW_PENDING | Source examples of unique solutions checked independently, but not all grading cases |
| U08 | Gauss: 1–2 parameters and contradiction | `gauss-parameters-one`, `gauss-parameters-two`, `gauss-five-4x5` | BOUNDED_METHOD, ONE-PARAMETER_TEXT_FIX, CONFIRMED_SOURCE_GAP | A source 5-unknown consistent rank-2 example needs **three** full affine parameters |

### Independent math checks
- U03: a 4×4 Cramer source representative independently solved with exact SymPy determinants, all four replacement determinants and residuals; matches the privately supplied answer.
- U07: source unique-solution representatives independently solved using exact SymPy ranks and direct solutions; matches the supplied answers.
- U06 and U08: two different source examples are each 5 unknowns with rank(A)=rank([A|b])=2, hence three free parameters; result checked against the private official answer key.
- Production tests read (not executed): `cramerFour.test.ts`, `cramerDiagnostics.test.ts`, `gaussCramerFollowup.test.ts`, `gaussParameters.test.ts`, `gaussFive.test.ts`. The available test suites cover independently calculated 4×4 minors, ranks, substitution, negative grading, parameter-coefficient residuals and PL/EN.

## Single production correction in this Draft PR
In `gaussParameters.ts`, one-free-variable Gaussian problems formerly showed an example containing both `t1` **and an extraneous `t2`** whenever the coefficient matrix was square. The example is now selected solely by the number of free columns. `gaussParameters.test.ts` asserts that every one-parameter problem's PL and EN question contains no `t2`. Two-parameter tasks retain `t2`.

This is a copy/teaching defect, not an arithmetic algorithm change. It does not address the separate three-parameter family gap. No catalog or parser modifications.

## STUDENT_READY (families already registered on main)
1. `cramer-applicability` — square determinant and D=0 decision.
2. `cramer-eligibility-solve-three` — decide applicability and solve 3×3.
3. `cramer-four` — solve controlled 4×4 cases.
4. `cramer-four-singular-minors` — enter D and D1–D4, including singular cases.
5. `gauss-four-forced-pivot` — perform an actual row swap, then back-substitute.
6. `gauss-parameters-one` — one parameter (example text fixed in this PR, not yet merged).
7. `gauss-parameters-two` — two independent parameters and original-equation checks.
8. `capelli-given-ranks` — apply the Kronecker–Capelli criterion.

Access: Math Tutor university exercises in the **Układy równań / Systems** category, and select a family from the family picker or competence search. Do not infer any deep link.

## Testing, merge and next step
- Local independent mathematics with SymPy: performed on select **private source** examples; not a replacement for production generator QA.
- Code-level Vitest: **NOT_RUN** (no local GitHub checkout / dependency environment).
- Production build / Playwright: **NOT_RUN** in this sprint.
- CI/Pages: **NOT_CLAIMED** for this change until verified with exact PR and main SHAs.
- Only one draft PR, no merge or auto-merge; needs independent PR checks and explicit owner approval.

**Next engineering task (separate integration, not this parallel sprint):** support and independently test a consistent rank-2, 5-unknown, three-parameter Gaussian system with all affine coefficients graded in PL/EN. Requires both producer/presenter integration and thus is intentionally not slipped into this narrow one-module correction. Refs #108.
