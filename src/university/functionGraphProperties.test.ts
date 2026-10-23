import {describe,it,expect} from "vitest";
import {assessAnswer,emptyAnswer} from "../answers";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {graphPropertyFamilies,graphSymmetry,graphTrends,graphExtremum,type GraphPropertyProblem} from "./functionGraphProperties";
import {formatRational as f} from "../answers";
import {rational as r} from "../rational";

const answer=(task:ReturnType<typeof makeUniversityTask>)=>{
  const spec=task.answer;
  if(spec.kind!=="choice")throw Error("Expected choice");
  return spec.options.find(o=>o.value===spec.value)?.label;
};
const point=(p:{x:number;y:number})=>"("+f(r(p.x))+"; "+f(r(p.y))+")";
const status=(x:number,y:number)=>x<y?"up":x>y?"down":"flat";
function reference(p:GraphPropertyProblem,locale:"pl"|"en"){
  const t=(pl:string,en:string)=>locale==="pl"?pl:en;
  if(p.kind==="function-graph-monotonicity"){
    const words=(x:string)=>x==="up"?t("rośnie","increases"):x==="down"?t("maleje","decreases"):t("jest stała","is constant");
    return words(status(p.nodes[0].y,p.nodes[1].y))+", "+t("potem","then")+" "+words(status(p.nodes[1].y,p.nodes[2].y));
  }
  if(p.kind==="function-graph-extrema"){
    const extreme=p.target==="maximum"?Math.max(...p.nodes.map(n=>n.y)):Math.min(...p.nodes.map(n=>n.y));
    const found=p.nodes.find((n,i)=>n.y===extreme&&(i===1||i===0&&p.leftClosed||i===2&&p.rightClosed));
    if(!found)throw Error("Reference extremum must be attained");
    return point(found);
  }
  const [l,m,right]=p.nodes;
  const symmetric=p.leftClosed===p.rightClosed&&l.x===-right.x&&m.x===0;
  return symmetric&&l.y===right.y?t("parzysta","even"):
    symmetric&&m.y===0&&l.y===-right.y?t("nieparzysta","odd"):
      t("ani parzysta, ani nieparzysta","neither even nor odd");
}
describe("MT-EDU-015B P2B-2 graph properties",()=>{
 it.each(graphPropertyFamilies)("$id: correct for every difficulty/variant in both languages",family=>{
  for(const level of family.supportedDifficulties){
    const unique=new Set<string>();
    for(let v=0;v<24;v++){
      const task=makeUniversityTask(family.id,v,level),p=task.university as GraphPropertyProblem;
      unique.add(task.contentKey);
      expect(p.nodes[0].x).toBeLessThan(p.nodes[1].x);
      expect(p.nodes[1].x).toBeLessThan(p.nodes[2].x);
      for(const pt of p.nodes)expect(Math.abs(pt.y)).toBeLessThanOrEqual(4);
      const spec=task.answer;
      expect(spec.kind).toBe("choice");
      if(spec.kind!=="choice")throw Error("Expected choices");
      expect(spec.options).toHaveLength(4);
      expect(new Set(spec.options.map(o=>o.value)).size).toBe(4);
      expect(new Set(spec.options.map(o=>o.label)).size).toBe(4);
      expect(assessAnswer(spec,{kind:"choice",value:spec.value}).kind).toBe("correct");
      expect(assessAnswer(spec,{kind:"choice",value:spec.options.find(o=>o.value!==spec.value)!.value}).kind).toBe("incorrect");
      expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
      expect(assessAnswer(spec,{kind:"choice",value:"bogus"}).kind).toBe("invalid");
      if(p.kind==="function-graph-monotonicity"){
        const [a,b]=graphTrends(p);
        expect(a).toBe(status(p.nodes[0].y,p.nodes[1].y));
        expect(b).toBe(status(p.nodes[1].y,p.nodes[2].y));
      } else if(p.kind==="function-graph-extrema"){
        expect(graphExtremum(p)).toEqual(p.nodes[1]);
      } else {
        const sym=graphSymmetry(p);
        const target=sym==="even"?"parzysta":sym==="odd"?"nieparzysta":"ani parzysta, ani nieparzysta";
        expect(answer(task)).toBe(target);
      }
      for(const locale of ["pl","en"] as const){
        const shown=localizeUniversity(task,locale);
        expect(shown.question.length).toBeGreaterThan(30);
        expect(shown.hint.length).toBeGreaterThan(12);
        expect(shown.nextHint.length).toBeGreaterThan(20);
        expect(shown.solution?.length).toBeGreaterThanOrEqual(3);
        const options=shown.answer;
        expect(options.kind).toBe("choice");
        if(options.kind!=="choice")throw Error("Expected localized choices");
        expect(options.options.find(o=>o.value===options.value)?.label).toBe(reference(p,locale));
      }
    }
    expect(unique.size,family.id+"/"+level).toBe(24);
  }
 });
});
