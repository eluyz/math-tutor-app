import type { TypedExercise, CategoryId } from "../exercises";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { GeneratedTask } from "../generators";
import type { UniversityProblem, LinearAlgebraProblem, ElementaryAnalysisProblem, AsymptoteProblem, AdvancedCalculusProblem, FunctionStudyProblem } from "./schema";
import { systemFamilies, presentSystem } from "./systems";
import { functionFamilies, presentFunction } from "./functions";
import { functionExtensionFamilies, presentFunctionExtension } from "./functionExtensions";
import { functionDomainExtraFamilies, presentFunctionDomainExtra } from "./functionDomainsExtra";
import { functionGraphFamilies, presentFunctionGraph } from "./functionGraphs";
import { graphPropertyFamilies, presentGraphProperty } from "./functionGraphProperties";
import { nondifferentiabilityFamilies, presentNondifferentiability } from "./nondifferentiability";
import { sequenceFamilies, presentSequence } from "./sequences";
import { sequenceExtensionFamilies, presentSequenceExtension } from "./sequenceExtensions";
import { functionLimitFamilies, presentFunctionLimit } from "./functionLimits";
import { derivativeFamilies, presentDerivative } from "./derivatives";
import { determinantFamilies, presentDeterminant } from "./determinants";
import { inverseFamilies, presentInverse } from "./inverses";
import { rankFamilies, presentRank } from "./ranks";
import { gaussFamilies, presentGauss } from "./gauss";
import { gaussParameterFamilies, presentGaussParameters } from "./gaussParameters";
import { gaussRectangularParameterFamilies } from "./gaussRectangularParameters";
import { chainFamilies, presentChain } from "./chainEqualities";
import { rectangularFamilies, presentRectangular } from "./rectangularSystems";
import { cramerFourFamilies, presentCramerFour } from "./cramerFour";
import { cramerIntermediateFamilies, presentCramerMinors } from "./cramerIntermediate";
import { matrixPairFamilies, presentMatrixPair } from "./matrixPair";
import { advancedMatrixEquationFamilies, presentAdvancedMatrixEquation } from "./matrixEquations";
import { matrixPracticeFamilies, presentMatrixPractice } from "./matrixPractice";
import { elementaryAnalysisFamilies, presentElementaryAnalysis } from "./elementaryAnalysis";
import { asymptoteFamilies, presentAsymptote } from "./analysisLimitsAsymptotes";
import { advancedCalculusFamilies, presentAdvancedCalculus } from "./advancedCalculus";
import { functionStudyFamilies, presentFunctionStudy } from "./functionStudy";
import { integralFamilies, presentIntegral } from "./integrals";

export const UNIVERSITY_VARIANTS = 24;
export const universityFamilies = [
  ...systemFamilies,
  ...functionFamilies,
  ...functionExtensionFamilies,
  ...functionDomainExtraFamilies,
  ...functionGraphFamilies,
  ...graphPropertyFamilies,
  ...nondifferentiabilityFamilies,
  ...sequenceFamilies,
  ...sequenceExtensionFamilies,
  ...functionLimitFamilies,
  ...derivativeFamilies,
  ...determinantFamilies,
  ...inverseFamilies,
  ...rankFamilies,
  ...gaussFamilies,
  ...gaussParameterFamilies,
  ...gaussRectangularParameterFamilies,
  ...chainFamilies,
  ...rectangularFamilies,
  ...cramerFourFamilies,
  ...cramerIntermediateFamilies,
  ...matrixPairFamilies,
  ...advancedMatrixEquationFamilies,
  ...matrixPracticeFamilies,
  ...elementaryAnalysisFamilies,
  ...asymptoteFamilies,
  ...advancedCalculusFamilies,
  ...functionStudyFamilies,
  ...integralFamilies,
];
const isElementaryAnalysis = (problem: UniversityProblem): problem is ElementaryAnalysisProblem => problem.kind.startsWith("analysis-");
const isAsymptote = (problem: UniversityProblem): problem is AsymptoteProblem => problem.kind === "analysis-euler" || problem.kind.startsWith("analysis-asymptote-");
const isAdvancedCalculus = (problem: UniversityProblem): problem is AdvancedCalculusProblem => problem.kind === "analysis-lhospital" || problem.kind === "analysis-lhospital-infinity" || problem.kind === "analysis-log-exp-derivative" || problem.kind === "analysis-concavity";
const isFunctionStudy = (problem: UniversityProblem): problem is FunctionStudyProblem => problem.kind === "analysis-study-polynomial" || problem.kind === "analysis-study-rational";
const isInverse = (problem: UniversityProblem): problem is Extract<LinearAlgebraProblem,{kind:"linear-inverse"|"linear-application"}> => problem.kind === "linear-inverse" || problem.kind === "linear-application";
const isRank = (problem: UniversityProblem): problem is Extract<LinearAlgebraProblem,{kind:"linear-rank"|"linear-capelli"|"linear-rank-given"}> => problem.kind === "linear-rank" || problem.kind === "linear-capelli" || problem.kind === "linear-rank-given";
const present = (problem: UniversityProblem, locale: Locale) =>
  problem.kind === "integral"
    ? presentIntegral(problem, locale)
    : isFunctionStudy(problem)
    ? presentFunctionStudy(problem, locale)
    : isAdvancedCalculus(problem)
    ? presentAdvancedCalculus(problem, locale)
    : isAsymptote(problem)
    ? presentAsymptote(problem, locale)
    : isElementaryAnalysis(problem)
    ? presentElementaryAnalysis(problem, locale)
    : problem.kind === "derivative-absolute-one-sided" || problem.kind === "derivative-piecewise-point"
    ? presentNondifferentiability(problem, locale)
    : problem.kind === "function-graph-monotonicity" || problem.kind === "function-graph-extrema" || problem.kind === "function-graph-symmetry"
    ? presentGraphProperty(problem, locale)
    : problem.kind === "function-graph-domain-range" || problem.kind === "function-graph-zeros"
    ? presentFunctionGraph(problem, locale)
    : problem.kind === "function-tangent-domain" || problem.kind === "function-mixed-domain"
    ? presentFunctionDomainExtra(problem, locale)
    : problem.kind === "function-parity" || problem.kind === "function-affine-inverse"
    ? presentFunctionExtension(problem, locale)
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
    : problem.kind === "linear-cramer-minors"
    ? presentCramerMinors(problem, locale)
    : problem.kind === "linear-cramer-four"
    ? presentCramerFour(problem, locale)
    : problem.kind === "determinant"
    ? presentDeterminant(problem, locale)
    : problem.kind === "system"
      ? presentSystem(problem, locale)
      : problem.kind === "sequence-radical-ratio" ||
          problem.kind === "sequence-exponential-ratio" ||
          problem.kind === "sequence-euler-product"
        ? presentSequenceExtension(problem, locale)
        : problem.kind === "sequence-rational" ||
          problem.kind === "sequence-geometric" ||
          problem.kind === "sequence-conjugate"
        ? presentSequence(problem, locale)
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
