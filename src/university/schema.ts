import type { Matrix } from "../matrices";
import type { Rational } from "../rational";
import type { Difficulty } from "../difficulty";
import type { CategoryId } from "../exercises";
import type { Locale } from "../locales/types";
import type { Polynomial, PolynomialFormula } from "./polynomial";
import type { IntegralProblem } from "./integrals";
import type { DefiniteIntegralFollowupProblem } from "./definiteIntegralFollowup";
import type { FunctionStudyFollowupProblem } from "./functionStudyFollowup";
import type { ImproperIntegralProblem } from "./improperIntegrals";
import type { InteriorImproperProblem } from "./interiorImproper";
import type { AreaArcProblem } from "./areaArc";
import type { HorizontalSliceAreaProblem } from "./horizontalSliceArea";
import type { TwoParabolasAreaProblem } from "./twoParabolasArea";
import type { ParametricArcProblem } from "./parametricArc";
import type { IntegralBasicsFollowupProblem } from "./integralBasicsFollowup";
import type { IntegralMethodsFollowupProblem } from "./integralMethodsFollowup";
import type { FunctionExtensionProblem } from "./functionExtensions";
import type { FunctionDomainExtraProblem } from "./functionDomainsExtra";
import type { FunctionFollowupProblem } from "./functionFollowup";
import type { LimitFollowupProblem } from "./limitFollowup";
import type { FunctionGraphProblem } from "./functionGraphs";
import type { GraphGapProblem } from "./graphGaps";
import type { GraphGapRangeProblem } from "./graphGapRange";
import type { GraphMonotonicityIntervalsProblem } from "./graphMonotonicityIntervals";
import type { DerivativeSketchProblem } from "./derivativeSketch";
import type { GraphPropertyProblem } from "./functionGraphProperties";
import type { GraphInjectivityProblem } from "./graphInjectivity";
import type { GraphDisconnectedInjectivityProblem } from "./graphDisconnectedInjectivity";
import type { NondifferentiabilityProblem } from "./nondifferentiability";
import type { EdgeLimitProblem } from "./edgeLimits";
import type { TrigDerivativeProblem } from "./trigDerivatives";
import type { ProductQuotientProblem } from "./productQuotient";
import type { DerivativeFollowupProblem } from "./derivativeFollowup";
import type { PartialGradientProblem } from "./partialGradient";
import type { MultivarDerivativeFollowupProblem } from "./multivarDerivativeFollowup";
import type { MultivarLimitProblem } from "./multivarLimits";
import type { PolarContinuityProblem } from "./polarContinuity";
import type { RectangularPathProblem } from "./rectangularPaths";
import type { HessianProblem } from "./hessian";
import type { MultivarExtremaProblem } from "./multivarExtrema";
import type { DegenerateDiskProblem } from "./degenerateDisk";
import type { NegativePowerProblem } from "./negativePower";
import type { TriangularThreeProblem } from "./triangularThree";

export type SystemProblem = Readonly<{
  kind: "system";
  coefficients: Matrix;
  rhs: readonly Rational[];
  method: "substitution" | "elimination" | "classification" | "cramer";
  coordinates?: "sum-difference" | "triangular";
  shifts?: readonly Rational[];
}>;
export type FunctionProblem =
  | Readonly<{
      kind: "function-value";
      numerator: Polynomial;
      denominator: Polynomial;
      at: Rational;
      inner?: Polynomial;
      difference?: boolean;
    }>
  | Readonly<{
      kind: "function-domain";
      mode:
        | "all"
        | "one-pole"
        | "two-poles"
        | "root-ray"
        | "root-over-linear"
        | "root-over-two"
        | "root-ratio";
      p: Rational;
      q: Rational;
      r: Rational;
      sign: Rational;
    }>
  | Readonly<{
      kind: "function-zeros";
      formula: PolynomialFormula;
      denominator: Polynomial;
    }>
  | Readonly<{
      kind: "function-linear";
      points: readonly [Rational, Rational, Rational, Rational];
      known?: Polynomial;
      relation?: "sum" | "composition";
    }>
  | Readonly<{ kind: "function-monotonicity"; formula: PolynomialFormula }>
  | Readonly<{
      kind: "function-shape";
      formula: PolynomialFormula;
      target: "vertex" | "range";
    }>
  | Readonly<{
      kind: "function-composition";
      outer: Polynomial;
      inner: Polynomial;
      commutator: boolean;
    }>;
