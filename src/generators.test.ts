import { describe, expect, it } from "vitest";
import { checkAnswer, checkStep } from "./exercises";
import { createGenerator, difficulties, makeInstance, pool, templates, type GeneratedExercise } from "./generators";
import { categories, feedback } from "./locales/pl";
import { equalRational, rational as r, type Rational } from "./rational";

function independentAnswer(item: GeneratedExercise): Rational {
  const { a, b, c, p, q, x, k, offset } = item.parameters;
  switch (item.templateId) {
    case "order-add-product": return r(a + b * c);
    case "order-subtract-product": return r(a - b * c);
    case "order-parentheses": return r((a + b) * c);
    case "signed-add": return r(b - a);
    case "signed-subtract-negative": return r(a + b);
    case "signed-product": return r(-a * b * c);
    case "fraction-add": return r(p * b + q * a, a * b);
    case "fraction-subtract": return r(p * b - q * a, a * b);
    case "fraction-product": return r(p * q, a * b);
    case "algebra-substitute": return r(x * x + k * x);
    case "algebra-like-terms": return r(a * x + b * x);
    case "algebra-distribute": return r(a * x + a * b);
    case "equation-add": return r(((a * x + b) - b) / a);
    case "equation-subtract": return r(((a * x - b) + b) / a);
    case "equation-fraction": return r((a * k + offset));
    default: throw new Error(`Missing independent formula: ${item.templateId}`);
  }
}

function independentStep(item: GeneratedExercise): Rational | null {
  const { a, b, p, x, k, offset } = item.parameters;
  switch (item.templateId) {
    case "order-add-product": return r(b * item.parameters.c);
    case "signed-add": return r(Math.abs(a - b));
    case "fraction-add": return r(p * b);
    case "algebra-substitute": return r(x * x);
    case "equation-add": return r(a * x);
    case "equation-fraction": return r(a * k + offset, a);
    default: return null;
  }
}

function expectedExplanationFragments(item: GeneratedExercise): string[] {
  const { a, b, c, p, q, x, k, offset } = item.parameters;
  const signed = (n: number) => String(n).replace("-", "−");
  const fraction = (n: Rational) => n.denominator === 1n
    ? n.numerator.toString().replace("-", "−")
    : `${n.numerator.toString().replace("-", "−")}/${n.denominator}`;
  switch (item.templateId) {
    case "order-add-product": return [`${b} × ${c} = ${b * c}`, `${a} + ${b * c} = ${a + b * c}`];
    case "order-subtract-product": return [`${b} × ${c} = ${b * c}`, `${a} − ${b * c} = ${signed(a - b * c)}`];
    case "order-parentheses": return [`${a} + ${b} = ${a + b}`, `${a + b} × ${c} = ${(a + b) * c}`];
    case "signed-add": return [`${b} − ${a} = ${signed(b - a)}`];
    case "signed-subtract-negative": return [`${signed(a)} + ${b} = ${signed(a + b)}`];
    case "signed-product": return [`= ${signed(-a * b * c)}`];
    case "fraction-add": return [`${p * b + q * a}/${a * b} = ${fraction(r(p * b + q * a, a * b))}`];
    case "fraction-subtract": return [`${p * b} − ${q * a} = ${signed(p * b - q * a)}`, `Wynik to ${fraction(r(p * b - q * a, a * b))}`];
    case "fraction-product": return [`${p * q}/${a * b} = ${fraction(r(p * q, a * b))}`];
    case "algebra-substitute": return [`= ${x * x}`, `= ${signed(k * x)}`, `Suma wynosi ${signed(x * x + k * x)}`];
    case "algebra-like-terms": return [`${a} + ${b})x = ${a + b}x`, `otrzymasz ${signed((a + b) * x)}`];
    case "algebra-distribute": return [`${signed(x)} + ${b} = ${signed(x + b)}`, `= ${signed(a * (x + b))}`];
    case "equation-add": return [`${a}x = ${signed(a * x)}`, `x = ${signed(x)}`];
    case "equation-subtract": return [`${a}x = ${signed(a * x)}`, `x = ${signed(x)}`];
    case "equation-fraction": return [`x/${a} = ${fraction(r(a * k + offset, a))}`, `x = ${signed(a * k + offset)}`];
    default: throw new Error(`Missing explanation audit: ${item.templateId}`);
  }
}

