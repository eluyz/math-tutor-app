import {describe,it,expect} from "vitest";
import {rational as r,addRational as add,multiplyRational as mul,type Rational} from "../rational";
import {assessAnswer,emptyAnswer,formatRational as fmt} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import {
  makeTwoPoleStudy,twoPoleStudyPoles,twoPoleStudyValue,twoPoleStudyPoint,
  presentTwoPoleStudy,twoPoleStudyStage,type TwoPoleStudyProblem,
} from "./functionStudyTwoPoles";

const num=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
const eq=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const sign=(v:number)=>v>0?1:v<0?-1:0;
function independentValue(p:TwoPoleStudyProblem,x:number){
  const t=x-num(p.a),q=num(p.q);
  return p.mode==="even"
    ?num(p.k)*(t*t-num(p.s)**2)/(t*t-q*q)
    :num(p.c)*t/(q*q-t*t);
}
function independentDerivatives(p:TwoPoleStudyProblem,t:number){
  const q=num(p.q),q2=q*q,t2=t*t;
  if(p.mode==="even"){
    const c=num(p.k)*(q2-num(p.s)**2),den=t2-q2;
    return [-2*c*t/den**2,2*c*(3*t2+q2)/den**3] as const;
  }
  const c=num(p.c),den=q2-t2;
  return [c*(q2+t2)/den**2,2*c*t*(3*q2+t2)/den**3] as const;
}

