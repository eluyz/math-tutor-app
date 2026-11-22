import { execSync } from "node:child_process";
import type { CategoryId } from "../exercises.ts";
import {
  difficulties,
  higherDifficulties,
  legacyDifficulties,
  type Difficulty,
} from "../difficulty.ts";
import {
  historicalTemplates,
  makeInstance,
  templates,
  type Parameters,
  type Template,
} from "../generators.ts";
import { supplementalPool } from "../education/supplements.ts";
import { educationTemplates } from "../education/catalog.ts";
import { VARIANTS_PER_LEVEL, makeEducationInstance } from "../education/types.ts";
import {
  HIGHER_VARIANTS,
  makeHigherInstance,
  supportsHigher,
} from "../advanced/catalog.ts";
import {
  UNIVERSITY_VARIANTS,
  makeUniversityTask,
  universityFamilies,
} from "../university/catalog.ts";
import type { Locale } from "../locales/types.ts";

export const inventoryLocales = ["pl", "en"] as const satisfies readonly Locale[];

type InventorySource =
  | "legacy"
  | "supplemental"
  | "education"
  | "higher"
  | "university";

export type InventoryTuple = {
  family_id: string;
  difficulty: Difficulty;
  variant_index: number;
  canonical_key: string;
  category?: CategoryId;
  inventory_sha: string;
  locales: readonly Locale[];
  source: InventorySource;
  source_variant: number;
};

type SeedTuple = Omit<InventoryTuple, "variant_index" | "canonical_key" | "inventory_sha">;

export type InventoryDeclaration = {
  source: InventorySource;
  family_id: string;
  difficulty: Difficulty;
  category?: CategoryId;
  declared_variants: number;
};

export type InventoryReport = {
  inventory_sha: string;
  generated_at_utc: string;
  summary: {
    families: number;
    tuples: number;
    locales: number;
    declarations: number;
  };
  tuples: readonly InventoryTuple[];
  declarations: readonly InventoryDeclaration[];
};

const sourceOrder: Readonly<Record<InventorySource, number>> = {
  legacy: 0,
  supplemental: 1,
  education: 2,
  higher: 3,
  university: 4,
};

function combinations(choices: Record<string, readonly number[]>): Parameters[] {
  return Object.entries(choices).reduce<Parameters[]>(
    (acc, [key, values]) =>
      acc.flatMap((previous) =>
        values.map((selected) => ({ ...previous, [key]: selected })),
      ),
    [{}],
  );
}

function sortSeeds(left: SeedTuple, right: SeedTuple): number {
  return (
    left.family_id.localeCompare(right.family_id) ||
    left.difficulty.localeCompare(right.difficulty) ||
    sourceOrder[left.source] - sourceOrder[right.source] ||
    left.source_variant - right.source_variant
  );
}

function sortTuples(left: InventoryTuple, right: InventoryTuple): number {
  return (
    left.family_id.localeCompare(right.family_id) ||
    left.difficulty.localeCompare(right.difficulty) ||
    left.variant_index - right.variant_index
  );
}

