import {describe,expect,it} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {taskPool} from "../generators";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {makeGraphPuncturedSymmetry,puncturedParity,type GraphPuncturedSymmetryProblem} from "./graphPuncturedSymmetry";

function independent(p:GraphPuncturedSymmetryProblem):"even"|"odd"|"neither"{
 const [a,b,c,d,e]=p.nodes,inc=p.included;
 if(inc[0]!==inc[4]||inc[1]!==inc[3])return "neither";
 // On each mirrored linear branch, equality at the knots implies equality
 // throughout its open interior; the knot itself may be excluded.
 const ev=a.y===e.y&&b.y===d.y, od=a.y===-e.y&&b.y===-d.y&&c.y===0;
 return ev?"even":od?"odd":"neither";
}
const sample=(height:readonly [number,number,number,number,number],included:readonly [boolean,boolean,boolean,boolean,boolean]):GraphPuncturedSymmetryProblem=>({
 kind:"function-punctured-symmetry",
 nodes:[{x:-6,y:height[0]},{x:-2,y:height[1]},{x:0,y:height[2]},
        {x:2,y:height[3]},{x:6,y:height[4]}],included
});
describe("F05 P0E punctured-domain parity",()=>{
 it("checks odd/even limits at hollow origin and domain asymmetric one-sided holes",()=>{
  expect(puncturedParity(sample([-2,-1,0,1,2],[true,true,false,true,true]))).toBe("odd");
  expect(puncturedParity(sample([2,1,2,1,2],[true,false,true,false,true]))).toBe("even");
  expect(puncturedParity(sample([2,1,2,1,2],[true,false,true,true,true]))).toBe("neither");
  expect(puncturedParity(sample([-2,-1,1,1,2],[true,true,false,true,true]))).toBe("neither");
  expect(()=>puncturedParity(sample([2,1,0,-1,-2],[true,true,true,true,true]).nodes[0].x===-6
    ? {...sample([2,1,0,-1,-2],[true,true,true,true,true]),
       nodes:[{x:-6,y:2},{x:-2,y:1},{x:1,y:0},{x:2,y:-1},{x:6,y:-2}]}
    : sample([2,1,0,-1,-2],[true,true,true,true,true]))).toThrow();
  for(const v of [-1,24,1.5,NaN,Infinity])expect(()=>makeGraphPuncturedSymmetry(v,"hard")).toThrow();
  expect(()=>makeGraphPuncturedSymmetry(0,"easy")).toThrow();
 });
 it("validates 72 variants, levels, bilingual labels and mathematical outcome",()=>{
  const keys=new Set<string>();const counts={even:0,odd:0,neither:0};
  let originHoles=0,sideHoles=0,domainAsym=0;
  for(const level of ["hard","advanced","expert"] as const){
   const pool=taskPool("functions",level).filter(x=>x.templateId==="function-punctured-symmetry");
   expect(pool).toHaveLength(24);expect(new Set(pool.map(x=>x.contentKey)).size).toBe(24);
   for(let v=0;v<24;v++){
    const task=makeUniversityTask("function-punctured-symmetry",v,level);
    if(task.university.kind!=="function-punctured-symmetry")throw Error("Unexpected task type");
    const p=task.university,ns=p.nodes;
    expect(ns.map(q=>q.x)).toEqual([...ns.map(q=>q.x)].sort((a,b)=>a-b));
    expect(ns[0].x).toBe(-ns[4].x);expect(ns[1].x).toBe(-ns[3].x);
    expect(ns[2].x).toBe(0);
    expect(ns.every(q=>Math.abs(q.y)<=4&&Number.isSafeInteger(q.y))).toBe(true);
    const expected=independent(p);counts[expected]++;
    expect(puncturedParity(p),level+":"+v).toBe(expected);
    if(!p.included[2])originHoles++;
    if(!p.included[1]||!p.included[3])sideHoles++;
    if(p.included[1]!==p.included[3]||p.included[0]!==p.included[4])domainAsym++;
    keys.add(task.contentKey);
    for(const locale of ["pl","en"] as const){
      const view=localizeUniversity(task,locale),spec=view.answer;
      if(spec.kind!=="choice")throw Error("Expected choice");
      expect(spec.options).toHaveLength(3);
      expect(new Set(spec.options.map(o=>o.label)).size).toBe(3);
      expect(spec.value).toBe(expected);
      expect(spec.options.find(o=>o.value===expected)?.label).toBe(
        expected==="even"?(locale==="pl"?"parzysta":"even"):
        expected==="odd"?(locale==="pl"?"nieparzysta":"odd"):
        (locale==="pl"?"ani parzysta, ani nieparzysta":"neither even nor odd"));
      expect(assessAnswer(spec,{kind:"choice",value:expected}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"choice",value:expected==="even"?"odd":"even"}).kind).toBe("incorrect");
      expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
      expect(assessAnswer(spec,{kind:"choice",value:"invalid"}).kind).toBe("invalid");
      expect(view.solution!.length).toBeGreaterThanOrEqual(4);
      if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
    }
   }
  }
  expect(keys.size).toBe(72);
  expect(counts.even).toBe(18);expect(counts.odd).toBe(18);
  expect(counts.neither).toBe(36);
  expect(originHoles).toBeGreaterThan(5);
  expect(sideHoles).toBeGreaterThan(30);
  expect(domainAsym).toBe(18);
 },60000);
});
