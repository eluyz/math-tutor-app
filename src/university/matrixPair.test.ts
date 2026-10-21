import { describe, expect, it } from "vitest";
import { assessAnswer, formatRational } from "../answers";
import { getAnswerSpec } from "../exercises";
import { taskPool } from "../generators";
import { addRational as add, equalRational as equal, multiplyRational as mul,
  rational as r, type Rational } from "../rational";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { createMatrixPair, presentMatrixPair } from "./matrixPair";

const dot = (a:Rational,x:Rational,b:Rational,y:Rational) => add(mul(a,x),mul(b,y));
describe("MT-EDU-008 two matrix equations", () => {
  it("solves a manually calculated exact 2×2 fixture independently", () => {
    const first=[[r(5),r(2)],[r(3),r(2)]], second=[[r(-1),r(4)],[r(-5),r(-2)]];
    const problem={kind:"linear-matrix-pair" as const,coefficients:[r(1),r(1),r(1),r(-1)] as const,first,second};
    const expected=[2,3,-1,0,3,-1,4,2].map((value)=>r(value));
    for(const locale of ["pl","en"] as const){
      const s=presentMatrixPair(problem,locale);
      expect(s.answer.kind).toBe("list");
      if(s.answer.kind!=="list")continue;
      expect(s.answer.values.map(formatRational)).toEqual(expected.map(formatRational));
      expect(s.answer.labels).toHaveLength(8);
      expect(s.solution.length).toBeGreaterThan(5);
      expect(assessAnswer(s.answer,{kind:"list",values:expected.map(formatRational)}).kind).toBe("correct");
      expect(assessAnswer(s.answer,{kind:"list",values:["1/0",...expected.slice(1).map(formatRational)]}).kind).toBe("invalid");
    }
  });
  it("audits all generated 2×2 variants at all supported levels using equation substitution",()=>{
    const levels=["medium","hard","advanced","expert"] as const;
    for(const difficulty of levels){
      const tasks=taskPool("matrices",difficulty).filter(t=>t.templateId==="matrix-coupled-equations");
      expect(tasks).toHaveLength(24);
      expect(new Set(tasks.map(t=>t.contentKey)).size).toBe(24);
      for(const task of tasks){
        expect("university" in task).toBe(true);
        if(!("university" in task) || task.university.kind!=="linear-matrix-pair")continue;
        const p=task.university, [a,b,c,d]=p.coefficients;
        const spec=getAnswerSpec(task);
        expect(spec.kind).toBe("list");
        if(spec.kind!=="list")continue;
        const x=[spec.values.slice(0,2),spec.values.slice(2,4)];
        const y=[spec.values.slice(4,6),spec.values.slice(6,8)];
        for(let i=0;i<2;i++)for(let j=0;j<2;j++){
          expect(equal(dot(a,x[i][j],b,y[i][j]),p.first[i][j])).toBe(true);
          expect(equal(dot(c,x[i][j],d,y[i][j]),p.second[i][j])).toBe(true);
        }
        for(const locale of ["pl","en"] as const){
          const translated=localizeUniversity(task,locale);
          expect(translated.solution?.length).toBeGreaterThan(5);
          expect(assessAnswer(getAnswerSpec(translated),
            {kind:"list",values:spec.values.map(formatRational)}).kind).toBe("correct");
        }
      }
    }
  });
  it("rejects singular systems without dividing by zero",()=>{
    const p=createMatrixPair(1,"medium");
    expect(()=>presentMatrixPair({...p,coefficients:[r(1),r(2),r(2),r(4)]},"pl")).toThrow();
    expect(()=>makeUniversityTask("matrix-coupled-equations",24,"hard")).toThrow();
  });
});
