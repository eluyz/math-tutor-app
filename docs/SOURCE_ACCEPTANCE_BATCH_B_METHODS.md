# Batch B — generator-method witness ledger (2026-11-04)

**Scope:** #151, 8 of 14 candidate source skills. Baseline: `main@0fa7b421fc350a2d826fce7c64fc6b00fe0d5fa8` (CI and Pages PASS). The eight fixtures in `src/qa/syllabusBatchBMethodWitness.test.ts` exercise **synthetic examples only**, not the private original exercises. They must not be counted as SOURCE_PASS, even when CI passes.

| Skill | Source pointer | Method witness (synthetic ID) | Required source gate / caveat |
| --- | --- | --- | --- |
| C01 | P15/1a–l; P14 | `sequence-rational:medium:1` | Choose an original rational expression; compare highest-degree terms and signs, verify complete PL/EN workflow |
| C03 | P15/1m–t; P14 | `sequence-conjugate:medium:1` | Verify original square-root difference and rationalization, including the actual root scales |
| F01 | P17/1a,b,h,k; P16 | `function-domain:hard:0` | Verify actual radicand, denominator exclusion and endpoints; special care with square roots in denominators |
| G01 | P26/1l; P25 | `limit-point:easy:1` | Check the actual substitution point, a nonzero denominator and exact result |
| G02 | P26/1a,b,d,k,w–z; P25 | `limit-point:medium:1` | Verify original 0/0, factor cancellation for x≠a, and domain at the hole |
| G03 | P26/1c,e,j,m,v,y; P25 | `limit-point:hard:0` | Verify original one-sided signs and whether the two-sided limit exists |
| G05 | P26/2a–d,g,h,j; P25 | `limit-conjugate:advanced:0` | **Review jointly with** `limit-radical-infinity`, since the original set also contains conjugates at ±∞; do not claim source equivalence from one family |
| D01 | P29/1g,h,i,s; P27 | `derivative-formula:easy:2` | **Method gap** in this specific witness: polynomial power rule only, while originals include radical and negative/fractional exponents; inventory other families before implementing a fix |

## Evidence levels and acceptance

- A CI PASS for the fixture is **METHOD_WITNESS** (generator computation, independent algebra, grading, hints and working steps PL/EN), not a source-to-app match.
- The private original exercises and keys have an earlier visual/text inventory in the owner's materials. **No fresh source-page comparison was performed for this PR.**
- Before checking a #151 row, require: actual original and answer key or independently recomputed answer; exact matching synthetic family, difficulty, variant and SHA; complete bilingual explanations and grading; Chromium 375px and desktop; final PR review and same-SHA CI/Pages after authorized squash merge. Physical Safari remains NOT_VERIFIED.
- Keep Batch A 6/6, Batch B 0/8, overall **6/14** SOURCE_PASS; bounded generator coverage **14/64 (21.9%)**; source-accepted **6/64 (9.4%)**. The 64/64 generator map is not 100% syllabic acceptance.
- Keep F05 original full-graph matches **0/6**, global QA #106 PAUSED and unrelated #142 Draft.
- Never copy the owner's original PDF coefficients, page screenshots or answer key into this public repository.

## F01 source-form review — proposed correction (2026-11-04)

- The archived private visual audit describes P17/1h as **one linear square-root radicand in the numerator and one linear denominator**. This is not the exact formula topology of the original pinned `function-domain:hard:0` (quadratic radicand).
- Current generator families display: one radical ray with no pole; a quadratic radical with one pole; or a linear radical with two poles. They do not display this specific one-radical/one-pole formula.
- **Draft candidate** `function-radical-over-linear-domain:medium:0..23` adds one narrowly scoped source-observed form and independently tests root endpoint inclusion, denominator exclusion, the pole outside/on/inside the ray, PL/EN hints and working, and correct/wrong/empty grading. No private source coefficients or keys are included.
- This is a **method coverage fix only**, not SOURCE_PASS. The original PDF/answer key and an actual deployed same-SHA Chromium 375px/desktop witness still need comparison.
- Other seven entries remain source-unverified. G05 requires two generators (`limit-conjugate` and `limit-radical-infinity`); D01's original fractional/negative power **symbolic differentiation** is not represented by polynomial-only `derivative-formula`. Do not create a D01 family without checking the actual source forms.

