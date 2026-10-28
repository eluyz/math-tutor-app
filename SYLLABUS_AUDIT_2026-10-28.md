# Mathematics syllabus completeness — evidence and release audit (2026-10-28)

**Status: NOT COMPLETE.** An extensive generator catalogue is not the same as independently accepted exercise forms, mathematical explanations or confirmed full written-exam coverage.

## Grounding and limits

- Private content inventory covers **43 mathematics PDFs / 221 pages** across **8 sections**, reconciled with a current official syllabus and a 64-skill source-to-task matrix in [SYLLABUS_ACCEPTANCE.md](SYLLABUS_ACCEPTANCE.md).
- This public document deliberately references anonymous `Pxx` identifiers only. Original worksheets, scans, institution identifiers, staff names and private examination records are not published.
- There is **no confirmed past exam paper or weight by problem family** available in the evidence reviewed. The official syllabus includes written assessment and drawing graphs from mathematical properties. Lecture-only subjects may still matter but cannot be converted into fabricated independent practice-exam requirements.
- At the #117 merge, the `main` source contains **210 exercise families / 17,013 variants**; post-merge CI + Pages release verification is tracked separately. After proposed #118 implementation, **211 / 17,085** is only a *candidate*, not a deployed total until owner-approved merge.

## The 64-skill evidence ledger

| Evidence measure | Count | What it actually means |
| --- | ---: | --- |
| Skill IDs mapped to at least one existing family | 64/64 | Breadth of catalog mapping, not demonstrated correctness of the source worksheet |
| Map labels `pokryte` (bounded) | 14 | Existing implemented subcases; not automatically full-source acceptance |
| Map labels `częściowo` | 50 | Broader scope or unverified forms remain; **not** 50 missing generators |
| Acceptance matrix `BOUNDED MATCH` | 14 | Method-level match identified, still needs representative witness |
| `SAMPLE MATCH PENDING` | 41 | Source-to-variant mathematical and teaching comparison unaccepted |
| Source-dependent exceptions | 9 | Includes bounded deployed/witness pending, shape matched, graph pending, drawing, and four lecture-only/unknown rows |

The remaining nine status rows are separately marked in the source matrix: one bounded radical form, one tall-rank shape, one new graph topology, one other area shape review, one drawing gate, and four lecture/theory flags. Totals add to 64. This classification concerns **evidence maturity**, not the arithmetic proportion of syllabus actually taught.

## Ordered next steps (actual source-form gaps before arbitrary generalization)

| Priority | Skill & evidence | Verified observation | Required next action | Completion evidence |
| --- | --- | --- | --- | --- |
| P0 | **I07, P38/2i** | Region boundaries are expressed as `x=±√y`. Existing area families use `y=f(x)`, integration in `dx`. | **MT-EDU-034 / #118:** bounded `x=c±k√(y-h)` horizontal slices; exact `dy` area, 72 cases, independent oracle, PL/EN and browser CI | Mathematical match to source method, 72 variant audit and reviewed solution steps |
| P0 | **D09, P32/4a–b** | Student must sketch from derivative/concavity sign data. Showing a completed SVG is not equivalent to evaluating a sketch; answer key has no model sketch. | **#119:** decide/implement guided checkpoints and an honest offline paper-drawing acceptance flow or owner-approved interactive drawing | Complete graph-reasoning checklist and explicit owner approval of assessment mode |
| P1 | **F05, P21/a–f** | Six source sketches include holes and separated branches. #117 adds *domain only* for one bounded topology. | Validate six witnesses individually (domain, range, zeros, monotonicity, symmetry/one-to-one, gaps) and add only demonstrated uncovered response types | A per-graph source witness and independently checked output for every asked property |
| P1 | **W01/W02, P43/1a–j/2a–h** | Mixed symbolic partials including trig/log/root and nonlinear stationary equations occur; current families are bounded. | Per-witness exact derivative/Hessian audit, then separate targeted implementation packs for any confirmed non-matching forms | Independently derived first/second mixed partials, stationarity, Hessian, and valid classifications |
| P1 | **I07, P38/2g** | Signed curve order changes inside the interval. | Audit the existing `integral-area-between` / `integral-area-parabolas` explanations and splits; add precise form if needed | Correct positive split-area computation including crossing at zero |
| P2 | **All 41 sample-pending rows** | Method-level mapping exists but specific examples and teaching steps not accepted. | A private source witness → exact family/variant/level → independent mathematical answer/method → PL/EN and mobile check, with PASS/NEEDS_FIXES | Inspectable, privacy-safe per-skill acceptance checklist |
| P2 | **C06/F07/G08/W03** | Concept/theory from lectures, not four proven distinct exam calculations | Confirm assessment scope; do not invent missing calculations | Explicit evidence or documented theory-only handling |
| P2 | **QA-003 / #106** | Passing computational tests doesn't certify pedagogy | Validate explanation truthfulness including sign choices, domain exclusions, f′/f″ and the invalid-input path | No open confirmed instructional error in syllabus-critical family |

## Syllabus graduation gate (#108)

1. Every actually required exercise method has a faithful and usable family, or an owner-accepted alternative assessment for non-scalar work such as graph sketches.
2. Each source exercise-form row has at least one checked original witness matched to a generated task at a suitable level, plus independent result and method verification.
3. Verify step-by-step explanations, error feedback for correct/incorrect/invalid input, Polish/English copy and iPhone-size layout.
4. Full verified final **main CI + GitHub Pages on the exact same commit**; all blocking QA issues resolved.
5. **Explicit owner sign-off** before declaring the syllabus complete or unblocking custom-problem Issue #104.

**Governance:** draft implementation PRs may be prepared; never merge another PR without the owner's explicit approval of the final exact HEAD.
