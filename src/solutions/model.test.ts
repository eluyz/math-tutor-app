import { isUniversityTask } from "../university/catalog";
import { isLegacyDifficulty } from "../difficulty";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allTemplates, difficulties, taskPool } from "../generators";
import { getAnswerSpec } from "../exercises";
import { categories, studyCategories } from "../locales/pl";
import { solutionFor, type Calculation } from "./model";
import { englishTask } from "../locales/lessons-en";
import type { Rational } from "../rational";

// Independent arithmetic: cross multiplication, without the production rational operators.
function verify(c: Calculation) {
  const [first, ...rest] = c.operands;
  const result = rest.reduce<Rational>((a, b) => {
    switch (c.operation) {
      case "sum": return { numerator: a.numerator * b.denominator + b.numerator * a.denominator, denominator: a.denominator * b.denominator };
      case "difference": return { numerator: a.numerator * b.denominator - b.numerator * a.denominator, denominator: a.denominator * b.denominator };
      case "product": return { numerator: a.numerator * b.numerator, denominator: a.denominator * b.denominator };
      case "quotient": expect(b.numerator).not.toBe(0n); return { numerator: a.numerator * b.denominator, denominator: a.denominator * b.numerator };
    }
  }, first);
  expect(result.numerator * c.result.denominator).toBe(c.result.numerator * result.denominator);
}
const tasks = [...categories, ...studyCategories].flatMap(({ id }) => difficulties.flatMap((d) => taskPool(id, d)));
describe("rzeczywiste rozwiązania wszystkich 35 rodzin", () => {
  it.each(allTemplates)("$id: każdy wariant ma uporządkowane etapy, poprawne rachunki i końcowy AnswerSpec", ({ id }) => {
    const family = tasks.filter((task) => task.templateId === id);
    expect(family.length).toBeGreaterThan(0);
    for (const task of family) {
      const steps = solutionFor(task);
      expect(steps).toEqual(solutionFor(task));
      expect(steps.length).toBeGreaterThanOrEqual(2);
      expect(steps.slice(0, -1).every((step) => step.kind === "working")).toBe(true);
      for (const step of steps) {
        expect(step.action.length).toBeGreaterThan(8);
        expect(step.reason.length).toBeGreaterThan(20);
        if (step.kind === "working") step.calculations.forEach(verify);
      }
      expect(steps.at(-1)).toMatchObject({ kind: "answer", answer: getAnswerSpec(task) });
    }
  });
  it("MT-QA-002: each signed-product level explains only displayed factors in PL and EN", () => {
    const signed = tasks.filter((task) => task.templateId === "signed-product" && isLegacyDifficulty(task.difficulty));
    expect(signed.length).toBeGreaterThan(0);
    const byLevel = new Set<string>();
    for (const task of signed) {
      const factor = task.parameters.c;
      const easyCase = factor === 1;
      byLevel.add(task.difficulty);
      const pl = solutionFor(task);
      const en = solutionFor(englishTask(task));
      for (const [locale, steps] of [["pl", pl], ["en", en]] as const) {
        const working = steps.filter((step) => step.kind === "working");
        expect(working, `${locale}:${task.id}`).toHaveLength(easyCase ? 1 : 2);
        expect(working[0].calculations, `${locale}:${task.id}`).toHaveLength(1);
        expect(working[0].calculations[0].result.numerator < 0n).toBe(true);
        const combined = working.map((step) => step.action + " " + step.reason).join(" ");
        if (easyCase) {
          expect(task.question).not.toContain("× (");
          expect(combined).not.toMatch(/two negative|dwa ujemne|dwóch ujemnych|trzeci|third|multiply by 1|mnożenie przez 1/i);
          expect(combined).toMatch(locale === "pl" ? /ujemna/i : /negative/i);
        } else {
          expect(factor).toBeLessThan(0);
          expect(working[1].calculations).toHaveLength(1);
          expect(working[1].calculations[0].result.numerator > 0n).toBe(true);
          expect(working[1].reason).toMatch(locale === "pl" ? /dwa ujemne/i : /two negative/i);
          expect(working[1].action).toContain(String(factor));
          expect(task.question).toContain("× (");
        }
        expect(steps.at(-1)).toMatchObject({ kind: "answer", answer: getAnswerSpec(task) });
      }
    }
    expect(byLevel).toEqual(new Set(["easy", "medium", "hard"]));
  });
  it("Sarrus zawiera sześć oddzielnych iloczynów z właściwym znakiem i sumami", () => {
    for (const task of tasks.filter((t) => t.templateId === "determinant-sarrus" && isLegacyDifficulty(t.difficulty))) {
      const steps = solutionFor(task);
      expect(steps.slice(1, 4).every((s) => s.action.startsWith("+ ↘"))).toBe(true);
      expect(steps.slice(4, 7).every((s) => s.action.startsWith("− ↗"))).toBe(true);
      for (const step of steps.slice(1, 7)) if (step.kind === "working") {
        expect(step.calculations).toHaveLength(1);
        expect(step.calculations[0].operation).toBe("product");
        expect(step.calculations[0].operands).toHaveLength(3);
      }
    }
  });
  it("iloczyn macierzy wyjaśnia każdy element jako wiersz × kolumna", () => {
    for (const task of tasks.filter((t) => t.templateId === "matrix-product" && isLegacyDifficulty(t.difficulty))) {
      const steps = solutionFor(task), spec = getAnswerSpec(task);
      if (spec.kind !== "matrix") throw new Error("Matrix expected");
      expect(steps).toHaveLength(2 + spec.values.flat().length);
      expect(steps.slice(1, -1).every((s) => /wiersz .* × kolumna/.test(s.action))).toBe(true);
    }
  });
  it("dokumentowana suma obejmuje faktyczne instancje wszystkich pul i poziomów", () => {
    expect(tasks.filter((t) => isLegacyDifficulty(t.difficulty) && !t.supplemental && !isUniversityTask(t))).toHaveLength(2092);
    const docs = readFileSync(new URL("../../GENERATORS.md", import.meta.url), "utf8");
    expect(docs).toContain("łącznie z pierwotnymi pulami 2092 instancje");
  });
});