export type RationalExpression =
  | Readonly<{ kind: "ratio"; numerator: Polynomial; denominator: Polynomial }>
  | Readonly<{
      kind: "difference" | "product";
      left: RationalExpression;
      right: RationalExpression;
    }>;
export type GeometricTerm = Readonly<{ coefficient: Rational; base: Rational }>;
export type SequenceProblem =
  | Readonly<{kind:"sequence-power-exponential";coefficient:Rational;denominatorCoefficient:Rational;numeratorBase:Rational;denominatorBase:Rational;numeratorDegree:number;denominatorDegree:number}>
  | Readonly<{kind:"sequence-monotonic-bounded";mode:"reciprocal"|"linear"|"alternating";offset:Rational;amplitude:Rational;shift:number}>
  | Readonly<{kind:"sequence-radical-ratio";a:Rational;b:Rational;c:Rational;linear:Rational;e:Rational;offset:Rational;remainder:Rational;lowerLinear:Rational}>
  | Readonly<{kind:"sequence-exponential-ratio";numerator:readonly GeometricTerm[];denominator:readonly GeometricTerm[]}>
  | Readonly<{kind:"sequence-euler-product";factors:readonly {a:Rational;b:Rational;c:Rational;d:Rational}[]}>
  | Readonly<{ kind: "sequence-rational"; expression: RationalExpression }>
  | Readonly<{
      kind: "sequence-geometric";
      terms: readonly GeometricTerm[];
      denominator?: readonly GeometricTerm[];
    }>
  | Readonly<{
      kind: "sequence-conjugate";
      mode: "basic" | "scaled" | "multiply" | "second-order";
      a: Rational;
      b: Rational;
      k: Rational;
    }>;
export type FunctionLimitProblem =
  | Readonly<{
      kind: "limit-conjugate";
      at: Rational;
      s: Rational;
      k: Rational;
      b: Rational;
      c: Rational;
      mode: "linear" | "quadratic" | "second-order" | "two-roots";
    }>
  | Readonly<{
      kind: "limit-point";
      numerator: PolynomialFormula;
      denominator: Polynomial;
      at: Rational;
      side: "both" | "left" | "right";
      definedAt?: Rational;
    }>
  | Readonly<{
      kind: "limit-infinity";
      expression: RationalExpression;
      direction: "positive" | "negative";
    }>;
export type DerivativeProblem =
  | Readonly<{
      kind: "derivative";
      formula: PolynomialFormula;
      target: "formula" | "point" | "tangent";
      at: Rational;
    }>
  | Readonly<{
      kind: "derivative-analysis";
      formula: PolynomialFormula;
      target: "stationary" | "classification" | "positive" | "negative";
    }>
  | Readonly<{
      kind: "derivative-economics";
      cost: PolynomialFormula;
      revenue: PolynomialFormula;
      target: "cost" | "revenue" | "profit";
      at: Rational;
    }>
  | Readonly<{
      kind: "derivative-rational";
      numerator: PolynomialFormula;
      denominator: Polynomial;
      at: Rational;
    }>
  | Readonly<{
      kind: "derivative-maximum";
      profit: PolynomialFormula;
      cost?: PolynomialFormula;
      revenue?: PolynomialFormula;
      cap: Rational;
    }>;
/** Separate from the 1×1–3×3 answer-matrix model. */
export type SquareDeterminantMatrix = readonly (readonly Rational[])[];
export type DeterminantRowOperation = Readonly<
  | { kind: "add"; target: number; source: number; multiple: Rational }
  | { kind: "swap"; first: number; second: number }
  | { kind: "scale"; row: number; factor: Rational }
