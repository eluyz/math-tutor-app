# Math Tutor — 64-competency Mathematics coverage map

This is the **English-readable mapping of the project's 64 historical Mathematics competency IDs** to implemented, bounded exercise-family identifiers. The table preserves the original ID/status mapping and all referenced family IDs from the prior map.

**Coverage labels are about particular implemented generator forms, not independent verification of every possible problem or complete university-syllabus acceptance.**

| ID | Mathematics competency | Generator scope | Referenced exercise families |
| --- | --- | --- | --- |
| M01 | Scalar multiplication, addition and subtraction | covered | `matrix-scale`, `matrix-add`, `matrix-subtract`, `matrix-worksheet-composites` |
| M02 | Matrix transpose | covered | `matrix-transpose`, `matrix-worksheet-composites` |
| M03 | Multiplication and dimension compatibility | partial | `matrix-product`, `matrix-dimensions`, `matrix-compatibility`, `matrix-chained-dimensions`, `matrix-rectangular-evaluation`, `matrix-transpose-dimensions`, `matrix-four-factor-dimensions` |
| M04 | Composite operations and powers | partial | `matrix-product`, `matrix-add`, `matrix-powers`, `matrix-composite-operations`, `matrix-rectangular-evaluation`, `matrix-transpose-dimensions`, `matrix-negative-square-two`, `matrix-conjugation-two`, `matrix-negative-square-three`, `matrix-conjugation-three` |
| M05 | Matrix equations and coupled unknown matrices | partial | `inverse-applications`, `inverse-right-applications`, `matrix-coupled-equations`, `matrix-ax-shift`, `matrix-axb`, `matrix-inverse-plus`, `matrix-bx-shift`, `matrix-ax-shift-three`, `matrix-axb-three`, `matrix-ax-shift-four`, `inverse-four-xa-equation` |
| M06 | 2×2 determinants | partial | `determinant-two`, `determinant-radical-two` |
| M07 | 3×3 determinants | covered | `determinant-sarrus` |
| M08 | Laplace expansion for 4×4 matrices with zeros | covered | `determinant-laplace-four`, `determinant-laplace-column-three` |
| M09 | Dense 4×4 determinant and row operations | partial | `determinant-row-operations`, `determinant-dense-four`, `determinant-strategy-four`, `determinant-gaussian-pivot-four` |
| M10 | 5×5 determinants | partial | `determinant-laplace-five`, `determinant-dense-five`, `determinant-strategy-five`, `determinant-gaussian-pivot-five` |
| M11 | Determinant properties and singularity | partial | `determinant-properties`, `determinant-zero-row` |
| M12 | Inverse matrices | partial | `inverse-two`, `inverse-three`, `inverse-existence`, `inverse-four-gauss-jordan` |
| M13 | Equations involving inverse matrices | partial | `inverse-four-ax-equation`, `inverse-applications`, `inverse-right-applications`, `matrix-ax-shift`, `matrix-axb`, `matrix-inverse-plus`, `matrix-bx-shift`, `matrix-ax-shift-three`, `matrix-axb-three`, `inverse-four-xa-equation`, `matrix-ax-shift-four` |
| M14 | Matrix rank | partial | `matrix-rank`, `capelli-matrices`, `matrix-rank-four-square`, `matrix-rank-four-rectangular`, `matrix-rank-five-four`, `matrix-rank-six-three` |
| U01 | Recognizing when Cramer's rule applies | partial | `system-cramer-two`, `system-cramer-three`, `cramer-applicability`, `cramer-four-forced-pivot` |
| U02 | Cramer's rule with three unknowns | covered | `system-cramer-three`, `cramer-determinants-three`, `cramer-eligibility-solve-three` |
| U03 | Cramer's rule with four unknowns | partial | `cramer-four`, `cramer-determinants-four`, `cramer-four-singular-minors`, `cramer-four-forced-pivot` |
| U04 | Equality chains and solving for one unknown | partial | `system-substitution`, `system-chain-five` |
| U05 | Solution counts from given matrix ranks | covered | `capelli-given-ranks`, `capelli-free-parameters` |
| U06 | Classifying systems by computed ranks | partial | `capelli-matrices`, `gauss-classification`, `system-rectangular-3x2`, `system-rectangular-4x3`, `gauss-four-dependent-diagnostic`, `gauss-five-3x5`, `gauss-five-4x5` |
| U07 | Gaussian elimination with one solution | partial | `gauss-unique`, `gauss-four-forced-pivot` |
| U08 | Gaussian parameters and inconsistent systems | partial | `gauss-classification`, `capelli-matrices`, `gauss-parameters-one`, `gauss-parameters-two`, `gauss-rectangular-3x2-parameters`, `gauss-rectangular-4x3-parameters`, `gauss-rectangular-2x3-parameters`, `gauss-four-dependent-diagnostic` |
| C01 | Limits of polynomial and rational sequences | covered | `sequence-rational` |
| C02 | Radicals in sequence quotients | partial | `sequence-conjugate`, `sequence-radical-ratio` |
| C03 | Differences of square roots | covered | `sequence-conjugate` |
| C04 | Limits of exponential sequences | partial | `sequence-geometric`, `sequence-exponential-ratio`, `sequence-power-exponential` |
| C05 | Euler-type limits of the form 1 to infinity | partial | `analysis-euler-sequence`, `sequence-euler-product` |
| C06 | Monotonicity, bounds and sequence concepts | partial | `sequence-monotonic-bounded` |
| F01 | Domains with radicals and fractions | covered | `function-domain`, `function-radical-over-linear-domain` |
| F02 | Domains of logarithmic functions | partial | `analysis-log-domain`, `function-log-rational-domain` |
| F03 | Absolute values and domains | partial | `analysis-absolute` |
| F04 | Domains with multiple constraints | partial | `function-domain`, `analysis-log-domain`, `function-tangent-domain`, `function-mixed-domain` |
| F05 | Reading function properties from graphs | partial | `function-integrated-asymptotes`, `function-integrated-properties`, `function-integrated-jump`, `function-integrated-punctures`, `function-punctured-symmetry`, `function-disconnected-monotonicity`, `function-asymptote-range` |
| F06 | Evenness, composition and inverses | partial | `function-composition`, `function-parity`, `function-affine-inverse`, `function-graph-symmetry`, `function-mobius-inverse-point` |
| F07 | Exponential and logarithmic rules, equations and inequalities | partial | `analysis-power-law`, `analysis-elementary-equation`, `analysis-log-inequality` |
| G01 | Limits by direct substitution | covered | `limit-point` |
| G02 | Indeterminate 0/0 resolved by cancellation | covered | `limit-point` |
| G03 | One-sided limits and nonexistence | covered | `limit-point`, `limit-cancelled-pole` |
| G04 | Limits at infinity with powers and radicals | partial | `limit-infinity`, `analysis-asymptote-horizontal`, `analysis-asymptote-oblique`, `limit-radical-infinity` |
| G05 | Limits using conjugates | covered | `limit-conjugate`, `limit-radical-infinity`, `limit-root-infinity-conjugates` |
| G06 | Euler-type function limits | partial | `analysis-euler-function` |
| G07 | Vertical, horizontal and oblique asymptotes | partial | `analysis-asymptote-vertical`, `analysis-asymptote-horizontal`, `analysis-asymptote-oblique` |
| G08 | Continuity and Heine's criterion | partial | `limit-point`, `limit-piecewise-heine`, `limit-oscillatory-heine` |
| D01 | Power derivatives after simplification | covered | `derivative-formula`, `derivative-fractional-powers`, `derivative-higher-root-powers` |
| D02 | Product and quotient rules | partial | `derivative-formula`, `derivative-rational-point`, `derivative-product-point`, `derivative-quotient-point`, `derivative-quadratic-quotient` |
| D03 | Chain rule and elementary functions | partial | `derivative-formula`, `analysis-log-exp-derivative`, `derivative-trig-chain`, `derivative-trig-special-point` |
| D04 | L'Hôpital's rule | partial | `analysis-lhospital`, `analysis-lhospital-infinity` |
| D05 | Monotonicity and local extrema | partial | `derivative-monotonicity`, `derivative-extrema`, `analysis-study-quartic`, `analysis-study-rational-shift` |
| D06 | Nondifferentiability at critical points | partial | `derivative-absolute-one-sided`, `derivative-piecewise-point`, `derivative-vertical-cusp` |
| D07 | Concavity and inflection points | partial | `analysis-concavity` |
| D08 | Complete function study | partial | `analysis-study-polynomial`, `analysis-study-rational` |
| D09 | Graph sketching from sign tables | partial | `analysis-study-polynomial`, `analysis-study-rational`, `derivative-sign-sketch` |
| D10 | Global extrema | partial | `derivative-profit-maximum` |
| I01 | Direct integration after simplification | partial | `integral-direct`, `integral-direct-product` |
| I02 | Trigonometric and table-based integrals | partial | `integral-table`, `integral-table-arctan` |
| I03 | Integration by substitution | partial | `integral-substitution`, `integral-substitution-definite`, `integral-log-substitution` |
| I04 | Integration by parts | partial | `integral-parts`, `integral-parts-definite`, `integral-parts-trig-linear` |
| I05 | Recurring integrals | partial | `integral-recurring` |
| I06 | Definite and improper integrals | partial | `integral-definite`, `integral-improper-infinity`, `integral-improper-endpoint`, `integral-improper-interior-power` |
| I07 | Area between curves | partial | `integral-area-between`, `integral-area-parabolas`, `integral-area-horizontal-slices` |
| I08 | Arc length | partial | `integral-arc-length`, `integral-arc-parametric` |
| W01 | First- and second-order partial derivatives | partial | `multivar-partial-point`, `multivar-gradient-point`, `multivar-cubic-partial`, `multivar-chain-gradient`, `multivar-elementary-partial`, `multivar-trig-partial`, `multivar-rational-partial`, `multivar-source-shape-partial` |
| W02 | Extrema of two-variable functions | partial | `multivar-stationary-point`, `multivar-hessian-classify`, `multivar-rectangle-extrema`, `multivar-disk-linear-extrema`, `multivar-degenerate-quartic`, `multivar-diagonal-quadratic-disk`, `multivar-cubic-extrema-full`, `multivar-bilinear-extrema`, `multivar-quadratic-cubic-extrema` |
| W03 | Two-variable limits and continuity | partial | `multivar-path-limit`, `multivar-continuity-point`, `multivar-polar-homogeneous-limit`, `multivar-angular-continuity`, `multivar-anisotropic-limit` |

