import {describe,expect,it} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {taskPool} from "../generators";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {makeGraphMonotonicityIntervals,monotonicitySets,monotonicitySegments,
 formatMonotonicity,type GraphMonotonicityIntervalsProblem
} from "./graphMonotonicityIntervals";
describe("F05 P0D connected monotonicity intervals with a hole",()=>{
 it("keeps the two sides of a missing point separate",()=>{
  const p:GraphMonotonicityIntervalsProblem={
   kind:"function-disconnected-monotonicity",
   left:[{x:0,y:0},{x:2,y:1},{x:4,y:2}],
   right:[{x:7,y:0},{x:11,y:0}],included:[true,false,false,true]};
  expect(formatMonotonicity(monotonicitySets(p),"pl"))
   .toBe("Rośnie: [0; 2) ∪ (2; 4); Maleje: ∅; Stała: (7; 11]");
  expect(()=>monotonicitySegments({...p,right:[{x:4,y:0},{x:11,y:0}]})).toThrow();
  for(const v of [-1,24,NaN,Infinity,1.1])expect(()=>makeGraphMonotonicityIntervals(v,"hard")).toThrow();
  expect(()=>makeGraphMonotonicityIntervals(0,"easy")).toThrow();
 });
 it("checks all 72 geometries with an independent segment-sign and boundary oracle",()=>{
  const keys=new Set<string>();let rising=0,falling=0,constant=0,open=0;
  for(const level of ["hard","advanced","expert"] as const){
   const pool=taskPool("functions",level).filter(t=>t.templateId==="function-disconnected-monotonicity");
   expect(pool).toHaveLength(24);expect(new Set(pool.map(t=>t.contentKey)).size).toBe(24);
   for(let v=0;v<24;v++){
    const task=makeUniversityTask("function-disconnected-monotonicity",v,level);
    if(task.university.kind!=="function-disconnected-monotonicity")throw Error("Unexpected problem");
    const p=task.university,[a,h,b]=p.left,[c,d]=p.right,[ac,bc,cc,dc]=p.included;
    const oracle=[{u:a,v:h,cl:ac,cr:false},{u:h,v:b,cl:false,cr:bc},{u:c,v:d,cl:cc,cr:dc}];
    const intervals=oracle.map(q=>({lo:q.u.x,hi:q.v.x,closedLo:q.cl,closedHi:q.cr}));
    const expectSets={
     up:oracle.flatMap((q,i)=>q.v.y>q.u.y?[intervals[i]]:[]),
     down:oracle.flatMap((q,i)=>q.v.y<q.u.y?[intervals[i]]:[]),
     flat:oracle.flatMap((q,i)=>q.v.y===q.u.y?[intervals[i]]:[]),
    };
    expect(monotonicitySets(p)).toEqual(expectSets);
    expect(a.x<h.x&&h.x<b.x&&b.x<c.x&&c.x<d.x).toBe(true);
    expect([a,h,b,c,d].every(q=>Math.abs(q.y)<=4)).toBe(true);
    rising+=expectSets.up.length;falling+=expectSets.down.length;constant+=expectSets.flat.length;
    open+=Number(!ac||!bc||!cc||!dc);keys.add(task.contentKey);
    for(const locale of ["pl","en"] as const){
     const view=localizeUniversity(task,locale);
     if(view.answer.kind!=="choice")throw Error("No choice");
     const right=formatMonotonicity(expectSets,locale);
     expect(view.answer.options).toHaveLength(4);
     expect(new Set(view.answer.options.map(q=>q.label)).size).toBe(4);
     expect(view.answer.options.find(q=>q.value===view.answer.value)?.label).toBe(right);
     expect(assessAnswer(view.answer,{kind:"choice",value:view.answer.value}).kind).toBe("correct");
     expect(assessAnswer(view.answer,{kind:"choice",value:view.answer.options.find(q=>q.value!==view.answer.value)!.value}).kind).toBe("incorrect");
     expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
     expect(view.explanation).toContain(right);
     if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
    }
   }
  }
  // Regression: a different difficulty must not reproduce an identical graph.
  const advanced=makeGraphMonotonicityIntervals(4,"advanced");
  const expert=makeGraphMonotonicityIntervals(1,"expert");
  expect(JSON.stringify(advanced)).not.toBe(JSON.stringify(expert));
  expect(keys.size).toBe(72);
  expect(rising).toBeGreaterThan(30);expect(falling).toBeGreaterThan(30);
  expect(constant).toBeGreaterThan(10);expect(open).toBeGreaterThan(15);
 },60000);
});