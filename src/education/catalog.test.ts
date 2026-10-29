import { describe, expect, it } from "vitest";
import { legacyDifficulties as difficulties } from "../difficulty";
import { educationTemplates, educationPool } from "./catalog";
import { makeEducationInstance, VARIANTS_PER_LEVEL, type EducationInstance } from "./types";
import { createGenerator, taskPool, allTemplates, historicalTemplates } from "../generators";
import { checkAnswer } from "../exercises";
import { feedback } from "../locales/pl";
import { emptyAnswer, formatRational as f, type AnswerInput, type AnswerSpec } from "../answers";
import { rational as r, addRational, subtractRational, multiplyRational, divideRational, parseAnswer, equalRational, type Rational } from "../rational";
import type { Matrix } from "../matrices";

export function inputFor(spec: AnswerSpec): AnswerInput {
  if (spec.kind === "primitive") return { kind: "primitive", coefficients: spec.terms.map((term) => f(term.coefficient)), hasConstant: true };
  if (spec.kind === "limit") return {kind:"limit",classification:spec.value.kind,value:spec.value.kind === "finite"?f(spec.value.value):""};
  if (spec.kind === "system") return {kind:"system",classification:spec.classification,values:spec.values.map(f)};
  if (spec.kind === "scalar") return f(spec.value);
  if (spec.kind === "choice") return { kind: "choice", value: spec.value };
  if (spec.kind === "multi-choice") return {kind:"multi-choice",values:Object.fromEntries(spec.fields.map(f=>[f.id,f.value]))};
  if (spec.kind === "roots") return { kind: "roots", classification: ["none", "double", "two"][spec.values.length], values: [...spec.values].reverse().map(f) };
  return spec.kind === "list" ? { kind: "list", values: spec.values.map(f) } : { kind: "matrix", values: spec.values.map((row) => row.map(f)) };
}
function wrongInput(spec: AnswerSpec): AnswerInput {
  const input = inputFor(spec);
  if (typeof input === "string") return f(addRational(spec.kind === "scalar" ? spec.value : r(0), r(1)));
  if (input.kind === "choice" && spec.kind === "choice") return { kind: "choice", value: spec.options.find((o) => o.value !== spec.value)!.value };
  if (input.kind === "multi-choice" && spec.kind === "multi-choice") return {...input,values:{...input.values,[spec.fields[0].id]:spec.fields[0].options.find(o=>o.value!==spec.fields[0].value)!.value}};
  if (input.kind === "roots") return { kind: "roots", classification: "double", values: ["99999"] };
  if (input.kind === "list") return { kind: "list", values: input.values.map((v, i) => i === 0 ? "99999" : v) };
  if (input.kind === "matrix") return { kind: "matrix", values: input.values.map((row, i) => row.map((v, j) => i === 0 && j === 0 ? "99999" : v)) };
  throw new Error("Missing wrong input");
}
function integerSquareRoot(value: bigint): bigint {
  let low = 0n, high = value + 1n;
  while (high - low > 1n) { const middle = (low + high) / 2n; if (middle * middle <= value) low = middle; else high = middle; }
  if (low * low !== value) throw new Error("Unexpected irrational roots");
  return low;
}

