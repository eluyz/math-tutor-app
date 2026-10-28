import {describe,expect,it} from "vitest";
import {addRational as add,equalRational as eq,rational as r,type Rational} from "../rational";
import {formatRational as fmt,assessAnswer,emptyAnswer} from "../answers";
import {taskPool} from "../generators";
import {makeUniversityTask,localizeUniversity} from "./catalog";
import {horizontalAreaBounds,exactHorizontalSliceArea,makeHorizontalSliceArea,horizontalAreaFamilies} from "./horizontalSliceArea";
type Frac=readonly [bigint,bigint];
const frac=(x:Rational):Frac=>[x.numerator,x.denominator];
const times=(a:Frac,b:Frac):Frac=>[a[0]*b[0],a[1]*b[1]];
const div=(a:Frac,b:Frac):Frac=>[a[0]*b[1],a[1]*b[0]];
/** Independent integral: integrate sqrt(z) from 0 to R², then multiply by width factor 2k. */
function independentIntegral(k:Rational,R:Rational):Rational {
  const rad=frac(R), power=times(times(rad,rad),rad);
  const primitive=times(div([2n,1n],[3n,1n]),power);
  const width=times([2n,1n],frac(k));
  const area=times(width,primitive);
  return r(area[0],area[1]);
}
const val=(v:Rational)=>Number(v.numerator)/Number(v.denominator);
describe("MT-EDU-034: I07 area by integrating x_right−x_left with respect to y",()=>{
  it("validates generation limits and nonpositive geometry",()=>{
    expect(horizontalAreaFamilies).toHaveLength(1);
    for(const v of [-1,24,NaN,Infinity,1.2])
      expect(()=>makeHorizontalSliceArea(v,"hard")).toThrow();
    expect(()=>makeHorizontalSliceArea(0,"easy")).toThrow();
    expect(()=>makeHorizontalSliceArea(0,"medium")).toThrow();
    const p=makeHorizontalSliceArea(0,"hard");
    expect(()=>exactHorizontalSliceArea({...p,coefficient:r(0)})).toThrow();
    expect(()=>horizontalAreaBounds({...p,radius:r(-1)})).toThrow();
    expect(p.center).toEqual(r(0));expect(p.bottom).toEqual(r(0));
    expect(p.coefficient).toEqual(r(1));expect(p.radius).toEqual(r(1));
  });
  it("72 exact unique geometry witnesses, independent integration, PL/EN and feedback",()=>{
    const ids=new Set<string>(),rationalResults=new Set<string>();
    for(const level of ["hard","advanced","expert"] as const){
      const pool=taskPool("integrals",level).filter(x=>x.templateId==="integral-area-horizontal-slices");
      expect(pool).toHaveLength(24);
      expect(new Set(pool.map(t=>t.contentKey)).size).toBe(24);
      for(let v=0;v<24;v++){
        const task=makeUniversityTask("integral-area-horizontal-slices",v,level);
        if(task.university.kind!=="integral-area-horizontal-slices")throw Error("Wrong type");
        const p=task.university,b=horizontalAreaBounds(p),expected=independentIntegral(p.coefficient,p.radius);
        const upperIndependent=add(p.bottom,r(p.radius.numerator**2n,p.radius.denominator**2n));
        expect(eq(b.lower,p.bottom)).toBe(true);
        expect(eq(b.upper,upperIndependent)).toBe(true);
        expect(eq(exactHorizontalSliceArea(p),expected)).toBe(true);
        expect(expected.numerator).toBeGreaterThan(0n);
        ids.add(JSON.stringify([String(p.center.numerator),String(p.center.denominator),
          String(p.bottom.numerator),String(p.bottom.denominator),
          String(p.coefficient.numerator),String(p.coefficient.denominator),
          String(p.radius.numerator),String(p.radius.denominator)]));
        rationalResults.add(fmt(expected));
        // Independent midpoint integration checks the physical width of each horizontal slice.
        const lower=val(b.lower),upper=val(b.upper),h=val(p.bottom),k=val(p.coefficient);
        const n=3000,dy=(upper-lower)/n;let area=0;
        for(let i=0;i<n;i++) {
          const y=lower+(i+.5)*dy;
          area+=2*k*Math.sqrt(y-h)*dy;
        }
        expect(Math.abs(area-val(expected))).toBeLessThan(Math.max(.002,.0002*val(expected)));
        for(const locale of ["pl","en"] as const){
          const view=localizeUniversity(task,locale);
          expect(view.question).toContain("√");
          expect(view.question).toContain("x_left(y)=");
          expect(view.question).toContain("x_right(y)=");
          expect(view.solution?.length).toBeGreaterThan(5);
          expect(view.solution?.some(s=>s.action.includes("dy"))).toBe(true);
          expect(view.solution?.some(s=>s.action.includes("u^(3/2)"))).toBe(true);
          expect(view.solution?.some(s=>s.action.includes("A="))).toBe(true);
          if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
          if(view.answer.kind!=="scalar")throw Error("Expected scalar");
          expect(eq(view.answer.value,expected)).toBe(true);
          expect(assessAnswer(view.answer,fmt(expected)).kind).toBe("correct");
          expect(assessAnswer(view.answer,fmt(add(expected,r(1)))).kind).toBe("incorrect");
          expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe("invalid");
          expect(assessAnswer(view.answer,"1/0").kind).toBe("invalid");
        }
      }
    }
    expect(ids.size).toBe(72);
    expect(rationalResults.size).toBeGreaterThan(12);
  },60000);
});