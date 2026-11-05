# Overnight Batch D — independent linear algebra QA

Execution date: **2026-11-05, Europe/Warsaw** (runner timestamps use UTC). Tested implementation HEAD: `6acc822a77566dffa30cea29b724f87f6a710122`. The next commit adds this report only. **Exact final delivery HEAD and immutable Actions links are recorded in the single stacked Draft PR validation section**; `git rev-parse HEAD` resolves the delivery SHA locally. Committed [evidence and tested file SHA-256 hashes](qa-batch-d/local-results.json) bind the executed tests to the implementation.

## Repository and dependency gates

- Current main at start: `376c1a31adbd05fbac3a75fb05f62b913b6e668d`; [CI #41926918237 PASS](https://github.com/eluyz/math-tutor-app/actions/runs/41926918237), [same-SHA Pages #41929729137 PASS](https://github.com/eluyz/math-tutor-app/actions/runs/41929729137).
- Parent [PR #171](https://github.com/eluyz/math-tutor-app/pull/171): **OPEN, Draft, unmerged**, HEAD `befc5ab6abaa6f2fe7a432e999da14dbbe854499`; [CI #41929028315 PASS](https://github.com/eluyz/math-tutor-app/actions/runs/41929028315). Rechecked before publication. Its branch/content was not modified.
- New isolated branch: `qa/batch-d-linear-algebra-acceptance`, based on that exact Batch C HEAD. The new Draft PR targets **`qa/batch-c-controlled-acceptance`**, so its diff contains only Batch D. CI's pull-request base filter explicitly includes this branch; the push-to-main behavior remains unchanged.
- Read the curriculum map, selected generators/tests and Batch B/C manifests, oracles, browser runner and reports. No original private PDF/key was read or copied. #151, #106, F05 and #142 are untouched; #106 remains paused. No PR is merged.

Dependency risk: parent #171 must be reviewed/merged first or otherwise coordinated by the owner. Retarget/rebase and verify the resulting delivery SHA after parent changes; do not treat today's stacked CI as proof of a future rebased tree. The helper extensions in this PR are additive test infrastructure on the D branch, not modifications to Batch C's six-row scope, witness list or source counters.

## Budget and actual execution

**15 competencies, 24 family–difficulty combinations, 24 unit variants each = 576 tasks / 1,152 PL+EN instances.** Exactly **48 distinct pinned UI variants**, exercised in four conditions (PL/EN × 375/1280 px): **192 witnesses in 96 browser tests**. Hard budget assertions are part of the unit suite. No subagents, parallel independent audits, new libraries, new families, application refactor or subsequent batch. A numerical remaining Codex quota is not exposed, so no remaining-percentage estimate is claimed.

The production browser runner uses two workers with parallel test isolation; this limits concurrency rather than raising the existing 40-minute CI timeout. Existing unit/browser suites, B and C and then D run in the single final CI workflow. No full local CI was run repeatedly.

## Checkpoint commits

| Stage | Checkpoint | Passing scope |
| --- | --- | --- |
| A / D1 | `30ca58e` | 9 combinations / 216 tasks, PL+EN; 9 tests PASS |
| B / D2 | `328adb8` | 8 combinations / 192 tasks, PL+EN; 8 D2 tests PASS; D1+D2 with printed-row replay: 17 PASS |
| C / D3 | `d0aa4b5` | 7 combinations / 168 tasks, PL+EN; 7 tests PASS |
| D / integration | `6acc822a77566dffa30cea29b724f87f6a710122` | 25 unit tests PASS, production build PASS, 96/96 browser tests PASS |

The [checkpoint ledger](qa-batch-d/PROGRESS.md) preserves the partial-stage states. The final reference also verifies the last answer step against the independent oracle, not merely its presence.

## Exact generator matrix

Every row below tests **unit variants 0..23**. The UI column is the exhaustive pinned list; other examples encountered while walking a pool are identified but not graded as acceptance witnesses.

| Block | Skill | Family : difficulty | Pinned UI variants |
| --- | --- | --- | --- |
| D1 | M03 | `matrix-rectangular-evaluation:medium` | 0, 1, 2 |
| D1 | M03 | `matrix-transpose-dimensions:hard` | 0, 4 |
| D1 | M04 | `matrix-composite-operations:advanced` | 0, 1 |
| D1 | M04 | `matrix-negative-square-three:hard` | 0 |
| D1 | M05 | `matrix-axb-three:hard` | 0, 1 |
| D1 | M05 | `matrix-coupled-equations:expert` | 0, 1 |
| D1 | M06 | `determinant-radical-two:hard` | 0, 1 |
| D1 | M11 | `determinant-properties:medium` | 0 |
| D1 | M11 | `determinant-properties:expert` | 0, 1, 2 |
| D2 | M09 | `determinant-gaussian-pivot-four:advanced` | 0, 1 |
| D2 | M10 | `determinant-gaussian-pivot-five:expert` | 0, 1 |
| D2 | M10 | `determinant-dense-five:advanced` | 0 |
| D2 | M12 | `inverse-four-gauss-jordan:advanced` | 0, 1 |
| D2 | M13 | `inverse-four-xa-equation:expert` | 0, 1 |
| D2 | M13 | `inverse-four-ax-equation:hard` | 0, 1 |
| D2 | M14 | `matrix-rank-four-rectangular:expert` | 0, 1, 4 |
| D2 | M14 | `matrix-rank-six-three:hard` | 0, 2 |
| D3 | U01 | `cramer-applicability:hard` | 0, 1, 2 |
| D3 | U03 | `cramer-four-singular-minors:hard` | 0, 1, 2 |
| D3 | U03 | `cramer-four-forced-pivot:hard` | 0 |
| D3 | U06 | `gauss-four-dependent-diagnostic:expert` | 0, 1, 2 |
| D3 | U07 | `gauss-four-forced-pivot:hard` | 1 |
| D3 | U08 | `gauss-parameters-two:expert` | 0, 1 |
| D3 | U08 | `gauss-rectangular-2x3-parameters:advanced` | 0 |

## Independent mathematical controls

`batchDOracle` reads **only original problem parameters**. It never reads `task.answer`, localized answer values or production determinant/inverse/rank/system solvers. Shared low-level rational arithmetic and rational string formatting are used; there are no floating-point approximations in mathematical expected results. Visible radical coefficients are bounded exact integers.

- **Products and compatibility:** independent row-by-column dot products with explicit inner-dimension checks; separate shape equality for sums; transpose changes rows/columns before evaluation. Incompatible intermediate expressions produce the correct dimension classification. Composite operations preserve multiplication order.
- **Determinants:** independent Leibniz permutation expansion, including inversion parity. It is independent of production Laplace, sparse-axis choice and Gaussian pivot traces. Both dense 5×5 and pivot-controlled 4×4/5×5 matrices are checked. Dependent-row claims are verified from the actual original row pair using minors, as well as a zero determinant.
- **Controlled radicals:** exact pair arithmetic in Q(√d) expands both cross-products; irrational coefficients must cancel exactly before accepting a rational answer. The pinned pair includes a singular example. This validates controlled radical inputs, not arbitrary irrational output parsing or every standalone rational 2×2 UI family.
- **Inverse and matrix equations:** cofactor adjugate divided by the independent permutation determinant. Every computed inverse must satisfy **AA⁻¹=I and A⁻¹A=I**. Singular cases are confirmed by minors. AXB=C, AX=B, XA=B and both coupled equations are reconstructed element by element. A⁻² satisfies the inverse-square identity on both sides.
- **Rank:** enumerate minors from largest order downward, independent of production pivot selection/row reduction. Rectangular 4×5 and tall 6×3 matrices include zero, deficient and maximal rank within their supported classes.
- **Cramer and classification:** independent D and each replaced-column Dᵢ. D≠0 must agree with full rank; Dᵢ/D must satisfy every original equation and agree with an independently selected nonsingular-minor solution. D=0 is not used alone to classify: compare ranks of A and [A|b]; verify the expected zero/nonzero replaced minors for the generated rank n−1 singular cases.
- **Gauss and parameters:** choose the lexicographically first independent column basis using minors, solve its nonsingular row minor by adjugate, and construct the canonical left-to-right free-variable coefficients. Check **A·constant=b**, **A·direction=0 for each direction**, and the free-coordinate identity/dimension **n−rank(A)**. This is an independent computation, not extraction of a production RREF answer.
- **Displayed row steps:** parse and replay every matrix-bearing elementary row operation printed by the selected determinant, inverse, rank and Gaussian solutions. Each resulting displayed matrix must exactly match the independent operation, and divisions/scales must be nonzero. Dependency proof statements without a printed matrix are validated on original rows. Other working actions/reasons are inspected and required in the UI; recorded arithmetic is checked with the existing calculation auditor. This is not a claim of generic symbolic verification of arbitrary natural-language prose.

## Competency statuses and limits

**METHOD_PASS** means the listed bounded method passed independent math and workflow checks. **METHOD_PARTIAL** preserves the wider competency limits and untested forms. **NEEDS_FIX** requires a reproduced generator defect; none remains or was found here. **BLOCKED_SOURCE** is a separate private-original gate. **SOURCE_PASS_CANDIDATE** is reserved for source comparison/final review and is not assigned by this synthetic package.

| Skill | Verified selected method | Wider competency / remaining boundary | Source |
| --- | --- | --- | --- |
| M03 | METHOD_PASS: rectangular products and compatibility after transpose | METHOD_PARTIAL: general dimensions and the existing four-factor family are outside this sample | BLOCKED_SOURCE |
| M04 | METHOD_PASS: composite transpose/products and triangular 3×3 A⁻² | METHOD_PARTIAL: other positive powers/similarity families exist; arbitrary negative powers are not claimed | BLOCKED_SOURCE |
| M05 | METHOD_PASS: 3×3 AXB=C and two coupled 2×2 equations | METHOD_PARTIAL: other shifted/inverse equations exist but are not all sampled | BLOCKED_SOURCE |
| M06 | METHOD_PASS: exact controlled radical 2×2, zero and rational outputs | METHOD_PARTIAL: standalone rational `determinant-two` already exists but is not a separate university-task witness here; general irrational outputs are outside this family | BLOCKED_SOURCE |
| M11 | METHOD_PASS: proportional rows/zero and 4×4 row-operation properties | METHOD_PARTIAL: bounded numerical relations, not all symbolic determinant identities | BLOCKED_SOURCE |
| M09 | METHOD_PASS: 4×4 Gaussian determinant with pivot swaps and singular cases | METHOD_PARTIAL: other dense/strategy families exist; no all-form source attestation | BLOCKED_SOURCE |
| M10 | METHOD_PASS: dense 5×5 and pivot-controlled 5×5, signs/fractions/zero | METHOD_PARTIAL: selected numerical classes, not every source topology | BLOCKED_SOURCE |
| M12 | METHOD_PASS: singular and invertible 4×4, both inverse identities | METHOD_PARTIAL: 2×2/3×3 families exist; arbitrary sizes not claimed | BLOCKED_SOURCE |
| M13 | METHOD_PASS: both 4×4 AX=B and XA=B with rectangular X | METHOD_PARTIAL: other inverse-expression equations remain outside this sample | BLOCKED_SOURCE |
| M14 | METHOD_PASS: rank by minors, 4×5 and 6×3, zero/deficiency/missing pivots | METHOD_PARTIAL: bounded sizes and constructions | BLOCKED_SOURCE |
| U01 | METHOD_PASS: 4×4 Cramer eligibility, unique/consistent singular/inconsistent | METHOD_PARTIAL: smaller existing eligibility forms not separately sampled | BLOCKED_SOURCE |
| U03 | METHOD_PASS: 4×4 D,Dᵢ at D=0 and D≠0 plus forced pivot and Ax=b | METHOD_PARTIAL: bounded classes, not every source system | BLOCKED_SOURCE |
| U06 | METHOD_PASS: 4×4 rank classification into one/none/many | METHOD_PARTIAL: existing rectangular classifiers not all sampled | BLOCKED_SOURCE |
| U07 | METHOD_PASS: unique 4×4 Gaussian solve with required row swap | METHOD_PARTIAL: other sizes/structures remain outside this sample | BLOCKED_SOURCE |
| U08 | METHOD_PASS: full two-parameter 4×4 and one-parameter 2×3 solutions; contradiction also checked by the shared U06 diagnostic witness | METHOD_PARTIAL: arbitrary free-parameter counts/formulas are not graded | BLOCKED_SOURCE |

No new source-confirmed missing mathematical method was established. The third column distinguishes test-scope gaps in existing methods from limits of bounded generators. It does not turn an untested existing family into a missing-method implementation request. No private original, coefficient, answer key or scan is published. **Zero SOURCE_PASS awarded; all formal counters/checklists remain unchanged.**

## Test execution and incidents

```bash
npm test -- src/qa/batchDAcceptance.test.ts -t D1
npm test -- src/qa/batchDAcceptance.test.ts -t D2
npm test -- src/qa/batchDAcceptance.test.ts -t D3
npm_config_cache=/tmp/math-tutor-npm npm ci --offline
npm run test:batch-d
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-d
```

| Control | Result |
| --- | --- |
| D1 / D2 / D3 targeted checkpoints | PASS, 9 / 8 / 7 selected tests respectively; other blocks intentionally filtered |
| Integrated unit and quota tests | **25 PASS**, 576 tasks / 1,152 localized instances; correct, wrong and empty grading; both hints; every working calculation and final solution answer |
| Production build | **PASS**; unchanged application asset hashes/names, existing large-JS-chunk warning |
| Production Chromium | **96/96 PASS**, 48 distinct variants / 192 witnesses; PL/EN × 375/1280; zero skipped/flaky/unexpected in the final complete run |
| Console, pageerror, failed requests, HTTP ≥400 | **0 errors** in the final complete run |
| Modified-generator regressions | Not applicable: **0 generator fixes / 0 application changes**; full B/C browser regression is retained in final CI for the additive shared-harness extensions |
| Full CI | One run requested on final delivery HEAD; immutable result/link in Draft PR validation, not inferred from local PASS |

Two test-development issues were corrected: an import in the new wrong-answer helper and recognition of dependency proof statements that do not contain a matrix trace. The initial browser integration exposed that some families render operands only in tables, making the question alone ambiguous across 24 variants. That attempt was stopped, the shared harness was extended to match every visible rational/radical cell and shape, and the **entire** 96-test matrix was rerun successfully. Initial aborted-run statistics are preserved in compact evidence; none is counted as a generator defect or acceptance PASS.

The browser harness reuses Batch B/C navigation, deterministic pool order, grading, hints, solutions, responsive and console/network checks. It adds scalar/matrix/system input filling and original operand-table matching. The Batch C manifest, oracle and witness list are unchanged. Successful evidence includes screenshots and exact visited IDs for every locale/viewport. Internal horizontal matrix scrolling is allowed; page-level horizontal overflow is rejected. Physical Safari/iOS and a general accessibility audit remain NOT_VERIFIED.

CI adds a dedicated D production step and `batch-d-browser-evidence` artifact (JSON/HTML/screenshots/failure traces, 14 days). [Batch D workflow runs](https://github.com/eluyz/math-tutor-app/actions/workflows/ci.yml?query=branch%3Aqa%2Fbatch-d-linear-algebra-acceptance) provide current status. Raw local files: `test-results/batch-d-results.json`, `test-results/batch-d/`, `playwright-report/batch-d/index.html` (Git-ignored). Compact committed evidence and file hashes: `docs/qa-batch-d/local-results.json`.

## Remaining owner gates and next package

1. Direct private-source-to-family/level/variant comparison and final review before assigning SOURCE_PASS_CANDIDATE or any formal source acceptance. This package proves selected synthetic methods, not completion of all original syllabus forms.
2. Review parent #171 and this stacked Draft PR; separately authorize any merge at the exact reviewed HEAD. After retarget/rebase/authorized merge, require CI and Pages PASS on the actual main SHA. This task performs none of those merges or formal issue updates.
3. Prioritize any additional matrix test only after checking whether an existing family already supplies the actual original form. In particular, standalone rational M06 UI witnesses and the unselected inverse/dimension variants are test-scope follow-ups, not reasons to create bulk generators.
4. Recommended **next** bounded package, only if the owner requests it: **I01–I04** on existing integral families, using independent differentiation of candidate primitives and domain/constant checks. Start with at most six combinations and sixteen UI variants after inspecting original requirements. It is not started here.

This completes the bounded D implementation. #106 remains paused and no subsequent batch is launched.