function independentAnswer(item: EducationInstance): AnswerSpec {
  const p = item.parameters;
  if (item.templateId.startsWith("matrix-") || item.templateId.startsWith("determinant-")) return independentMatrixAnswer(item);
  switch (item.templateId) {
    case "algebra-negative-brackets": return { kind: "list", labels: [], values: [r(p.a), r(p.a * p.b)] };
    case "algebra-monomials": return { kind: "list", labels: [], values: [r(p.a * p.b), r(p.p + p.q)] };
    case "algebra-polynomial-product": {
      const values = [p.a, p.a * p.c + p.b, p.b * p.c];
      for (const x of [-3, 0, 2]) expect(BigInt(values[0] * x * x + values[1] * x + values[2])).toBe(BigInt((p.a * x + p.b) * (x + p.c)));
      return { kind: "list", labels: [], values: values.map((v) => r(v)) };
    }
    case "equation-fraction-balance": {
      const x = r(p.xN, p.xD), rhs = parseAnswer(item.question.match(/ = (.+)\. Podaj x\.$/)![1]);
      expect(rhs.kind).toBe("valid");
      if (rhs.kind === "valid") expect(addRational(divideRational(x, r(p.s)), r(p.p, p.q))).toEqual(rhs.value);
      return { kind: "scalar", value: x };
    }
    case "quadratic-square-sum":
    case "quadratic-square-difference": {
      const values = [p.a ** 2, 2 * p.sign * p.a * p.b, p.b ** 2];
      for (const x of [-2, 0, 3]) expect(BigInt(values[0] * x ** 2 + values[1] * x + values[2])).toBe(BigInt((p.a * x + p.sign * p.b) ** 2));
      return { kind: "list", labels: [], values: values.map((v) => r(v)) };
    }
    case "quadratic-difference-squares": return { ...(item.answer as Extract<AnswerSpec, { kind: "choice" }>), value: "product" };
    case "quadratic-discriminant": return { kind: "scalar", value: r(p.b ** 2 - 4 * p.a * p.c) };
    case "quadratic-delta-sign": {
      const delta = p.b ** 2 - 4 * p.a * p.c;
      return { ...(item.answer as Extract<AnswerSpec, { kind: "choice" }>), value: delta > 0 ? "two" : delta < 0 ? "none" : "double" };
    }
    case "quadratic-roots": {
      const delta = BigInt(p.b) ** 2n - 4n * BigInt(p.a) * BigInt(p.c);
      const values = delta < 0n ? [] : delta === 0n ? [r(-p.b, 2 * p.a)] : [
        r(-BigInt(p.b) - integerSquareRoot(delta), 2n * BigInt(p.a)), r(-BigInt(p.b) + integerSquareRoot(delta), 2n * BigInt(p.a))];
      for (const root of values) expect(equalRational(addRational(addRational(multiplyRational(r(p.a), multiplyRational(root, root)), multiplyRational(r(p.b), root)), r(p.c)), r(0))).toBe(true);
      return { kind: "roots", values };
    }
    default: throw new Error(`Missing independent audit: ${item.templateId}`);
  }
}

// Independent recursive Laplace expansion. No matrix arithmetic implementation is imported here.
function laplace(a: Matrix): Rational {
  if (a.length === 1) return a[0][0];
  return a[0].reduce((sum, value, j) => addRational(sum, multiplyRational(r(j % 2 ? -1 : 1),
    multiplyRational(value, laplace(a.slice(1).map((row) => row.filter((_, k) => k !== j)))))), r(0));
}
function independentMatrixAnswer(item: EducationInstance): AnswerSpec {
  const a = item.matrices![0].values, b = item.matrices?.[1]?.values, p = item.parameters;
  switch (item.templateId) {
    case "matrix-dimensions": return { kind: "list", labels: [], values: [r(a.length), r(a[0].length)] };
    case "matrix-entry": return { kind: "scalar", value: a[p.i - 1][p.j - 1] };
    case "matrix-add": return { kind: "matrix", values: a.map((row, i) => row.map((v, j) => addRational(v, b![i][j]))) };
    case "matrix-subtract": return { kind: "matrix", values: a.map((row, i) => row.map((v, j) => subtractRational(v, b![i][j]))) };
    case "matrix-scale": return { kind: "matrix", values: a.map((row) => row.map((v) => multiplyRational(v, r(p.kN, p.kD)))) };
    case "matrix-transpose": return { kind: "matrix", values: a[0].map((_, j) => a.map((row) => row[j])) };
    case "matrix-product": return { kind: "matrix", values: a.map((row) => b![0].map((_, j) =>
      row.map((v, k) => multiplyRational(v, b![k][j])).reduce(addRational, r(0)))) };
    case "determinant-two":
    case "determinant-sarrus":
    case "determinant-zero-row": return { kind: "scalar", value: laplace(a) };
    default: throw new Error(`Missing matrix audit: ${item.templateId}`);
  }
}

