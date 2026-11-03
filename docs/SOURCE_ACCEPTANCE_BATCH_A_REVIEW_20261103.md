# Batch A — semantic acceptance review (2026-11-03)

**Reference release:** `main@a337cadbfb9d128a208156ecbba164e7fffb5587`, 226 generator families / 17,973 variants. [Full CI](https://github.com/eluyz/math-tutor-app/actions/runs/41712633324) and [same-SHA Pages](https://github.com/eluyz/math-tutor-app/actions/runs/41714600312) PASS.

## Independent scope and source provenance

This review checks **six bounded source forms**, not every question in each original PDF, not all 64 skills and not the paused 17K-variant global QA #106. No original UWM questions, coefficients or key are copied to this public repository. Private source form + checked answer are independently documented in the owner's archived `01_AUDYT_MATERIALOW.md` and `10_KONTROLA_ODPOWIEDZI.md` (2026-10-18, 43/43 PDFs and 221/221 pages visually inspected, with expressly scoped independent algebra). The original P10 key exists for P12 exercises; P08 is the P09 determinant key.

The existing `src/qa/syllabusBatchAWitness.test.ts`, `src/university/determinantColumnSource.test.ts`, `src/university/cramerIntegratedSource.test.ts` and browser suites `e2e/syllabusBatchAPinnedSource.spec.ts`, `e2e/determinantColumnSource.spec.ts`, `e2e/cramerIntegratedSource.spec.ts` provide answer, shape, answer feedback and Chrome 375px/1280px witnesses. This PR adds **assertions over exact mathematical intermediate step actions and bilingual reasons** that those earlier suites did not fully cover. The source archive was not visually re-rendered in this chat; its *historical* visual audit is traceable and distinct.

## Competence ledger

| Competence | Private original case | Pinned generated instance | Semantic oracle | Before this PR |
| --- | --- | --- | --- | --- |
| M01 | P03/1a (and mapped 1j/2a) | `matrix-worksheet-composites:medium:0` | Entrywise 3A−B: all 6 cell arithmetic strings + bilingual rationale | Interim only |
| M02 | P03/1b | `matrix-worksheet-composites:medium:1` | A+Aᵀ: all 9 cell strings, symmetry, both-language explanation | Interim only |
| M07 | P09/1c–f,1n | `determinant-sarrus:easy:1` | Independent 6 diagonals, 9 English/Polish teaching stages, exact operands | Interim only |
| M08 | P09/1h,1l,1t | `determinant-laplace-column-three:hard:0` | 3rd column zeros, negative sign C43, signed minor proof | Interim only |
| U02 | P12/1a–c,1f–g | `cramer-eligibility-solve-three:medium:0,1,2` | Nonzero D and Dᵢ/D with substitution; both D=0 rank classes, explicit inconsistency/parameters | Interim only |
| U05 | P12/3a–d | `capelli-free-parameters:easy:0,1,2,3` | 0/1/∞ class, n−rank(A), inconsistent case EN fixed by #162 | Interim only |

## Exact acceptance gates

- **Pre-existing:** source topology and independently calculated private source keys (historical, scope-limited); pinned generator ID+variant, independent generated arithmetic, valid/wrong/empty grading, PL/EN presentation, Chromium 375px and desktop.
- **Added here:** explicit named actions and *each* mathematical worked-step formula for M01/M02; all six products and computations for M07; C43 sign/parity/axis and minor for M08; Cramer determinant identity and each rank-class explanation for U02; all four source rank-pattern parameter explanations for U05. All numeric `SolutionStep.calculations` are checked with independent rational arithmetic.
- **Not claimed:** physical iOS/Safari execution, fresh direct original-PDF page-image review, complete every-generator/variant audit, or all original subproblems.
- **Acceptance governance:** do **not** turn on `SOURCE_PASS` or check #151 boxes based only on the presence of this unmerged PR. First verify its exact-head full unit/build/Chromium CI and independent review; for any item requiring original source page or semantic review beyond these boundaries, keep `NOT_VERIFIED`. Any merge requires separate explicit exact-HEAD consent.

## Quantitative progress

- Current release: **226 families, 17,973 variants**.
- Syllabus index **64/64 mapped**; bounded method scope **14/64**, partial **50/64**.
- Batch A: **6/6 previously had interim math and browser witnesses**, **0/6 SOURCE_PASS** before this independent completion gate.
- Batch B: archived sources available for **8/8** bounded forms; **0/8 SOURCE_PASS**.
- Entire #151: **0/14 SOURCE_PASS** before acceptance sign-off. Graph F05 source examples **0/6**. Global #106 remains paused.
