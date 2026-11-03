# Batch A — six source-to-app acceptance witnesses (#151)

**Status:** evidence collected; **no SOURCE_PASS** awarded. Last checked **2026-11-03** against released **`main@5f8b29a1dacbaf800c720bc5f74ae70c1092c39e`**. This ledger is a provenance and remaining-gate checklist; it does **not** reproduce private source PDF coefficients, scans, or solution keys.

## Statistics (distinct denominators)

| Metric | Result | Scope |
| --- | ---: | --- |
| Syllabus competencies mapped to at least one generator | **64/64** | Index coverage only |
| Generator-bounded / partial competencies | **14/64 / 50/64** | Bounded = 21.9%; partial = 78.1% |
| Released catalogue | **226 families / 17,973 variants** | Not correctness certification |
| Batch A with independent source-text calculations and in-repo regression/browser witnesses | **6/6** | Intermediate evidence only |
| Batch A fully source-accepted | **0/6** | Original-page visual + human semantic gates outstanding |
| Overall #151 SOURCE_PASS | **0/14** | Do not tick any issue checkbox without six-gate sign-off |
| Source text examples or rank patterns independently checked in this batch | **21** | 2 P03 + 8 P09 + 7 P12 systems + 4 P12 rank patterns; NOT 21 full SOURCE_PASS |
| Original F05 six graph sources fully accepted | **0/6** | Separate #122 / #106 status |
| Other eight initially bounded skills, not yet source-accepted | **8/8** | C01, C03, F01, G01, G02, G03, G05, D01 |

**Release witnesses:** [CI #41643677979](https://github.com/eluyz/math-tutor-app/actions/runs/41643677979) and [Pages #41646226673](https://github.com/eluyz/math-tutor-app/actions/runs/41646226673), both successful for the same main SHA. **Source-witness tests:** [#155](https://github.com/eluyz/math-tutor-app/pull/155), [#160](https://github.com/eluyz/math-tutor-app/pull/160), [#158](https://github.com/eluyz/math-tutor-app/pull/158), [#159](https://github.com/eluyz/math-tutor-app/pull/159) (all merged following individual owner approvals).

## Six-skill witness matrix

| Skill | Private original reference | Deployed candidate (family / level / index) | Independent math/source-text evidence | Automated answer/UI evidence | Pending independent source acceptance |
| --- | --- | --- | --- | --- | --- |
| M01 | P03/1a; additional mapped P03/1j,2a | `matrix-worksheet-composites:medium:0` (2×3 3A−B) | P03/1a checked vs source key; entrywise arithmetic | #155, #160, PL+EN, 375/1280px | Visual source page and full bilingual worked-step review |
| M02 | P03/1b; additional mapped P03/1e–f,3 | `matrix-worksheet-composites:medium:1` (3×3 A+Aᵀ) | P03/1b checked vs key; symmetry and entries | #155, #160, PL+EN, 375/1280px | Visual source page and full bilingual worked-step review |
| M07 | P09/1c,d,e,f,n | `determinant-sarrus:easy:1` | Independent signed triple products; five source key checks | #155, #160, PL+EN, 375/1280px | Visual source page and full bilingual worked-step review |
| M08 | P09/1h,l,t | `determinant-laplace-column-three:hard:0` | Three source 4×4 keys checked; sparse third-column shape, signed minor oracle | #158, PL+EN, 375/1280px | Visual source page and full bilingual worked-step review |
| U02 | P12/1a,b,c,d,f,g,h | `cramer-eligibility-solve-three:medium:0` | Independent D and D_i, rank classification and Ax=b; P12 source key not available | #159, PL+EN, 375/1280px | Visual source page and full bilingual worked-step review |
| U05 | P12/3a–d | `capelli-free-parameters:easy:0..3` | Four independent rank/class/number-of-parameters cases | #155, #160, PL+EN, 375/1280px | Visual source page and full bilingual worked-step review |

**Important distinction:** automation validates the generated forms, not that an original PDF example has identical coefficients or a manually inspected every-step explanation. A matching method or question topology suffices only if **all** issue #151 gates are independently proven.

## Acceptance gates for every row

- [x] Map private source reference to a deployed generator family and exact level / variant.
- [x] Independently recalculate a representative original exercise and compare to available key (or derive when key is unavailable).
- [x] Have automated PL/EN correct/wrong/blank answer and worked-solution checks.
- [x] Have automated Chromium 375px and desktop browser checks for the source-form generator.
- [ ] Render/visually verify the original source PDF page against the claimed exercise topology and relevant mathematical details (raw Library PDF copy was not authorized; indexed text alone is not page rendering).
- [ ] Complete an independent human-style semantic review of the pinned generated example's full explanation, both hints, every worked step and reason, in PL and EN.

The checkmarks above are **batch-level capabilities**, not six individual SOURCE_PASS certifications. Where coverage varies by example, retain `NOT_VERIFIED` until each skill is checked separately. **No physical Safari tested.**

## Execution order

1. **Batch A closure:** obtain visually readable original pages P03/P09/P12 without republishing them; conduct exact six-row bilingual semantic review, record visual/step evidence against pinned main SHA, and mark SOURCE_PASS **individually** only for verified rows. The original file viewer currently supplied extracted text but no rendered page images; raw Library-file materialization failed, so do not fabricate visual confirmation.
2. **Batch B (remaining eight bounded skills):** C01/C03 on P15, F01 on P17, G01/G02/G03/G05 on P26, D01 on P29. First obtain the missing private source materials in a readable form; avoid adding synthetic variants until one real source form reveals a gap.
3. **Broader partial skills:** assess the 50 partial rows by actual exam requirements, not by arbitrary completeness. Revisit F05 original graphs, drawing and Hessian/area cases based on documented source need.
4. **Governance:** #151 remains OPEN and **0/14**; #108 parent OPEN; #106 independent bulk QA PAUSED; #142 unmerged and unrelated. No further PR merges without separate exact-HEAD owner consent.

See the detailed [Issue #151 acceptance contract](https://github.com/eluyz/math-tutor-app/issues/151) and [syllabus coverage v2](SYLLABUS_COVERAGE_V2.md).