function getInventorySha(explicitSha?: string): string {
  if (explicitSha) return explicitSha;
  try {
    return execSync("git rev-parse HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "UNKNOWN_SHA";
  }
}

function groupKey(familyId: string, difficulty: Difficulty): string {
  return `${familyId}::${difficulty}`;
}

function buildLegacySeeds(): {
  seeds: SeedTuple[];
  declarations: InventoryDeclaration[];
} {
  const seeds: SeedTuple[] = [];
  const declarations: InventoryDeclaration[] = [];

  for (const template of templates) {
    for (const difficulty of legacyDifficulties) {
      const choiceMap = template.parameterSets[difficulty];
      if (!choiceMap) continue;
      const unique = new Map<string, number>();
      for (const params of combinations(choiceMap)) {
        const instance = makeInstance(template, params, difficulty);
        if (!unique.has(instance.contentKey)) unique.set(instance.contentKey, unique.size);
      }

      declarations.push({
        source: "legacy",
        family_id: template.id,
        difficulty,
        category: template.category,
        declared_variants: unique.size,
      });

      for (const sourceVariant of [...unique.values()].sort((a, b) => a - b)) {
        seeds.push({
          family_id: template.id,
          difficulty,
          category: template.category,
          locales: inventoryLocales,
          source: "legacy",
          source_variant: sourceVariant,
        });
      }
    }
  }

  return { seeds, declarations };
}

function buildSupplementalSeeds(): {
  seeds: SeedTuple[];
  declarations: InventoryDeclaration[];
} {
  const seeds: SeedTuple[] = [];
  const declarations: InventoryDeclaration[] = [];

  for (const template of templates) {
    for (const difficulty of legacyDifficulties) {
      const supplemental = supplementalPool(template.category, difficulty, templates)
        .filter((item) => item.templateId === template.id)
        .sort((a, b) => a.id.localeCompare(b.id));

      if (!supplemental.length) continue;

      declarations.push({
        source: "supplemental",
        family_id: template.id,
        difficulty,
        category: template.category,
        declared_variants: supplemental.length,
      });

      supplemental.forEach((_instance, sourceVariant) => {
        seeds.push({
          family_id: template.id,
          difficulty,
          category: template.category,
          locales: inventoryLocales,
          source: "supplemental",
          source_variant: sourceVariant,
        });
      });
    }
  }

  return { seeds, declarations };
}

function buildEducationSeeds(): {
  seeds: SeedTuple[];
  declarations: InventoryDeclaration[];
} {
  const seeds: SeedTuple[] = [];
  const declarations: InventoryDeclaration[] = [];

  for (const template of educationTemplates) {
    for (const difficulty of legacyDifficulties) {
      const unique = new Map<string, number>();
      for (let variant = 0; variant < VARIANTS_PER_LEVEL; variant++) {
        const instance = makeEducationInstance(template, variant, difficulty);
        if (!unique.has(instance.contentKey)) unique.set(instance.contentKey, unique.size);
      }

      declarations.push({
        source: "education",
        family_id: template.id,
        difficulty,
        category: template.category,
        declared_variants: unique.size,
      });

      for (const sourceVariant of [...unique.values()].sort((a, b) => a - b)) {
        seeds.push({
          family_id: template.id,
          difficulty,
          category: template.category,
          locales: inventoryLocales,
          source: "education",
          source_variant: sourceVariant,
        });
      }
    }
  }

  return { seeds, declarations };
}

function toHigherTemplate(template: Template): {
  id: string;
  title: string;
  category: CategoryId;
} {
  return {
    id: template.id,
    title: template.title,
    category: template.category,
  };
}

function buildHigherSeeds(): {
  seeds: SeedTuple[];
  declarations: InventoryDeclaration[];
} {
  const seeds: SeedTuple[] = [];
  const declarations: InventoryDeclaration[] = [];

  for (const template of historicalTemplates.filter((item) => supportsHigher(item.id))) {
    for (const difficulty of higherDifficulties) {
      declarations.push({
        source: "higher",
        family_id: template.id,
        difficulty,
        category: template.category,
        declared_variants: HIGHER_VARIANTS,
      });

      for (let variant = 0; variant < HIGHER_VARIANTS; variant++) {
        makeHigherInstance(toHigherTemplate(template as Template), variant, difficulty);
        seeds.push({
          family_id: template.id,
          difficulty,
          category: template.category,
          locales: inventoryLocales,
          source: "higher",
          source_variant: variant,
        });
      }
    }
  }

  return { seeds, declarations };
}

function buildUniversitySeeds(): {
  seeds: SeedTuple[];
  declarations: InventoryDeclaration[];
} {
  const seeds: SeedTuple[] = [];
  const declarations: InventoryDeclaration[] = [];

  for (const family of universityFamilies) {
    for (const difficulty of family.supportedDifficulties) {
      declarations.push({
        source: "university",
        family_id: family.id,
        difficulty,
        category: family.category,
        declared_variants: UNIVERSITY_VARIANTS,
      });

      for (let variant = 0; variant < UNIVERSITY_VARIANTS; variant++) {
        makeUniversityTask(family.id, variant, difficulty);
        seeds.push({
          family_id: family.id,
          difficulty,
          category: family.category,
          locales: inventoryLocales,
          source: "university",
          source_variant: variant,
        });
      }
    }
  }

  return { seeds, declarations };
}

function validateSources(declarations: readonly InventoryDeclaration[]): void {
  const knownSources = new Set<InventorySource>([
    "legacy",
    "supplemental",
    "education",
    "higher",
    "university",
  ]);
  for (const declaration of declarations)
    if (!knownSources.has(declaration.source))
      throw new Error(`Unsupported metadata source: ${String(declaration.source)}`);
}

export function validateInventory(
  tuples: readonly InventoryTuple[],
  declarations: readonly InventoryDeclaration[],
): void {
  validateSources(declarations);

  const knownDifficulties = new Set(difficulties);
  const canonical = new Set<string>();
  const tupleBase = new Set<string>();

  for (const tuple of tuples) {
    if (!knownDifficulties.has(tuple.difficulty))
      throw new Error(`Unknown difficulty in tuple: ${tuple.canonical_key}`);

    if (canonical.has(tuple.canonical_key))
      throw new Error(`Duplicate canonical key: ${tuple.canonical_key}`);
    canonical.add(tuple.canonical_key);

    const base = groupKey(tuple.family_id, tuple.difficulty) + `::${tuple.variant_index}`;
    if (tupleBase.has(base))
      throw new Error(`Locale view split into multiple tuples: ${base}`);
    tupleBase.add(base);

    const localesSorted = [...tuple.locales].sort();
    const expectedLocales = [...inventoryLocales].sort();
    if (
      localesSorted.length !== expectedLocales.length ||
      localesSorted.some((locale, index) => locale !== expectedLocales[index])
    )
      throw new Error(`Locale views mismatch for ${tuple.canonical_key}`);
  }

  const byFamilyDifficulty = new Map<string, number[]>();
  for (const tuple of tuples) {
    const key = groupKey(tuple.family_id, tuple.difficulty);
    const variants = byFamilyDifficulty.get(key) ?? [];
    variants.push(tuple.variant_index);
    byFamilyDifficulty.set(key, variants);
  }

  for (const [key, variants] of byFamilyDifficulty) {
    variants.sort((a, b) => a - b);
    variants.forEach((variant, index) => {
      if (variant !== index)
        throw new Error(`Gap in variant range for ${key}: expected ${index}, got ${variant}`);
    });
  }

  const declared = new Map<string, number>();
  for (const item of declarations) {
    if (!knownDifficulties.has(item.difficulty))
      throw new Error(`Unknown difficulty in declaration: ${item.family_id}/${item.difficulty}`);
    const key = groupKey(item.family_id, item.difficulty);
    declared.set(key, (declared.get(key) ?? 0) + item.declared_variants);
  }

  for (const [key, expected] of declared) {
    const actual = byFamilyDifficulty.get(key)?.length ?? 0;
    if (actual !== expected)
      throw new Error(
        `Declared variant mismatch for ${key}: expected ${expected}, got ${actual}`,
      );
  }
}

export function generateInventory(explicitSha?: string): InventoryReport {
  const legacy = buildLegacySeeds();
  const supplemental = buildSupplementalSeeds();
  const education = buildEducationSeeds();
  const higher = buildHigherSeeds();
  const university = buildUniversitySeeds();

  const declarations = [
    ...legacy.declarations,
    ...supplemental.declarations,
    ...education.declarations,
    ...higher.declarations,
    ...university.declarations,
  ].sort(
    (left, right) =>
      left.family_id.localeCompare(right.family_id) ||
      left.difficulty.localeCompare(right.difficulty) ||
      sourceOrder[left.source] - sourceOrder[right.source],
  );

  const seeds = [
    ...legacy.seeds,
    ...supplemental.seeds,
    ...education.seeds,
    ...higher.seeds,
    ...university.seeds,
  ].sort(sortSeeds);

  const inventorySha = getInventorySha(explicitSha);

  const variantsByGroup = new Map<string, number>();
  const tuples = seeds.map((seed) => {
    const key = groupKey(seed.family_id, seed.difficulty);
    const variantIndex = variantsByGroup.get(key) ?? 0;
    variantsByGroup.set(key, variantIndex + 1);
    return {
      ...seed,
      variant_index: variantIndex,
      canonical_key: `${seed.family_id}/${seed.difficulty}/${variantIndex}`,
      inventory_sha: inventorySha,
    } satisfies InventoryTuple;
  }).sort(sortTuples);

  validateInventory(tuples, declarations);

  return {
    inventory_sha: inventorySha,
    generated_at_utc: new Date().toISOString(),
    summary: {
      families: new Set(tuples.map((tuple) => tuple.family_id)).size,
      tuples: tuples.length,
      locales: tuples.length * inventoryLocales.length,
      declarations: declarations.length,
    },
    tuples,
    declarations,
  };
}
