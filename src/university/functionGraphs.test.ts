import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { functionGraphFamilies, graphZeros, graphDomainRange, type FunctionGraphProblem } from "./functionGraphs";

type Endpoint = { value:number; closed:boolean };
const n = (x:number)=>String(x).replace("-","−");
const interval = (a:Endpoint,b:Endpoint) =>
  (a.closed?"[":"(")+n(a.value)+"; "+n(b.value)+(b.closed?"]":")");
const output = (task:ReturnType<typeof makeUniversityTask>) => {
  const a=task.answer;
  if(a.kind!=="choice")throw Error("Expected graph choice");
  return a.options.find(o=>o.value===a.value)?.label;
};
function independent(p:FunctionGraphProblem):string {
  const ns=p.nodes;
  if(p.target==="zeros"){
    const roots:number[]=[];
    for(let i=0;i<2;i++){
      const a=ns[i],b=ns[i+1];
      if(a.y*b.y<0)roots.push(a.x+(b.x-a.x)*(-a.y)/(b.y-a.y));
    }
    return "x = "+roots.map(n).join("; x = ");
  }
  if(p.target==="domain")
    return interval({value:ns[0].x,closed:p.leftClosed},{value:ns[2].x,closed:p.rightClosed});
  const ys=ns.map(nd=>nd.y),min=Math.min(...ys),max=Math.max(...ys);
  return interval({
    value:min,closed:ys.some((y,i)=>y===min&&(i===1||i===0&&p.leftClosed||i===2&&p.rightClosed))
  },{
    value:max,closed:ys.some((y,i)=>y===max&&(i===1||i===0&&p.leftClosed||i===2&&p.rightClosed))
  });
}
describe("MT-EDU-015B P2B-1 — independent graph math audit",()=>{
  it.each(functionGraphFamilies)("$id: 24 unique bilingual variants per level, exact solution and choice checks",family=>{
    for(const level of family.supportedDifficulties){
      const keys=new Set<string>();
      for(let variant=0;variant<24;variant++){
        const task=makeUniversityTask(family.id,variant,level);
        const p=task.university as FunctionGraphProblem;
        keys.add(task.contentKey);
        expect(p.nodes[0].x).toBeLessThan(p.nodes[1].x);
        expect(p.nodes[1].x).toBeLessThan(p.nodes[2].x);
        expect(output(task),family.id+"/"+level+"/"+variant).toBe(independent(p));
        const spec=task.answer;
        if(spec.kind!=="choice")throw Error("Expected choice");
        expect(spec.options).toHaveLength(4);
        expect(new Set(spec.options.map(o=>o.label)).size).toBe(4);
        expect(new Set(spec.options.map(o=>o.value)).size).toBe(4);
        expect(assessAnswer(spec,{kind:"choice",value:spec.value}).kind).toBe("correct");
        expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(o=>o.value!==spec.value)!.value}).kind).toBe("incorrect");
        expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
        expect(assessAnswer(spec,{kind:"choice",value:"not-an-option"}).kind).toBe("invalid");
        if(p.target==="zeros"){
          expect(graphZeros(p)).toHaveLength(2);
          for(const x of graphZeros(p)){
            const xv=Number(x.numerator)/Number(x.denominator);
            const segment=xv<p.nodes[1].x?[p.nodes[0],p.nodes[1]]:[p.nodes[1],p.nodes[2]];
            const y=segment[0].y+(segment[1].y-segment[0].y)*
              (xv-segment[0].x)/(segment[1].x-segment[0].x);
            expect(y).toBe(0);
          }
        }else{
          const exact=graphDomainRange(p,p.target);
          expect((exact.lo.closed?"[":"(")+n(exact.lo.value)+"; "+n(exact.hi.value)+(exact.hi.closed?"]":")"))
            .toBe(independent(p));
        }
        for(const locale of ["pl","en"] as const){
          const shown=localizeUniversity(task,locale);
          expect(shown.answer).toEqual(task.answer);
          expect(shown.solution?.length).toBeGreaterThanOrEqual(3);
          expect(shown.hint.length).toBeGreaterThan(12);
          expect(shown.nextHint.length).toBeGreaterThan(20);
          expect(shown.question.length).toBeGreaterThan(20);
        }
      }
      expect(keys.size,family.id+"/"+level).toBe(24);
    }
  });
});