**No counter increase:** Batch A 6/6; Batch B 0/8; scoped source acceptance 6/64 = 9.4%; bounded generator labels 14/64 = 21.9%. #106 stays PAUSED, F05 original graphs 0/6, #142 Draft.

## C01/C03/G01/G02/G03 audit and G03 gap (2026-11-04)

Archived private source registers `01_AUDYT_MATERIALOW.md`, `03_KATALOG_ZADAN.md` and `10_KONTROLA_ODPOWIEDZI.md` were rechecked against main's generators. They report 43 visually inspected PDFs / 221 pages as **historical provenance**, not a fresh original-page read.

- **C01** P15/1a,c–g,i–l: compare highest powers; source arithmetic historically checked in 1a,c,f,g,i–l. `sequence-rational` has independent numeric/limit/PL+EN tests. `NOT_VERIFIED_SOURCE`: source PDF/key currently unavailable for direct form-by-form confirmation.
- **C03** P15/1m–t: conjugation; source arithmetic historically checked 1m,n,q,s,t, not all items. `sequence-conjugate` method-level regression exists. `NOT_VERIFIED_SOURCE`.
- **G01** P26/1l: source register recorded finite result −2 with nonzero denominator; existing `limit-point:easy:1` is a synthetic substitution witness. `NOT_VERIFIED_SOURCE` until the original formula/key is directly checked.
- **G02** P26/1a,b,d,k,w,x,z: 0/0 cancellation; source arithmetic historically checked 1a,d,k,w,x,z (not b). Existing `limit-point:medium:1` covers the method. `NOT_VERIFIED_SOURCE`.
- **G03** P26/1c,e,j,m,v,y: left/right signs and missing two-sided limit. The historical page-image register explicitly records P26/1c numerator with **one removable factor x−a** and a **double denominator factor (x−a)²**. The former `limit-point:hard:0` has a *nonzero* numerator at a: it tests a simple pole but **not** the 0/0 cancellation required by this source example. Proposed synthetic `limit-cancelled-pole:hard:0..23` addresses this evidence-based method gap without original coefficients, alongside independent exact order/sign and bilingual grading/browser regressions. `METHOD_FIX_PENDING_RELEASE` but **not SOURCE_PASS**.

