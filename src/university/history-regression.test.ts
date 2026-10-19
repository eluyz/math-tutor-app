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

// Generated from an archive of the published main, not from changed generators.
// Covers the entire task plus its full PL/EN solution, sorted by canonical ID.
const baseline = JSON.parse(
  readFileSync(
    new URL("./fixtures/mtedu004-baseline.json", import.meta.url),
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
it("preserves all 5229 published tasks, IDs, contentKeys, answers, hints and complete PL/EN steps", () => {
  expect(baseline.source).toBe("afcb24886e80ddf06b6cee95a274c5237ef4e752");
  expect(baseline.families).toHaveLength(51);
  expect(baseline.families.reduce((sum, f) => sum + f.count, 0)).toBe(5229);
  for (const saved of baseline.families) {
    const family = allTemplates.find((f) => f.id === saved.id)!;
    expect(family).toBeDefined();
    expect(family.category).toBe(saved.category);
    expect(family.supportedDifficulties).toEqual(saved.levels);
    const tasks = difficulties
      .flatMap((level) =>
        taskPool(family.category, level).filter(
          (t) => t.templateId === family.id,
        ),
      )
      .sort((a, b) => a.id.localeCompare(b.id));
    const contents = tasks.map((task) =>
      (["pl", "en"] as const).map((locale) => {
        const localized = localizeTask(task, locale);
        return { task: localized, solution: solutionFor(localized) };
      }),
    );
    const sha256 = createHash("sha256")
      .update(
        JSON.stringify(contents, (_, v) =>
          typeof v === "bigint" ? v.toString() : v,
        ),
      )
      .digest("hex");
    expect(tasks, saved.id).toHaveLength(saved.count);
    expect(sha256, saved.id).toBe(saved.sha256);
  }
});
it("each calculus family/level exhausts its finite pool without an immediate duplicate or a fallback level", () => {
  for (const family of allTemplates.filter((f) =>
    ["function-limits", "derivatives"].includes(f.category),
  ))
    for (const level of difficulties) {
      const pool = taskPool(family.category, level).filter(
        (t) => t.templateId === family.id,
      );
      if (!family.supportedDifficulties.includes(level)) {
        expect(pool).toHaveLength(0);
        continue;
      }
      expect(pool).toHaveLength(24);
      const generator = createGenerator(185),
        seen = new Set<string>();
      for (let v = 0; v < 24; v++) {
        const item = generator.next(family.category, level, family.id);
        expect(item.exercise.difficulty).toBe(level);
        expect(item.repeated).toBe(false);
        expect(seen.has(item.exercise.contentKey)).toBe(false);
        seen.add(item.exercise.contentKey);
      }
      const restart = generator.next(family.category, level, family.id);
      expect(restart.repeated).toBe(true);
      expect(seen.has(restart.exercise.contentKey)).toBe(true);
    }
});
