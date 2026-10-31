/**
 * Curated competency-to-family search map (MT-UX-002).
 * Source: CURRICULUM_COVERAGE.md, 64 competency rows on main 2026-10-30.
 * F05 also includes six newer deployed, synthetic graph families.
 * This is a navigation index, NOT an exam/syllabus acceptance certificate.
 * Keep family IDs and bounded statuses in sync with the coverage document.
 */
export type CompetencyCoverage = "bounded" | "partial";
export type CompetencyDefinition = Readonly<{
  coverage: CompetencyCoverage;
  familyIds: readonly string[];
}>;

export const competencyIndex: Readonly<Record<string, CompetencyDefinition>> = {
  "M01": {
    "coverage": "bounded",
    "familyIds": [
      "matrix-scale",
      "matrix-add",
      "matrix-subtract"
    ]
  },
  "M02": {
    "coverage": "bounded",
    "familyIds": [
      "matrix-transpose"
    ]
  },
  "M03": {
    "coverage": "partial",
    "familyIds": [
      "matrix-product",
      "matrix-dimensions",
      "matrix-compatibility",
      "matrix-chained-dimensions",
      "matrix-rectangular-evaluation",
      "matrix-transpose-dimensions",
      "matrix-four-factor-dimensions"
    ]
  },
  "M04": {
    "coverage": "partial",
    "familyIds": [
      "matrix-product",
      "matrix-add",
      "matrix-powers",
      "matrix-composite-operations",
      "matrix-rectangular-evaluation",
      "matrix-transpose-dimensions",
      "matrix-negative-square-two",
      "matrix-conjugation-two",
      "matrix-negative-square-three",
      "matrix-conjugation-three"
    ]
  },
  "M05": {
    "coverage": "partial",
    "familyIds": [
      "inverse-applications",
      "inverse-right-applications",
      "matrix-coupled-equations",
      "matrix-ax-shift",
      "matrix-axb",
      "matrix-inverse-plus",
      "matrix-bx-shift",
      "matrix-ax-shift-three",
      "matrix-axb-three",
      "matrix-ax-shift-four",
      "inverse-four-xa-equation"
    ]
  },
  "M06": {
    "coverage": "partial",
    "familyIds": [
      "determinant-two",
      "determinant-radical-two"
    ]
  },
  "M07": {
    "coverage": "bounded",
    "familyIds": [
      "determinant-sarrus"
    ]
  },
  "M08": {
    "coverage": "bounded",
    "familyIds": [
      "determinant-laplace-four"
    ]
  },
  "M09": {
    "coverage": "partial",
    "familyIds": [
      "determinant-row-operations",
      "determinant-dense-four",
      "determinant-strategy-four",
      "determinant-gaussian-pivot-four"
    ]
  },
  "M10": {
    "coverage": "partial",
    "familyIds": [
      "determinant-laplace-five",
      "determinant-dense-five",
      "determinant-strategy-five",
      "determinant-gaussian-pivot-five"
    ]
  },
  "M11": {
    "coverage": "partial",
    "familyIds": [
      "determinant-properties",
      "determinant-zero-row"
    ]
  },
  "M12": {
    "coverage": "partial",
    "familyIds": [
      "inverse-two",
      "inverse-three",
      "inverse-existence",
      "inverse-four-gauss-jordan"
    ]
  },
  "M13": {
    "coverage": "partial",
    "familyIds": [
      "inverse-four-ax-equation",
      "inverse-applications",
      "inverse-right-applications",
      "matrix-ax-shift",
      "matrix-axb",
      "matrix-inverse-plus",
      "matrix-bx-shift",
      "matrix-ax-shift-three",
      "matrix-axb-three",
      "inverse-four-xa-equation",
      "matrix-ax-shift-four"
    ]
  },
  "M14": {
    "coverage": "partial",
    "familyIds": [
      "matrix-rank",
      "capelli-matrices",
      "matrix-rank-four-square",
      "matrix-rank-four-rectangular",
      "matrix-rank-five-four",
      "matrix-rank-six-three"
    ]
  },
  "U01": {
    "coverage": "partial",
    "familyIds": [
      "system-cramer-two",
      "system-cramer-three",
      "cramer-applicability",
      "cramer-four-forced-pivot"
    ]
  },
  "U02": {
    "coverage": "bounded",
    "familyIds": [
      "system-cramer-three",
      "cramer-determinants-three"
    ]
  },
  "U03": {
    "coverage": "partial",
    "familyIds": [
      "cramer-four",
      "cramer-determinants-four",
      "cramer-four-singular-minors",
      "cramer-four-forced-pivot"
    ]
  },
  "U04": {
    "coverage": "partial",
    "familyIds": [
      "system-substitution",
      "system-chain-five"
    ]
  },
  "U05": {
    "coverage": "bounded",
    "familyIds": [
      "capelli-given-ranks"
    ]
  },
  "U06": {
    "coverage": "partial",
    "familyIds": [
      "capelli-matrices",
      "gauss-classification",
      "system-rectangular-3x2",
      "system-rectangular-4x3",
      "gauss-four-dependent-diagnostic",
      "gauss-five-3x5",
      "gauss-five-4x5"
    ]
  },
  "U07": {
    "coverage": "partial",
    "familyIds": [
      "gauss-unique",
      "gauss-four-forced-pivot"
    ]
  },
  "U08": {
    "coverage": "partial",
    "familyIds": [
      "gauss-classification",
      "capelli-matrices",
      "gauss-parameters-one",
      "gauss-parameters-two",
      "gauss-rectangular-3x2-parameters",
      "gauss-rectangular-4x3-parameters",
      "gauss-rectangular-2x3-parameters",
      "gauss-four-dependent-diagnostic"
    ]
  },
  "C01": {
    "coverage": "bounded",
    "familyIds": [
      "sequence-rational"
    ]
  },
  "C02": {
    "coverage": "partial",
    "familyIds": [
      "sequence-conjugate",
      "sequence-radical-ratio"
    ]
  },
  "C03": {
    "coverage": "bounded",
    "familyIds": [
      "sequence-conjugate"
    ]
  },
  "C04": {
    "coverage": "partial",
    "familyIds": [
      "sequence-geometric",
      "sequence-exponential-ratio",
      "sequence-power-exponential"
    ]
  },
  "C05": {
    "coverage": "partial",
    "familyIds": [
      "analysis-euler-sequence",
      "sequence-euler-product"
    ]
  },
  "C06": {
    "coverage": "partial",
    "familyIds": [
      "sequence-monotonic-bounded"
    ]
  },
  "F01": {
    "coverage": "bounded",
    "familyIds": [
      "function-domain"
    ]
  },
  "F02": {
    "coverage": "partial",
    "familyIds": [
      "analysis-log-domain",
      "function-log-rational-domain"
    ]
  },
  "F03": {
    "coverage": "partial",
    "familyIds": [
      "analysis-absolute"
    ]
  },
  "F04": {
    "coverage": "partial",
    "familyIds": [
      "function-domain",
      "analysis-log-domain",
      "function-tangent-domain",
      "function-mixed-domain"
    ]
  },
  "F05": {
    "coverage": "partial",
    "familyIds": [
      "function-graph-domain-range",
      "function-graph-zeros",
      "function-graph-monotonicity",
      "function-graph-extrema",
      "function-graph-symmetry",
      "function-graph-injectivity",
      "function-disconnected-domain",
      "function-disconnected-range",
      "function-disconnected-injectivity",
      "function-disconnected-monotonicity",
      "function-punctured-symmetry",
      "function-asymptote-range",
      "function-integrated-properties",
      "function-integrated-jump",
      "function-integrated-punctures",
      "function-integrated-asymptotes"
    ]
  },
  "F06": {
    "coverage": "partial",
    "familyIds": [
      "function-composition",
      "function-parity",
      "function-affine-inverse",
      "function-graph-symmetry",
      "function-mobius-inverse-point"
    ]
  },
  "F07": {
    "coverage": "partial",
    "familyIds": [
      "analysis-power-law",
      "analysis-elementary-equation",
      "analysis-log-inequality"
    ]
  },
  "G01": {
    "coverage": "bounded",
    "familyIds": [
      "limit-point"
    ]
  },
  "G02": {
    "coverage": "bounded",
    "familyIds": [
      "limit-point"
    ]
  },
  "G03": {
    "coverage": "bounded",
    "familyIds": [
      "limit-point"
    ]
  },
  "G04": {
    "coverage": "partial",
    "familyIds": [
      "limit-infinity",
      "analysis-asymptote-horizontal",
      "analysis-asymptote-oblique",
      "limit-radical-infinity"
    ]
  },
  "G05": {
    "coverage": "bounded",
    "familyIds": [
      "limit-conjugate"
    ]
  },
  "G06": {
    "coverage": "partial",
    "familyIds": [
      "analysis-euler-function"
    ]
  },
  "G07": {
    "coverage": "partial",
    "familyIds": [
      "analysis-asymptote-vertical",
      "analysis-asymptote-horizontal",
      "analysis-asymptote-oblique"
    ]
  },
  "G08": {
    "coverage": "partial",
    "familyIds": [
      "limit-point",
      "limit-piecewise-heine",
      "limit-oscillatory-heine"
    ]
  },
  "D01": {
    "coverage": "bounded",
    "familyIds": [
      "derivative-formula"
    ]
  },
  "D02": {
    "coverage": "partial",
    "familyIds": [
      "derivative-formula",
      "derivative-rational-point",
      "derivative-product-point",
      "derivative-quotient-point",
      "derivative-quadratic-quotient"
    ]
  },
  "D03": {
    "coverage": "partial",
    "familyIds": [
      "derivative-formula",
      "analysis-log-exp-derivative",
      "derivative-trig-chain",
      "derivative-trig-special-point"
    ]
  },
  "D04": {
    "coverage": "partial",
    "familyIds": [
      "analysis-lhospital",
      "analysis-lhospital-infinity"
    ]
  },
  "D05": {
    "coverage": "partial",
    "familyIds": [
      "derivative-monotonicity",
      "derivative-extrema",
      "analysis-study-quartic",
      "analysis-study-rational-shift"
    ]
  },
  "D06": {
    "coverage": "partial",
    "familyIds": [
      "derivative-absolute-one-sided",
      "derivative-piecewise-point",
      "derivative-vertical-cusp"
    ]
  },
  "D07": {
    "coverage": "partial",
    "familyIds": [
      "analysis-concavity"
    ]
  },
  "D08": {
    "coverage": "partial",
    "familyIds": [
      "analysis-study-polynomial",
      "analysis-study-rational"
    ]
  },
  "D09": {
    "coverage": "partial",
    "familyIds": [
      "analysis-study-polynomial",
      "analysis-study-rational",
      "derivative-sign-sketch"
    ]
  },
  "D10": {
    "coverage": "partial",
    "familyIds": [
      "derivative-profit-maximum"
    ]
  },
  "I01": {
    "coverage": "partial",
    "familyIds": [
      "integral-direct",
      "integral-direct-product"
    ]
  },
  "I02": {
    "coverage": "partial",
    "familyIds": [
      "integral-table",
      "integral-table-arctan"
    ]
  },
  "I03": {
    "coverage": "partial",
    "familyIds": [
      "integral-substitution",
      "integral-substitution-definite",
      "integral-log-substitution"
    ]
  },
  "I04": {
    "coverage": "partial",
    "familyIds": [
      "integral-parts",
      "integral-parts-definite",
      "integral-parts-trig-linear"
    ]
  },
  "I05": {
    "coverage": "partial",
    "familyIds": [
      "integral-recurring"
    ]
  },
  "I06": {
    "coverage": "partial",
    "familyIds": [
      "integral-definite",
      "integral-improper-infinity",
      "integral-improper-endpoint",
      "integral-improper-interior-power"
    ]
  },
  "I07": {
    "coverage": "partial",
    "familyIds": [
      "integral-area-between",
      "integral-area-parabolas",
      "integral-area-horizontal-slices"
    ]
  },
  "I08": {
    "coverage": "partial",
    "familyIds": [
      "integral-arc-length",
      "integral-arc-parametric"
    ]
  },
  "W01": {
    "coverage": "partial",
    "familyIds": [
      "multivar-partial-point",
      "multivar-gradient-point",
      "multivar-cubic-partial",
      "multivar-chain-gradient"
    ]
  },
  "W02": {
    "coverage": "partial",
    "familyIds": [
      "multivar-stationary-point",
      "multivar-hessian-classify",
      "multivar-rectangle-extrema",
      "multivar-disk-linear-extrema",
      "multivar-degenerate-quartic",
      "multivar-diagonal-quadratic-disk"
    ]
  },
  "W03": {
    "coverage": "partial",
    "familyIds": [
      "multivar-path-limit",
      "multivar-continuity-point",
      "multivar-polar-homogeneous-limit",
      "multivar-angular-continuity",
      "multivar-anisotropic-limit"
    ]
  }
};

/** Exact normalized PL/EN learning-intent phrases; deliberately not fuzzy synonyms. */
export const competencyAliases: Readonly<Record<string, string>> = {
  "mnozenie macierzy": "M03",
  "matrix multiplication": "M03",
  "wyznacznik 5x5": "M10",
  "5x5 determinant": "M10",
  "cramer 4x4": "U03",
  "metoda cramera 4x4": "U03",
  "wlasnosci wykresu": "F05",
  "graph properties": "F05",
  "szkic z tabeli": "D09",
  "sketch from sign chart": "D09",
  "calka przez czesci": "I04",
  "integration by parts": "I04",
  "pochodne czastkowe": "W01",
  "partial derivatives": "W01",
  "ekstrema 2d": "W02",
  "two variable extrema": "W02",
  "granice 2d": "W03",
  "multivariable limits": "W03"
};
