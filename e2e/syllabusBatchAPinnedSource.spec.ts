import { test, expect, type Page } from "@playwright/test";
import { makeUniversityTask } from "../src/university/catalog";
import { educationTemplates } from "../src/education/catalog";
import { makeEducationInstance } from "../src/education/types";
import { q, a, s, m, eq } from "../src/university/audit";
import { formatRational as f } from "../src/answers";
import { shownFraction } from "./helpers/functions";
import type { Rational } from "../src/rational";

/** Issue #151: exact rendered-task witnesses for Batch A source forms.
 * The original private P03/P09/P12 matrices are never embedded in public tests.
 * Match each displayed task to a concrete deterministic variant instead.
 */
type M=readonly (readonly Rational[])[];
const button=(p:Page,name:string)=>p.getByRole("button",{name,exact:true});
const same=(A:M,B:M):boolean=>A.length===B.length&&A.every((row,i)=>
  row.length===B[i].length&&row.every((x,j)=>eq(x,B[i][j])));
const plus=(A:M,B:M)=>A.map((row,i)=>row.map((x,j)=>a(x,B[i][j])));
const minus=(A:M,B:M)=>A.map((row,i)=>row.map((x,j)=>s(x,B[i][j])));
const scale=(A:M)=>A.map(row=>row.map(x=>m(q(3),x)));
const trans=(A:M):Rational[][]=>A[0].map((_,j)=>A.map(row=>row[j]));
async function renderedMatrices(page:Page):Promise<Rational[][][]> {
  const out:Rational[][][]=[];
  for(const table of await page.locator(".linear-algebra-matrices .given-matrix").all()){
    const matrix:Rational[][]=[];
    for(const row of await table.locator("tbody tr").all())
      matrix.push((await row.locator("td").allTextContents()).map(shownFraction));
    out.push(matrix);
  }
  return out;
}
async function fillMatrix(page:Page,expected:M,wrong=false){
  for(let i=0;i<expected.length;i++)for(let j=0;j<expected[i].length;j++){
    const selector=i===0&&j===0?"#answer":"#answer-"+i+"-"+j;
    const value=wrong&&i===0&&j===0?a(expected[i][j],q(1)):expected[i][j];
    await page.locator(selector).fill(f(value));
  }
}
async function prepare(page:Page,en:boolean,width:number,category:"matrices"|"determinants"|"systems"){
  await page.setViewportSize({width,height:900});await page.goto("/");
  if(en)await button(page,"English").click();
  await button(page,en?"University mathematics":"Matematyka na studia").click();
  const cats={matrices:en?"Matrices":"Macierze",determinants:en?"Determinants":"Wyznaczniki",systems:en?"Systems of equations":"Układy równań"};
  await button(page,cats[category]).click();
}
const checked=async(page:Page,en:boolean,kind:"invalid"|"incorrect"|"correct")=>{
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback "+kind);
};

