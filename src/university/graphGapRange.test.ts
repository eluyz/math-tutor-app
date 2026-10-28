import {describe, expect, it} from "vitest";
import {assessAnswer, emptyAnswer} from "../answers";
import {taskPool} from "../generators";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {
  disconnectedRange,formatRange,graphGapRangeFamilies,makeGraphGapRange,
  type GraphGapRangeProblem, type YInterval
} from "./graphGapRange";

function independentY(p:GraphGapRangeProblem,y:number):boolean {
  const [a,h,b]=p.left,[c,d]=p.right,[ac,bc,cc,dc]=p.included;
  for(const [u,v,iu,iv] of [[a,h,ac,false],[h,b,false,bc],[c,d,cc,dc]] as const){
    if(y<Math.min(u.y,v.y)||y>Math.max(u.y,v.y))continue;
    if(u.y===v.y)return true; // horizontal segment has infinitely many included interior points
    if(y===u.y&&!iu)continue;
    if(y===v.y&&!iv)continue;
    return true; // interior point of continuous segment
  }
  return false;
}
function includesY(intervals:readonly YInterval[],y:number) {
  return intervals.some(i=>(y>i.lo||y===i.lo&&i.closedLo)&&(y<i.hi||y===i.hi&&i.closedHi));
}
function oracleFormatted(a:readonly YInterval[]):string {
  return a.map(i=>i.lo===i.hi?"{"+i.lo+"}":(i.closedLo?"[":"(")+i.lo+"; "+i.hi+(i.closedHi?"]":")"))
    .join(" ∪ ").replace(/-/g,"−");
}

describe("F05/P0B disconnected-graph image union",()=>{
  it("rejects invalid bounds/levels and invalid geometry",()=>{
    expect(graphGapRangeFamilies).toHaveLength(1);
    for(const v of [-1,24,1.1,NaN,Infinity])
      expect(()=>makeGraphGapRange(v,"hard")).toThrow();
    expect(()=>makeGraphGapRange(0,"easy")).toThrow();
    const ok=makeGraphGapRange(0,"hard");
    expect(()=>disconnectedRange({...ok,right:[{x:ok.left[2].x,y:0},ok.right[1]]})).toThrow();
  });
  it("covers precise mathematical corner cases independently",()=>{
    const p=(left:readonly [number,number,number],right:readonly [number,number],inc:readonly [boolean,boolean,boolean,boolean]):GraphGapRangeProblem=>({
      kind:"function-disconnected-range",
      left:[{x:0,y:left[0]},{x:2,y:left[1]},{x:4,y:left[2]}],
      right:[{x:7,y:right[0]},{x:11,y:right[1]}],included:inc,
    });
    // True missing height with both sides open, plus disjoint y-image.
    expect(formatRange(disconnectedRange(p([-2,0,2],[3,4],[true,true,true,true]))))
      .toBe("[−2; 0) ∪ (0; 2] ∪ [3; 4]");
    // Identical hollow y is attained elsewhere, so range is continuous.
    expect(formatRange(disconnectedRange(p([-2,0,2],[0,3],[true,true,true,true]))))
      .toBe("[−2; 3]");
    // Hole is at a peak, no x attains that y there.
    expect(formatRange(disconnectedRange(p([-2,1,-2],[2,3],[true,true,true,true]))))
      .toBe("[−2; 1) ∪ [2; 3]");
    // Missing argument does NOT remove y on a horizontal segment.
    expect(formatRange(disconnectedRange(p([-1,-1,-1],[1,2],[false,false,false,true]))))
      .toBe("{−1} ∪ (1; 2]");
    // Branch overlap across a puncture restores even the exact absent height.
    expect(formatRange(disconnectedRange(p([0,2,4],[1,3],[true,true,true,true]))))
      .toBe("[0; 4]");
  });
  it("checks each of 72 geometries against independent segment-image membership oracle",()=>{
    const keys=new Set<string>();let holes=0,restored=0,disjoint=0,singletons=0;
    for(const level of ["hard","advanced","expert"] as const){
      const pool=taskPool("functions",level).filter(t=>t.templateId==="function-disconnected-range");
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(t=>t.contentKey)).size).toBe(24);
      for(let v=0;v<24;v++){
        const task=makeUniversityTask("function-disconnected-range",v,level);
        if(task.university.kind!=="function-disconnected-range")throw Error("Unexpected task kind");
        const p=task.university,[a,h,b]=p.left,[c,d]=p.right;
        expect(a.x<h.x&&h.x<b.x&&b.x<c.x&&c.x<d.x).toBe(true);
        expect([a,h,b,c,d].every(n=>Number.isSafeInteger(n.y)&&Math.abs(n.y)<=4)).toBe(true);
        const imgs=disconnectedRange(p);
        const correct=oracleFormatted(imgs);
        expect(formatRange(imgs)).toBe(correct);
        expect(imgs.every(i=>i.lo<=i.hi)).toBe(true);
        for(let j=-20;j<=20;j++){
          const y=j/4;
          expect(includesY(imgs,y),level+":"+v+" at y="+y).toBe(independentY(p,y));
        }
        const hy=h.y;
        if(!independentY(p,hy))holes++;
        else restored++;
        if(imgs.length>1)disjoint++;
        if(imgs.some(i=>i.lo===i.hi))singletons++;
        keys.add(task.contentKey);
        for(const locale of ["pl","en"] as const){
          const view=localizeUniversity(task,locale);
          expect(view.answer.kind).toBe("choice");
          if(view.answer.kind!=="choice")throw Error("Expected choice answer");
          const ans=view.answer;
          expect(ans.options).toHaveLength(4);
          expect(new Set(ans.options.map(o=>o.label)).size).toBe(4);
          expect(ans.options.find(o=>o.value===ans.value)?.label).toBe(correct);
          expect(assessAnswer(ans,{kind:"choice",value:ans.value}).kind).toBe("correct");
          expect(assessAnswer(ans,{kind:"choice",value:ans.options.find(o=>o.value!==ans.value)!.value}).kind).toBe("incorrect");
          expect(assessAnswer(ans,emptyAnswer(ans)).kind).toBe("invalid");
          expect(assessAnswer(ans,{kind:"choice",value:"bad"}).kind).toBe("invalid");
          expect(view.solution!.length).toBeGreaterThan(4);
          expect(view.explanation).toContain(correct);
          if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
    }
    expect(keys.size).toBe(72);
    expect(holes).toBeGreaterThan(0);
    expect(restored).toBeGreaterThan(0);
    expect(disjoint).toBeGreaterThan(0);
    expect(singletons).toBeGreaterThan(0);
  },60000);
});
