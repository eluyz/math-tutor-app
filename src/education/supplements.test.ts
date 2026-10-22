import { isUniversityTask } from "../university/catalog";
import { determinantFamilies } from "../university/determinants";
import { inverseFamilies } from "../university/inverses";
import { rankFamilies } from "../university/ranks";
import { gaussFamilies } from "../university/gauss";
import { cramerFourFamilies } from "../university/cramerFour";
import { elementaryAnalysisFamilies } from "../university/elementaryAnalysis";
import { asymptoteFamilies } from "../university/analysisLimitsAsymptotes";
import { advancedCalculusFamilies } from "../university/advancedCalculus";
import { functionStudyFamilies } from "../university/functionStudy";
import { readFileSync } from "node:fs";
import { isLegacyDifficulty } from "../difficulty";
import { it, expect } from "vitest";
import { allTemplates, difficulties, taskPool } from "../generators";
import { legacyDifficulties } from "../difficulty";
import { categories, studyCategories, feedback } from "../locales/pl";
import { rational as r } from "../rational";
import { checkAnswer, checkStep } from "../exercises";
import { formatRational as f } from "../answers";
const tasks = [...categories, ...studyCategories]
  .flatMap(({ id }) => legacyDifficulties.flatMap((d) => taskPool(id, d)))
  .filter((t) => t.supplemental);
it("każda wspierana rodzina × poziom ma minimum dziesięć odmiennych treści i niepowtarzalne ID", () => {
  const all = [...categories, ...studyCategories].flatMap(({ id }) =>
    difficulties.flatMap((d) => taskPool(id, d)),
  );
  expect(new Set(all.map((t) => t.id)).size).toBe(all.length);
  expect(all.filter((t) => !isUniversityTask(t))).toHaveLength(3501);
  const added = all.filter(isUniversityTask);
  expect(
    new Set(added.map((t) => t.contentKey)).size,
    added
      .filter(
        (t, i) =>
          added.findIndex((other) => other.contentKey === t.contentKey) !== i,
      )
      .map((t) => t.id)
      .join(", "),
  ).toBe(added.length);
  for (const template of allTemplates)
    for (const level of difficulties) {
      const pool = taskPool(template.category, level).filter(
        (t) => t.templateId === template.id,
      );
      if (template.supportedDifficulties.includes(level)) {
        expect(pool.length, `${template.id}/${level}`).toBeGreaterThanOrEqual(
          10,
        );
        expect(new Set(pool.map((t) => t.contentKey)).size).toBe(pool.length);
        expect(new Set(pool.map((t) => t.id)).size).toBe(pool.length);
      } else expect(pool).toHaveLength(0);
    }
});
it("17 jawnych uzupełnień zachowuje wynik, krok i hipotezy sprawdzone niezależnym wzorem", () => {
  expect(tasks).toHaveLength(17);
  for (const task of tasks) {
    const p = task.parameters;
    const expected =
      task.templateId === "signed-add"
        ? r(p.b - p.a)
        : task.templateId === "signed-subtract-negative"
          ? r(p.a + p.b)
          : task.templateId === "signed-product"
            ? r(-p.a * p.b * p.c)
            : task.templateId === "fraction-subtract"
              ? r(p.p * p.b - p.q * p.a, p.a * p.b)
              : r(p.x * p.x + p.k * p.x);
    expect(checkAnswer(task, f(expected), feedback).kind).toBe("correct");
    expect(
      checkAnswer(
        task,
        f(r(expected.numerator + expected.denominator, expected.denominator)),
        feedback,
      ).kind,
    ).toBe("incorrect");
    expect(checkAnswer(task, "1/0", feedback).kind).toBe("invalid");
    for (const rule of task.errorRules)
      expect(rule.wrongAnswer).not.toEqual(expected);
    if (task.step) {
      const v =
        task.templateId === "signed-add"
          ? r(Math.abs(p.a - p.b))
          : r(p.x * p.x);
      expect(checkStep(task, f(v), feedback).kind).toBe("correct");
    }
  }
});

