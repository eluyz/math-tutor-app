# Batch A — six source-to-app acceptance witnesses (#151)

**Status (signed 2026-11-04):** **6/6 Batch A SOURCE_PASS**, limited to the independently verified original-source method forms and pinned generated examples. Proof: [Issue #151 sign-off](https://github.com/eluyz/math-tutor-app/issues/151#issuecomment-6625286771). Deployed `main@733fc73dac208016ffc4876c6798fbde723c11ac`; 226 families / 17,973 variants. No private PDF coefficients, scans, or answer keys reproduced.

## Statistics (distinct denominators)

| Metric | Result | Scope |
| --- | ---: | --- |
| Syllabus competencies mapped to at least one generator | **64/64** | Index coverage only |
| Generator-bounded / partial competencies | **14/64 / 50/64** | Bounded = 21.9%; partial = 78.1% |
| Released catalogue | **226 families / 17,973 variants** | Not correctness certification |
| Batch A with independent source-text calculations and in-repo regression/browser witnesses | **6/6** | Independent exact source arithmetic, bilingual reasons and browser witnesses |
| Batch A source-accepted in bounded method scope | **6/6** | Source page + archived visual provenance and PL/EN semantic sign-off, not all source subproblems |
| Overall #151 SOURCE_PASS | **6/14** | Six independently signed Batch A rows; eight Batch B rows open |
| Source examples/rank patterns independently checked in Batch A | **23** | 4 P03 + 8 P09 + 7 P12 systems + 4 P12 rank patterns; counts are source examples, not family variants |
| Original F05 six graph sources fully accepted | **0/6** | Separate #122 / #106 status |
| Other eight initially bounded skills, not yet source-accepted | **8/8** | C01, C03, F01, G01, G02, G03, G05, D01 |

**Current release witnesses:** [CI #41724981813](https://github.com/eluyz/math-tutor-app/actions/runs/41724981813) and [same-SHA Pages #41727742263](https://github.com/eluyz/math-tutor-app/actions/runs/41727742263), both SUCCESS on `main@733fc73dac208016ffc4876c6798fbde723c11ac`. Source-form independent suites merged via [#155](https://github.com/eluyz/math-tutor-app/pull/155), [#158](https://github.com/eluyz/math-tutor-app/pull/158), [#159](https://github.com/eluyz/math-tutor-app/pull/159), [#160](https://github.com/eluyz/math-tutor-app/pull/160) and [#163](https://github.com/eluyz/math-tutor-app/pull/163).

**Historical original-PDF evidence (private, 2026-10-18):** The user-supplied archived protocols `01_AUDYT_MATERIALOW.md` and `10_KONTROLA_ODPOWIEDZI.md` explicitly report that **all 43 PDF files and 221 pages were visually inspected**, including P03/P09/P12; P08 determinant key 21/21 checked and P10 Cramer answer key inspected. This is **historical source-image provenance**, NOT a fresh rendered-page inspection. Source/form acceptance was signed separately on 2026-11-04 using the original source PDF extracted page text, historical visual audit, new exact independent calculation and current PL/EN/Chromium evidence. The earlier statement that a P12 answer key does not exist is incorrect: P10 is listed in the archived register, although its raw file is not in the currently accessible Library PDF set. Source arithmetic and app evidence remain separately scoped.

## Six-skill witness matrix

| Skill | Private original reference | Deployed candidate (family / level / index) | Independent math/source-text evidence | Automated answer/UI evidence | Final bounded source status |
| --- | --- | --- | --- | --- | --- |
| M01 | P03/1a; additional mapped P03/1j,2a | `matrix-worksheet-composites:medium:0` (2×3 3A−B) | P03/1a checked vs source key; entrywise arithmetic | #155, #160, PL+EN, 375/1280px | SOURCE_PASS (2026-11-04, bounded original-source method; Safari NOT_VERIFIED) |
| M02 | P03/1b; additional mapped P03/1e–f,3 | `matrix-worksheet-composites:medium:1` (3×3 A+Aᵀ) | P03/1b checked vs key; symmetry and entries | #155, #160, PL+EN, 375/1280px | SOURCE_PASS (2026-11-04, bounded original-source method; Safari NOT_VERIFIED) |
| M07 | P09/1c,d,e,f,n | `determinant-sarrus:easy:1` | Independent signed triple products; five source key checks | #155, #160, PL+EN, 375/1280px | SOURCE_PASS (2026-11-04, bounded original-source method; Safari NOT_VERIFIED) |
| M08 | P09/1h,l,t | `determinant-laplace-column-three:hard:0` | Three source 4×4 keys checked; sparse third-column shape, signed minor oracle | #158, PL+EN, 375/1280px | SOURCE_PASS (2026-11-04, bounded original-source method; Safari NOT_VERIFIED) |
| U02 | P12/1a,b,c,d,f,g,h | `cramer-eligibility-solve-three:medium:0` | Independent D and D_i, rank classification and Ax=b; historical private P10 key reviewed in 2026-10-18 audit, but its raw file not available in current live read | #159, PL+EN, 375/1280px | SOURCE_PASS (2026-11-04, bounded original-source method; Safari NOT_VERIFIED) |
| U05 | P12/3a–d | `capelli-free-parameters:easy:0..3` | Four independent rank/class/number-of-parameters cases | #155, #160, PL+EN, 375/1280px | SOURCE_PASS (2026-11-04, bounded original-source method; Safari NOT_VERIFIED) |

**Important distinction:** automation validates the generated forms, not that an original PDF example has identical coefficients or a manually inspected every-step explanation. A matching method or question topology suffices only if **all** issue #151 gates are independently proven.

## Acceptance gates for every row

- [x] Map private source reference to a deployed generator family and exact level / variant.
- [x] Independently recalculate a representative original exercise and compare to available key (or derive when key is unavailable).
- [x] Have automated PL/EN correct/wrong/blank answer and worked-solution checks.
- [x] Have automated Chromium 375px and desktop browser checks for the source-form generator.
- [x] Link historical visual page checks (P03/P09/P12 from 2026-10-18) and current directly extracted original PDF page text to each precise source form and pinned generator; the latest reader did not render new source images.
- [x] Independently review pinned PL/EN mathematical workings, both hints, answer grading (correct/wrong/blank) and source-form fit; full unit/build/375px/1280px Chromium suite PASS at the matching released SHA.

The gates above are now linked to **six individual SOURCE_PASS attestations** in [Issue #151](https://github.com/eluyz/math-tutor-app/issues/151#issuecomment-6625286771) (M01/M02/M07/M08/U02/U05), restricted to the named original source method form and current representative app variant. Other original subproblems remain outside that scope. **No physical Safari tested.**

## Execution order

1. **Batch A CLOSED (2026-11-04, bounded source forms):** six source-to-app attestations independently completed and recorded in #151 against matching full CI/Pages on `main@733fc73dac208016ffc4876c6798fbde723c11ac`. Current original P03/P09/P12 extracted page text and key P02/P08 were checked against exact private historical visual evidence; P10 key is historically documented and Cramer results were independently derived. No fresh rendered page images or Safari claimed. All other original PDF subproblems remain outside this bounded sign-off.
2. **Batch B (remaining eight bounded skills):** C01/C03 on P15, F01 on P17, G01/G02/G03/G05 on P26, D01 on P29. The private 2026-10-18 archive already reports **visual source review** of P15/P17/P26/P29 and independent selected arithmetic for P15/P17/P26, plus numerical checks of 38 P29 derivatives. Use those archived, scope-limited witnesses first. Their original raw PDFs are not mounted here; do not claim new direct PDF inspection or full symbolic derivative proofs. Add no synthetic variants unless an authentic source-form gap is confirmed.
3. **Broader partial skills:** assess the 50 partial rows by actual exam requirements, not by arbitrary completeness. Revisit F05 original graphs, drawing and Hessian/area cases based on documented source need.
4. **Governance:** #151 remains OPEN with **6/14 SOURCE_PASS**; #108 parent OPEN; #106 independent bulk QA PAUSED; #142 unmerged and unrelated. No further PR merges without separate exact-HEAD owner consent.

See the detailed [Issue #151 acceptance contract](https://github.com/eluyz/math-tutor-app/issues/151) and [syllabus coverage v2](SYLLABUS_COVERAGE_V2.md).
