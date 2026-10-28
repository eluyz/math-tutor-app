import { describe,expect,it } from "vitest";
import { taskPool } from "../generators";
import { assessAnswer,emptyAnswer } from "../answers";
import { makeUniversityTask,localizeUniversity } from "./catalog";
import { gapDomain,makeGraphGap,graphGapFamilies,type GraphGapProblem } from "./graphGaps";

const fmt=(n:number)=>String(n).replace("-","−");
const segment=(a:number,b:number,left:boolean,right:boolean)=>
  (left?"[":"(")+fmt(a)+"; "+fmt(b)+(right?"]":")");
/** Separate reference splitting endpoints from the raw geometry (does not invoke gapDomain). */
function independentDomain(g:GraphGapProblem):string {
  const xs=[g.left[0].x,g.left[1].x,g.left[2].x,g.right[0].x,g.right[1].x];
  const mask=g.included;
  return segment(xs[0],xs[1],mask[0],false)+" ∪ "+
         segment(xs[1],xs[2],false,mask[1])+" ∪ "+
         segment(xs[3],xs[4],mask[2],mask[3]);
}
const options=(p:ReturnType<typeof localizeUniversity>)=>{
  if(p.answer.kind!=="choice")throw Error("Expected choice");
  return p.answer;
};
describe("MT-EDU-033 F05 disconnected graphs and removable holes",()=>{
  it("rejects unsupported variant bounds and difficulty",()=>{
    expect(graphGapFamilies).toHaveLength(1);
    for(const v of [-1,24,1.2,NaN,Infinity])
      expect(()=>makeGraphGap(v,"hard")).toThrow();
    expect(()=>makeGraphGap(0,"easy")).toThrow();
    expect(()=>makeGraphGap(0,"medium")).toThrow();
  });
  it("covers 72 distinct geometry cases, true gaps, holes, PL/EN answer checking",()=>{
    const keys=new Set<string>();let openEndpoints=0,closedEndpoints=0,flatSegments=0;
    for(const level of graphGapFamilies[0].supportedDifficulties){
      const pool=taskPool("functions",level).filter(t=>t.templateId==="function-disconnected-domain");
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(t=>t.contentKey)).size).toBe(24);
      for(let v=0;v<24;v++){
        const task=makeUniversityTask("function-disconnected-domain",v,level);
        if(task.university.kind!=="function-disconnected-domain")throw Error("Wrong problem");
        const g=task.university;
        const [a,h,b]=g.left,[c,d]=g.right;
        expect(a.x).toBeLessThan(h.x);
        expect(h.x).toBeLessThan(b.x);
        expect(b.x).toBeLessThan(c.x);
        expect(c.x).toBeLessThan(d.x);
        expect(h.x*2).toBe(a.x+b.x);
        expect(h.y*2).toBe(a.y+b.y);
        expect(g.left.concat(g.right).every(n=>Number.isSafeInteger(n.x)&&Number.isSafeInteger(n.y)&&Math.abs(n.y)<=4)).toBe(true);
        openEndpoints+=g.included.filter(x=>!x).length;
        closedEndpoints+=g.included.filter(Boolean).length;
        flatSegments+=a.y===h.y?1:0;
        const expected=independentDomain(g);
        expect(gapDomain(g)).toBe(expected);
        keys.add(task.contentKey);
        for(const locale of ["pl","en"] as const){
          const view=localizeUniversity(task,locale),answer=options(view);
          expect(answer.options).toHaveLength(4);
          expect(new Set(answer.options.map(o=>o.label)).size).toBe(4);
          expect(answer.options.find(o=>o.value===answer.value)?.label).toBe(expected);
          expect(assessAnswer(answer,{kind:"choice",value:answer.value}).kind).toBe("correct");
          expect(assessAnswer(answer,{kind:"choice",value:answer.options.find(o=>o.value!==answer.value)!.value}).kind).toBe("incorrect");
          expect(assessAnswer(answer,emptyAnswer(answer)).kind).toBe("invalid");
          expect(assessAnswer(answer,{kind:"choice",value:"invalid"}).kind).toBe("invalid");
          expect(view.solution!.length).toBeGreaterThan(4);
          expect(view.explanation).toContain(expected);
          expect(view.hint.length).toBeGreaterThan(40);
          if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
    }
    expect(keys.size).toBe(72);
    expect(openEndpoints).toBeGreaterThan(40);
    expect(closedEndpoints).toBeGreaterThan(70);
    expect(flatSegments).toBeGreaterThan(0);
  });
});