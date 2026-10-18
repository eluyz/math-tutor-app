import type { TypedExercise, CategoryId } from "../exercises";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { GeneratedTask } from "../generators";
import type { UniversityProblem } from "./schema";
import { systemFamilies, presentSystem } from "./systems";

export const UNIVERSITY_VARIANTS = 24;
export const universityFamilies = [...systemFamilies];
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
  const presentation = presentSystem(task.university, locale);
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
    presentation = presentSystem(university, "pl");
  return {
    ...presentation,
    id: `${id}:${difficulty}:${variant}`,
    category: family.category,
    title: family.titles.pl,
    templateId: id,
    difficulty,
    parameters: { variant },
    university,
    contentKey: `university:${presentation.question}`,
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
