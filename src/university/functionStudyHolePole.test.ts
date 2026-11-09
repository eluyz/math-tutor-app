import {describe, it, expect} from "vitest";
import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational} from "../rational";
import {assessAnswer, emptyAnswer, formatRational as fmt} from "../answers";
import {polishLearningText} from "../../e2e/helpers/localization";
import {
  holePoleStudyStage, makeHolePoleStudy, holePoleStudyValue,
  holePoleStudyHoleLimit, holePoleStudyZero, presentHolePoleStudy,
} from "./functionStudyHolePole";

const eq=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const n=(a:Rational)=>Number(a.numerator)/Number(a.denominator);
const sign=(a:number)=>a>0?1:a<0?-1:0;

// Independent direct rational oracle for the UNSIMPLIFIED two-factor expression.
const oracle=(h:number,p:number,m:number,k:number,x:number)=>
  ((x-h)*(k*(x-p)+m))/((x-h)*(x-p));

describe("D08 isolated full study: distinct removable hole and genuine pole",()=>{
  it("stages one family without registering it in the student catalog",()=>{
    expect(holePoleStudyStage.id).toBe("analysis-study-hole-pole");
    expect(holePoleStudyStage.category).toBe("derivatives");
    expect(holePoleStudyStage.variantCountPerLevel).toBe(24);
    expect(holePoleStudyStage.supportedDifficulties).toEqual(["hard","advanced","expert"]);
    for(const variant of [-1,24,1.2,NaN,Infinity])
      expect(()=>makeHolePoleStudy(variant,"hard")).toThrow();
    expect(()=>makeHolePoleStudy(0,"easy")).toThrow();
    const p=makeHolePoleStudy(0,"hard");
    expect(()=>holePoleStudyHoleLimit({...p,coefficient:r(0)})).toThrow();
    expect(()=>holePoleStudyValue({...p,hole:p.pole},r(11))).toThrow();
    expect(()=>holePoleStudyValue(p,p.hole)).toThrow();
    expect(()=>holePoleStudyValue(p,p.pole)).toThrow();
  });

  for(const level of ["hard","advanced","expert"] as const)
    it(level+": all 24 variants, mathematical checks, two languages, hints, steps and grading",()=>{
      const keys=new Set<string>();
      let signs=new Set<number>(), holesLeft=0,holesRight=0,zeroShift=0,zeroAsymptoteWithYIntercept=0;
      for(let variant=0;variant<24;variant++){
        const p=makeHolePoleStudy(variant,level);
        const h=n(p.hole),pole=n(p.pole),m=n(p.coefficient),k=n(p.shift);
        keys.add([h,pole,m,k].join(";"));
        expect(h).not.toBe(pole);
        expect(m).not.toBe(0);
        signs.add(sign(m));
        if(h<pole) holesLeft++;else holesRight++;
        if(k===0)zeroShift++;
        if(k===0 && pole!==0 && h!==0){
          zeroAsymptoteWithYIntercept++;
          expect(()=>holePoleStudyValue(p,r(0))).not.toThrow();
          expect(presentHolePoleStudy(p,"en").explanation).toContain("f(0)=");
        }
        const holeY=holePoleStudyHoleLimit(p);
        expect(eq(holeY,add(p.shift,div(p.coefficient,sub(p.hole,p.pole))))).toBe(true);
        expect(n(holeY)).toBeCloseTo(k+m/(h-pole),12);
        // Numerator and denominator both vanish at the excluded hole;
        // the same limit is finite from either side.
        for(const eps of [-1e-5,-1e-6,1e-6,1e-5])
          expect(oracle(h,pole,m,k,h+eps)).toBeCloseTo(n(holeY),3);
        for(const delta of [-3,-2,2,3]){
          const xRat=add(p.pole,r(delta)), x=n(xRat);
          if(eq(xRat,p.hole))continue;
          expect(n(holePoleStudyValue(p,xRat)))
            .toBeCloseTo(oracle(h,pole,m,k,x),10);
          expect(sign(-m/(x-pole)**2)).toBe(sign(-m));
          expect(sign(2*m/(x-pole)**3)).toBe(sign(m*(x-pole)));
        }
        const zero=holePoleStudyZero(p);
        if(k===0)expect(zero).toBeNull();
        else if(zero){
          expect(eq(holePoleStudyValue(p,zero),r(0))).toBe(true);
        }
        for(const locale of ["pl","en"] as const){
          const view=presentHolePoleStudy(p,locale),spec=view.answer;
          expect(view.question).toContain("f(x)=");
          expect(view.question).toContain("f′");
          expect(view.question).toContain("f″");
          expect(view.question).toContain("xₕ");
          expect(view.solution.filter(s=>s.kind==="working").length).toBeGreaterThanOrEqual(12);
          expect(view.hint.length).toBeGreaterThan(25);
          expect(view.nextHint.length).toBeGreaterThan(25);
          expect(view.explanation).toContain("f″(x)");
          expect(view.explanation).toContain("lim(x→");
          if(locale==="en")for(const line of [view.question,view.hint,view.nextHint,
            ...view.solution.filter(s=>s.kind==="working").map(s=>s.action+" "+s.reason)])
              expect(line).not.toMatch(polishLearningText);
          expect(spec.kind).toBe("list");
          if(spec.kind!=="list")throw Error("Expected list answer");
          expect(spec.values).toHaveLength(4);
          const expected=[p.hole,holeY,p.pole,p.shift];
          expect(spec.values.every((v,i)=>eq(v,expected[i]))).toBe(true);
          expect(assessAnswer(spec,{kind:"list",values:expected.map(fmt)}).kind).toBe("correct");
          expect(assessAnswer(spec,{kind:"list",values:expected.map((v,i)=>fmt(i===0?add(v,r(1)):v))}).kind).toBe("incorrect");
          expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
          expect(assessAnswer(spec,{kind:"list",values:["1/0",...expected.slice(1).map(fmt)]}).kind).toBe("invalid");
        }
      }
      expect(keys.size).toBe(24);
      expect(signs.size).toBe(2);
      expect(holesLeft).toBeGreaterThan(0);
      expect(holesRight).toBeGreaterThan(0);
      expect(zeroShift).toBeGreaterThan(0);
      expect(zeroAsymptoteWithYIntercept).toBeGreaterThan(0);
    },30000);

  it("rejects a cancelled algebraic zero at a hole, rather than counting an intercept",()=>{
    const p=makeHolePoleStudy(5,"advanced");
    const forcedZeroAtHole={...p,shift:mul(r(-1),div(p.coefficient,sub(p.hole,p.pole)))};
    expect(eq(holePoleStudyHoleLimit(forcedZeroAtHole),r(0))).toBe(true);
    expect(holePoleStudyZero(forcedZeroAtHole)).toBeNull();
    expect(()=>holePoleStudyValue(forcedZeroAtHole,forcedZeroAtHole.hole)).toThrow();
    expect(presentHolePoleStudy(forcedZeroAtHole,"en").explanation).toContain("excluded from D");
  });

  it("never invents an intercept when zero is a pole or a removable hole",()=>{
    const p=makeHolePoleStudy(0,"hard");
    const atPole={...p,pole:r(0),hole:r(2)};
    const atHole={...p,pole:r(2),hole:r(0)};
    for(const v of [atPole,atHole]){
      expect(()=>holePoleStudyValue(v,r(0))).toThrow();
      expect(presentHolePoleStudy(v,"en").explanation).toContain("no y-axis intercept");
    }
  });
});