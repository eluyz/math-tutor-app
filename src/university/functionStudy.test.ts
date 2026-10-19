import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, formatRational as f } from "../answers";
import { rational as r, type Rational } from "../rational";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { functionStudyFamilies } from "./functionStudy";
import { a,s,m,d,eq,auditCalculation } from "./audit";
import { polishLearningText } from "../../e2e/helpers/localization";

const canon = (value:Rational)=>r(value.numerator,value.denominator);
const evalPoly=(coefficient:Rational,t:Rational)=>s(m(coefficient,m(m(t,t),t)),m(r(3),m(coefficient,t)));
const evalRational=(coefficient:Rational,t:Rational)=>m(coefficient,a(t,d(r(1),t)));
const derivative=(kind:string,coefficient:Rational,t:Rational)=>kind==="analysis-study-polynomial"?m(r(3),m(coefficient,s(m(t,t),r(1)))):m(coefficient,s(r(1),d(r(1),m(t,t))));
const second=(kind:string,coefficient:Rational,t:Rational)=>kind==="analysis-study-polynomial"?m(r(6),m(coefficient,t)):d(m(r(2),coefficient),m(m(t,t),t));

describe("MT-EDU-007 P3 controlled function studies",()=>{
  it("audits 96 distinct lessons, exact stationary/global values and derivative signs",()=>{
    let count=0;
    for(const family of functionStudyFamilies) for(const level of family.supportedDifficulties){
      const unique=new Set<string>();
      for(let variant=0;variant<24;variant++){
        const task=makeUniversityTask(family.id,variant,level),p=task.university;
        if(p.kind!=="analysis-study-polynomial"&&p.kind!=="analysis-study-rational") throw Error("wrong problem");
        unique.add(task.contentKey);count++;
        const fn=p.kind==="analysis-study-polynomial"?evalPoly:evalRational;
        expect(eq(fn(p.coefficient,r(-1)),p.kind==="analysis-study-polynomial"?m(r(2),p.coefficient):m(r(-2),p.coefficient))).toBe(true);
        expect(eq(fn(p.coefficient,r(1)),p.kind==="analysis-study-polynomial"?m(r(-2),p.coefficient):m(r(2),p.coefficient))).toBe(true);
        expect(eq(derivative(p.kind,p.coefficient,r(-1)),r(0))).toBe(true);
        expect(eq(derivative(p.kind,p.coefficient,r(1)),r(0))).toBe(true);
        expect(canon(derivative(p.kind,p.coefficient,r(2))).numerator*canon(derivative(p.kind,p.coefficient,r(1,2))).numerator).toBeLessThan(0n);
        if(p.kind==="analysis-study-polynomial"){
          expect(eq(evalPoly(p.coefficient,r(0)),r(0))).toBe(true);
          expect(eq(second(p.kind,p.coefficient,r(0)),r(0))).toBe(true);
          expect(canon(second(p.kind,p.coefficient,r(-1))).numerator*canon(second(p.kind,p.coefficient,r(1))).numerator).toBeLessThan(0n);
        }else{
          expect(canon(second(p.kind,p.coefficient,r(-1))).numerator*canon(second(p.kind,p.coefficient,r(1))).numerator).toBeLessThan(0n);
          // The sign change occurs only across excluded t=0.
          expect(eq(evalRational(p.coefficient,r(2)),m(r(5,2),p.coefficient))).toBe(true);
          expect(eq(evalRational(p.coefficient,r(1,2)),m(r(5,2),p.coefficient))).toBe(true);
        }
        for(const locale of ["pl","en"] as const){
          const lesson=localizeUniversity(task,locale), spec=lesson.answer;
          expect(lesson.id).toBe(task.id);expect(lesson.contentKey).toBe(task.contentKey);
          expect(lesson.solution!.length).toBeGreaterThanOrEqual(8);
          if(locale==="en") for(const text of [lesson.title,lesson.question,lesson.hint,lesson.nextHint,lesson.explanation,...lesson.solution!.map(step=>step.action+step.reason)]) expect(text).not.toMatch(polishLearningText);
          for(const step of lesson.solution!) if(step.kind==="working") for(const calc of step.calculations) expect(auditCalculation(calc)).toBe(true);
          expect(spec.kind).toBe("list");
          if(spec.kind!=="list") continue;
          const left=s(p.at,r(1)),right=a(p.at,r(1));
          if(p.target==="stationary"){
            const values=p.kind==="analysis-study-polynomial"?[left,m(r(2),p.coefficient),right,m(r(-2),p.coefficient)]:[left,m(r(-2),p.coefficient),right,m(r(2),p.coefficient)];
            expect(spec.values.every((v,i)=>eq(v,values[i]))).toBe(true);
          }else{
            const isPositive=p.coefficient.numerator>0n;
            const values=p.kind==="analysis-study-polynomial"?[m(r(2),isPositive?p.coefficient:s(r(0),p.coefficient)),m(r(-2),isPositive?p.coefficient:s(r(0),p.coefficient))]:[m(isPositive?r(5,2):r(2),p.coefficient),m(isPositive?r(2):r(5,2),p.coefficient)];
            expect(spec.values.every((v,i)=>eq(v,values[i]))).toBe(true);
            if(p.kind==="analysis-study-polynomial"){
              expect(eq(evalPoly(p.coefficient,r(-3,2)),m(r(9,8),p.coefficient))).toBe(true);
              expect(eq(evalPoly(p.coefficient,r(3,2)),m(r(-9,8),p.coefficient))).toBe(true);
            }
          }
          expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
          expect(assessAnswer(spec,{kind:"list",values:spec.values.map(f)}).kind).toBe("correct");
          expect(assessAnswer(spec,{kind:"list",values:spec.values.map((value,i)=>f(i?value:a(value,r(1))))}).kind).toBe("incorrect");
        }
      }
      expect(unique.size,`${family.id}/${level}`).toBe(24);
    }
    expect(count).toBe(96);
  },30_000);
});
