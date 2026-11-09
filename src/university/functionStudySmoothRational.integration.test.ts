import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational } from "../answers";
import { difficulties, taskPool } from "../generators";
import { searchCatalog } from "../catalogSearch";
import { makeUniversityTask, localizeUniversity, universityFamilies } from "./catalog";
import { rational as r, addRational as add } from "../rational";
import { polishLearningText } from "../../e2e/helpers/localization";

const ID = "analysis-study-smooth-rational";

describe("MT-SYLLABUS-D08: registered smooth rational study", () => {
  it("adds one student-visible family and only 72 bounded variants", () => {
    const families = universityFamilies.filter(f => f.id === ID);
    expect(families).toHaveLength(1);
    expect(families[0].category).toBe("derivatives");
    expect(families[0].supportedDifficulties).toEqual(["hard", "advanced", "expert"]);
    expect(searchCatalog("D08").map(x => x.id)).toContain(ID);
    expect(searchCatalog("funkcji wymiernej bez biegunów").map(x => x.id)).toContain(ID);
    expect(searchCatalog("smooth rational function").map(x => x.id)).toContain(ID);
    expect(difficulties.filter(level => taskPool("derivatives", level).some(t => t.templateId === ID)))
      .toEqual(["hard", "advanced", "expert"]);
    expect(taskPool("derivatives", "easy").some(t => t.templateId === ID)).toBe(false);
    expect(taskPool("derivatives", "medium").some(t => t.templateId === ID)).toBe(false);
  });

  it("dispatches all 72 variants PL/EN with correct answer, rejection and no missing source shape", () => {
    const ids = new Set<string>();
    let localized = 0;
    for (const level of ["hard", "advanced", "expert"] as const) {
      const pool = taskPool("derivatives", level).filter(task => task.templateId === ID);
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(task => task.contentKey)).size).toBe(24);
      for (let v = 0; v < 24; v++) {
        const task = makeUniversityTask(ID, v, level);
        expect(task.university.kind).toBe(ID);
        ids.add(task.id);
        for (const locale of ["pl", "en"] as const) {
          const view = localizeUniversity(task, locale);
          const spec = view.answer;
          expect(view.question).toContain("f(x)=");
          expect(view.question).toContain("f′");
          expect(view.question).toContain("f″");
          expect(view.explanation).toContain("f″(x)");
          expect(view.explanation).toContain("/√3");
          expect(view.solution!.filter(step => step.kind === "working").length).toBeGreaterThanOrEqual(11);
          if (locale === "en")
            expect([view.question, view.hint, view.nextHint,
              ...view.solution!.map(step => step.reason)].join(" ")).not.toMatch(polishLearningText);
          expect(spec.kind).toBe("list");
          if (spec.kind !== "list") throw Error("Expected list");
          const p = task.university;
          if (p.kind !== ID) throw Error("Wrong problem kind");
          const values = p.target === "critical"
            ? [p.a, add(p.k, p.m)]
            : p.m.numerator > 0n
              ? [add(p.k, p.m), add(p.k, { numerator: p.m.numerator, denominator: p.m.denominator * 5n })]
              : [add(p.k, { numerator: p.m.numerator, denominator: p.m.denominator * 5n }), add(p.k, p.m)];
          // Independent selected sample check, plus production grading for every tuple.
          if (v === 0) expect(spec.values.map(formatRational)).toEqual(values.map(formatRational));
          expect(assessAnswer(spec, { kind: "list", values: spec.values.map(formatRational) }).kind).toBe("correct");
          expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
          expect(assessAnswer(spec, {
            kind: "list",
            values: spec.values.map((value, index) =>
              formatRational(index === 0 ? add(value, r(1)) : value)),
          }).kind).toBe("incorrect");
          expect(assessAnswer(spec, {
            kind: "list",
            values: spec.values.map((value, index) => index === 0 ? "1/0" : formatRational(value)),
          }).kind).toBe("invalid");
          localized++;
        }
      }
    }
    expect(ids.size).toBe(72);
    expect(localized).toBe(144);
  });
});
