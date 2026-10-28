import type { TypedExercise, CategoryId } from "../exercises";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { GeneratedTask } from "../generators";
import type { UniversityProblem, LinearAlgebraProblem, ElementaryAnalysisProblem, AsymptoteProblem, AdvancedCalculusProblem, FunctionStudyProblem } from "./schema";
import { systemFamilies, presentSystem } from "./systems";
import { functionFamilies, presentFunction } from "./functions";
import { functionExtensionFamilies, presentFunctionExtension } from "./functionExtensions";
import { functionDomainExtraFamilies, presentFunctionDomainExtra } from "./functionDomainsExtra";
import { functionFollowupFamilies, presentFunctionFollowup } from "./functionFollowup";
import { functionGraphFamilies, presentFunctionGraph } from "./functionGraphs";
import { graphPropertyFamilies, presentGraphProperty } from "./functionGraphProperties";
import { nondifferentiabilityFamilies, presentNondifferentiability } from "./nondifferentiability";
import { edgeLimitFamilies, presentEdgeLimit } from "./edgeLimits";
import { trigDerivativeFamilies, presentTrigDerivative } from "./trigDerivatives";
import { productQuotientFamilies, presentProductQuotient } from "./productQuotient";
import { derivativeFollowupFamilies, presentDerivativeFollowup } from "./derivativeFollowup";
import { partialGradientFamilies, presentPartialGradient } from "./partialGradient";
import { multivarDerivativeFollowupFamilies, presentMultivarDerivativeFollowup } from "./multivarDerivativeFollowup";
import { multivarLimitFamilies, presentMultivarLimit } from "./multivarLimits";
import { polarContinuityFamilies, presentPolarContinuity } from "./polarContinuity";
import { rectangularPathFamilies, presentRectangularPath } from "./rectangularPaths";
import { hessianFamilies, presentHessian } from "./hessian";
import { multivarExtremaFamilies, presentMultivarExtrema } from "./multivarExtrema";
import { degenerateDiskFamilies, presentDegenerateDisk } from "./degenerateDisk";
import { negativePowerFamilies, presentNegativePower } from "./negativePower";
import { triangularThreeFamilies, presentTriangularThree } from "./triangularThree";
import { sequenceFamilies, presentSequence } from "./sequences";
import { sequenceExtensionFamilies, presentSequenceExtension } from "./sequenceExtensions";
import { sequenceFollowupFamilies, presentSequenceFollowup } from "./sequenceFollowup";
import { functionLimitFamilies, presentFunctionLimit } from "./functionLimits";
import { limitFollowupFamilies, presentLimitFollowup } from "./limitFollowup";
import { derivativeFamilies, presentDerivative } from "./derivatives";
import { determinantFamilies, presentDeterminant } from "./determinants";
import { determinantStrategyFamilies } from "./determinantStrategies";
import { gaussianPivotFamilies, presentGaussianPivot } from "./gaussianPivotDeterminants";
import { inverseFamilies, presentInverse } from "./inverses";
import { inverseFourFamilies } from "./inverseFour";
import { inverseFourFollowupFamilies } from "./inverseFourFollowup";
import { rankFamilies, presentRank } from "./ranks";
import { rankExtensionFamilies } from "./rankExtensions";
import { tallRankFamilies } from "./rankTall";
import { gaussFamilies, presentGauss } from "./gauss";
import { gaussCramerFollowupFamilies } from "./gaussCramerFollowup";
import { gaussParameterFamilies, presentGaussParameters } from "./gaussParameters";
import { gaussRectangularParameterFamilies } from "./gaussRectangularParameters";
import { gaussFiveFamilies } from "./gaussFive";
import { chainFamilies, presentChain } from "./chainEqualities";
import { rectangularFamilies, presentRectangular } from "./rectangularSystems";
import { cramerFourFamilies, presentCramerFour } from "./cramerFour";
import { cramerIntermediateFamilies, presentCramerMinors } from "./cramerIntermediate";
import { cramerDiagnosticFamilies, presentCramerDiagnostic } from "./cramerDiagnostics";
import { matrixPairFamilies, presentMatrixPair } from "./matrixPair";
import { advancedMatrixEquationFamilies, presentAdvancedMatrixEquation } from "./matrixEquations";
import { matrixPracticeFamilies, presentMatrixPractice } from "./matrixPractice";
import { matrixP0CFamilies, presentMatrixP0C } from "./matrixP0C";
import { elementaryAnalysisFamilies, presentElementaryAnalysis } from "./elementaryAnalysis";
import { asymptoteFamilies, presentAsymptote } from "./analysisLimitsAsymptotes";
import { advancedCalculusFamilies, presentAdvancedCalculus } from "./advancedCalculus";
import { functionStudyFamilies, presentFunctionStudy } from "./functionStudy";
import { functionStudyFollowupFamilies, presentFunctionStudyFollowup } from "./functionStudyFollowup";
import { integralFamilies, presentIntegral } from "./integrals";
import { definiteIntegralFollowupFamilies, presentDefiniteIntegralFollowup } from "./definiteIntegralFollowup";
import { improperIntegralFamilies, presentImproperIntegral } from "./improperIntegrals";
import { interiorImproperFamilies, presentInteriorImproper } from "./interiorImproper";
import { areaArcFamilies, presentAreaArc } from "./areaArc";
import { twoParabolasAreaFamilies, presentTwoParabolasArea } from "./twoParabolasArea";
import { parametricArcFamilies, presentParametricArc } from "./parametricArc";
import { integralBasicsFollowupFamilies, presentIntegralBasicsFollowup } from "./integralBasicsFollowup";
import { integralMethodsFollowupFamilies, presentIntegralMethodsFollowup } from "./integralMethodsFollowup";

