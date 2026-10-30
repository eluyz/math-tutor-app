import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import { localizeUniversity, makeUniversityTask } from "../university/catalog";
import type { GraphIntegratedProblem } from "../university/graphIntegratedProperties";
import type { IntegratedJumpProblem } from "../university/graphIntegratedJump";

/**
 * QA-003 separate geometry witness: interpret the displayed graph as a set of
 * individual points on open/closed straight segments. For each of 144 task
 * instances, test membership, slopes and horizontal-level duplication against
 * the SELECTED answer labels. This code deliberately never uses the production
 * integratedOracle/jumpOracle, y-image mergers, or formulaic interval keys.
 * Numeric witnesses are sampled at integral/half/quarter levels; source math
 * remains piecewise linear with integer vertices. Not a manual PL/EN sign-off.
 */
type Graph = GraphIntegratedProblem | IntegratedJumpProblem;
type P = Readonly<{ x: number; y: number }>;
type Piece = Readonly<{ a: P; b: P; aIn: boolean; bIn: boolean }>;
type Field = "domain" | "range" | "increasing" | "decreasing" | "injective" | "parity";
const fields: readonly Field[] = ["domain","range","increasing","decreasing","injective","parity"];
const levels = ["hard","advanced","expert"] as const;
const ids = ["function-integrated-properties","function-integrated-jump"] as const;
const eps = 1e-9;
const eq = (a: number, b: number) => Math.abs(a-b) < eps;