describe("D08 two-pole synthetic full-study source shapes: stage only",()=>{
  it("is isolated, bounded and rejects invalid shape parameters",()=>{
    expect(twoPoleStudyStage.id).toBe("analysis-study-two-poles");
    expect(twoPoleStudyStage.category).toBe("derivatives");
    expect(twoPoleStudyStage.variantCountPerLevel).toBe(24);
    expect(twoPoleStudyStage.supportedDifficulties).toEqual(["hard","advanced","expert"]);
    for(const variant of [-1,24,0.5,NaN,Infinity])
      expect(()=>makeTwoPoleStudy(variant,"hard")).toThrow();
    expect(()=>makeTwoPoleStudy(0,"easy")).toThrow();
    const even=makeTwoPoleStudy(0,"hard"),odd=makeTwoPoleStudy(1,"hard");
    expect(even.mode).toBe("even");expect(odd.mode).toBe("odd");
    for(const p of [even,odd])for(const x of twoPoleStudyPoles(p))
      expect(()=>twoPoleStudyValue(p,x)).toThrow();
    if(even.mode==="even"){
      expect(()=>twoPoleStudyPoint({...even,s:r(0)})).toThrow();
      expect(()=>twoPoleStudyPoint({...even,s:even.q})).toThrow();
      expect(()=>twoPoleStudyPoint({...even,k:r(0)})).toThrow();
    }
    if(odd.mode==="odd")expect(()=>twoPoleStudyPoint({...odd,c:r(0)})).toThrow();
  });
  for(const level of ["hard","advanced","expert"] as const)
    it(level+": 24 distinct cases, math oracle, PL/EN hints/steps and grading",()=>{
      const unique=new Set<string>();let even=0,odd=0,positive=0,negative=0;
      for(let variant=0;variant<24;variant++){
        const p=makeTwoPoleStudy(variant,level),a=num(p.a),q=num(p.q);
        unique.add(JSON.stringify(p,(_,v)=>typeof v==="bigint"?v.toString():v));
        expect(q).toBeGreaterThan(0);
        if(p.mode==="even"){
          even++;expect(num(p.s)).toBeGreaterThan(0);expect(num(p.s)).toBeLessThan(q);
        }else odd++;
        const c=p.mode==="even"?num(p.k)*(q*q-num(p.s)**2):num(p.c);
        if(c>0)positive++;else negative++;
        const poles=twoPoleStudyPoles(p);
        expect(num(poles[0])).toBeCloseTo(a-q,12);
        expect(num(poles[1])).toBeCloseTo(a+q,12);
        expect(()=>twoPoleStudyValue(p,poles[0])).toThrow();
        expect(()=>twoPoleStudyValue(p,poles[1])).toThrow();
        const point=twoPoleStudyPoint(p);
        expect(eq(point[0],p.a)).toBe(true);
        expect(num(point[1])).toBeCloseTo(p.mode==="even"?num(p.k)*num(p.s)**2/q**2:0,12);
        for(const shift of [-1.5,-0.5,0,0.5,1.5]){
          const t=q*shift,x=a+t;
          const offset=r(Math.round(shift*2),2);
          const input=add(p.a,mul(p.q,offset));
          const exact=twoPoleStudyValue(p,input);
          // Direct expression, not the production derivative or critical-point helper.
          expect(Number.isFinite(num(exact))).toBe(true);
          expect(num(exact)).toBeCloseTo(independentValue(p,x),10);
          expect(independentValue(p,x)).toBeCloseTo(
            p.mode==="even"?num(p.k)*(t*t-num(p.s)**2)/(t*t-q*q)
              :num(p.c)*t/(q*q-t*t),12);
          const [fp,fpp]=independentDerivatives(p,t),h=Math.min(1e-4,q/5000);
          const numericFirst=(independentValue(p,x+h)-independentValue(p,x-h))/(2*h);
          const numericSecond=(independentValue(p,x+h)-2*independentValue(p,x)+independentValue(p,x-h))/(h*h);
          expect(numericFirst).toBeCloseTo(fp,3);
          expect(numericSecond).toBeCloseTo(fpp,1);
        }
        if(p.mode==="even"){
          expect(sign(independentDerivatives(p,-q/2)[0])).toBe(sign(c));
          expect(sign(independentDerivatives(p,q/2)[0])).toBe(-sign(c));
          expect(sign(independentDerivatives(p,0)[1])).toBe(-sign(c));
          expect(sign(independentDerivatives(p,2*q)[1])).toBe(sign(c));
        }else{
          for(const t of [-2*q,-q/2,0,q/2,2*q])
            expect(sign(independentDerivatives(p,t)[0])).toBe(sign(c));
          expect(sign(independentDerivatives(p,-q/2)[1])).toBe(-sign(c));
          expect(sign(independentDerivatives(p,q/2)[1])).toBe(sign(c));
        }
        for(const locale of ["pl","en"] as const){
          const view=presentTwoPoleStudy(p,locale),spec=view.answer;
          expect(view.question).toContain("f(x)=");
          expect(view.question).toContain("f′");
          expect(view.question).toContain("f″");
          expect(view.hint.length).toBeGreaterThan(25);
          expect(view.nextHint.length).toBeGreaterThan(25);
          expect(view.solution.filter(s=>s.kind==="working").length).toBeGreaterThanOrEqual(12);
          expect(view.explanation).toContain("f″(x)");
          const sketchStep=view.solution.find(s=>s.action.includes(locale==="pl"?"Szkic na kartce":"Sketch on paper"));
          expect(sketchStep).toBeDefined();
          expect(sketchStep!.reason).toContain(p.mode==="even"
            ? (locale==="pl"?"ekstremum lokalne":"local extremum")
            : (locale==="pl"?"punkt przegięcia":"inflection point"));
          if(p.mode==="odd")
            expect(sketchStep!.reason).not.toMatch(/punkt krytyczny|critical point/);
          expect(spec.kind).toBe("list");
          if(spec.kind!=="list")throw Error("Expected list");
          expect(spec.labels).toEqual(["x₁","x₂","y₀","x₃","y₃"]);
          const expected=[...poles,p.mode==="even"?p.k:r(0),...point];
          expect(spec.values.every((v,i)=>eq(v,expected[i]))).toBe(true);
          expect(assessAnswer(spec,{kind:"list",values:expected.map(fmt)}).kind).toBe("correct");
          expect(assessAnswer(spec,{kind:"list",values:expected.map((v,i)=>fmt(i===1?add(v,r(1)):v))}).kind).toBe("incorrect");
          expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
          expect(assessAnswer(spec,{kind:"list",values:["1/0",...expected.slice(1).map(fmt)]}).kind).toBe("invalid");
          for(const step of view.solution){
            expect(step.action.length).toBeGreaterThan(8);
            expect(step.reason.length).toBeGreaterThan(20);
          }
          if(locale==="en")for(const s of [view.question,view.hint,view.nextHint,...view.solution.map(s=>s.reason)])
            expect(s).not.toMatch(polishLearningText);
        }
      }
      expect(unique.size).toBe(24);
      expect(even).toBe(12);expect(odd).toBe(12);
      expect(positive).toBeGreaterThan(0);expect(negative).toBeGreaterThan(0);
    },30000);
});