const all = categories.flatMap(({ id }) => difficulties.flatMap((level) => pool(id, level)));

describe("15 parametrycznych rodzin zadań", () => {
  it("obejmuje każdą kategorię trzema rodzinami", () => {
    expect(templates).toHaveLength(15);
    expect(new Set(templates.map((item) => item.id)).size).toBe(15);
    for (const category of categories)
      expect(templates.filter((item) => item.category === category.id)).toHaveLength(3);
  });

  it("potwierdza co najmniej 200 różnych treści, również na wielu seedach", () => {
    const unique = new Set(all.map((item) => item.contentKey));
    expect(unique.size).toBeGreaterThanOrEqual(200);
    const answersByQuestion = new Map<string, Rational>();
    for (const item of all) {
      const previous = answersByQuestion.get(item.contentKey);
      if (previous) expect(equalRational(previous, item.answer)).toBe(true);
      answersByQuestion.set(item.contentKey, item.answer);
    }
    for (const category of categories)
      for (const level of difficulties)
        expect(pool(category.id, level).length).toBeGreaterThanOrEqual(10);
    const sampled = new Set<string>();
    for (const seed of [0, 1, 7, 42, 1234, 2026, 65535, 0xffffffff]) {
      const generator = createGenerator(seed);
      for (const category of categories)
        for (const level of difficulties)
          for (let index = 0; index < 10; index++)
            sampled.add(generator.next(category.id, level).exercise.contentKey);
    }
    expect(sampled.size).toBeGreaterThanOrEqual(200);
    console.info(`Potwierdzone warianty: ${unique.size}; na ośmiu seedach: ${sampled.size}`);
  });

  it("przelicza niezależnie każde zadanie i jego krok pomocniczy", () => {
    for (const item of all) {
      expect(item.parameters).toBeDefined();
      expect(item.id).toContain(item.templateId);
      expect(item.contentKey).toBe(item.question.replace(/\s+/g, " ").trim());
      expect(equalRational(item.answer, independentAnswer(item)), item.id).toBe(true);
      expect(item.answer.denominator).toBeGreaterThan(0n);
      expect(item.question).not.toMatch(/undefined|NaN/);
      expect(item.explanation).not.toMatch(/undefined|NaN/);
      for (const fragment of expectedExplanationFragments(item))
        expect(item.explanation, item.id).toContain(fragment);
      expect(item.hint.trim()).not.toBe("");
      expect(item.nextHint.trim()).not.toBe("");
      const step = independentStep(item);
      if (step) {
        expect(item.step, item.id).toBeDefined();
        expect(equalRational(item.step!.answer, step), item.id).toBe(true);
        expect(item.step!.question).not.toMatch(/undefined|NaN/);
        const right = `${step.numerator}/${step.denominator}`;
        expect(checkStep(item, right, feedback).kind).toBe("correct");
        const wrong = `${step.numerator + step.denominator}/${step.denominator}`;
        const checked = checkStep(item, wrong, feedback);
        expect(checked.kind).toBe("incorrect");
        expect(checked.message).not.toContain(item.explanation);
      } else expect(item.step).toBeUndefined();
    }
  });

  it.each([
    { level: "medium" as const, a: 7, b: 3, question: "−7 + 3 = ?", result: r(-4), difference: "7 − 3" },
    { level: "easy" as const, a: 2, b: 5, question: "−2 + 5 = ?", result: r(3), difference: "5 − 2" },
  ])("podpowiada znak składnika o większej wartości bezwzględnej dla $question", ({ level, a, b, question, result, difference }) => {
    const family = templates.find((item) => item.id === "signed-add")!;
    const item = makeInstance(family, { a, b }, level);
    expect(item.question).toBe(question);
    expect(item.answer).toEqual(result);
    expect(item.nextHint).toBe(`Oblicz różnicę ${difference} i wybierz znak składnika o większej wartości bezwzględnej.`);
  });

  it("sprawdza odpowiedź dokładnie, bez fałszywych diagnoz", () => {
    for (const item of all) {
      const right = `${item.answer.numerator}/${item.answer.denominator}`;
      expect(checkAnswer(item, right, feedback).kind, item.id).toBe("correct");
      const unknown = `${item.answer.numerator + 999n}/${item.answer.denominator}`;
      const checked = checkAnswer(item, unknown, feedback);
      expect(checked.kind).toBe("incorrect");
      if (checked.kind === "incorrect") expect(checked.diagnosis.kind).toBe("undetermined");
      expect(checkAnswer(item, "1/0", feedback).kind).toBe("invalid");
    }
  });

  it("buduje niskopewne hipotezy z parametrów, odrzucając kolizję z wynikiem", () => {
    for (const item of all)
      for (const rule of item.errorRules) {
        expect(rule.confidence).toBe("low");
        expect(rule.category).toBe(item.category);
        expect(rule.explanation).toMatch(/^Możliwe, że/);
        expect(equalRational(rule.wrongAnswer, item.answer)).toBe(false);
        const wrong = `${rule.wrongAnswer.numerator}/${rule.wrongAnswer.denominator}`;
        const result = checkAnswer(item, wrong, feedback);
        expect(result.kind).toBe("incorrect");
        if (result.kind === "incorrect") {
          expect(result.diagnosis.kind).toBe("hypotheses");
          if (result.diagnosis.kind === "hypotheses")
            expect(result.diagnosis.candidates.map((candidate) => candidate.errorCode)).toContain(rule.errorCode);
        }
      }
  });

  it("daje ten sam ciąg dla seeda i nie powtarza treści przed wyczerpaniem", () => {
    const sequence = (seed: number) => {
      const generator = createGenerator(seed);
      return Array.from({ length: 10 }, () => generator.next("order", "medium").exercise.contentKey);
    };
    expect(sequence(42)).toEqual(sequence(42));
    expect(sequence(42)).not.toEqual(sequence(43));
    expect(new Set(sequence(42)).size).toBe(10);

    const generator = createGenerator(13);
    const size = pool("signed", "easy").filter((item) => item.templateId === "signed-add").length;
    const seen = new Set<string>();
    for (let index = 0; index < size; index++) {
      const next = generator.next("signed", "easy", "signed-add");
      expect(next.repeated).toBe(false);
      seen.add(next.exercise.contentKey);
    }
    expect(seen.size).toBe(size);
    expect(generator.next("signed", "easy", "signed-add").repeated).toBe(true);
  });

  it("różnicuje poziomy także strukturą i nie tworzy zerowych mianowników", () => {
    const easy = pool("equations", "easy").filter((item) => item.templateId === "equation-fraction");
    const hard = pool("equations", "hard").filter((item) => item.templateId === "equation-fraction");
    expect(easy.every((item) => item.parameters.offset === 0)).toBe(true);
    expect(hard.every((item) => item.parameters.offset > 0)).toBe(true);
    expect(hard.some((item) => item.question.includes("/"))).toBe(true);
    expect(all.every((item) => item.answer.denominator > 0n &&
      (!item.step || item.step.answer.denominator > 0n))).toBe(true);
  });

  it("odrzuca parametry spoza dozwolonych zakresów", () => {
    const family = templates.find((item) => item.id === "fraction-add")!;
    expect(() => makeInstance(family, { p: 1, q: 1, a: 0, b: 4 }, "easy")).toThrow();
    expect(() => makeInstance(family, { p: 1, q: 1, a: 3, b: 4, extra: 1 }, "easy")).toThrow();
  });
});