Nothing in this comparison authorizes ticking any Batch B checkbox. The five audited competencies remain **0/5 accepted**; Batch B 0/8; overall **6/64 = 9.4%** source-accepted (6/14 of #151); bounded generator mapping **14/64 = 21.9%**, mapped 64/64. Broad #106 paused, F05 source charts 0/6, unrelated PR #142 untouched. Future merge requires explicit user consent at exact HEAD.

## G05/D01 method review and D01 proposed bounded implementation — 2026-11-04

Historical private-source records \`01_AUDYT_MATERIALOW.md\`, \`03_KATALOG_ZADAN.md\`, and \`10_KONTROLA_ODPOWIEDZI.md\` identify **G05 P26/2a–d,g,h,j** (conjugates at finite points and ±∞, with \`√(x²)=|x|\`), and **D01 P29/1g,h,i,s** (simplify radicals/reciprocals into fractional and negative powers and differentiate). Historical P29/P27 coverage consists of pointwise checks of 38 symbolic answers, not a fresh original-PDF read.

- **G05 METHOD_COVERED (not SOURCE_PASS)**: \`limit-conjugate\` implements finite-point conjugation, while \`limit-radical-infinity\` separately handles ±∞ and absolute-value sign. Prior independent unit suites and 375px/1280px Playwright tests cover both; a new paired audit asserts 24 deterministic synthetic cases of each in PL/EN. The two mechanisms must *not* be conflated into one fictitious original form.
- **D01 METHOD_GAP before fix**: \`derivative-formula:easy:2\` returns only polynomial coefficients with integer nonnegative powers. An inventory of other derivative families found no bounded *symbolic* derivative task with reciprocal and radical input and negative/fractional power output. Scalar evaluation and other unrelated derivative families do not close this gap.
- **D01 CANDIDATE FIX**: \`derivative-fractional-powers:medium:0..23\`, 4 explicit synthetic forms combining \`√x\`, \`x√x\`, \`√(x³)\`, \`1/√x\`, \`1/x²\`, and \`1/√(x³)\`. Every task declares **x>0** so the real power rule and reciprocal identities are valid. Three exact rational coefficients are independently graded with labels specifying the derivative powers; PL/EN, correct/wrong/blank grading, stepwise power-law calculations, and 375px/1280px browser witnesses. Historical original coefficients are not disclosed. **Do not add SOURCE_PASS** until P29/P27 direct source-to-answer matching.

**Counters remain** Batch A 6/6; Batch B 0/8, overall 6/14 SOURCE_PASS, formal 6/64=9.4%, bounded map 14/64=21.9%; candidate only 229 families/18,045 variants if merged. F05 original graphics 0/6; broad #106 PAUSED; #142 untouched. A fresh exact-head CI and separate owner approval are required before merge.

## Direct source-to-generator check (2026-11-04, owner-supplied 43 PDF ZIP)

Private source task/answer pages P14/P15 (sequences), P16/P17 (domain), P25/P26 (point and infinity limits), and P27/P29 (derivatives) were **opened directly**, visually inspected and independently checked with exact algebra (the eight skills C01/C03/F01/G01/G02/G03/G05/D01). Prior archive-only source uncertainty is superseded for these specific source-page inspections; unrelated archival comments remain historical.

| Skill | Direct source example | Independent original oracle | Candidate generator/method | Pending gate |
| --- | --- | --- | --- | --- |
| C01 | P15/1a → P14/1a | Polynomial degree numerator smaller than denominator: zero | `sequence-rational:medium:7` (matching degree order, synthetic) | Confirm exact variant browser witness and acceptance |
| C03 | P15/1n → P14/1n | Rationalization, dominant n and positive root coefficient | `sequence-conjugate:hard:12` (scaled root, synthetic) | Source-to-UI acceptance |
| F01 | P17/1h → P16/1h | Intersect closed radical ray and excluded denominator zero | `function-radical-over-linear-domain:medium` (same topology) | Choose actual variant with interior pole; UI acceptance |
| G01 | P26/1l → P25/1l | Nonzero denominator permits direct evaluation | `limit-point:easy` | Source-to-UI acceptance |
| G02 | P26/1a → P25/1a | Common linear factor cancels only away from excluded point | `limit-point:medium` | Source-to-UI acceptance |
| G03 | P26/1c → P25/1c | Cancelling one factor leaves an odd simple pole with opposite one-sided infinities | `limit-cancelled-pole:hard` | Source-to-UI acceptance |
| G05 | P26/2a,b,c,d,g,h,j → P25 same | Conjugation at both +∞ and −∞; correct sign from √(x²)=|x|; root pair and linear cancellation | **New** `limit-root-infinity-conjugates:advanced` (24 synthetic variants) plus existing `limit-conjugate`, `limit-radical-infinity` | PR CI, browser and release |
| D01 | P29/1g,h,i,s → P27 same | Polynomial, radical and reciprocal power rules agree with the source key including indices 3/4/5/6 | **New** `derivative-higher-root-powers:hard` (24 synthetic variants) plus existing `derivative-formula` and `derivative-fractional-powers` | PR CI, browser and release |

All original coefficients/results are retained **only in private source files**, never in committed tests, documentation or screenshots. The public crosswalk records only opaque task pointers, topology and synthetic generator IDs. **Do not mark SOURCE_PASS until same-HEAD unit, production and Chromium tests, an independent source-method review, an authorized merge and same-SHA main CI+Pages PASS.** Counts remain Batch A 6/6, Batch B 0/8 (formal 6/64 = 9.4%); candidate implementation 231 families / 18,093 variants.

## Next acceptance order

1. C01/C03 and G01/G02/G03: use the original source and its key to check actual topology before upgrading any row.
2. F01: include strict / non-strict root and denominator endpoints.
3. G05: evaluate point and ±∞ conjugate families together.
4. D01: decide whether to add a small restricted radical/negative-power generator only after confirming no existing family already implements the required original methods.

**Policy:** No additional SOURCE_PASS is awarded merely for a test running green. A separate owner approval is required for any merge at the final HEAD.

## Repeatable automated acceptance package

The [Batch B QA report](QA_BATCH_B_CODEX_REPORT.md) records the automated method
checks from the post-#169 baseline, with exact synthetic family/level/variant
witnesses. Run `npm run test:batch-b`, `npm run build`, then
`npm run test:e2e:batch-b` for the dedicated production Chromium matrix. The new
manifest supplements the historical witnesses above; it does not attest to a new
private-source inspection or change any SOURCE_PASS counter.
