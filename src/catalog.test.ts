import { describe, expect, it } from "vitest";
import { checkAnswer } from "./exercises";
import { categories, exercises, feedback } from "./locales/pl";
import {
  addRational,
  divideRational,
  equalRational,
  multiplyRational,
  rational as r,
  subtractRational,
  type Rational,
} from "./rational";

// Calculations here are independent of the manually entered answers in the catalog.
const independentlyCalculated = {
  order: r(3 + 4 * 2),
  "order-parentheses": r((6 + 2) * 3),
  "order-subtraction": r(18 - 2 * 5),
  negative: r(-7 + 12),
  "signed-subtract": r(6 - -4),
  "signed-product": r(-3 * -5),
  "fraction-add": addRational(r(1, 2), r(1, 4)),
  "fraction-subtract": subtractRational(r(5, 6), r(1, 3)),
  "fraction-multiply": multiplyRational(r(2, 3), r(3, 4)),
  "algebra-distribute": r(3 * (4 + 2)),
  "algebra-like-terms": r(2 * 2 + 3 * 2),
  "algebra-substitute": r(3 * 3 + 2 * 3),
  algebra: divideRational(subtractRational(r(11), r(3)), r(2)),
  "equation-minus": divideRational(addRational(r(10), r(5)), r(3)),
  "equation-half": multiplyRational(subtractRational(r(7), r(4)), r(2)),
};

const independentlyCalculatedSteps = {
  order: r(4 * 2),
  negative: r(0 - -7),
  "fraction-add": divideRational(r(4), r(2)),
  "algebra-substitute": r(3 * 3),
  algebra: r(11 - 3),
};

const independentlyCalculatedMistakes: Record<string, Rational> = {
  ORDER_LEFT_TO_RIGHT: r((3 + 4) * 2),
  ORDER_IGNORED_PARENTHESES: r(6 + 2 * 3),
  ORDER_SUBTRACTION_FIRST: r((18 - 2) * 5),
  SIGNED_WRONG_DIRECTION: r(-7 - 12),
  SIGNED_ADDED_MAGNITUDES: r(7 + 12),
  SIGNED_DOUBLE_MINUS: r(6 - 4),
  SIGNED_PRODUCT_SIGN: r(-3 * 5),
  FRACTION_ADD_DENOMINATORS: r(1 + 1, 2 + 4),
  FRACTION_SUBTRACT_DENOMINATORS: r(5 - 1, 6 - 3),
  FRACTION_ADDED_INSTEAD: r(2 + 3, 3 + 4),
  ALGEBRA_PARTIAL_DISTRIBUTION: r(3 * 4 + 2),
  ALGEBRA_FORGOT_SUBSTITUTION: r(2 + 3),
  ALGEBRA_SQUARE_AS_DOUBLE: r(2 * 3 + 2 * 3),
  ALGEBRA_COEFFICIENT_IGNORED: r(3 * 3 + 3),
  ALGEBRA_MISSING_X: r(3 * 3 + 2),
  EQUATION_STOPPED_AT_2X: r(11 - 3),
  EQUATION_STOPPED_AT_3X: r(10 + 5),
  EQUATION_WRONG_INVERSE: divideRational(subtractRational(r(10), r(5)), r(3)),
  EQUATION_STOPPED_AT_HALF_X: r(7 - 4),
  EQUATION_DIVIDED_AGAIN: divideRational(subtractRational(r(7), r(4)), r(2)),
};

describe("audyt katalogu zadań", () => {
  it("ma 15 unikalnych zadań po trzy w każdej kategorii", () => {
    expect(exercises).toHaveLength(15);
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(15);
    for (const category of categories) {
      expect(
        exercises.filter((exercise) => exercise.category === category.id),
      ).toHaveLength(3);
    }
  });

  it.each(exercises)(
    "$id: ręcznie wpisana odpowiedź zgadza się z niezależnym obliczeniem",
    (exercise) => {
      const expected =
        independentlyCalculated[
          exercise.id as keyof typeof independentlyCalculated
        ];
      expect(
        expected,
        `Brak niezależnego obliczenia dla ${exercise.id}`,
      ).toBeDefined();
      expect(equalRational(exercise.answer, expected)).toBe(true);
      expect(exercise.question.trim()).not.toBe("");
      expect(exercise.explanation.trim()).not.toBe("");
      expect(exercise.hint.trim()).not.toBe("");
      expect(exercise.nextHint.trim()).not.toBe("");
    },
  );

  it("weryfikuje etapy pośrednie niezależnie od danych zadania", () => {
    const steps = exercises.filter((exercise) => exercise.step);
    expect(steps.length).toBeGreaterThanOrEqual(3);
    for (const exercise of steps) {
      const expected =
        independentlyCalculatedSteps[
          exercise.id as keyof typeof independentlyCalculatedSteps
        ];
      expect(
        expected,
        `Brak niezależnego obliczenia kroku dla ${exercise.id}`,
      ).toBeDefined();
      expect(equalRational(exercise.step!.answer, expected)).toBe(true);
    }
  });

  it("reguły błędów nie obejmują poprawnych odpowiedzi i nie twierdzą, że znają przyczynę", () => {
    const codes = new Set<string>();
    for (const exercise of exercises)
      for (const rule of exercise.errorRules) {
        expect(rule.category).toBe(exercise.category);
        expect(equalRational(rule.wrongAnswer, exercise.answer)).toBe(false);
        expect(rule.confidence).toBe("low");
        expect(rule.explanation).toMatch(/^Możliwe, że/);
        expect(rule.hint.trim()).not.toBe("");
        expect(codes.has(rule.errorCode)).toBe(false);
        expect(
          equalRational(
            rule.wrongAnswer,
            independentlyCalculatedMistakes[rule.errorCode],
          ),
        ).toBe(true);
        const answer =
          rule.wrongAnswer.denominator === 1n
            ? rule.wrongAnswer.numerator.toString()
            : `${rule.wrongAnswer.numerator}/${rule.wrongAnswer.denominator}`;
        const result = checkAnswer(exercise, answer, feedback);
        expect(result.kind).toBe("incorrect");
        if (
          result.kind === "incorrect" &&
          result.diagnosis.kind === "hypotheses"
        ) {
          expect(
            result.diagnosis.candidates.map((candidate) => candidate.errorCode),
          ).toContain(rule.errorCode);
        }
        codes.add(rule.errorCode);
      }
    expect(codes).toEqual(
      new Set(Object.keys(independentlyCalculatedMistakes)),
    );
  });
});
