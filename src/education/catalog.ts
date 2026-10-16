import { algebraTemplates } from "./algebra";
import { makeEducationInstance, VARIANTS_PER_LEVEL, type EducationInstance } from "./types";
import type { CategoryId } from "../exercises";
import type { Difficulty } from "../generators";

export const educationTemplates = [...algebraTemplates];
const cache = new Map<string, readonly EducationInstance[]>();
export function educationPool(category: CategoryId, difficulty: Difficulty): readonly EducationInstance[] {
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
