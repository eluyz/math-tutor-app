import { algebraTemplates } from "./algebra";
import { matrixTemplates } from "./matrixLessons";
import { makeEducationInstance, VARIANTS_PER_LEVEL, type EducationInstance } from "./types";
import type { CategoryId } from "../exercises";
import { isLegacyDifficulty, type Difficulty, legacyDifficulties } from "../difficulty";

export const educationTemplates = [...algebraTemplates, ...matrixTemplates].map((template) => ({ ...template, supportedDifficulties: legacyDifficulties }));
const cache = new Map<string, readonly EducationInstance[]>();
export function educationPool(category: CategoryId, difficulty: Difficulty): readonly EducationInstance[] {
  if (!isLegacyDifficulty(difficulty)) return [];
  const key = `${category}:${difficulty}`;
  if (!cache.has(key)) {
    const unique = new Map<string, EducationInstance>();
    for (const template of educationTemplates.filter((item) => item.category === category))
      for (let variant = 0; variant < VARIANTS_PER_LEVEL; variant++) {
        const item = makeEducationInstance(template, variant, difficulty);
        if (!unique.has(item.contentKey)) unique.set(item.contentKey, item);
      }
    cache.set(key, [...unique.values()]);
  }
  return cache.get(key)!;
}
