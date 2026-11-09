# W01–W03 — bounded theory coverage audit (2026-11-09)

## Basis and privacy
Source: the owner's 14-page university lecture (private) and companion problem/answer sheets (private). This is a **concept and pedagogy audit**, not a quotation or distribution of private worksheets. The conceptual descriptions below are independently authored. Competency identifiers: W01–W03.

## Source section → existing student experience → action
| Source slide | Concept | Existing coverage before change | After the proposed change |
| --- | --- | --- | --- |
| 1 | Title | Not a teachable outcome | No change |
| 2 | Function of two variables, domain and 3D graph | Functions appear in exercises, but the concept is not introduced explicitly | Add introductory note in `multivar-partial-point` and `multivar-gradient-point` worked solutions |
| 3 | Point sequences and coordinatewise convergence | Numeric point transformations only | Add coordinatewise convergence to W03 path/continuity worked solutions |
| 4 | Punctured neighborhood and sequential limit criterion | Limit paths and uniform bounds are taught procedurally | State punctured neighborhood and *every sequence* criterion in W03 solutions |
| 5 | Neighborhood and continuity at a point | Equality of limit with point value and three classes already taught | Explicitly distinguish punctured neighborhood from neighborhood and formal equality |
| 6–7 | First partials and the fixed-variable rule | First partials/gradient are computed | Add difference-quotient meaning to W01 beginner worked solutions |
| 8 | Second and mixed partials, equality under continuity hypothesis | Derivative computation and polynomial identity already taught | State the continuity hypothesis rather than an unconditional identity |
| 9 | Worked mixed-partial example | Controlled trigonometric variants exist | Existing; no original exercise copied |
| 10 | Local extrema | Extrema and stationary points taught in W02 | Existing; note source's strict-inequality convention separately |
| 11 | Necessary condition for extrema | Stationarity equations f_x=f_y=0 taught | Explain why necessary does not mean sufficient, plus nondifferentiable candidates |
| 12 | Hessian determinant and sign test | Multiple W02 families and oracles | Existing; no grading changes |
| 13–14 | Worked multi-point extrema example | Nonlinear W02 complete stationary sets | Existing; no original exercise copied |

## Technical scope of this Draft PR
Only adds educational worked-solution text to existing W modules and one focused bilingual test. No new generators, variants, new categories, database/content snapshots, or shared catalog edits. No user-facing standalone theory lesson exists yet: these notes are visible **after opening worked solutions**, not as a separate theory module.

## Acceptance boundaries
- W01 and W02 method-shape source review remains bounded; no claim of verbatim matching coefficients.
- W03 exam-task scope is still unconfirmed; synthetic method coverage is not a formal original-task SOURCE_PASS.
- The source slide defining local extrema uses strict inequalities; this patch does not rewrite the university's convention or alter the application's classification answers.
- CI is NOT_RUN until GitHub Actions completes on the exact new head. Requires owner review and explicit approval before merge.

Refs #108.
