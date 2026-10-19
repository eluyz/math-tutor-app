import { it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  allTemplates,
  difficulties,
  taskPool,
  createGenerator,
} from "../generators";
import { localizeTask } from "../locales/catalog";
import { solutionFor } from "../solutions/model";
import { determinantFamilies } from "./determinants";

// Independently captured from an archive of merged main 69452a6.
const baseline = JSON.parse(
  readFileSync(
    new URL("./fixtures/mtedu005-baseline.json", import.meta.url),
    "utf8",
  ),
) as {
  source: string;
  families: {
    id: string;
    category: string;
    levels: string[];
    count: number;
    sha256: string;
  }[];
};
it("preserves all 6381 previously published PL/EN exercises and complete solutions", () => {
  expect(baseline.source).toBe("69452a655178ed073050bdf1b7dfe9e64dd15ebe");
  expect(baseline.families).toHaveLength(63);
  expect(baseline.families.reduce((sum, f) => sum + f.count, 0)).toBe(6381);
  for (const saved of baseline.families) {
    const family = allTemplates.find((f) => f.id === saved.id)!;
    expect(family).toBeDefined();
    expect(family.category).toBe(saved.category);
    expect(family.supportedDifficulties).toEqual(saved.levels);
    const tasks = difficulties
      .flatMap((level) =>
        taskPool(family.category, level).filter(
          (task) => task.templateId === saved.id,
        ),
      )
      .sort((a, b) => a.id.localeCompare(b.id));
    const contents = tasks.map((task) =>
      (["pl", "en"] as const).map((locale) => {
        const localized = localizeTask(task, locale);
        return { task: localized, solution: solutionFor(localized) };
      }),
    );
    const hash = createHash("sha256")
      .update(
        JSON.stringify(contents, (_, v) =>
          typeof v === "bigint" ? v.toString() : v,
        ),
      )
      .digest("hex");
    expect(tasks, saved.id).toHaveLength(saved.count);
    expect(hash, saved.id).toBe(saved.sha256);
  }
});
it("offers exactly 24 unique problems at supported levels and no fallback elsewhere", () => {
  for (const family of determinantFamilies)
    for (const level of difficulties) {
      const pool = taskPool("determinants", level).filter(
        (task) => task.templateId === family.id,
      );
      if (!family.supportedDifficulties.includes(level)) {
        expect(pool).toHaveLength(0);
        continue;
      }
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map((task) => task.contentKey)).size).toBe(24);
      const generator = createGenerator(212),
        seen = new Set<string>();
      for (let i = 0; i < 24; i++) {
        const next = generator.next("determinants", level, family.id);
        expect(next.exercise.difficulty).toBe(level);
        expect(next.repeated).toBe(false);
        expect(seen.has(next.exercise.contentKey)).toBe(false);
        seen.add(next.exercise.contentKey);
      }
      expect(generator.next("determinants", level, family.id).repeated).toBe(
        true,
      );
    }
});
