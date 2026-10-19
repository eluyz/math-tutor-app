import { isUniversityTask } from "../university/catalog";
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
  expect(new Set(added.map((t) => t.contentKey)).size).toBe(added.length);
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
  const higher = initial.filter((t) => !isLegacyDifficulty(t.difficulty)).length;
  const advanced = allTemplates.filter((t) => initial.some((task) => task.templateId === t.id)).filter((t) =>
    t.supportedDifficulties.includes("advanced"),
  ).length;
  const expert = allTemplates.filter((t) => initial.some((task) => task.templateId === t.id)).filter((t) =>
    t.supportedDifficulties.includes("expert"),
  ).length;
  const doc = readFileSync(
    new URL("../../GENERATORS.md", import.meta.url),
    "utf8",
  );
  for (const template of allTemplates) expect(doc).toContain(`| ${template.id} |`);
  expect(doc).toContain(
    `Instancje: **${initial.length}** (historyczne **${historical}**, uzupełnienia **${additions}**, L4/L5 **${higher}**).`,
  );
  expect(doc).toContain(`MT-EDU-004: **${all.length - initial.length}** nowych instancji; łącznie **${all.length}**.`);
  expect(doc).toContain(`Rodziny L4: **${advanced}**, L5: **${expert}**.`);
  const addedTemplates = allTemplates.filter((template) => !initial.some((task) => task.templateId === template.id));
  expect(doc).toContain(`Nowe rodziny: **${addedTemplates.length}**. Pary rodzina/poziom: **${addedTemplates.reduce((sum, template) => sum + template.supportedDifficulties.length, 0)}**.`);
  expect(doc).toContain(`Łącznie rodziny L4: **${allTemplates.filter((t) => t.supportedDifficulties.includes("advanced")).length}**, L5: **${allTemplates.filter((t) => t.supportedDifficulties.includes("expert")).length}**.`);
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  expect(readme).toContain(`**${allTemplates.length} rodzin**`);
  expect(readme).toContain(`**${all.length} instancji**`);
});
