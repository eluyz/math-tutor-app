import type { CategoryId } from "../exercises";
import {
  isLegacyDifficulty,
  type Difficulty,
  type LegacyDifficulty,
} from "../difficulty";
import type { GeneratedExercise, Parameters, Template } from "../generators";

/** Seventeen explicit additions meet the minimum of ten without changing the
 * original parameter grids or the questions and answers of 2092 historical instances. No Cartesian expansion. */
const additions: Record<
  string,
  Partial<Record<LegacyDifficulty, readonly Parameters[]>>
> = {
  "signed-add": {
    easy: [{ a: 1, b: 2 }],
    medium: [{ a: 6, b: 2 }],
    hard: [{ a: 10, b: 3 }],
  },
  "signed-subtract-negative": {
    easy: [{ a: 1, b: 2 }],
    medium: [{ a: -1, b: 3 }],
    hard: [{ a: -5, b: 2 }],
  },
  "signed-product": {
    easy: [{ a: 1, b: 2, c: 1 }],
    medium: [{ a: 2, b: 3, c: -1 }],
    hard: [{ a: 3, b: 4, c: -2 }],
  },
  "fraction-subtract": {
    easy: [
      { p: 1, q: 1, a: 3, b: 5 },
      { p: 1, q: 1, a: 4, b: 5 },
    ],
  },
  "algebra-substitute": {
    easy: [
      { x: 1, k: 2 },
      { x: 1, k: 3 },
      { x: 2, k: 1 },
      { x: 3, k: 1 },
    ],
    medium: [{ x: 2, k: 4 }],
    hard: [{ x: -1, k: 4 }],
  },
};
export function supplementalPool(
  category: CategoryId,
  difficulty: Difficulty,
  templates: readonly Template[],
): readonly GeneratedExercise[] {
  if (!isLegacyDifficulty(difficulty)) return [];
  return templates
    .filter((t) => t.category === category)
    .flatMap((template) =>
      (additions[template.id]?.[difficulty] ?? []).map((parameters, i) => {
        const details = template.create(parameters);
        return {
          ...details,
          id: `${template.id}:${difficulty}:supplement:${i}`,
          templateId: template.id,
          category,
          title: template.title,
          parameters,
          difficulty,
          supplemental: true as const,
          contentKey: details.question.replace(/\s+/g, " ").trim(),
        };
      }),
    );
}
