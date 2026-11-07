# W02 Batch 2 — complete quadratic minimum and bilinear no-extremum method

## Base, source boundary and isolation

Base main `c206e8dcdf4ae4aeca9e2c0a1fbdd6e4f4b6f9c2` was fetched and verified; its CI and Pages completed SUCCESS. Issue #185 and PR #186 were read. #186 remained an independent OPEN candidate at `b038664994a634ea39bfe7daf81c7379fc1c6f7b`; its branch/files were not used as a base, copied or modified. #142 and #106 remain untouched. No merge, auto-merge, main push, issue closure or SOURCE_PASS-counter update.

No original private worksheet/key was read in this session. Source-profile descriptions and reported point counts below come from the user and public Issue #185, not a fresh private-source verification. No original coefficients/functions/scans are published. **Global formal acceptance stays 14/64; W02 overall METHOD_PARTIAL / SOURCE_NOT_VERIFIED.**

## Inventory decision and exact delivered scope

Existing `multivar-stationary-point` already solves an invertible quadratic gradient system exactly. It previously stopped its teaching at coordinates and graded two coordinates only. The Hessian-classification family asks about a supplied point; bounded rectangle/disk families solve global constrained problems. Neither combination constitutes one complete local-minimum task with a graded function value.

**No redundant quadratic family is added.** Extend the existing stationary family with one `advanced` level, v0–23, for positive-definite quadratics and a three-field answer x_min,y_min,f_min. Its gradient system, uniqueness proof, Hessian, determinant, minimum classification and value are all displayed. Existing easy/medium/hard preserve their parameter data and two-field grading, gaining the additional Hessian/classification/value teaching steps. Maximum/saddle cases are correctly named; a saddle's displayed function value is never called an extremum value.

The new `multivar-bilinear-extrema:hard:0..23` family covers an authored bilinear-plus-affine function with nonzero mixed coefficient. Five existing multi-choice fields grade x_*,y_*,f_*,D and the combined conclusion “Saddle point; no local extrema”. The prompt explicitly identifies f_* as a function value, not a nonexistent extremum. Wrong minimum/maximum/inconclusive conclusions are not accepted. No new answer type, renderer or generic nonlinear solver is introduced.

Before/after: **237→238 families; 18,237→18,285 variants**. Existing stationary family **72→96** variants; new bilinear family **24**. Exactly 48 new tasks serve new full minimum-value grading or bilinear no-extremum grading, rather than adding levels for catalog size alone. Every supported variant is covered by the independent audit: quadratic easy/medium/hard/advanced v0–23 (96) and bilinear hard v0–23 (24).

## Mathematical proof

For a quadratic f=a x²+bxy+c y²+dx+ey+offset, gradient is (2ax+by+d,bx+2cy+e). The Hessian is constant [[2a,b],[b,2c]], with D=4ac−b². Generic exact row elimination establishes the unique solution when D≠0; substitution checks both original equations. For advanced cases a>0,D>0, the Hessian is positive definite and the only stationary point is a strict minimum (also global for this quadratic). Evaluate the original function at the solved coordinates for f_min. The new grading includes all three values. No zero-gradient-only minimum inference is made.

For f=a xy+bx+cy+d, a≠0: gradient=(ay+b,ax+c), so (x_*,y_*)=(−c/a,−b/a) is the only critical point. H=[[0,a],[a,0]] and D=−a²<0. Exact translation gives f−f_*=a uv; along u=v and u=−v it takes opposite signs arbitrarily close to the point. Thus it is a saddle. Since every local extremum on the smooth open domain R² must be stationary, there are **no local extrema anywhere**. f_*=d−bc/a is only the function value. D<0 is decisive, unlike the inconclusive D=0 cases retained in the separate existing Hessian/quartic families.

## Independent oracles and all-step checks

`src/qa/w02Batch2.ts` uses generic exact Gaussian elimination (including a row swap for the zero-diagonal bilinear matrix), original-function substitution and the independent 2×2 determinant identity. It does not call production Hessian/classification/coordinate helpers or read production correct-answer keys. Numeric option labels are mapped to UI option IDs only after expected numbers are computed; field.value is never an oracle input. Conclusion semantics are independently fixed and label-checked in both languages.

`w02Batch2.test.ts` checks all 120 task instances × PL/EN: both gradient equations, nonzero/negative determinant, full point-set completeness, coordinates, original function value, answer grading, every working step, both hints and final answers. Each bilinear field is tested wrong and omitted; all tasks reject blank input. The existing Batch H first four stationary-step anchors remain and are extended with three exact Hessian/classification/value anchors; no old mathematical assertion is removed. Existing Hessian regression assertions remain unchanged for legacy levels and explicitly cover the new three-field advanced answer.

A separate **SymPy 1.14.0** run reconstructs each original polynomial from exported parameter records, differentiates symbolically, solves the complete stationarity system, compares its entire solution set, computes the Hessian determinant, evaluates the function and checks the translated bilinear identity. **120/120 records PASS: 96 quadratic + 24 bilinear; 60 minima, 18 maxima, 42 saddles.** This includes 24 newly graded positive-quadratic minima and all 24 new no-extremum tasks. Script: `scripts/qa/w02_batch2_sympy.py`; result: `docs/qa-w02-batch2/sympy-results.json`. Run the Vitest audit first to export `/tmp/w02-batch2-symbolic-input.json`, then execute the script. SymPy was already installed; no application dependency added.

