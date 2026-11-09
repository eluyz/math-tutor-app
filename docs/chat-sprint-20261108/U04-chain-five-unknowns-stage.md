# U04 — five-unknown / five-equality chain, isolated method stage (2026-11-09)

## Original source, evidence and boundaries

The user's *private* mathematics materials, under the section **Układy równań liniowych**, contain a single **exercise (2)** asking for x in a chain of **six expressions joined by five equality signs**, with **five unknowns x,y,z,u,v**. Its published answer key gives x as an exact scalar. No original expression, source-specific coefficients or numerical answer is copied into this repository.

The old published family `system-chain-five` is NOT equivalent: it contains six expressions in **only two unknowns x and y** and is kept unchanged, with its frozen identities and grade behavior preserved.

This stage implements the *shape* using five neighbor-linked linear expressions plus a final constant:
`A+x+y = B+y+z = C+z+u = D+u+v = T+k*x+v = S`, with synthetic integers. The resulting 5x5 system has determinant `k+1`, which is provably nonzero for the generated positive k. The task asks for **x only**, exactly as in the source's request.

No original university problem or answer is committed. Shape fidelity does not constitute source-data reproduction or SOURCE_PASS.

## Scope — not yet registered

- `src/university/chainFiveUnknowns.ts`: a strongly-typed stage-only problem, generator of 24 variants for each of medium/hard/advanced/expert (**96 synthetic candidates**), full exact-rational solver and PL/EN worked explanation.
- `src/university/chainFiveUnknowns.test.ts`: independent test-only 5x5 Laplace/Cramer oracle, never using the production solver or its prepared answer to compute the expected x; proves unique solution, checks all six original expression values, four levels, answer scoring and language parity.
- **No changes** to `src/university/schema.ts`, `src/university/catalog.ts`, `src/competencyIndex.ts`, any global QA registry or existing student exercise. No published-family or variant-count change; no CI or Pages promotion triggered by a merge.

## Integration prerequisites

1. Verify exact-head GitHub Actions unit/build/Playwright/Batch B–G and independent code/math/localization QA. Do not claim full PASS until it has actually completed.
2. Separately register `linear-chain-five-unknowns` schema discriminator, the new family and presenter in the shared catalog only after parent stage review, safeguarding the existing `linear-chain-five` route.
3. Add a visible-expression-only independent 5x5 Cramer Playwright audit with PL/EN desktop/mobile (not relying on internal task answers) and a ten-question session.
4. Preserve frozen archival hashes and independently verify grading of **x only**.
5. Before a formal U04 SOURCE_PASS: compare the private exercise structure and canonical x with the answer key, including step-by-step algebra; do not expose private numbers in the public repository.
6. Both stage and integration merges require explicit owner approval; no auto-merge. Recheck concurrent main changes in C/G/F/I/W/D before integrating.

## Known limitations

Only the neighbor-linked unique-solution 5x5 chain is covered. Arbitrary nonlinear or rank-deficient 5-unknown chains are outside this candidate. The U07 4×3 explicit full-answer gap and other U source audits are independent.
