import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, type AnswerSpec, type AnswerInput } from "./answers";
import { rational as r } from "./rational";
import { checkAnswer, type TypedExercise } from "./exercises";
import { exercises, feedback } from "./locales/pl";
import { advanceSession, createSession, recordFirstAttempt, summarizeSession } from "./session";

const cases: { spec: AnswerSpec; right: AnswerInput; wrong: AnswerInput }[] = [
  { spec: { kind: "scalar", value: r(3, 4) }, right: "0,75", wrong: "3" },
  { spec: { kind: "list", values: [r(-2), r(3, 4)], labels: ["x₁", "x₂"], unordered: true },
    right: { kind: "list", values: ["0.75", "−2"] }, wrong: { kind: "list", values: ["-2", "-2"] } },
  { spec: { kind: "matrix", values: [[r(1, 2), r(-2)], [r(0), r(3)]] },
    right: { kind: "matrix", values: [["0,5", "-2"], ["0", "6/2"]] },
    wrong: { kind: "matrix", values: [["1", "-2"], ["0", "3"]] } },
  { spec: { kind: "choice", value: "none", options: [{ value: "none", label: "Brak pierwiastków rzeczywistych" }, { value: "two", label: "Dwa" }] },
    right: { kind: "choice", value: "none" }, wrong: { kind: "choice", value: "two" } },
];
describe("jawnie typowane odpowiedzi", () => {
  it("formularz pierwiastków sprawdza wybór, kompletność i wartości bez ujawniania rozwiązania", () => {
    const spec: AnswerSpec = { kind: "roots", values: [r(-1, 2), r(3)] };
    expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
    expect(assessAnswer(spec, { kind: "roots", classification: "two", values: ["3", ""] }).kind).toBe("invalid");
    expect(assessAnswer(spec, { kind: "roots", classification: "two", values: ["3", "−1/2"] }).kind).toBe("correct");
    expect(assessAnswer(spec, { kind: "roots", classification: "double", values: ["3"] }).kind).toBe("incorrect");
    expect(assessAnswer(spec, { kind: "roots", classification: "none", values: [] }).kind).toBe("incorrect");
    expect(assessAnswer({ kind: "roots", values: [] }, { kind: "roots", classification: "none", values: [] }).kind).toBe("correct");
  });
  it.each(cases)("$spec.kind: wspólne correct / incorrect / invalid", ({ spec, right, wrong }) => {
    expect(assessAnswer(spec, right).kind).toBe("correct");
    expect(assessAnswer(spec, wrong).kind).toBe("incorrect");
    expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
    const exercise: TypedExercise = { ...exercises[0], answer: spec, startingHint: "Zacznij od danych." };
    expect(checkAnswer(exercise, right, feedback).kind).toBe("correct");
    expect(checkAnswer(exercise, wrong, feedback)).toMatchObject({ kind: "incorrect" });
    expect(checkAnswer(exercise, emptyAnswer(spec), feedback).kind).toBe("invalid");
  });
  it("nie utożsamia uporządkowanych współczynników z nieuporządkowanymi pierwiastkami", () => {
    const spec: AnswerSpec = { kind: "list", values: [r(2), r(3)], labels: ["a", "b"] };
    expect(assessAnswer(spec, { kind: "list", values: ["3", "2"] }).kind).toBe("incorrect");
    expect(assessAnswer({ ...spec, unordered: true }, { kind: "list", values: ["3", "2"] }).kind).toBe("correct");
    expect(assessAnswer({ ...spec, values: [r(2), r(2)], unordered: true }, { kind: "list", values: ["2", "3"] }).kind).toBe("incorrect");
  });
  it("odrzuca niekompletne, źle ukształtowane i nieprawidłowe macierze", () => {
    const spec = cases[2].spec;
    for (const input of [
      { kind: "matrix", values: [["1", ""], ["0", "3"]] },
      { kind: "matrix", values: [["1", "2"]] },
      { kind: "matrix", values: [["1"], ["2", "3"]] },
      { kind: "matrix", values: [["1/0", "2"], ["0", "3"]] },
      { kind: "matrix", values: [["eval(2)", "2"], ["0", "3"]] },
    ] as AnswerInput[]) expect(assessAnswer(spec, input).kind).toBe("invalid");
    expect(assessAnswer(cases[1].spec, { kind: "list", values: ["-2"] }).kind).toBe("invalid");
    expect(assessAnswer(cases[3].spec, { kind: "choice", value: "injected" }).kind).toBe("invalid");
  });
  it.each(cases)("$spec.kind: sesja liczy tylko pierwszą ważną ocenę", ({ spec, right, wrong }) => {
    const exercise: TypedExercise = { ...exercises[0], answer: spec, startingHint: "Wskazówka" };
    let session = createSession("algebra", "easy", exercise.id);
    for (const input of [emptyAnswer(spec), wrong, wrong, right])
      session = recordFirstAttempt(session, exercise.id, checkAnswer(exercise, input, feedback).kind);
    for (let index = 1; index <= 10; index++) {
      session = advanceSession(session, index === 1 ? exercise.id : String(index), String(index + 1));
    }
    expect(summarizeSession(session)).toEqual({ shown: 10, correct: 0, incorrect: 1, solutionViewed: 0, skipped: 9 });
  });
});