>;
/** Bounded Q(√d) coefficient for exact 2×2 worksheets; never substituted for Rational. */
export type RadicalCoefficient = Readonly<{ whole: number; root: number }>;
export type RadicalDeterminantProblem = Readonly<{
  kind: "determinant-radical-two";
  radicand: 2 | 3 | 5 | 7;
  matrix: readonly [
    readonly [RadicalCoefficient, RadicalCoefficient],
    readonly [RadicalCoefficient, RadicalCoefficient],
  ];
}>;
export type DeterminantProblem = Readonly<{
  kind: "determinant";
  method: "laplace-four" | "row-operations" | "laplace-five" | "properties" | "staged-four" | "staged-five" | "gaussian-four" | "gaussian-five";
  matrix: SquareDeterminantMatrix;
  /** Operations reduce the displayed matrix to an upper triangular matrix. */
  reductions?: readonly DeterminantRowOperation[];
  dependentRows?: readonly [number, number];
  /** A dense matrix should not suggest a shortcut using zeros. */
  dense?: boolean;
}>;
export type LinearAlgebraProblem =
  | Readonly<{ kind: "linear-chain-five"; expressions: readonly { a:Rational; b:Rational; c:Rational; denominator:Rational }[]; target:"x"|"y" }>
  | Readonly<{ kind: "linear-rectangular"; matrix: readonly (readonly Rational[])[]; rhs:readonly Rational[] }>
  | Readonly<{ kind: "linear-inverse"; matrix: readonly (readonly Rational[])[]; method: "inverse" | "classification" }>
  | Readonly<{ kind: "linear-application"; matrix: readonly (readonly Rational[])[]; rhs: readonly (readonly Rational[])[]; method: "ax" | "xa" }>
  | Readonly<{ kind: "linear-matrix-equation"; mode: "ax-shift"; left: readonly (readonly Rational[])[]; rhs: readonly (readonly Rational[])[]; shift: Rational }>
  | Readonly<{ kind: "linear-matrix-equation"; mode: "axb"; left: readonly (readonly Rational[])[]; right: readonly (readonly Rational[])[]; rhs: readonly (readonly Rational[])[] }>
  | Readonly<{ kind: "linear-matrix-equation"; mode: "inverse-plus"; left: readonly (readonly Rational[])[]; rhs: readonly (readonly Rational[])[]; shift: Rational }>
  | Readonly<{ kind: "linear-matrix-equation"; mode: "bx-shift"; left: readonly (readonly Rational[])[]; rhs: readonly (readonly Rational[])[]; shift: Rational }>
  | Readonly<{ kind: "linear-rank"; matrix: readonly (readonly Rational[])[] }>
  | Readonly<{ kind: "linear-capelli"; matrix: readonly (readonly Rational[])[]; rhs: readonly Rational[] }>
  | Readonly<{ kind: "linear-rank-given"; rankA: number; rankAugmented: number; variables: number; equations: number }>
  | Readonly<{ kind: "linear-system"; matrix: readonly (readonly Rational[])[]; rhs: readonly Rational[]; method: "gauss" | "classification" | "parameters" }>
  | Readonly<{ kind: "linear-cramer-four"; matrix: readonly (readonly Rational[])[]; rhs: readonly Rational[] }>
  | Readonly<{ kind: "linear-cramer-minors"; matrix: readonly (readonly Rational[])[]; rhs: readonly Rational[] }>
  | Readonly<{ kind: "linear-cramer-diagnostic"; target: "eligibility" | "minors"; matrix: readonly (readonly Rational[])[]; rhs: readonly Rational[] }>
  | Readonly<{ kind: "linear-matrix-pair"; coefficients: readonly [Rational, Rational, Rational, Rational];
      first: readonly (readonly Rational[])[]; second: readonly (readonly Rational[])[] }>
  | Readonly<{ kind: "linear-matrix-practice";
      mode: "power" | "composite" | "compatibility" | "chain" | "rectangular" | "transpose-dimensions";
      expression: "A²" | "A³" | "AB−C" | "(A+B)C" | "A(B−C)" | "(AB)ᵀ−C" | "(AB)ᵀ−(3/2)C" |
        "A+B" | "AB" | "BA" | "AB+C" | "A(B+C)" | "A(BC)" | "AᵀB" | "Aᵀ(B+C)" | "ABᵀ+C" | "(AB)ᵀ+C" | "(A+Bᵀ)C";
      matrices: readonly { label: string; values: Matrix }[] }>;
export type ElementaryAnalysisProblem =
  | Readonly<{ kind: "analysis-log-domain"; mode: "linear" | "ratio" | "radical"; p: Rational; base: Rational }>
  | Readonly<{ kind: "analysis-power-law"; mode: "log-power" | "power-log" | "combined"; base: Rational; exponent: number; argument: Rational }>
  | Readonly<{ kind: "analysis-elementary-equation"; mode: "exponential" | "logarithmic" | "log-product"; base: Rational; p: Rational; multiplier: Rational; shift: Rational; exponent: number }>
  | Readonly<{ kind: "analysis-log-inequality"; p: Rational; base: Rational; exponent: number; relation: "greater" | "at-most" }>
  | Readonly<{ kind: "analysis-absolute"; mode: "equation" | "domain" | "inside" | "sum-inside" | "sum-outside"; p: Rational; q: Rational; radius: Rational }>;