function getPieces(p: Graph): readonly [Piece, Piece] {
  if (p.kind === "function-integrated-properties") {
    const [a,b,c] = p.nodes;
    const [i,j,k] = p.included;
    return [{a,b,aIn:i,bIn:j},{a:b,b:c,aIn:j,bIn:k}];
  }
  return [
    {a:p.left[0],b:p.left[1],aIn:true,bIn:false},
    {a:p.right[0],b:p.right[1],aIn:true,bIn:true},
  ];
}
function containsX(s: Piece, x: number): boolean {
  if (x < s.a.x-eps || x > s.b.x+eps) return false;
  if (eq(x,s.a.x) && !s.aIn) return false;
  if (eq(x,s.b.x) && !s.bIn) return false;
  return true;
}
function atX(ss: readonly Piece[], x: number): number | undefined {
  const values = ss.filter(s => containsX(s,x)).map(s =>
    s.a.y + (s.b.y-s.a.y)*(x-s.a.x)/(s.b.x-s.a.x));
  if (values.length > 1) expect(values.every(y => eq(y,values[0]))).toBe(true);
  return values[0];
}
function rootsAtY(ss: readonly Piece[], y: number): number[] {
  const roots: number[] = [];
  for (const s of ss) {
    const fraction = (y-s.a.y)/(s.b.y-s.a.y);
    if (fraction < -eps || fraction > 1+eps) continue;
    const x = s.a.x+(s.b.x-s.a.x)*fraction;
    if (containsX(s,x) && !roots.some(v => eq(v,x))) roots.push(x);
  }
  return roots;
}
type RangePiece = Readonly<{ lo:number; hi:number; loIn:boolean; hiIn:boolean }>;
function readSet(text:string): readonly RangePiece[] {
  if(text === "∅") return [];
  return text.split(" ∪ ").map(part => {
    if(!["(","["].includes(part[0]) || ![")","]"].includes(part.at(-1)!))
      throw Error("Unexpected interval notation: "+part);
    const coords = part.slice(1,-1).replace(/−/g,"-").split("; ");
    if(coords.length !== 2) throw Error("Unexpected interval endpoints: "+part);
    const [lo,hi] = coords.map(Number);
    if(!Number.isFinite(lo)||!Number.isFinite(hi)||lo >= hi)
      throw Error("Bad interval values: "+part);
    return {lo,hi,loIn:part[0]==="[",hiIn:part.endsWith("]")};
  });
}
function inSet(parts:readonly RangePiece[], x:number):boolean {
  return parts.some(p =>
    (x > p.lo+eps || eq(x,p.lo)&&p.loIn) &&
    (x < p.hi-eps || eq(x,p.hi)&&p.hiIn));
}
function expectedTrend(ss:readonly Piece[],x:number,rise:boolean):boolean {
  // Vertices can be endpoints of *both* strict trend intervals.
  return ss.some(s => containsX(s,x) && (s.b.y>s.a.y)===rise);
}
function fromGeometry(ss:readonly Piece[]):Readonly<{injective:"yes"|"no";parity:"even"|"odd"|"neither"}> {
  const end = ss[1].b.x;
  let symmetrical=true, even=true, odd=true;
  for(let i=-2*end;i<=2*end;i++){
    const x=i/2, left=atX(ss,x),right=atX(ss,-x);
    if((left===undefined)!==(right===undefined)) symmetrical=false;
    if(left!==undefined&&right!==undefined){
      if(!eq(left,right)) even=false;
      if(!eq(left,-right)) odd=false;
    }
  }
  if(!symmetrical){even=false;odd=false;}
  const ys=ss.flatMap(s=>[s.a.y,s.b.y]);
  const lo=Math.min(...ys),hi=Math.max(...ys);
  let unique=true;
  for(let i=4*lo;i<=4*hi;i++){
    if(rootsAtY(ss,i/4).length>1){unique=false;break;}
  }
  return {injective:unique?"yes":"no",parity:even?"even":odd?"odd":"neither"};
}
function checkGeometricField(p:Graph,id:Field,label:string,scope:string){
  const ss=getPieces(p);
  if(id==="injective"||id==="parity"){
    const answer=fromGeometry(ss)[id];
    const value=id==="injective"?(answer==="yes"?["Tak","Yes"]:["Nie","No"]):
      answer==="even"?["Parzysta","Even"]:answer==="odd"?["Nieparzysta","Odd"]:
      ["Ani parzysta, ani nieparzysta","Neither"];
    expect(value,scope).toContain(label);
    return;
  }
  const set=readSet(label);
  const xl=ss[0].a.x, xr=ss[1].b.x;
  if(id==="range"){
    const ys=ss.flatMap(s=>[s.a.y,s.b.y]);
    const lo=Math.min(...ys)-1,hi=Math.max(...ys)+1;
    for(let y=4*lo;y<=4*hi;y++){
      const sampled=y/4;
      expect(inSet(set,sampled),scope+"/y="+sampled)
        .toBe(rootsAtY(ss,sampled).length>0);
    }
  }else{
    for(let x=2*(xl-1);x<=2*(xr+1);x++){
      const sampled=x/2;
      const expected=id==="domain"?atX(ss,sampled)!==undefined:
        expectedTrend(ss,sampled,id==="increasing");
      expect(inSet(set,sampled),scope+"/x="+sampled).toBe(expected);
    }
  }
}
describe("QA-003 — additional graph-as-points witness, both six-field families",()=>{
  it("checks 144 exact task IDs, 288 localized answer sets, per-field diagnostics, sampled semantic witnesses",()=>{
    const seen=new Set<string>();
    const tally:Record<string,number>={};
    for(const id of ids) for(const level of levels) for(let v=0;v<24;v++){
      const task=makeUniversityTask(id,v,level);
      const p=task.university;
      if(p.kind!=="function-integrated-properties"&&p.kind!=="function-integrated-jump")
        throw Error("Unexpected task family");
      const key=id+"/"+level+"/"+v;
      expect(task.id).toBe(id+":"+level+":"+v);
      expect(seen.has(key)).toBe(false);seen.add(key);
      tally[id]=(tally[id]||0)+1;
      for(const locale of ["pl","en"] as const){
        const view=localizeUniversity(task,locale), spec=view.answer;
        if(spec.kind!=="multi-choice")throw Error("Incorrect answer spec: "+key);
        expect(spec.fields.map(f=>f.id)).toEqual(fields);
        expect(view.question.trim().length).toBeGreaterThan(50);
        expect(view.hint.trim().length).toBeGreaterThan(20);
        expect(view.nextHint.trim().length).toBeGreaterThan(20);
        if(!view.solution)throw Error("Missing worked solution: "+key+"/"+locale);
        expect(view.solution).toHaveLength(id==="function-integrated-jump"?8:7);
        expect(view.solution.every(step=>step.action.trim()&&step.reason.trim())).toBe(true);
        if(locale==="en")expect(view.explanation).not.toMatch(/[ąćęłńóśźż]/i);
        const correct=Object.fromEntries(spec.fields.map(f=>[f.id,f.value]));
        expect(assessAnswer(spec,{kind:"multi-choice",values:correct}).kind).toBe("correct");
        expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
        const working=view.solution.filter(s=>s.kind==="working");
        for(const f of spec.fields){
          const scope=key+"/"+locale+"/"+f.id;
          const chosen=f.options.find(o=>o.value===f.value);
          expect(chosen,scope).toBeDefined();
          checkGeometricField(p,f.id as Field,chosen!.label,scope);
          // Every numerical interval in the answer must also appear in the
          // worked explanation and in a dedicated lesson step, in both locales.
          if(["domain","range","increasing","decreasing"].includes(f.id)){
            expect(view.explanation,scope).toContain(chosen!.label);
            expect(working.some(s=>s.action.includes(chosen!.label)),scope).toBe(true);
          }
          const absent={...correct,[f.id]:""};
          const bogus={...correct,[f.id]:"not-an-option"};
          expect(assessAnswer(spec,{kind:"multi-choice",values:absent}).kind,scope).toBe("invalid");
          expect(assessAnswer(spec,{kind:"multi-choice",values:bogus}).kind,scope).toBe("invalid");
          for(const alternative of f.options.filter(o=>o.value!==f.value)){
            const incorrect={...correct,[f.id]:alternative.value};
            expect(assessAnswer(spec,{kind:"multi-choice",values:incorrect}).kind,scope+"/"+alternative.value).toBe("incorrect");
          }
        }
        if(v===0||v===1){
          // Twelve representative cases: reason wording must not collapse
          // into placeholders or assert continuity of the jump graph.
          expect(working.every(s=>s.reason.trim().length>35),key+"/"+locale).toBe(true);
          expect(view.hint).not.toEqual(view.nextHint);
          if(id==="function-integrated-jump"){
            expect(view.explanation).toContain(locale==="pl"?"pusty":"hollow");
            expect(view.explanation).toContain(locale==="pl"?"pełny":"filled");
          }
        }
      }
    }
    expect(seen.size).toBe(144);
    expect(tally).toEqual({"function-integrated-properties":72,"function-integrated-jump":72});
  },120000);
});
