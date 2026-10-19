import { it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  allTemplates,
  difficulties,
  taskPool,
} from "../generators";
import { localizeTask } from "../locales/catalog";
import { solutionFor } from "../solutions/model";

// Independently captured from the archive of merged main ea1cae4.
const baseline = JSON.parse(
  readFileSync(
    new URL("./fixtures/mtedu006a-baseline.json", import.meta.url),
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
it("preserves all 6645 previously published PL/EN exercises and complete solutions", () => {
  expect(baseline.source).toBe("ea1cae4017b1c972f7762cc36aca5f1b0e223b79");
  expect(baseline.families).toHaveLength(67);
  expect(baseline.families.reduce((sum, f) => sum + f.count, 0)).toBe(6645);
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
}, 40_000);