for(const width of [375,1280])for(const en of [false,true]){
test("#151 M01/M02 exact displayed matrix variant witnesses "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(180000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await prepare(page,en,width,"matrices");
  await button(page,en?"Medium":"Średni").click();
  await page.getByRole("button",{name:en?/Worksheet-style composite matrix calculations/:/Złożone rachunki macierzowe z arkusza/}).click();
  const observed=new Set<string>();
  for(let attempt=0;attempt<24&&observed.size<2;attempt++){
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","matrix-worksheet-composites");
    const question=await page.locator(".question").innerText();
    const match=/^(?:Oblicz|Calculate) (3A−B|A\+Aᵀ)/.exec(question);
    expect(match).not.toBeNull();
    const operation=match![1];
    const matrices=await renderedMatrices(page);
    expect(matrices.length).toBe(operation==="3A−B"?2:1);
    const candidates=Array.from({length:24},(_,v)=>v).filter(v=>{
      const task=makeUniversityTask("matrix-worksheet-composites",v,"medium"),p=task.university;
      return p.kind==="linear-matrix-practice"&&p.expression===operation&&
        p.matrices.length===matrices.length&&p.matrices.every((item,i)=>same(item.values,matrices[i]));
    });
    expect(candidates).toHaveLength(1);
    const A=matrices[0],result=operation==="3A−B"?minus(scale(A),matrices[1]):plus(A,trans(A));
    if(operation==="A+Aᵀ")expect(same(result,trans(result))).toBe(true);
    if(!observed.has(operation)){
      await checked(page,en,"invalid");
      await fillMatrix(page,result,true);
      await checked(page,en,"incorrect");
    }
    await fillMatrix(page,result);
    await checked(page,en,"correct");
    if(!observed.has(operation)){
      await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
      await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
      await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
    }
    observed.add(operation);
    if(observed.size<2)await button(page,en?"Next example":"Następny przykład").click();
  }
  expect([...observed].sort()).toEqual(["3A−B","A+Aᵀ"].sort());
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
test("#151 M07 exact displayed Sarrus source variant "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await prepare(page,en,width,"determinants");
  await button(page,en?"Easy":"Łatwy").click();
  await page.getByRole("button",{name:en?/A 3×3 determinant — Sarrus/:/Wyznacznik 3×3 — Sarrus/}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id","determinant-sarrus");
  const A:Rational[][]=[];
  const table=page.getByRole("table",{name:en?"Matrix A":"Macierz A",exact:true});
  for(const row of await table.locator("tbody tr").all())
    A.push((await row.locator("td").allTextContents()).map(shownFraction));
  expect(A).toHaveLength(3);expect(A.every(row=>row.length===3)).toBe(true);
  const family=educationTemplates.find(x=>x.id==="determinant-sarrus");
  if(!family)throw Error("Legacy Sarrus generator missing");
  const variants=Array.from({length:24},(_,v)=>v).filter(v=>{
    const candidate=makeEducationInstance(family,v,"easy");
    return candidate.matrices?.length===1&&same(candidate.matrices[0].values,A);
  });
  expect(variants).toHaveLength(1);
  const t=(i:number,j:number,k:number)=>m(m(A[0][i],A[1][j]),A[2][k]);
  const down=a(a(t(0,1,2),t(1,2,0)),t(2,0,1));
  const up=a(a(t(2,1,0),t(0,2,1)),t(1,0,2));
  const answer=s(down,up);
  await checked(page,en,"invalid");
  await page.locator("#answer").fill(f(a(answer,q(1))));
  await checked(page,en,"incorrect");
  await page.locator("#answer").fill(f(answer));
  await checked(page,en,"correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  const solution=await page.locator(".solution-panel").innerText();
  expect(solution).toContain(f(answer).replaceAll("−","-").replaceAll("-","−").slice(0,2));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
test("#151 U05 four pinned rank signatures and both graded answers "+width+" "+(en?"EN":"PL"),async({page})=>{
  test.setTimeout(180000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await prepare(page,en,width,"systems");
  await button(page,en?"Easy":"Łatwy").click();
  await page.getByRole("button",{name:en?/Kronecker–Capelli: number of free parameters/:/Kronecker–Capelli: liczba parametrów/}).click();
  const seen=new Set<number>();
  for(let attempt=0;attempt<24&&seen.size<4;attempt++){
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","capelli-free-parameters");
    const question=await page.locator(".question").innerText();
    const n=Number(question.match(en?/(\d+) unknowns/:/(\d+) niewiadomych/)?.[1]);
    const equations=Number(question.match(en?/(\d+) equations/:/(\d+) równań/)?.[1]);
    const ra=Number(question.match(/rank\(A\)\s*=\s*(\d+)/)?.[1]);
    const rab=Number(question.match(/rank\(\[A\|b\]\)\s*=\s*(\d+)/)?.[1]);
    const ids=Array.from({length:24},(_,v)=>v).filter(v=>{
      const task=makeUniversityTask("capelli-free-parameters",v,"easy");
      const p=task.university;
      return p.kind==="linear-rank-given"&&p.variables===n&&p.equations===equations&&p.rankA===ra&&p.rankAugmented===rab;
    });
    expect(ids).toHaveLength(1);
    const mode=ids[0]%4;
    const kind=ra<rab?"system-none":ra===n?"system-one":"system-many";
    const params=kind==="system-none"?"not-applicable":String(n-ra);
    if(!seen.has(mode)){
      await checked(page,en,"invalid");
      await page.locator("#answer").selectOption(kind);
      await page.locator("#answer-parameters").selectOption(params==="1"?"2":"1");
      await checked(page,en,"incorrect");
    }
    await page.locator("#answer").selectOption(kind);
    await page.locator("#answer-parameters").selectOption(params);
    await checked(page,en,"correct");
    if(!seen.has(mode)){
      await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
      await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
      await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
    }
    seen.add(mode);
    if(seen.size<4)await button(page,en?"Next example":"Następny przykład").click();
  }
  expect([...seen].sort()).toEqual([0,1,2,3]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
}
