import { difficultyConfig, type Difficulty } from "./difficulty";
import type { CategoryId } from "./exercises";
import { allTemplates } from "./generators";
import { familyTitle } from "./locales/catalog";
import type { Locale } from "./locales/types";
import { uiCopy } from "./locales/ui";

export type CatalogFamily = {
  id: string;
  category: CategoryId;
  title: string;
  supportedDifficulties: readonly Difficulty[];
};

export function normalizeCatalogQuery(value: string): string {
  return value.toLocaleLowerCase("pl").replace(/ł/g, "l")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().replace(/\s+/g, " ");
}

export function categoryTitle(category: CategoryId, locale: Locale): string {
  const copy = uiCopy[locale];
  return [...copy.categories, ...copy.studyCategories]
    .find((item) => item.id === category)?.label ?? category;
}

/** Search the whole catalog in either language, independent of the current category. */
export function searchCatalog(
  query: string,
  families: readonly CatalogFamily[] = allTemplates,
): CatalogFamily[] {
  const words = normalizeCatalogQuery(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  return families.filter((family) => {
    const searchable = normalizeCatalogQuery([
      familyTitle(family, "pl"), familyTitle(family, "en"),
      categoryTitle(family.category, "pl"), categoryTitle(family.category, "en"),
    ].join(" "));
    return words.every((word) => searchable.includes(word));
  });
}

/** Keep the level where possible; otherwise pick the nearest supported level. */
export function selectCatalogFamily(family: CatalogFamily, current: Difficulty) {
  const levels = difficultyConfig.map(({ id }) => id);
  const index = levels.indexOf(current);
  const difficulty = family.supportedDifficulties.includes(current)
    ? current
    : [...family.supportedDifficulties].sort((a, b) =>
      Math.abs(levels.indexOf(a) - index) - Math.abs(levels.indexOf(b) - index) ||
      levels.indexOf(a) - levels.indexOf(b))[0];
  if (!difficulty) throw new Error(`Family ${family.id} has no supported difficulty`);
  return { category: family.category, templateId: family.id, difficulty,
    changedDifficulty: difficulty !== current };
}
