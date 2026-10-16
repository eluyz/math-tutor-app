import { describe, it, expect } from "vitest";
import { rational as r, type Rational } from "../rational";
import { formatRational as f, emptyAnswer, type AnswerSpec, type AnswerInput } from "../answers";
import { allTemplates, taskPool, createGenerator, availableDifficulties, supportsDifficulty } from "../generators";
import { higherDifficulties, legacyDifficulties } from "../difficulty";
import { higherFamilyIds, makeHigherInstance, type HigherTask } from "./catalog";
import type { Expression, MatrixExpression } from "./schema";
import type { Matrix } from "../matrices";
import { checkAnswer } from "../exercises";
import { feedback, categories, studyCategories } from "../locales/pl";
import { solutionFor } from "../solutions/model";

// Independent exact arithmetic; do not import the production arithmetic or matrix operators.
const add = (a: Rational, b: Rational) => r(a.numerator*b.denominator + b.numerator*a.denominator, a.denominator*b.denominator);
const neg = (a: Rational) => r(-a.numerator, a.denominator);
const sub = (a: Rational, b: Rational) => add(a, neg(b));
const mul = (a: Rational, b: Rational) => r(a.numerator*b.numerator, a.denominator*b.denominator);
const div = (a: Rational, b: Rational) => r(a.numerator*b.denominator, a.denominator*b.numerator);
const pow = (a: Rational, p: number) => r(a.numerator**BigInt(p), a.denominator**BigInt(p));
function evaluate(e: Expression, x = r(0)): Rational {
  if (e.kind === "value") return e.value;
  if (e.kind === "variable") return x;
  if (e.kind === "power") return pow(evaluate(e.base, x), e.exponent);
  const a = evaluate(e.left, x), b = evaluate(e.right, x);
  return ({ sum: add, difference: sub, product: mul, quotient: div })[e.operator](a,b);
}
function matrix(e: MatrixExpression, task: HigherTask): Matrix {
  if (e.kind === "input") return task.matrices!.find((m) => m.label === e.name)!.values;
  if (e.kind === "transpose") { const a = matrix(e.input, task); return a[0].map((_, j) => a.map((row) => row[j])); }
  if (e.kind === "scale") return matrix(e.input, task).map((row) => row.map((v) => mul(e.scalar, v)));
  const a = matrix(e.left, task), b = matrix(e.right, task);
  if (e.kind === "product") {
    expect(a[0]).toHaveLength(b.length);
    return a.map((row) => b[0].map((_, j) => row.map((v, k) => mul(v, b[k][j])).reduce(add, r(0))));
  }
  expect(a).toHaveLength(b.length); expect(a[0]).toHaveLength(b[0].length);
  return a.map((row, i) => row.map((v,j) => (e.kind === "sum" ? add : sub)(v, b[i][j])));
}
function laplace(a: Matrix): Rational {
  if (a.length === 1) return a[0][0];
  return a[0].map((v,j) => mul(r(j%2 ? -1 : 1), mul(v, laplace(a.slice(1).map((row) => row.filter((_,k) => j!==k)))))).reduce(add, r(0));
}
function input(spec: AnswerSpec): AnswerInput {
  if (spec.kind === "scalar") return f(spec.value);
  if (spec.kind === "matrix") return { kind: "matrix", values: spec.values.map((row) => row.map(f)) };
  if (spec.kind === "list") return { kind: "list", values: spec.values.map(f) };
  if (spec.kind === "roots") return { kind: "roots", classification: ["none","double","two"][spec.values.length], values: [...spec.values].reverse().map(f) };
  return { kind: "choice", value: spec.value };
}
function audit(task: HigherTask) {
  const p = task.math, answer = task.answer;
  if (p.kind === "numeric") { expect(answer).toEqual({ kind: "scalar", value: evaluate(p.expression) }); return; }
  if (p.kind === "polynomial") {
    if (p.at) expect(answer).toEqual({ kind: "scalar", value: evaluate(p.expression, p.at) });
    else {
      if (answer.kind !== "list") throw new Error("List expected");
      for (const x of [-3,-1,0,2,5].map((v) => r(v,2))) {
        const expanded = answer.values.reduce((sum,v) => add(mul(sum,x),v),r(0));
        expect(expanded).toEqual(evaluate(p.expression,x));
      }
    }
    return;
  }
  if (p.kind === "linear" || p.kind === "quadratic") {
    const value = (x: Rational) => sub(evaluate(p.left,x),evaluate(p.right,x));
    const c = value(r(0)), b = div(sub(value(r(1)),value(r(-1))),r(2)), a = div(sub(add(value(r(1)),value(r(-1))),mul(r(2),c)),r(2));
    if (p.kind === "linear") {
      expect(a).toEqual(r(0)); if (answer.kind !== "scalar") throw new Error("Scalar expected");
      expect(answer.value).toEqual(div(neg(c),b)); expect(value(answer.value)).toEqual(r(0));
      // Construction audit also checks every variant has the intended rational root.
      const v = task.parameters.variant; expect(answer.value).toEqual(r(v%2 ? -(v+1) : v+1,3));
    } else {
      expect(a.numerator).not.toBe(0n);
      const delta = sub(mul(b,b),mul(r(4),mul(a,c)));
      if (p.target === "delta") expect(answer).toEqual({ kind: "scalar", value: delta });
      else {
        if (answer.kind !== "roots") throw new Error("Roots expected");
        expect(answer.values).toHaveLength(delta.numerator < 0n ? 0 : delta.numerator === 0n ? 1 : 2);
        for (const root of answer.values) expect(value(root)).toEqual(r(0));
        if (answer.values.length === 2) {
          expect(answer.values[0]).not.toEqual(answer.values[1]);
          expect(add(answer.values[0],answer.values[1])).toEqual(div(neg(b),a));
          expect(mul(answer.values[0],answer.values[1])).toEqual(div(c,a));
        }
      }
    }
    return;
  }
  if (p.kind === "monomial") {
    if (answer.kind !== "list") throw new Error("Monomial pair expected");
    const exponent = Number(answer.values[1].numerator); expect(answer.values[1].denominator).toBe(1n);
    for (const x of [r(-2),r(1,2),r(3)]) {
      const original = add(div(mul(mul(p.a,pow(x,p.p)),mul(p.b,pow(x,p.q))),mul(p.c,pow(x,p.s))),p.combined ? mul(p.d,pow(x,p.p+p.q-p.s)) : r(0));
      expect(mul(answer.values[0],pow(x,exponent))).toEqual(original);
    }
    return;
  }
  const value = matrix(p.expression,task);
  expect(answer).toEqual(p.kind === "matrix" ? { kind: "matrix", values: value } : { kind: "scalar", value: laplace(value) });
}
const descriptors = allTemplates.filter((t) => higherFamilyIds.some((id) => id === t.id));
describe("rzeczywiste zaawansowane i eksperckie zadania", () => {
  it.each(descriptors)("$id: wszystkie 48 wariantów, niezależny rachunek i kompletne kroki", (template) => {
    for (const level of higherDifficulties) {
      const tasks = Array.from({ length: 24 },(_,v) => makeHigherInstance(template,v,level));
      expect(new Set(tasks.map((t) => t.contentKey)).size).toBe(24);
      for (const task of tasks) {
        audit(task);
        expect(checkAnswer(task,input(task.answer),feedback).kind).toBe("correct");
        expect(checkAnswer(task,emptyAnswer(task.answer),feedback).kind).toBe("invalid");
        const spec = task.answer;
        const wrong = input(spec.kind === "scalar" ? { ...spec, value: add(spec.value,r(1)) } : spec.kind === "list" ? { ...spec, values: spec.values.map((v,i) => i ? v : add(v,r(1))) } : spec.kind === "matrix" ? { ...spec, values: spec.values.map((row,i) => row.map((v,j) => i || j ? v : add(v,r(1)))) } : { kind: "roots", values: [r(99999)] });
        expect(checkAnswer(task,wrong,feedback).kind).toBe("incorrect");
        const steps = solutionFor(task);
        expect(steps.length).toBeGreaterThanOrEqual(4);
        expect(steps.at(-1)).toMatchObject({ kind: "answer", answer: task.answer });
        expect(task.question + task.explanation + task.hint + task.nextHint).not.toMatch(/undefined|NaN|Infinity/);
        for (const step of steps) if (step.kind === "working") for (const calc of step.calculations) {
          const operation = ({ sum: add, difference: sub, product: mul, quotient: div })[calc.operation];
          expect(calc.operands.slice(1).reduce(operation,calc.operands[0])).toEqual(calc.result);
        }
      }
    }
  });
  it("deklaracje dostępności odpowiadają rzeczywistym pulom; każda kategoria wspiera oba poziomy", () => {
    const ids = new Set<string>(); let count = 0;
    for (const {id: category} of [...categories,...studyCategories]) for (const level of higherDifficulties) {
      expect(availableDifficulties(category)).toContain(level);
      const pool = taskPool(category,level); expect(pool.length).toBeGreaterThanOrEqual(24);
      for (const task of pool) { expect(supportsDifficulty(task.templateId,level)).toBe(true); expect(ids.has(task.id)).toBe(false); ids.add(task.id); count++; }
      const g = createGenerator(42), drawn = Array.from({length:10},() => g.next(category,level).exercise);
      expect(new Set(drawn.map((t) => t.id)).size).toBe(10);
    }
    expect(count).toBe(1392); expect(descriptors).toHaveLength(29);
    const legacy = [...categories,...studyCategories].flatMap(({id}) => legacyDifficulties.flatMap((d) => taskPool(id,d)));
    expect(legacy).toHaveLength(2092);
  });
  it("nie zastępuje nieobsługiwanej rodziny poziomem hard i odrzuca błędne warianty", () => {
    const elementary = allTemplates.find((t) => t.id === "matrix-entry")!;
    expect(supportsDifficulty(elementary.id,"expert")).toBe(false);
    expect(() => makeHigherInstance(elementary,0,"expert")).toThrow();
    expect(() => createGenerator().next("matrices","expert",elementary.id)).toThrow();
    expect(() => makeHigherInstance(descriptors[0],24,"advanced")).toThrow();
    expect(() => makeHigherInstance(descriptors[0],-1,"advanced")).toThrow();
  });
});
