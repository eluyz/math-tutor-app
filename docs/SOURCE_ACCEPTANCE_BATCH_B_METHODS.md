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

## Next acceptance order

1. C01/C03 and G01/G02/G03: use the original source and its key to check actual topology before upgrading any row.
2. F01: include strict / non-strict root and denominator endpoints.
3. G05: evaluate point and ±∞ conjugate families together.
4. D01: decide whether to add a small restricted radical/negative-power generator only after confirming no existing family already implements the required original methods.

**Policy:** No additional SOURCE_PASS is awarded merely for a test running green. A separate owner approval is required for any merge at the final HEAD.