export type AsymptoteProblem =
  | Readonly<{ kind: "analysis-euler"; variable: "sequence" | "function"; mode: "basic" | "scaled" | "ratio" | "offset"; a: Rational; b: Rational; c: Rational }>
  | Readonly<{ kind: "analysis-asymptote-vertical"; mode: "simple" | "hole" | "double" | "cancellation"; at: Rational; coefficient: Rational }>
  | Readonly<{ kind: "analysis-asymptote-horizontal"; mode: "rational" | "radical" | "linear"; a: Rational; b: Rational; c: Rational }>
  | Readonly<{ kind: "analysis-asymptote-oblique"; mode: "rational" | "radical" | "quadratic"; a: Rational; b: Rational; c: Rational; at: Rational }>;
export type AdvancedCalculusProblem =
  | Readonly<{ kind: "analysis-lhospital"; mode: "polynomial-one" | "polynomial-two" | "exponential-one" | "exponential-two"; at: Rational; coefficient: Rational }>
  | Readonly<{ kind: "analysis-lhospital-infinity"; mode: "linear" | "quadratic" | "log-linear" | "log-power"; coefficient: Rational; shift: Rational; power: number }>
  | Readonly<{ kind: "analysis-log-exp-derivative"; mode: "log" | "exp" | "log-abs" | "product"; at: Rational; coefficient: Rational; shift: Rational }>
  | Readonly<{ kind: "analysis-concavity"; mode: "cubic" | "quartic" | "mixed"; at: Rational; coefficient: Rational; cubic: Rational; shift: Rational }>;
export type FunctionStudyProblem = Readonly<{
  kind: "analysis-study-polynomial" | "analysis-study-rational";
  at: Rational;
  coefficient: Rational;
  target: "stationary" | "global";
}>;
export type UniversityProblem =
  | SystemProblem
  | FunctionProblem
  | FunctionExtensionProblem
  | FunctionDomainExtraProblem
  | FunctionFollowupProblem
  | FunctionGraphProblem
  | GraphGapProblem
  | GraphGapRangeProblem
  | GraphMonotonicityIntervalsProblem
  | DerivativeSketchProblem
  | GraphPropertyProblem
  | GraphInjectivityProblem
  | GraphDisconnectedInjectivityProblem
  | NondifferentiabilityProblem
  | EdgeLimitProblem
  | TrigDerivativeProblem
  | ProductQuotientProblem
  | DerivativeFollowupProblem
  | PartialGradientProblem
  | MultivarDerivativeFollowupProblem
  | MultivarLimitProblem
  | PolarContinuityProblem
  | RectangularPathProblem
  | HessianProblem
  | MultivarExtremaProblem
  | DegenerateDiskProblem
  | NegativePowerProblem
  | TriangularThreeProblem
  | SequenceProblem
  | FunctionLimitProblem
  | LimitFollowupProblem
  | DerivativeProblem
  | DeterminantProblem
  | RadicalDeterminantProblem
  | LinearAlgebraProblem
  | ElementaryAnalysisProblem
  | AsymptoteProblem
  | AdvancedCalculusProblem
  | FunctionStudyProblem
  | FunctionStudyFollowupProblem
  | IntegralProblem
  | ImproperIntegralProblem
  | InteriorImproperProblem
  | DefiniteIntegralFollowupProblem
  | AreaArcProblem
  | HorizontalSliceAreaProblem
  | TwoParabolasAreaProblem
  | ParametricArcProblem
  | IntegralBasicsFollowupProblem
  | IntegralMethodsFollowupProblem;
export const isFunctionProblem = (p: UniversityProblem): p is FunctionProblem =>
  p.kind.startsWith("function-");
export const isFunctionGraphProblem = (p: UniversityProblem): p is FunctionGraphProblem | GraphPropertyProblem | GraphInjectivityProblem =>
  p.kind.startsWith("function-graph-");
export const isLinearAlgebraProblem = (p: UniversityProblem): p is LinearAlgebraProblem =>
  p.kind.startsWith("linear-");
export type UniversityFamily = Readonly<{
  id: string;
  category: CategoryId;
  titles: Record<Locale, string>;
  supportedDifficulties: readonly Difficulty[];
  create: (variant: number, difficulty: Difficulty) => UniversityProblem;
}>;