## How to interpret this table

- **covered**: the original mapping identified specific implemented task forms; this is not a claim that all possible forms of the competency are handled.
- **partial**: important cases or exercise forms remain outside the documented generator bounds.
- **missing**, **theory**, and **unverified**: keep the same distinctions if future mapping work introduces them.
- These labels are carried forward from the historical mapping. They must not be mistaken for independent source-workbook acceptance, verified user learning outcomes, or a fresh coverage audit on the current release SHA.
- **Complete syllabus coverage requires independent verification of every required problem type, its worked solution and its test evidence.**

## Evidence and historical constraints

The mapping organizes eight broad areas: matrices (M), systems (U), sequences (C), functions (F), function limits (G), differentiation (D), integration (I), and two-variable functions (W). Referenced family identifiers are validated by automated tests against the current Mathematics catalog.

Historical checkpoints reported **64/64 mapped skills**, **14 bounded**, **50 partial**, and separate SOURCE_PASS numbers. These figures describe different evidence classes at their own dates; do not combine them or claim that 64/64 tasks have passed original-source acceptance.

Statistics has its own bounded pilot and exercise inventory. The `main` baseline contains ST-101 through ST-104. The ST-105 Mode candidate activates the existing Fundamentals topic. See the [Statistics roadmap](docs/SUBJECT_EXPANSION_PLAN.md).

- [Full original 64-competency report, unchanged](docs/archive/legacy-2026-11-20/CURRICULUM_COVERAGE.md) — includes the detailed Polish descriptions, assumptions and method limitations for each row.
- [Source-form closure audit](docs/SYLLABUS_COVERAGE_V2.md)
- [Formal source acceptance matrix](SYLLABUS_ACCEPTANCE.md)
- [Quality evidence register](QA_AUDIT_PROGRESS.md)
- [Generator inventory and historical acceptance notes](GENERATORS.md)