describe("niezależny audyt edukacyjnych rodzin", () => {
  it.each(educationTemplates)("$id: wszystkie poziomy i warianty", (template) => {
    for (const level of difficulties) {
      const questions = new Set<string>();
      for (let variant = 0; variant < VARIANTS_PER_LEVEL; variant++) {
        const item = makeEducationInstance(template, variant, level), expected = independentAnswer(item);
        questions.add(item.contentKey);
        expect(checkAnswer(item, inputFor(expected), feedback).kind, item.id).toBe("correct");
        expect(checkAnswer(item, wrongInput(expected), feedback).kind, item.id).toBe("incorrect");
        expect(checkAnswer(item, emptyAnswer(item.answer), feedback).kind, item.id).toBe("invalid");
        expect(item.question + item.explanation).not.toMatch(/undefined|NaN|Infinity/);
        expect(item.startingHint.length).toBeGreaterThan(15);
        expect(item.nextHint.length).toBeGreaterThan(15);
        if (expected.kind === "matrix" && item.answer.kind === "matrix") {
          expect(item.answer.values).toEqual(expected.values);
          for (const row of expected.values) for (const value of row) expect(item.explanation).toContain(f(value));
        }
        if (item.templateId === "determinant-sarrus") {
          expect(item.explanation.match(/^↘/gm)).toHaveLength(3);
          expect(item.explanation.match(/^↗/gm)).toHaveLength(3);
        }
        if (expected.kind === "list" && item.answer.kind === "list") {
          expect(item.answer.values).toEqual(expected.values);
          expect(item.answer.labels).toHaveLength(expected.values.length);
        }
      }
      expect(questions.size, `${template.id}/${level}`).toBeGreaterThanOrEqual(10);
      expect(educationPool(template.category, level).filter((item) => item.templateId === template.id).length).toBeGreaterThanOrEqual(10);
    }
  });

  it("klasyfikuje wszystkie trzy znaki delty na każdym poziomie bez zaokrąglania", () => {
    for (const level of difficulties) {
      const roots = educationPool("quadratics", level).filter((item) => item.templateId === "quadratic-roots");
      expect(new Set(roots.map((item) => item.answer.kind === "roots" ? item.answer.values.length : -1))).toEqual(new Set([0, 1, 2]));
    }
  });

  it("buforuje skończony katalog bez kombinatorycznego wzrostu", () => {
    let total = 0;
    const categories = [...new Set(educationTemplates.map((template) => template.category))];
    for (const category of categories) for (const level of difficulties) {
      const items = educationPool(category, level);
      expect(educationPool(category, level)).toBe(items);
      expect(items.length).toBeLessThanOrEqual(educationTemplates.filter((t) => t.category === category).length * 24);
      total += items.length;
    }
    expect(total).toBeLessThanOrEqual(1440);
    expect(total).toBeGreaterThanOrEqual(20 * 3 * 10);
  });

  it("ma skończone pule, deterministyczne losowanie i pamięć treści", () => {
    expect(educationTemplates).toHaveLength(20);
    expect(historicalTemplates).toHaveLength(35);
    expect(allTemplates).toEqual(expect.arrayContaining(historicalTemplates));
    for (const template of educationTemplates) {
      const items = educationPool(template.category, "medium").filter((item) => item.templateId === template.id);
      expect(items.length).toBeLessThanOrEqual(VARIANTS_PER_LEVEL);
      const generator = createGenerator(42), seen = new Set<string>();
      for (let index = 0; index < items.length; index++) {
        const next = generator.next(template.category, "medium", template.id);
        expect(next.repeated).toBe(false); expect(seen.has(next.exercise.contentKey)).toBe(false); seen.add(next.exercise.contentKey);
      }
      expect(generator.next(template.category, "medium", template.id).repeated).toBe(true);
    }
    const sequence = (seed: number) => {
      const generator = createGenerator(seed);
      return Array.from({ length: 10 }, () => generator.next("quadratics", "hard").exercise.id);
    };
    expect(sequence(42)).toEqual(sequence(42)); expect(sequence(42)).not.toEqual(sequence(43));
    expect(taskPool("quadratics", "hard").length).toBeLessThanOrEqual(6 * VARIANTS_PER_LEVEL);
    expect(() => makeEducationInstance(educationTemplates[0], VARIANTS_PER_LEVEL, "easy")).toThrow();
  });

  it("wyznaczniki 2×2 i 3×3 mają wyniki dodatnie, ujemne i zerowe; mnożenie bywa nieprzemienne", () => {
    for (const level of difficulties) {
      for (const id of ["determinant-two", "determinant-sarrus"]) {
        const values = educationPool("determinants", level).filter((item) => item.templateId === id).map((item) => independentAnswer(item));
        const signs = new Set(values.map((answer) => answer.kind === "scalar" ? answer.value.numerator < 0n ? -1 : answer.value.numerator > 0n ? 1 : 0 : 99));
        expect(signs, `${id}/${level}`).toEqual(new Set([-1, 0, 1]));
      }
      const products = educationPool("matrices", level).filter((item) => item.templateId === "matrix-product");
      expect(products.some((item) => item.explanation.includes("AB ≠ BA"))).toBe(true);
      for (const item of products) {
        const a = item.matrices![0].values, b = item.matrices![1].values;
        const ab = independentMatrixAnswer(item), ba = b.map((row) => a[0].map((_, j) => row.map((v, k) => multiplyRational(v, a[k][j])).reduce(addRational, r(0))));
        if (item.explanation.includes("AB ≠ BA")) expect(ab.kind === "matrix" && JSON.stringify(ab.values, (_, v) => typeof v === "bigint" ? String(v) : v) === JSON.stringify(ba, (_, v) => typeof v === "bigint" ? String(v) : v)).toBe(false);
      }
    }
  });
});