export const UNIVERSITY_VARIANTS = 24;
export const universityFamilies = [
  ...systemFamilies,
  ...functionFamilies,
  ...functionExtensionFamilies,
  ...functionDomainExtraFamilies,
  ...functionFollowupFamilies,
  ...functionGraphFamilies,
  ...graphPropertyFamilies,
  ...nondifferentiabilityFamilies,
  ...edgeLimitFamilies,
  ...trigDerivativeFamilies,
  ...productQuotientFamilies,
  ...derivativeFollowupFamilies,
  ...partialGradientFamilies,
  ...multivarDerivativeFollowupFamilies,
  ...multivarLimitFamilies,
  ...polarContinuityFamilies,
  ...rectangularPathFamilies,
  ...hessianFamilies,
  ...multivarExtremaFamilies,
  ...degenerateDiskFamilies,
  ...negativePowerFamilies,
  ...triangularThreeFamilies,
  ...sequenceFamilies,
  ...sequenceExtensionFamilies,
  ...sequenceFollowupFamilies,
  ...functionLimitFamilies,
  ...limitFollowupFamilies,
  ...derivativeFamilies,
  ...determinantFamilies,
  ...determinantStrategyFamilies,
  ...gaussianPivotFamilies,
  ...inverseFamilies,
  ...inverseFourFamilies,
  ...inverseFourFollowupFamilies,
  ...rankFamilies,
  ...rankExtensionFamilies,
  ...tallRankFamilies,
  ...gaussFamilies,
  ...gaussCramerFollowupFamilies,
  ...gaussParameterFamilies,
  ...gaussRectangularParameterFamilies,
  ...gaussFiveFamilies,
  ...chainFamilies,
  ...rectangularFamilies,
  ...cramerFourFamilies,
  ...cramerIntermediateFamilies,
  ...cramerDiagnosticFamilies,
  ...matrixPairFamilies,
  ...advancedMatrixEquationFamilies,
  ...matrixPracticeFamilies,
  ...matrixP0CFamilies,
  ...elementaryAnalysisFamilies,
  ...asymptoteFamilies,
  ...advancedCalculusFamilies,
  ...functionStudyFamilies,
  ...functionStudyFollowupFamilies,
  ...integralFamilies,
  ...definiteIntegralFollowupFamilies,
  ...improperIntegralFamilies,
  ...interiorImproperFamilies,
  ...areaArcFamilies,
  ...twoParabolasAreaFamilies,
  ...parametricArcFamilies,
  ...integralBasicsFollowupFamilies,
  ...integralMethodsFollowupFamilies,
];
const isElementaryAnalysis = (problem: UniversityProblem): problem is ElementaryAnalysisProblem => problem.kind.startsWith("analysis-");
const isAsymptote = (problem: UniversityProblem): problem is AsymptoteProblem => problem.kind === "analysis-euler" || problem.kind.startsWith("analysis-asymptote-");
const isAdvancedCalculus = (problem: UniversityProblem): problem is AdvancedCalculusProblem => problem.kind === "analysis-lhospital" || problem.kind === "analysis-lhospital-infinity" || problem.kind === "analysis-log-exp-derivative" || problem.kind === "analysis-concavity";
const isFunctionStudy = (problem: UniversityProblem): problem is FunctionStudyProblem => problem.kind === "analysis-study-polynomial" || problem.kind === "analysis-study-rational";
const isInverse = (problem: UniversityProblem): problem is Extract<LinearAlgebraProblem,{kind:"linear-inverse"|"linear-application"}> => problem.kind === "linear-inverse" || problem.kind === "linear-application";
const isRank = (problem: UniversityProblem): problem is Extract<LinearAlgebraProblem,{kind:"linear-rank"|"linear-capelli"|"linear-rank-given"}> => problem.kind === "linear-rank" || problem.kind === "linear-capelli" || problem.kind === "linear-rank-given";
const present = (problem: UniversityProblem, locale: Locale) =>
  (problem.kind === "matrix-four-factor-dimensions" || problem.kind === "multivar-anisotropic-limit")
    ? presentRectangularPath(problem,locale)
    : problem.kind === "integral-log-substitution" || problem.kind === "integral-parts-trig-linear"
    ? presentIntegralMethodsFollowup(problem,locale)
    : problem.kind === "integral-improper-interior-power" || problem.kind === "integral-improper-interior-pv"
    ? presentInteriorImproper(problem,locale)
    : problem.kind === "integral-improper-infinity" || problem.kind === "integral-improper-endpoint"
    ? presentImproperIntegral(problem, locale)
    : problem.kind === "integral-direct-product" || problem.kind === "integral-table-arctan"
    ? presentIntegralBasicsFollowup(problem, locale)
    : problem.kind === "integral-substitution-definite" || problem.kind === "integral-parts-definite"
    ? presentDefiniteIntegralFollowup(problem, locale)
    : problem.kind === "integral"
    ? presentIntegral(problem, locale)
    : problem.kind === "integral-arc-parametric"
    ? presentParametricArc(problem,locale)
    : problem.kind === "integral-area-parabolas"
    ? presentTwoParabolasArea(problem,locale)
    : problem.kind === "integral-area-between" || problem.kind === "integral-arc-length"
    ? presentAreaArc(problem,locale)
    : problem.kind === "analysis-study-quartic" || problem.kind === "analysis-study-rational-shift"
    ? presentFunctionStudyFollowup(problem, locale)
    : isFunctionStudy(problem)
    ? presentFunctionStudy(problem, locale)
    : isAdvancedCalculus(problem)
    ? presentAdvancedCalculus(problem, locale)
    : isAsymptote(problem)
    ? presentAsymptote(problem, locale)
    : isElementaryAnalysis(problem)
    ? presentElementaryAnalysis(problem, locale)
    : problem.kind === "multivar-polar-homogeneous-limit" || problem.kind === "multivar-angular-continuity"
    ? presentPolarContinuity(problem, locale)
    : problem.kind === "multivar-path-limit" || problem.kind === "multivar-continuity-point"
    ? presentMultivarLimit(problem, locale)
    : problem.kind === "matrix-negative-square-three" || problem.kind === "matrix-conjugation-three"
    ? presentTriangularThree(problem, locale)
    : problem.kind === "matrix-negative-square-two" || problem.kind === "matrix-conjugation-two"
    ? presentNegativePower(problem, locale)
    : problem.kind === "multivar-degenerate-quartic" || problem.kind === "multivar-diagonal-quadratic-disk"
    ? presentDegenerateDisk(problem, locale)
    : problem.kind === "multivar-rectangle-extrema" || problem.kind === "multivar-disk-linear-extrema"
    ? presentMultivarExtrema(problem, locale)
    : problem.kind === "multivar-stationary-point" || problem.kind === "multivar-hessian-classify"
    ? presentHessian(problem, locale)
    : problem.kind === "multivar-cubic-partial" || problem.kind === "multivar-chain-gradient"
    ? presentMultivarDerivativeFollowup(problem,locale)
    : problem.kind === "multivar-partial-point" || problem.kind === "multivar-gradient-point"
    ? presentPartialGradient(problem,locale)
    : problem.kind === "derivative-quadratic-quotient" || problem.kind === "derivative-log-quadratic"
    ? presentDerivativeFollowup(problem, locale)
    : problem.kind === "derivative-product-point" || problem.kind === "derivative-quotient-point"
    ? presentProductQuotient(problem, locale)
    : problem.kind === "derivative-trig-chain" || problem.kind === "derivative-trig-special-point"
    ? presentTrigDerivative(problem, locale)
    : problem.kind === "derivative-vertical-cusp" || problem.kind === "limit-oscillatory-heine"
    ? presentEdgeLimit(problem,locale)
    : problem.kind === "derivative-absolute-one-sided" || problem.kind === "derivative-piecewise-point"
    ? presentNondifferentiability(problem, locale)
    : problem.kind === "function-graph-monotonicity" || problem.kind === "function-graph-extrema" || problem.kind === "function-graph-symmetry"
    ? presentGraphProperty(problem, locale)
    : problem.kind === "function-graph-domain-range" || problem.kind === "function-graph-zeros"
    ? presentFunctionGraph(problem, locale)
    : problem.kind === "function-log-rational-domain" || problem.kind === "function-mobius-inverse-point"
    ? presentFunctionFollowup(problem, locale)
    : problem.kind === "function-tangent-domain" || problem.kind === "function-mixed-domain"
    ? presentFunctionDomainExtra(problem, locale)
    : problem.kind === "function-parity" || problem.kind === "function-affine-inverse"
    ? presentFunctionExtension(problem, locale)
    : problem.kind === "linear-matrix-practice" && (problem.mode === "rectangular" || problem.mode === "transpose-dimensions")
    ? presentMatrixP0C(problem as Extract<LinearAlgebraProblem,{kind:"linear-matrix-practice"}> & {mode:"rectangular"|"transpose-dimensions"}, locale)
    : problem.kind === "linear-matrix-practice"
    ? presentMatrixPractice(problem, locale)
    : problem.kind === "linear-matrix-pair"
    ? presentMatrixPair(problem, locale)
    : problem.kind === "linear-matrix-equation"
    ? presentAdvancedMatrixEquation(problem, locale)
    : isInverse(problem)
    ? presentInverse(problem, locale)
    : isRank(problem)
    ? presentRank(problem, locale)
    : problem.kind === "linear-chain-five"
    ? presentChain(problem, locale)
    : problem.kind === "linear-rectangular"
    ? presentRectangular(problem, locale)
    : problem.kind === "linear-system"
    ? problem.method === "parameters" ? presentGaussParameters(problem, locale) : presentGauss(problem, locale)
    : problem.kind === "linear-cramer-diagnostic"
    ? presentCramerDiagnostic(problem, locale)
    : problem.kind === "linear-cramer-minors"
    ? presentCramerMinors(problem, locale)
    : problem.kind === "linear-cramer-four"
    ? presentCramerFour(problem, locale)
    : problem.kind === "determinant"
    ? (problem.method==="gaussian-four"||problem.method==="gaussian-five"
        ? presentGaussianPivot(problem,locale) : presentDeterminant(problem, locale))
    : problem.kind === "system"
      ? presentSystem(problem, locale)
      : problem.kind === "sequence-power-exponential" ||
          problem.kind === "sequence-monotonic-bounded"
        ? presentSequenceFollowup(problem, locale)
        : problem.kind === "sequence-radical-ratio" ||
          problem.kind === "sequence-exponential-ratio" ||
          problem.kind === "sequence-euler-product"
        ? presentSequenceExtension(problem, locale)
        : problem.kind === "sequence-rational" ||
          problem.kind === "sequence-geometric" ||
          problem.kind === "sequence-conjugate"
        ? presentSequence(problem, locale)
        : problem.kind === "limit-radical-infinity" || problem.kind === "limit-piecewise-heine"
          ? presentLimitFollowup(problem, locale)
        : problem.kind === "limit-point" ||
            problem.kind === "limit-infinity" ||
            problem.kind === "limit-conjugate"
          ? presentFunctionLimit(problem, locale)
          : problem.kind === "derivative" ||
              problem.kind === "derivative-analysis" ||
              problem.kind === "derivative-economics" ||
              problem.kind === "derivative-rational" ||
              problem.kind === "derivative-maximum"
            ? presentDerivative(problem, locale)
            : presentFunction(problem, locale);
