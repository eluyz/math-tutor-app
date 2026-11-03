import { describe, expect, it } from "vitest";
import { makeUniversityTask, localizeUniversity } from "../university/catalog";
import { educationTemplates } from "../education/catalog";
import { makeEducationInstance } from "../education/types";
import { localizeTask } from "../locales/catalog";
import { getAnswerSpec } from "../exercises";
import { auditCalculation, a, m, s, q, eq, laplace } from "../university/audit";
import { formatRational as f } from "../answers";
import type { Rational } from "../rational";
import type { SolutionStep } from "../solutions/types";

/** #151: independent FULL-STEP semantic witnesses for six bounded source
 * forms. Source PDFs remain private; only source IDs and *synthetic* task
 * identities occur here. These assertions complement, not replace, the
 * existing 375/1280px Playwright and source-PDF reading evidence.
 */
const work = (steps: readonly SolutionStep[] | undefined) => {
  expect(steps?.at(-1)?.kind).toBe("answer");
  const w = (steps ?? []).filter(step => step.kind === "working");
  for (const step of w) {
    if (step.kind !== "working") throw Error("Working step required");
    expect(step.action.trim().length).toBeGreaterThan(1);
    expect(step.reason.trim().length).toBeGreaterThan(12);
    expect(step.action + step.reason).not.toMatch(/undefined|NaN|Infinity/);
    for (const calc of step.calculations) expect(auditCalculation(calc)).toBe(true);
  }
  return w;
};
const solutionStrings = (steps: readonly SolutionStep[]) => steps.map(step =>
  step.action + " " + step.reason).join("\n");
type Mat = readonly (readonly Rational[])[];
const transpose = (A: Mat) => A[0].map((_,j) => A.map(row => row[j]));
const same = (A:Mat,B:Mat) => A.length===B.length && A.every((row,i) =>
  row.length===B[i].length && row.every((x,j) => eq(x,B[i][j])));