it("dokumentacja odzwierciedla policzone instancje i rzeczywisty zasięg L4/L5", () => {
  const all = [...categories, ...studyCategories].flatMap(({ id }) =>
    difficulties.flatMap((d) => taskPool(id, d)),
  );
  const initial = all.filter((t) => !isUniversityTask(t));
  const historical = initial.filter(
    (t) => isLegacyDifficulty(t.difficulty) && !t.supplemental,
  ).length;
  const additions = initial.filter((t) => t.supplemental).length;
  const higher = initial.filter(
    (t) => !isLegacyDifficulty(t.difficulty),
  ).length;
  const advanced = allTemplates
    .filter((t) => initial.some((task) => task.templateId === t.id))
    .filter((t) => t.supportedDifficulties.includes("advanced")).length;
  const expert = allTemplates
    .filter((t) => initial.some((task) => task.templateId === t.id))
    .filter((t) => t.supportedDifficulties.includes("expert")).length;
  const doc = readFileSync(
    new URL("../../GENERATORS.md", import.meta.url),
    "utf8",
  );
  for (const template of allTemplates)
    expect(doc).toContain(`| ${template.id} |`);
  expect(doc).toContain(
    `Instancje: **${initial.length}** (historyczne **${historical}**, uzupełnienia **${additions}**, L4/L5 **${higher}**).`,
  );
  const newIds = new Set(["system-chain-five", "system-rectangular-3x2", "system-rectangular-4x3", "gauss-parameters-one", "gauss-parameters-two", "matrix-ax-shift", "matrix-axb", "matrix-inverse-plus", "matrix-bx-shift", "matrix-coupled-equations", "determinant-dense-four", "determinant-dense-five", "matrix-powers", "matrix-composite-operations", "matrix-compatibility", "matrix-chained-dimensions", "cramer-determinants-three", "cramer-determinants-four"]);
  const determinantIds = new Set(determinantFamilies.filter(family => !newIds.has(family.id)).map(family => family.id));
  const linearIds = new Set([...inverseFamilies,...rankFamilies,...gaussFamilies,...cramerFourFamilies].map((family) => family.id));
  const analysisIds = new Set([...elementaryAnalysisFamilies, ...asymptoteFamilies, ...advancedCalculusFamilies, ...functionStudyFamilies].map((family) => family.id));
  const integralTasks = all.filter((task) => task.category === "integrals");
  const beforeIntegrals = all.filter((task) => task.category !== "integrals" && !newIds.has(task.templateId));
  const calculus = (category: string) =>
    ["function-limits", "derivatives"].includes(category);
  const added004 = all.filter(
    (t) => isUniversityTask(t) && !newIds.has(t.templateId) && t.category !== "integrals" && !calculus(t.category) && !determinantIds.has(t.templateId) && !linearIds.has(t.templateId) && !analysisIds.has(t.templateId),
  );
  const added005 = all.filter((t) => calculus(t.category) && !analysisIds.has(t.templateId));
  expect(doc).toContain(
    `MT-EDU-004: **${added004.length}** nowych instancji; łącznie **${initial.length + added004.length}**.`,
  );
  expect(doc).toContain(
    `MT-EDU-005: **${added005.length}** nowych instancji; łącznie **${initial.length + added004.length + added005.length}**.`,
  );
  const added006a = all.filter((task) => determinantIds.has(task.templateId));
  expect(added006a).toHaveLength(264);
  const added006b=all.filter((task)=>linearIds.has(task.templateId));
  const added007=all.filter((task)=>analysisIds.has(task.templateId));
  expect(doc).toContain(`MT-EDU-006A: **${added006a.length}** nowych instancji; łącznie **${beforeIntegrals.length-added006b.length-added007.length}**.`);
  expect(added006b).toHaveLength(720);
  expect(doc).toContain(`MT-EDU-006B: **${added006b.length}** nowych instancji; łącznie **${beforeIntegrals.length-added007.length}**.`);
  expect(added007).toHaveLength(1224);
  expect(doc).toContain(`MT-EDU-007 P0: **384** nowych instancji; łącznie **7749**.`);
  expect(doc).toContain(`MT-EDU-007 P1: **384** nowych instancji; łącznie **8133**.`);
  expect(doc).toContain(`MT-EDU-007 P2: **360** nowych instancji; łącznie **8493**.`);
  expect(doc).toContain(`MT-EDU-007 P3 (częściowo): **${added007.length - 1128}** nowych instancji; łącznie **${beforeIntegrals.length}**.`);
  expect(integralTasks).toHaveLength(432);
  expect(all.filter(task => newIds.has(task.templateId) && !["system-chain-five", "system-rectangular-3x2", "system-rectangular-4x3", "gauss-parameters-one", "gauss-parameters-two", "matrix-ax-shift", "matrix-axb", "matrix-inverse-plus", "matrix-bx-shift"].includes(task.templateId))).toHaveLength(720);
  expect(doc).toContain(`MT-EDU-008 P0–P2: **${integralTasks.length}** nowych instancji; łącznie **9021**.`);
  expect(doc).toContain("MT-EDU-009: **216** nowych instancji; łącznie **9237**.");
  expect(doc).toContain("MT-EDU-010: **384** nowe instancje; łącznie **9621**.");
  expect(doc).toContain("MT-EDU-012: **120** nowych instancji; łącznie **9741**.");
  expect(doc).toContain(`Rodziny L4: **${advanced}**, L5: **${expert}**.`);
  const addedTemplates = allTemplates.filter(
    (template) =>
      !newIds.has(template.id) && template.category !== "integrals" && !calculus(template.category) && !determinantIds.has(template.id) && !linearIds.has(template.id) && !analysisIds.has(template.id) &&
      !initial.some((task) => task.templateId === template.id),
  );
  expect(doc).toContain(
    `Bieżący katalog UI i sesji: **${allTemplates.length} rodzin**, **${all.length} instancji**.`,
  );
  expect(doc).toContain(
    `Nowe rodziny: **${addedTemplates.length}**. Pary rodzina/poziom: **${addedTemplates.reduce((sum, template) => sum + template.supportedDifficulties.length, 0)}**.`,
  );
  expect(doc).toContain(
    `Łącznie rodziny L4: **${allTemplates.filter((t) => t.supportedDifficulties.includes("advanced")).length}**, L5: **${allTemplates.filter((t) => t.supportedDifficulties.includes("expert")).length}**.`,
  );
  const readme = readFileSync(
    new URL("../../README.md", import.meta.url),
    "utf8",
  );
  expect(readme).toContain(`**${allTemplates.length} rodzin**`);
  expect(readme).toContain(`**${all.length} instancji**`);
});
