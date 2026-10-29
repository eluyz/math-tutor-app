import { describe, expect, it } from "vitest";
import { rational as r } from "../rational";
import { assessAnswer } from "../answers";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { presentFunctionFollowup } from "./functionFollowup";
import { selectedSetContains } from "./functions-audit";

describe("QA-003 explanation regressions", () => {
  it("counts two numerator zeros and one denominator pole in all logarithm hints", () => {
    for (const level of ["hard", "advanced", "expert"] as const) {
      for (let variant = 0; variant < 24; variant++) {
        const task = makeUniversityTask("function-log-rational-domain", variant, level);
        expect(task.hint).toContain("dwa miejsca zerowe licznika i biegun mianownika");
        expect(localizeUniversity(task, "en").hint).toContain("two numerator zeros and denominator pole");
      }
    }
  });

  it("allows a zero logarithm value while excluding zero arguments and poles", () => {
    // ln(x(x-1)/(x+3)): at x=3 the argument is 3*2/6=1,
    // hence f(3)=0 is valid; x=0,1 are argument zeros and x=-3 is a pole.
    for (const locale of ["pl", "en"] as const) {
      const view = presentFunctionFollowup({
        kind: "function-log-rational-domain", p: r(0), q: r(1), pole: r(-3),
      }, locale);
      if (view.answer.kind !== "choice") throw Error("Expected a domain choice");
      expect(selectedSetContains(view.answer.value, r(3))).toBe(true);
      for (const x of [-3, 0, 1]) expect(selectedSetContains(view.answer.value, r(x))).toBe(false);
      expect(assessAnswer(view.answer, { kind: "choice", value: view.answer.value }).kind).toBe("correct");
      if (locale === "pl") {
        expect(view.explanation).toContain("Argument logarytmu musi być ściśle dodatni, a mianownik nie może być zerem");
        expect(view.explanation).not.toContain("zera logarytmu");
      }
    }
  });

  it("distinguishes an excluded origin from f(0)=0 in odd-symmetry explanations", () => {
    for (const level of ["hard", "advanced", "expert"] as const) {
      for (const variant of [1, 9, 21]) {
        const task = makeUniversityTask("function-punctured-symmetry", variant, level);
        if (task.university.kind !== "function-punctured-symmetry") throw Error("Unexpected graph");
        for (const locale of ["pl", "en"] as const) {
          const view = localizeUniversity(task, locale);
          expect(view.answer.kind === "choice" && view.answer.value).toBe("odd");
          const reason = view.solution![2].reason;
          if (task.university.included[2]) {
            expect(reason).toContain("f(0)=0");
          } else {
            expect(reason).toContain(locale === "pl" ? "f(0) nie jest określone" : "f(0) is not defined");
          }
        }
      }
    }
  });
});
