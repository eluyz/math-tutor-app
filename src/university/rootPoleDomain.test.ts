import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { assessAnswer, emptyAnswer } from "../answers";
import { rational as r, addRational as add, subtractRational as sub, divideRational as div } from "../rational";
import { compare } from "./realSets";
import { selectedSetContains } from "./functions-audit";
import { polishLearningText } from "../../e2e/helpers/localization";

describe("F01: one radical boundary plus a separate linear denominator pole", () => {
  it("proves domain and grading independently for all 24 bilingual examples", () => {
    const kinds = new Set<string>(), keys = new Set<string>();
    for (let variant = 0; variant < 24; variant++) {
      const task = makeUniversityTask("function-radical-over-linear-domain", variant, "medium");
      keys.add(task.contentKey);
      const p = task.university;
      expect(p.kind).toBe("function-domain");
      if (p.kind !== "function-domain" || p.mode !== "root-over-one") throw Error("Wrong form");
      const relation = compare(p.q, p.p);
      kinds.add(String(relation));
      const points = [
        p.p, p.q, sub(p.p, r(2)), add(p.p, r(2)),
        sub(p.q, r(2)), add(p.q, r(2)),
        div(add(p.p, p.q), r(2)),
      ];
      for (const locale of ["pl", "en"] as const) {
        const view = localizeUniversity(task, locale), answer = view.answer;
        if (answer.kind !== "choice") throw Error("Expected set choice");
        for (const x of points) {
          const expected = compare(x, p.p) >= 0 && compare(x, p.q) !== 0;
          expect(selectedSetContains(answer.value, x),
            `${variant}/${locale}/${x.numerator}/${x.denominator}`).toBe(expected);
        }
        expect(assessAnswer(answer, { kind: "choice", value: answer.value }).kind).toBe("correct");
        expect(assessAnswer(answer, { kind: "choice", value: answer.options.find(o => o.value !== answer.value)!.value }).kind).toBe("incorrect");
        expect(assessAnswer(answer, emptyAnswer(answer)).kind).toBe("invalid");
        expect(view.question).toContain("√");
        expect(view.question).toContain("/(x");
        expect(view.hint.length).toBeGreaterThan(15);
        expect(view.nextHint.length).toBeGreaterThan(15);
        const steps = view.solution?.filter(x => x.kind === "working") ?? [];
        expect(steps.length).toBeGreaterThanOrEqual(4);
        expect(steps.some(x => x.kind === "working" && x.action.includes("≥ 0"))).toBe(true);
        expect(steps.some(x => x.kind === "working" && x.action.includes("x ∉"))).toBe(true);
        expect(view.solution?.at(-1)?.kind).toBe("answer");
        if (locale === "en") {
          expect(view.question + view.hint + view.nextHint + view.explanation).not.toMatch(polishLearningText);
        }
      }
    }
    expect(keys.size).toBe(24);
    expect(kinds).toEqual(new Set(["-1", "0", "1"]));
    expect(() => makeUniversityTask("function-radical-over-linear-domain", 0, "easy")).toThrow();
  });
});
