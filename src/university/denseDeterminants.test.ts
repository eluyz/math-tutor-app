import { describe, expect, it } from "vitest";
import { formatRational, assessAnswer } from "../answers";
import { getAnswerSpec } from "../exercises";
import { taskPool } from "../generators";
import { addRational as add, multiplyRational as mul, rational as r,
  equalRational as equal, type Rational } from "../rational";
import { localizeUniversity, isUniversityTask } from "./catalog";

/** Independent full Leibniz permutation expansion, not the production Laplace implementation. */
function leibniz(a: readonly (readonly Rational[])[]): Rational {
  let result=r(0);
  const n=a.length;
  const visit=(prefix:number[],unused:number[])=>{
    if(!unused.length){
      let inversions=0;
      for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(prefix[i]>prefix[j])inversions++;
      let term=r(inversions%2?-1:1);
      for(let i=0;i<n;i++)term=mul(term,a[i][prefix[i]]);
      result=add(result,term);return;
    }
    for(const j of unused)visit([...prefix,j],unused.filter(k=>k!==j));
  };
  visit([],Array.from({length:n},(_,i)=>i));
  return result;
}
describe("MT-EDU-008 dense determinants, independent oracle",()=>{
  const cases=[
    ["determinant-dense-four","hard",4],
    ["determinant-dense-four","advanced",4],
    ["determinant-dense-four","expert",4],
    ["determinant-dense-five","advanced",5],
    ["determinant-dense-five","expert",5],
  ] as const;
  for(const [family,level,n] of cases)it(`${family}/${level} 24 full ${n}x${n} determinants`,()=>{
    const tasks=taskPool("determinants",level).filter(t=>t.templateId===family);
    expect(tasks).toHaveLength(24);
    expect(new Set(tasks.map(t=>t.contentKey)).size).toBe(24);
    for(const task of tasks){
      if(!isUniversityTask(task)||task.university.kind!=="determinant")throw Error("det expected");
      const p=task.university, spec=getAnswerSpec(task);
      expect(p.matrix).toHaveLength(n);
      expect(p.dense).toBe(true);
      expect(p.matrix.every(row=>row.length===n && row.every(cell=>cell.numerator!==0n))).toBe(true);
      expect(spec.kind).toBe("scalar");
      if(spec.kind!=="scalar")continue;
      const oracle=leibniz(p.matrix);
      expect(equal(spec.value,oracle)).toBe(true);
      expect(assessAnswer(spec,formatRational(oracle)).kind).toBe("correct");
      expect(assessAnswer(spec,"1/0").kind).toBe("invalid");
      for(const locale of ["pl","en"] as const){
        const translated=localizeUniversity(task,locale);
        const answer=getAnswerSpec(translated);
        expect(answer.kind).toBe("scalar");
        if(answer.kind==="scalar") expect(equal(answer.value,oracle)).toBe(true);
        expect(translated.solution?.length).toBeGreaterThan(3);
        expect(translated.question.length).toBeGreaterThan(20);
      }
    }
  });
  it("literal manual control fixture of a full nonzero 4×4",()=>{
    const matrix=[[r(1),r(1),r(1),r(1)],[r(1),r(2),r(1),r(1)],
      [r(1),r(1),r(3),r(1)],[r(1),r(1),r(1),r(4)]];
    // Subtract first row from remaining rows: diagonal 1,1,2,3 -> det=6.
    expect(formatRational(leibniz(matrix))).toBe("6");
  });
});
