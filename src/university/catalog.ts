import type { TypedExercise, CategoryId } from "../exercises";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { GeneratedTask } from "../generators";
import type { UniversityProblem } from "./schema";
import { systemFamilies, presentSystem } from "./systems";
import { functionFamilies, presentFunction } from "./functions";
import { sequenceFamilies, presentSequence } from "./sequences";
import { functionLimitFamilies, presentFunctionLimit } from "./functionLimits";
import { derivativeFamilies, presentDerivative } from "./derivatives";
import { determinantFamilies, presentDeterminant } from "./determinants";

export const UNIVERSITY_VARIANTS = 24;
export const universityFamilies = [
  ...systemFamilies,
  ...functionFamilies,
  ...sequenceFamilies,
  ...functionLimitFamilies,
  ...derivativeFamilies,
  ...determinantFamilies,
];
const present = (problem: UniversityProblem, locale: Locale) =>
  problem.kind === "determinant"
    ? presentDeterminant(problem, locale)
    : problem.kind === "system"
      ? presentSystem(problem, locale)
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
    contentKey: `university:${presentation.question}${university.kind === "determinant" ? JSON.stringify(university.matrix, (_, value) => (typeof value === "bigint" ? value.toString() : value)) : ""}`,
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
