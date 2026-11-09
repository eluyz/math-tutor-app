import {describe,it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity,universityPool} from "./catalog";
import {competencyIndex} from "../competencyIndex";
import {searchCatalog,selectCatalogFamily} from "../catalogSearch";
import {assessAnswer,formatRational as fmt} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";

const family="integral-parts-trig-quadratic";
const levels=["hard","advanced","expert"] as const;

describe("I04 production integration — quadratic × trigonometric, two passes",()=>{
  it("exposes exactly one registered family through I04 in the source-aware search",()=>{
    expect(competencyIndex.I04.coverage).toBe("partial");
    expect(competencyIndex.I04.familyIds).toContain(family);
    for(const query of ["I04","calkowanie przez czesci","integration by parts"]){
      const matches=searchCatalog(query);
      expect(matches.filter(f=>f.id===family)).toHaveLength(1);
    }
    const search=searchCatalog("I04");
    const entry=search.find(x=>x.id===family);
    expect(entry).toBeDefined();
    expect(selectCatalogFamily(entry!,"easy")).toEqual({
      category:"integrals",
      templateId:family,
      difficulty:"hard",
      changedDifficulty:true,
    });
  });

  for(const level of levels){
    it(level+": registers 24 unique student-facing tasks with correct 3-field grading and PL/EN",()=>{
      const pool=universityPool("integrals",level).filter(x=>x.templateId===family);
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(x=>x.contentKey)).size).toBe(24);
      expect(new Set(pool.map(x=>x.id)).size).toBe(24);
      for(let v=0;v<24;v++){
        const task=makeUniversityTask(family,v,level);
        expect(task.id).toBe(family+":"+level+":"+v);
        expect(task.category).toBe("integrals");
        expect(task.answer.kind).toBe("primitive");
        for(const locale of ["pl","en"] as const){
          const displayed=localizeUniversity(task,locale);
          const answer=displayed.answer;
          expect(displayed.question).toContain("∫");
          expect(displayed.solution?.length).toBeGreaterThanOrEqual(7);
          if(locale==="en"){
            expect(displayed.title).toContain("Integration by parts twice");
            expect(displayed.explanation).not.toMatch(polishLearningText);
            expect(displayed.hint).not.toMatch(polishLearningText);
          }
          if(answer.kind!=="primitive")throw Error("I04 requires primitive answers");
          expect(answer.terms).toHaveLength(3);
          expect(assessAnswer(answer,{
            kind:"primitive",
            coefficients:answer.terms.map(x=>fmt(x.coefficient)),
            hasConstant:true,
          })).toEqual({kind:"correct"});
          expect(assessAnswer(answer,{
            kind:"primitive",
            coefficients:answer.terms.map(x=>fmt(x.coefficient)),
            hasConstant:false,
          })).toEqual({kind:"incorrect",reason:"missing-constant"});
        }
      }
    });
  }
});
