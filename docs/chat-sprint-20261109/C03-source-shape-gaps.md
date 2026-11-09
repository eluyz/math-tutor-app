# C03 source-shape gaps — bounded method PR (isolated)

- Static private worksheet-to-app audit (do not copy source task values or key into public repo) identified four missing synthetic form classes in C03: two square roots of linear terms subtracted, reverse quadratic-root subtraction, positive linear-plus-quadratic-root sum, and quadratic-root differences with a negative constant under the radical (domain valid only from n>=N).
- Added **one standalone module**, `sequenceConjugateSourceShapes.ts`, and independent test `sequenceConjugateSourceShapes.test.ts`. 96 synthetic tasks (4 levels × 24 variants), evenly 24 per mode, PL/EN hints and full steps, finite and +infinity grading, explicit domain conditions. Expected limits independently derived by rational cross multiplication; numerical high-n convergence checked.
- **No catalog, schema, inventory, README or competency index changes** in this PR. No student-facing deployment until a separate integration PR, full CI and owner approval.
- This method expansion is **not** independent 1:1 acceptance of any private source problem and not C03/C01–C06 SOURCE_PASS. Keep private PDFs and exact original values out of GitHub.