Production browser spec reuses the unchanged common runner with a local multi-choice input adapter. Quadratic advanced pins 0,3; bilinear hard pins 0,1,7,16. PL/EN × 375/1280 px gives 24 witnesses in eight scenarios, with actual correct/wrong/blank grading, both hints and full solution, domain/semantic checks and console/page/HTTP/overflow guards. The deterministic independent oracle supplies expected values; arbitrary correct-or-incorrect outcomes are not accepted.

## Additional audit — recommendations only

Point structures below are **reported in Issue #185**, not direct original-equation reproduction. Current main has single-point quadratic/Hessian/quartic tasks and constrained global tasks. PR #186's separate candidate handles two coupled-cubic critical points for 2b/2g; it is not merged or generalized here.

| Profile | Reported method / complete point structure | Existing family | Actual gap | Next bounded task | Priority |
| --- | --- | --- | --- | --- | --- |
| 2a | Positive quadratic; one minimum and its value | stationary-point, now advanced full minimum | METHOD_PASS within the bounded method; BLOCKED_SOURCE for originals | Original review, no new family | Review |
| 2e | Bilinear-affine; unique saddle, no extrema | NEW bilinear-extrema | METHOD_PASS within the bounded method; BLOCKED_SOURCE for originals | Original review | Review |
| 2c | Quadratic-x / mixed y-cubic; one minimum + two saddles | No complete main family; #186 only has two points | Three-candidate enumeration and classification | Controlled rational/square-discriminant family; elimination/factorization proves all three roots, grade extremum value and explain both saddles | P1 |
| 2d | Cubic-x with xy²; one minimum + three saddles | No complete main family | Four stationary branches/candidates; zero-factor branch must not be divided away | Split gradient factors before division, enumerate both branches, independently verify all four candidates and Hessians | P1 |
| 2f | x-quadratic, y-cubic and xy; minimum + saddle | No complete main family; #186 is a different cubic shape | Solve x from the linear gradient equation, substitute into quadratic in y | One shared controlled two-root family for 2f/2h, positive discriminant and full substitution checks | P1 |
| 2h | Same structural class with maximum + saddle | Same limitation | Sign-controlled maximum orientation and value | Second orientation of the same 2f/2h family, not another redundant family | P1 |
| 2b/2g | Coupled cubic; extremum + saddle | Separate PR #186 | Pending review/release, not this package | Preserve and independently integrate that PR when approved | Separate |

Current W02 tasks do not provide a general solver/grader for variable-size unordered algebraic critical-point sets, irrational coordinate sets or nonisolated critical manifolds. Existing list/multi-choice infrastructure can represent bounded known-size rational candidates; a general engine is not justified here. None of the four additional profiles is implemented in this PR. No completeness claim for the entire P43 sheet.

## Integration, results and delivery

Catalog/current-stat assertions are updated by exactly one family and 48 tasks. The new bilinear family is explicitly separated from unchanged historical cohorts; historical expected totals/hashes are not relaxed. Current generator table includes advanced stationary minimum and the hard bilinear family. English multi-choice headings/conclusions use explicit translations, not a broad fallback. Shared files also touched in #186 (catalog/schema/count docs) may require a later additive rebase; this branch must preserve both families and recompute totals when that independently approved PR lands. Do not modify its branch.

Local results and exact tested implementation SHA are recorded in `docs/qa-w02-batch2/local-results.json`; the Draft PR validation section pairs the final delivery HEAD with terminal Actions evidence. Full unit/build/standard browser/B–G CI must pass on that exact HEAD. Batch H remains in the default browser suite and its unit oracle was strengthened. No workflow timeout increase or disabled test.

Verdict: **READY_FOR_OWNER_REVIEW for the bounded 2a/2e method package once final exact-head CI is verified; source acceptance remains BLOCKED_SOURCE / SOURCE_NOT_VERIFIED.** No SOURCE_PASS, no change to 14/64, no issue closure and no automatic next package or merge.


Local verification: **137 files / 1,711 unit tests PASS**, production TypeScript/Vite build PASS, production Chromium **8/8 scenarios, 24 witnesses PASS** (PL/EN, 375/1280). Final additional per-field rejection and exact step assertions passed **16/16 targeted tests** afterward. Independent SymPy **120/120 PASS**. No console, page, HTTP/request or layout errors were recorded. Existing bundle-size advisory remains; no TypeScript error. Full remote standard and B–G browser results belong to the exact final delivery HEAD and are linked in the Draft PR; they are not inferred from local success.

Tested implementation commit: `1d943aebb21689990f5c44f58cafae3fc318fa36`. The subsequent delivery commit adds only this report and evidence. SHA-256 values for the tested mathematical, UI and QA sources (including the unchanged common browser harness) are in `docs/qa-w02-batch2/local-results.json`. Raw generated JSON/screenshot bundles stay out of Git; their digests and compact witness/error records are retained. The final delivery SHA and CI URL are recorded externally in the Draft PR validation section to avoid a self-referential commit hash.
