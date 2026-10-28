import {describe,expect,it} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {taskPool} from "../generators";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {
  graphDisconnectedInjectivityFamilies,makeGraphDisconnectedInjectivity,
  duplicateDisconnectedHeight,isDisconnectedGraphInjective,
  type GraphDisconnectedInjectivityProblem,
} from "./graphDisconnectedInjectivity";

/** An independent sampling oracle, based on segment equations (not production hitsAtY). */
function intersections(p:GraphDisconnectedInjectivityProblem,y:number):number[] {
  const [a,h,b]=p.left,[c,d]=p.right,[ac,bc,cc,dc]=p.included;
  const result:number[]=[];
  for(const [u,v,iu,iv] of [[a,h,ac,false],[h,b,false,bc],[c,d,cc,dc]] as const) {
    if(y<Math.min(u.y,v.y)||y>Math.max(u.y,v.y))continue;
    if(u.y===v.y){
      result.push((2*u.x+v.x)/3,(u.x+2*v.x)/3);
    }else{
      const pos=u.x+(y-u.y)*(v.x-u.x)/(v.y-u.y);
      if((y===u.y&&!iu)||(y===v.y&&!iv))continue;
      result.push(pos);
    }
  }
  return result.filter((x,i)=>result.findIndex(z=>Math.abs(x-z)<1e-8)===i);
}
const problem=(ly:readonly [number,number,number],ry:readonly [number,number],
  included:readonly [boolean,boolean,boolean,boolean],shared=false):GraphDisconnectedInjectivityProblem=>({
  kind:"function-disconnected-injectivity",
  left:[{x:0,y:ly[0]},{x:2,y:ly[1]},{x:4,y:ly[2]}],
  right:[{x:shared?4:7,y:ry[0]},{x:shared?8:11,y:ry[1]}],
  included,
});

describe("F05/P0C global injectivity across graph branches",()=>{
  it("handles overlaps, a flat section, touching endpoint membership and shared-x jumps",()=>{
    expect(graphDisconnectedInjectivityFamilies).toHaveLength(1);
    expect(isDisconnectedGraphInjective(problem([-3,-1,1],[2,4],[true,true,true,true]))).toBe(true);
    expect(isDisconnectedGraphInjective(problem([-3,-1,1],[0,3],[true,true,true,true]))).toBe(false);
    expect(isDisconnectedGraphInjective(problem([-3,-3,-3],[2,4],[true,true,true,true]))).toBe(false);
    expect(isDisconnectedGraphInjective(problem([-2,0,2],[2,4],[true,true,true,true]))).toBe(false);
    expect(isDisconnectedGraphInjective(problem([-2,0,2],[2,4],[true,false,true,true]))).toBe(true);
    expect(isDisconnectedGraphInjective(problem([-2,0,2],[2,4],[true,true,false,true]))).toBe(true);
    expect(isDisconnectedGraphInjective(problem([-3,-1,1],[2,4],[true,true,false,true],true))).toBe(true);
    expect(()=>isDisconnectedGraphInjective(problem([-3,-1,1],[2,4],[true,true,true,true],true))).toThrow();
    for(const variant of [-1,24,1.5,NaN,Infinity])
      expect(()=>makeGraphDisconnectedInjectivity(variant,"hard")).toThrow();
    expect(()=>makeGraphDisconnectedInjectivity(0,"easy")).toThrow();
  });
  it("independently checks all variants, bilingual teaching, exact answer grading",()=>{
    let yes=0,no=0,flat=0,shared=0,endpoint=0;
    for(const difficulty of ["hard","advanced","expert"] as const) {
      const pool=taskPool("functions",difficulty)
        .filter(t=>t.templateId==="function-disconnected-injectivity");
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(t=>t.contentKey)).size).toBe(24);
      for(let v=0;v<24;v++) {
        const task=makeUniversityTask("function-disconnected-injectivity",v,difficulty);
        if(task.university.kind!=="function-disconnected-injectivity")throw Error("Unexpected kind");
        const p=task.university,[a,h,b]=p.left,[c,d]=p.right;
        expect(a.x<h.x&&h.x<b.x&&b.x<=c.x&&c.x<d.x).toBe(true);
        expect([a,h,b,c,d].every(n=>Math.abs(n.y)<=4&&Number.isSafeInteger(n.x))).toBe(true);
        if(b.x===c.x)shared++;
        if([a.y,h.y,b.y].some(y=>y===c.y||y===d.y))endpoint++;
        if(a.y===h.y||h.y===b.y||c.y===d.y)flat++;
        const expected=[...Array(49)].every((_,j)=>intersections(p,(j-24)/4).length<=1);
        expect(isDisconnectedGraphInjective(p),difficulty+":"+v).toBe(expected);
        const witness=duplicateDisconnectedHeight(p);
        if(expected){yes++;expect(witness).toBeNull();}
        else{no++;expect(witness).not.toBeNull();
          if(witness!==null)expect(intersections(p,witness).length).toBeGreaterThanOrEqual(2);}
        for(const locale of ["pl","en"] as const) {
          const view=localizeUniversity(task,locale);
          expect(view.answer.kind).toBe("choice");
          if(view.answer.kind!=="choice")throw Error("Expected choice");
          expect(view.answer.options).toHaveLength(2);
          expect(view.answer.value).toBe(expected?"injective":"not-injective");
          expect(assessAnswer(view.answer,{kind:"choice",value:view.answer.value}).kind).toBe("correct");
          expect(assessAnswer(view.answer,{kind:"choice",value:expected?"not-injective":"injective"}).kind).toBe("incorrect");
          expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
          expect(assessAnswer(view.answer,{kind:"choice",value:"missing"}).kind).toBe("invalid");
          expect(view.solution!.length).toBeGreaterThanOrEqual(4);
          if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        }
      }
    }
    expect(yes).toBeGreaterThan(8);
    expect(no).toBeGreaterThan(8);
    expect(flat).toBeGreaterThan(0);
    expect(shared).toBeGreaterThan(0);
    expect(endpoint).toBeGreaterThan(0);
  },60000);
});