describe("#151 Batch A independent bilingual semantic gates", () => {
  for (const [code,variant,expression] of [
    ["M01",0,"3A−B"],["M02",1,"A+Aᵀ"],
  ] as const) {
    it(code+" source P03: independently accounts for every displayed matrix entry in PL/EN", () => {
      const task=makeUniversityTask("matrix-worksheet-composites",variant,"medium");
      const p=task.university;
      if(p.kind!=="linear-matrix-practice")throw Error("Wrong matrix form");
      expect(p.expression).toBe(expression);
      const A=p.matrices[0].values,B=p.matrices[1]?.values;
      const result=expression==="3A−B"
        ?A.map((row,i)=>row.map((x,j)=>s(m(q(3),x),B[i][j])))
        :A.map((row,i)=>row.map((x,j)=>a(x,A[j][i])));
      if(expression==="A+Aᵀ")expect(same(result,transpose(result))).toBe(true);
      for(const locale of ["pl","en"] as const) {
        const view=localizeUniversity(task,locale);
        expect(view.hint.length).toBeGreaterThan(20);
        expect(view.nextHint.length).toBeGreaterThan(20);
        if(view.answer.kind!=="matrix")throw Error("No matrix answer");
        expect(same(view.answer.values,result)).toBe(true);
        const steps=work(view.solution);
        const actions=steps.map(step=>step.action);
        expect(steps).toHaveLength(expression==="3A−B"?10:12);
        for(let i=0;i<result.length;i++)for(let j=0;j<result[0].length;j++) {
          const expected=expression==="3A−B"
            ?`c${i+1}${j+1} = 3·(${f(A[i][j])}) − (${f(B[i][j])}) = ${f(result[i][j])}`
            :`c${i+1}${j+1} = (${f(A[i][j])}) + (${f(A[j][i])}) = ${f(result[i][j])}`;
          expect(actions).toContain(expected);
        }
        expect(actions.at(-1)).toContain(expression);
        const narrative=solutionStrings(view.solution!);
        expect(narrative).toContain(locale==="pl"
          ?expression==="3A−B"?"Odejmuj element B":"Wynik musi być symetryczny"
          :expression==="3A−B"?"Subtract B at the same entry":"The result must be symmetric");
        expect(view.explanation).toContain(f(result[0][0]));
      }
    });
  }
  it("M07 source P09: preserves all six exact Sarrus products and bilingual teaching steps",()=>{
    const family=educationTemplates.find(x=>x.id==="determinant-sarrus");
    if(!family)throw Error("Sarrus family unavailable");
    const task=makeEducationInstance(family,1,"easy");
    const A=task.matrices?.[0]?.values;
    if(!A)throw Error("Sarrus input unavailable");
    const t=(i:number,j:number,k:number)=>m(m(A[0][i],A[1][j]),A[2][k]);
    const positive=a(a(t(0,1,2),t(1,2,0)),t(2,0,1));
    const negative=a(a(t(2,1,0),t(0,2,1)),t(1,0,2));
    const answer=s(positive,negative);
    for(const locale of ["pl","en"] as const){
      const view=localizeTask(task,locale);
      const spec=getAnswerSpec(view);
      if(spec.kind!=="scalar")throw Error("Expected numeric determinant");
      expect(eq(spec.value,answer)).toBe(true);
      const steps=work(view.solution);
      expect(steps).toHaveLength(9); // rule, six products, two totals
      expect(steps.filter(step=>step.kind==="working"&&step.calculations.some(c=>c.operation==="product"))).toHaveLength(6);
      const text=solutionStrings(view.solution!);
      expect(text).toContain(locale==="pl"?"Zastosuj Sarrusa":"Use Sarrus' rule");
      expect(text).toContain(locale==="pl"?"Odejmij sumę":"Subtract the entire upward sum");
      expect(view.hint.length).toBeGreaterThan(15);
      expect(view.nextHint.length).toBeGreaterThan(15);
    }
  });
  it("M08 source P09: explains the negative C43 cofactor and third-column topology",()=>{
    const task=makeUniversityTask("determinant-laplace-column-three",0,"hard");
    const p=task.university;
    if(p.kind!=="determinant")throw Error("Expected determinant");
    expect(p.matrix).toHaveLength(4);
    expect(p.matrix.slice(0,3).every(row=>row[2].numerator===0n)).toBe(true);
    const minor=p.matrix.slice(0,3).map(row=>row.filter((_,j)=>j!==2));
    const result=m(q(-1),m(p.matrix[3][2],laplace(minor)));
    for(const locale of ["pl","en"] as const){
      const view=localizeUniversity(task,locale),steps=work(view.solution);
      if(view.answer.kind!=="scalar")throw Error("Expected scalar answer");
      expect(eq(view.answer.value,result)).toBe(true);
      expect(steps[0].action).toMatch(locale==="pl"?/kolumna 3/:/column 3/);
      const cofactor=steps.filter(step=>step.action.startsWith("C43:"));
      expect(cofactor).toHaveLength(1);
      expect(cofactor[0].action).toContain("−("+f(p.matrix[3][2])+")");
      expect(cofactor[0].reason).toContain(locale==="pl"?"Mnożymy element":"Multiply the entry");
      expect(view.hint.length).toBeGreaterThan(15);
      expect(view.nextHint.length).toBeGreaterThan(15);
    }
  });
  it("U02 source P12: teaching distinguishes nonzero D from both singular rank classes",()=>{
    const expected=["system-one","system-many","system-none"] as const;
    for(let variant=0;variant<3;variant++){
      const task=makeUniversityTask("cramer-eligibility-solve-three",variant,"medium");
      const p=task.university;
      if(p.kind!=="linear-cramer-diagnostic")throw Error("Wrong Cramer diagnostic");
      const D=laplace(p.matrix);
      expect(D.numerator!==0n).toBe(variant===0);
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale),steps=work(view.solution);
        if(view.answer.kind!=="system")throw Error("Wrong answer type");
        expect(view.answer.classification).toBe(expected[variant]);
        expect(steps.some(step=>step.action.startsWith("D = det(A) = "+f(D)))).toBe(true);
        if(variant===0){
          for(let j=0;j<3;j++){
            const Dj=laplace(p.matrix.map((row,i)=>row.map((v,k)=>j===k?p.rhs[i]:v)));
            expect(view.answer.values[j]).toBeDefined();
            expect(eq(m(view.answer.values[j],D),Dj)).toBe(true);
            expect(steps.some(step=>step.action.includes("D"+(j+1)+" = "+f(Dj)))).toBe(true);
          }
          expect(steps.filter(step=>/^R[123]:/.test(step.action))).toHaveLength(3);
        }else{
          expect(view.answer.values).toHaveLength(0);
          expect(steps.some(step=>step.action.includes(locale==="pl"?"metoda Cramera nie jest stosowalna":"Cramer's rule is not applicable"))).toBe(true);
          const narrative=solutionStrings(view.solution!);
          if(variant===1)expect(narrative).toContain(locale==="pl"?"Rodzina rozwiązań":"Solution family");
          else expect(narrative).toContain(locale==="pl"?"Sprzeczność w układzie":"Contradiction in system");
        }
        expect(view.hint.length).toBeGreaterThan(15);
        expect(view.nextHint.length).toBeGreaterThan(15);
      }
    }
  });
  it("U05 source P12: all four rank cases have the right free-parameter reasoning in both languages",()=>{
    const cases=[["system-none","not-applicable"],["system-many","1"],["system-one","0"],["system-many","2"]] as const;
    for(let i=0;i<cases.length;i++){
      const task=makeUniversityTask("capelli-free-parameters",i,"easy");
      const p=task.university;
      if(p.kind!=="linear-rank-given")throw Error("Wrong rank-form");
      const expectedClass=p.rankA<p.rankAugmented?"system-none":p.rankA===p.variables?"system-one":"system-many";
      const expectedCount=expectedClass==="system-none"?"not-applicable":String(p.variables-p.rankA);
      expect([expectedClass,expectedCount]).toEqual(cases[i]);
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale),steps=work(view.solution);
        if(view.answer.kind!=="multi-choice")throw Error("Wrong rank answer type");
        expect(Object.fromEntries(view.answer.fields.map(field=>[field.id,field.value])))
          .toEqual({classification:expectedClass,parameters:expectedCount});
        expect(steps).toHaveLength(3);
        expect(steps[0].action).toContain("rank(A) = "+p.rankA);
        const last=steps[2].action;
        if(expectedClass==="system-none")
          expect(last).toBe(locale==="pl"?"Parametry: nie dotyczy":"Parameters: not applicable");
        else expect(last).toBe("n − rank(A) = "+p.variables+" − "+p.rankA+" = "+expectedCount);
        const reasons=steps.map(step=>step.reason).join(" ");
        expect(reasons).toContain(locale==="pl"?"Porównaj najpierw rzędy":"First compare the coefficient");
        expect(view.hint.length).toBeGreaterThan(20);
        expect(view.nextHint.length).toBeGreaterThan(20);
      }
    }
  });
});
