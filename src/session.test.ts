import { describe, expect, it } from "vitest";
import { checkAnswer, type CheckResult } from "./exercises";
import type { Difficulty } from "./generators";
import { exercises, feedback } from "./locales/pl";
import {
  advanceSession, createSession, recordFirstAttempt, summarizeSession, suggestLevel,
  type SessionState,
} from "./session";

function complete(kinds: (CheckResult["kind"] | null)[], difficulty: Difficulty = "medium") {
  let session = createSession("order", difficulty, "exercise-1");
  for (let index = 0; index < 10; index++) {
    const id = `exercise-${index + 1}`;
    if (kinds[index]) session = recordFirstAttempt(session, id, kinds[index]!);
    session = advanceSession(session, id, index < 9 ? `exercise-${index + 2}` : undefined);
  }
  return session;
}

describe("pierwsze ważne próby w pojedynczej sesji", () => {
  it("pokazuje podsumowanie dopiero po zakończeniu dziesiątego zadania", () => {
    let session = createSession("order", "easy", "exercise-1");
    for (let number = 1; number <= 10; number++) {
      expect(session.entries).toHaveLength(number);
      expect(summarizeSession(session)).toBeNull();
      session = advanceSession(session, `exercise-${number}`, `exercise-${number + 1}`);
    }
    expect(session.completed).toBe(true);
    expect(session.entries).toHaveLength(10);
    expect(summarizeSession(session)).toEqual({ shown: 10, correct: 0, incorrect: 0, skipped: 10 });
    expect(advanceSession(session, "exercise-10", "exercise-11")).toBe(session);
  });

  it("zlicza 7 poprawnych, 2 wymagające poprawy i 1 pominięte zadanie", () => {
    const session = complete([
      "correct", "correct", "correct", "correct", "correct", "correct", "correct", "incorrect", "incorrect", null,
    ]);
    expect(summarizeSession(session)).toEqual({ shown: 10, correct: 7, incorrect: 2, skipped: 1 });
  });

  it.each(["", "   ", "abc", "1/0", "1 + 2"])("zapis %j nie jest ważną próbą ani oceną przed pominięciem", (raw) => {
    const initial = createSession("order", "easy", exercises[0].id);
    const checked = checkAnswer(exercises[0], raw, feedback);
    expect(checked.kind).toBe("invalid");
    expect(recordFirstAttempt(initial, exercises[0].id, checked.kind)).toBe(initial);
  });

  it("nieważna odpowiedź pozwala na późniejszą pierwszą ważną próbę", () => {
    const initial = createSession("order", "easy", "one");
    const invalid = recordFirstAttempt(initial, "one", "invalid");
    const correct = recordFirstAttempt(invalid, "one", "correct");
    expect(correct.entries[0].firstAttempt).toBe("correct");
    expect(initial.entries[0].firstAttempt).toBeNull();
  });

  it.each(["correct", "incorrect"] as const)("nie nadpisuje pierwszej oceny %s przy powtórnym sprawdzaniu", (kind) => {
    const first = recordFirstAttempt(createSession("order", "medium", "one"), "one", kind);
    for (const retry of ["invalid", "incorrect", "correct", "correct"] as const)
      expect(recordFirstAttempt(first, "one", retry)).toBe(first);
    expect(first.entries[0].firstAttempt).toBe(kind);
  });

  it("nie podwaja przejść ani nie zapisuje oceny z poprzedniego zadania", () => {
    const first = createSession("order", "medium", "one");
    const second = advanceSession(first, "one", "two");
    expect(second.entries).toHaveLength(2);
    expect(advanceSession(second, "one", "three")).toBe(second);
    expect(recordFirstAttempt(second, "one", "correct")).toBe(second);
    expect(advanceSession(second, "two", "two")).toBe(second);
    expect(advanceSession(second, "two")).toBe(second);
    expect(first.entries).toHaveLength(1);
  });

  it("pominięcie po samych nieważnych odpowiedziach nie jest błędną pierwszą próbą", () => {
    const session = complete(["invalid", null, "invalid", "correct", "incorrect"]);
    expect(summarizeSession(session)).toEqual({ shown: 10, correct: 1, incorrect: 1, skipped: 8 });
    expect(recordFirstAttempt(session, "exercise-10", "correct")).toBe(session);
  });

  it("nowa sesja ma własny poziom, kategorię i puste statystyki", () => {
    const previous = complete(Array(10).fill("correct"));
    const next: SessionState = createSession("algebra", "hard", "new-exercise");
    expect(next).toEqual({
      category: "algebra", difficulty: "hard", completed: false,
      entries: [{ exerciseId: "new-exercise", firstAttempt: null }],
    });
    expect(summarizeSession(next)).toBeNull();
    expect(summarizeSession(previous)).toEqual({ shown: 10, correct: 10, incorrect: 0, skipped: 0 });
  });
});

const levels: Difficulty[] = ["easy", "medium", "hard"];
// Jawna tabela oczekiwań dla 0, 1, ..., 10 poprawnych pierwszych prób.
const expected: Record<Difficulty, Difficulty[]> = {
  easy:   ["easy", "easy", "easy", "easy", "easy", "easy", "easy", "easy", "medium", "medium", "medium"],
  medium: ["easy", "easy", "easy", "easy", "easy", "medium", "medium", "medium", "hard", "hard", "hard"],
  hard:   ["medium", "medium", "medium", "medium", "medium", "hard", "hard", "hard", "hard", "hard", "hard"],
};

describe("ostrożna sugestia poziomu na następną sesję", () => {
  it.each(levels.flatMap((difficulty) => Array.from({ length: 7 }, (_, valid) => ({ difficulty, valid }))))(
    "$difficulty: $valid ważnych prób to za mało danych niezależnie od ich poprawności", ({ difficulty, valid }) => {
      for (let correct = 0; correct <= valid; correct++) {
        expect(suggestLevel(difficulty, { shown: 10, correct, incorrect: valid - correct, skipped: 10 - valid }))
          .toEqual({ kind: "insufficient" });
      }
    },
  );

  it.each(levels.flatMap((difficulty) => [7, 8, 9, 10].flatMap((valid) =>
    Array.from({ length: valid + 1 }, (_, correct) => ({ difficulty, valid, correct })),
  )))("$difficulty: $correct poprawnych / $valid ważnych prób", ({ difficulty, valid, correct }) => {
    const summary = { shown: 10, correct, incorrect: valid - correct, skipped: 10 - valid };
    expect(suggestLevel(difficulty, summary)).toEqual({ kind: "suggestion", difficulty: expected[difficulty][correct] });
  });

  it("nie sugeruje poziomu na podstawie nieukończonej sesji", () => {
    expect(suggestLevel("medium", { shown: 9, correct: 9, incorrect: 0, skipped: 0 })).toEqual({ kind: "insufficient" });
  });
});
