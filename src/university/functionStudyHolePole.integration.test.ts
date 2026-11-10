import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as fmt } from "../answers";
import { addRational as add, rational as r } from "../rational";
import { difficulties, taskPool } from "../generators";
import { searchCatalog } from "../catalogSearch";
import { polishLearningText } from "../../e2e/helpers/localization";
import { holePoleStudyHoleLimit } from "./functionStudyHolePole";
import { universityFamilies, makeUniversityTask, localizeUniversity } from "./catalog";

const ID = "analysis-study-hole-pole";
const eq = (x: {numerator:bigint;denominator:bigint}, y:{numerator:bigint;denominator:bigint}) =>
  x.numerator*y.denominator === y.numerator*x.denominator;

describe("MT-SYLLABUS-D08: hole and genuine pole integrated in student catalog", () => {
  it("registers exactly one visible family at hard/advanced/expert only", () => {
    const matches = universityFamilies.filter(f => f.id === ID);
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("derivatives");
    expect(matches[0].supportedDifficulties).toEqual(["hard","advanced","expert"]);
    expect(searchCatalog("D08").map(row => row.id)).toContain(ID);
    expect(searchCatalog("funkcji z dziurą i biegunem").map(row => row.id)).toContain(ID);
    expect(searchCatalog("rational function with a hole and pole").map(row => row.id)).toContain(ID);
    expect(difficulties.filter(level => taskPool("derivatives",level).some(x => x.templateId === ID)))
      .toEqual(["hard","advanced","expert"]);
    expect(taskPool("derivatives","easy").some(x => x.templateId===ID)).toBe(false);
    expect(taskPool("derivatives","medium").some(x => x.templateId===ID)).toBe(false);
  });
  it("exercises all 72 distinct variants in PL and EN with full answer grading", () => {
    const unique = new Set<string>();
    let count = 0;
    for(const level of ["hard","advanced","expert"] as const){
      const pool = taskPool("derivatives", level).filter(x => x.templateId === ID);
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(x => x.contentKey)).size).toBe(24);
      for(let v=0; v<24; v++){
        const task=makeUniversityTask(ID,v,level);
        expect(task.university.kind).toBe(ID);
        unique.add(task.id);
        if(task.university.kind !== ID) throw Error("Unexpected problem kind");
        const p=task.university;
        for(const locale of ["pl","en"] as const){
          const view=localizeUniversity(task,locale),answer=view.answer;
          expect(view.question).toContain("f(x)=");
          expect(view.question).toContain("f′");
          expect(view.question).toContain("f″");
          expect(view.hint.length).toBeGreaterThan(20);
          expect(view.nextHint.length).toBeGreaterThan(20);
          expect(view.explanation).toContain("lim(x→");
          expect(view.explanation).toContain("f″(x)");
          expect(view.solution?.filter(x => x.kind === "working").length).toBeGreaterThanOrEqual(12);
          if(locale==="en")
            expect([view.question,view.hint,view.nextHint,...view.solution!.map(z => z.reason)].join(" "))
              .not.toMatch(polishLearningText);
          expect(answer.kind).toBe("list");
          if(answer.kind !== "list") throw Error("Expected list answer");
          expect(answer.values).toHaveLength(4);
          expect(answer.labels).toEqual(["xₕ","yₕ","xₚ","yₐ"]);
          expect(view.question).toContain("xₕ");
          expect(view.question).toContain("xₚ");
          const expected=[p.hole,holePoleStudyHoleLimit(p),p.pole,p.shift];
          expect(answer.values.every((x,i) => eq(x,expected[i]))).toBe(true);
          expect(assessAnswer(answer,{kind:"list",values:expected.map(fmt)}).kind).toBe("correct");
          expect(assessAnswer(answer,emptyAnswer(answer)).kind).toBe("invalid");
          expect(assessAnswer(answer,{kind:"list",values:expected.map((x,i)=>fmt(i===0?add(x,r(1)):x))}).kind)
            .toBe("incorrect");
          expect(assessAnswer(answer,{kind:"list",values:["1/0",...expected.slice(1).map(fmt)]}).kind)
            .toBe("invalid");
          count++;
        }
      }
    }
    expect(unique.size).toBe(72);
    expect(count).toBe(144);
  });
});