export const universityTemplates = universityFamilies.map((family) => ({
  id: family.id,
  category: family.category,
  title: family.titles.pl,
  supportedDifficulties: family.supportedDifficulties,
}));
export type UniversityTask = TypedExercise & {
  templateId: string;
  difficulty: Difficulty;
  parameters: Readonly<Record<string, number>>;
  contentKey: string;
  university: UniversityProblem;
};
export const isUniversityTask = (task: GeneratedTask): task is UniversityTask =>
  "university" in task;
export function localizeUniversity(
  task: UniversityTask,
  locale: Locale,
): UniversityTask {
  const family = universityFamilies.find((f) => f.id === task.templateId)!;
  const presentation = present(task.university, locale);
  return {
    ...task,
    ...presentation,
    title: family.titles[locale],
    startingHint: presentation.hint,
  };
}
export function makeUniversityTask(
  id: string,
  variant: number,
  difficulty: Difficulty,
): UniversityTask {
  const family = universityFamilies.find((f) => f.id === id);
  if (
    !family ||
    !family.supportedDifficulties.includes(difficulty) ||
    !Number.isInteger(variant) ||
    variant < 0 ||
    variant >= UNIVERSITY_VARIANTS
  )
    throw new Error("Unsupported university exercise");
  const university = family.create(variant, difficulty),
    presentation = present(university, "pl");
  return {
    ...presentation,
    id: `${id}:${difficulty}:${variant}`,
    category: family.category,
    title: family.titles.pl,
    templateId: id,
    difficulty,
    parameters: { variant },
    university,
    contentKey: `university:${presentation.question}${university.kind === "determinant" ? JSON.stringify(university.matrix, (_, value) => (typeof value === "bigint" ? value.toString() : value)) : university.kind === "linear-matrix-practice" ? JSON.stringify(university.matrices, (_, value) => (typeof value === "bigint" ? value.toString() : value)) : ["function-graph-domain-range","function-graph-zeros","function-graph-monotonicity","function-graph-extrema","function-graph-symmetry"].includes(university.kind) ? JSON.stringify(university) : ""}`,
    startingHint: presentation.hint,
    errorRules: [],
  };
}
const cache = new Map<string, readonly UniversityTask[]>();
export function universityPool(
  category: CategoryId,
  difficulty: Difficulty,
): readonly UniversityTask[] {
  const key = `${category}:${difficulty}`;
  if (!cache.has(key))
    cache.set(
      key,
      universityFamilies
        .filter(
          (f) =>
            f.category === category &&
            f.supportedDifficulties.includes(difficulty),
        )
        .flatMap((f) =>
          Array.from({ length: UNIVERSITY_VARIANTS }, (_, v) =>
            makeUniversityTask(f.id, v, difficulty),
          ),
        ),
    );
  return cache.get(key)!;
}
