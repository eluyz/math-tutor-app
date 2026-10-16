import { describe, expect, it } from "vitest";
import { checkAnswer, checkStep } from "./exercises";
import { exercises, feedback } from "./locales/pl";

const byId = (id: string) => {
  const exercise = exercises.find((item) => item.id === id);
  if (!exercise) throw new Error(`Missing exercise ${id}`);
  return exercise;
};

function incorrect(id: string, answer: string) {
  const result = checkAnswer(byId(id), answer, feedback);
  expect(result.kind).toBe("incorrect");
  if (result.kind !== "incorrect")
    throw new Error(`Expected incorrect result for ${id}`);
  return result;
}

describe("deterministyczne sprawdzanie i diagnoza", () => {
  it.each([
    ["order", "11", "4 × 2 = 8"],
    ["negative", "5", "pozostałych 5 kroków"],
    ["algebra", "4", "2x = 8"],
    ["fraction-add", "3/4", "2/4 + 1/4"],
    ["fraction-add", "0,75", "2/4 + 1/4"],
    ["fraction-subtract", "2/4", "5/6 − 2/6"],
    ["fraction-multiply", "0.5", "6/12 = 1/2"],
    ["signed-product", "15", "3 × 5 = 15"],
  ])(
    "%s akceptuje %s i podaje poprawne wyjaśnienie",
    (id, answer, explanation) => {
      const result = checkAnswer(byId(id), answer, feedback);
      expect(result.kind).toBe("correct");
      expect(result.message).toContain(explanation);
    },
  );

  it.each([
    ["order", "14", "ORDER_LEFT_TO_RIGHT"],
    ["negative", "-19", "SIGNED_WRONG_DIRECTION"],
    ["fraction-add", "1/3", "FRACTION_ADD_DENOMINATORS"],
    ["algebra-distribute", "14", "ALGEBRA_PARTIAL_DISTRIBUTION"],
    ["algebra", "8", "EQUATION_STOPPED_AT_2X"],
  ])(
    "rozpoznaje możliwy typ błędu w %s, bez pewnej diagnozy",
    (id, answer, code) => {
      const result = incorrect(id, answer);
      expect(result.message).not.toContain(byId(id).explanation);
      expect(result.diagnosis.kind).toBe("hypotheses");
      if (result.diagnosis.kind === "hypotheses") {
        expect(
          result.diagnosis.candidates.map((candidate) => candidate.errorCode),
        ).toContain(code);
        expect(
          result.diagnosis.candidates.every(
            (candidate) => candidate.confidence === "low",
          ),
        ).toBe(true);
      }
    },
  );

  it("zachowuje dwie hipotezy dla tego samego wyniku zamiast wybierać jedną", () => {
    const result = incorrect("algebra-substitute", "12");
    expect(result.diagnosis).toMatchObject({
      kind: "hypotheses",
      ambiguous: true,
    });
    if (result.diagnosis.kind === "hypotheses") {
      expect(
        result.diagnosis.candidates.map((candidate) => candidate.errorCode),
      ).toEqual(["ALGEBRA_SQUARE_AS_DOUBLE", "ALGEBRA_COEFFICIENT_IGNORED"]);
    }
  });

  it("obsługuje znak matematyczny w błędnych odpowiedziach bez zmiany pewności", () => {
    const result = incorrect("signed-product", "−15");
    expect(result.diagnosis).toMatchObject({
      kind: "hypotheses",
      ambiguous: false,
      candidates: [{ errorCode: "SIGNED_PRODUCT_SIGN", confidence: "low" }],
    });
  });

  it("dla innego błędnego wyniku zwraca nieustaloną przyczynę", () => {
    const result = incorrect("order", "10");
    expect(result.diagnosis).toMatchObject({
      kind: "undetermined",
      errorCode: "UNDETERMINED",
      confidence: "none",
    });
    if (result.diagnosis.kind === "undetermined") {
      expect(result.diagnosis.explanation).toContain("Nieustalona przyczyna");
    }
  });

  it.each([
    ["", "Wpisz odpowiedź"],
    ["abc", "Wpisz jedną liczbę"],
    ["1/0", "Mianownik nie może być zerem"],
    ["1/2/3", "Wpisz jedną liczbę"],
    ["1".repeat(101), "zbyt długa"],
  ])("odrzuca wejście %s bez fałszywej diagnozy", (answer, message) => {
    expect(checkAnswer(byId("fraction-add"), answer, feedback)).toMatchObject({
      kind: "invalid",
    });
    expect(
      checkAnswer(byId("fraction-add"), answer, feedback).message,
    ).toContain(message);
  });

  it("nie akceptuje przybliżenia 1/3 jako dokładnej wartości", () => {
    const exercise = {
      ...byId("fraction-add"),
      answer: { numerator: 1n, denominator: 3n },
    };
    expect(checkAnswer(exercise, "0.3333333333333333", feedback).kind).toBe(
      "incorrect",
    );
  });
});

describe("pytania pomocnicze", () => {
  it.each([
    ["order", "8", "9"],
    ["negative", "7", "8"],
    ["fraction-add", "2", "1"],
    ["algebra-substitute", "9", "6"],
    ["algebra", "8", "7"],
  ])("%s reaguje inaczej na poprawny i błędny etap", (id, right, wrong) => {
    const exercise = byId(id);
    const correct = checkStep(exercise, right, feedback);
    const incorrectStep = checkStep(exercise, wrong, feedback);
    expect(correct.kind).toBe("correct");
    expect(incorrectStep.kind).toBe("incorrect");
    expect(correct.message).not.toBe(incorrectStep.message);
    expect(incorrectStep.message).not.toContain(exercise.explanation);
  });

  it("waliduje wejście pytania pomocniczego", () => {
    expect(checkStep(byId("order"), "1/0", feedback)).toEqual({
      kind: "invalid",
      message: feedback.divisionByZero,
    });
  });

  it("nie przedstawia odpowiedzi pomocniczej jako dowodu przyczyny błędu", () => {
    const exercise = byId("algebra-substitute");
    const diagnosis = incorrect(exercise.id, "12").diagnosis;
    for (const [answer, kind] of [["9", "correct"], ["6", "incorrect"]] as const) {
      const step = checkStep(exercise, answer, feedback);
      expect(step.kind).toBe(kind);
      expect(step.message).toContain("Nie ustala to przyczyny wcześniejszej odpowiedzi");
      expect(step.message).not.toContain(exercise.explanation);
      expect(incorrect(exercise.id, "12").diagnosis).toEqual(diagnosis);
    }
  });
});
