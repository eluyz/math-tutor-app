import {test,expect,type Page} from "@playwright/test";
import {shownFraction} from "./helpers/functions";
import {a,s,m,q} from "../src/university/audit";
import {formatRational as f} from "../src/answers";
import type {Rational} from "../src/rational";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
type M=Rational[][];
const add=(A:M,B:M)=>A.map((row,i)=>row.map((x,j)=>a(x,B[i][j])));
const sub=(A:M,B:M)=>A.map((row,i)=>row.map((x,j)=>s(x,B[i][j])));
const mul=(A:M,B:M)=>A.map(row=>B[0].map((_,j)=>row.reduce((sum,x,k)=>a(sum,m(x,B[k][j])),q(0))));
const tr=(A:M)=>A[0].map((_,j)=>A.map(row=>row[j]));
const shape=(A:M)=>({r:A.length,c:A[0].length});
const sumShape=(A:{r:number;c:number}|null,B:{r:number;c:number}|null)=>A&&B&&A.r===B.r&&A.c===B.c?A:null;
const mulShape=(A:{r:number;c:number}|null,B:{r:number;c:number}|null)=>A&&B&&A.c===B.r?{r:A.r,c:B.c}:null;
const t=(A:{r:number;c:number}|null)=>A?{r:A.c,c:A.r}:null;
async function displayed(page:Page):Promise<M[]>{
 const out:M[]=[];
 for(const table of await page.locator(".linear-algebra-matrices .given-matrix").all()){
  const matrix:M=[];
  for(const row of await table.locator("tbody tr").all())
   matrix.push((await row.locator("td").allTextContents()).map(shownFraction));
  out.push(matrix);
 }
 return out;
}
const calculate=(name:string,[A,B,C]:M[]):M=>{
 switch(name){
  case "3A−B":return sub(A.map(row=>row.map(x=>m(q(3),x))),B);
  case "A+Aᵀ":return add(A,tr(A));
  case "AB+C":return add(mul(A,B),C);
  case "(A+B)C":return mul(add(A,B),C);
  case "A(B−C)":return mul(A,sub(B,C));
  case "(AB)ᵀ−C":return sub(tr(mul(A,B)),C);
  case "(AB)ᵀ−(3/2)C":return sub(tr(mul(A,B)),C.map(row=>row.map(x=>m(q(3,2),x))));
  default:throw Error("Unsupported displayed matrix expression "+name);
 }
};
const dimension=(name:string,[A,B,C]:M[]):string=>{
 const x=shape(A),y=shape(B),z=C?shape(C):null;
 let v:{r:number;c:number}|null=null;
 switch(name){
  case "AᵀB":v=mulShape(t(x),y);break;
  case "Aᵀ(B+C)":v=mulShape(t(x),sumShape(y,z));break;
  case "(AB)ᵀ+C":v=sumShape(t(mulShape(x,y)),z);break;
  case "ABᵀ+C":v=sumShape(mulShape(x,t(y)),z);break;
  case "(A+Bᵀ)C":v=mulShape(sumShape(x,t(y)),z);break;
  default:throw Error("Unsupported displayed dimensions expression "+name);
 }
 return v?v.r+"x"+v.c:"not-possible";
};
for(const width of [375,1280])for(const en of [false,true])
for(const [level,plLevel,enLevel] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
test("MT-EDU-019 P0C "+width+" "+level+" "+(en?"EN":"PL"),async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.setViewportSize({width,height:900});
 await page.goto("/");
 if(en)await button(page,"English").click();
 await button(page,en?"University mathematics":"Matematyka na studia").click();
 await button(page,en?"Matrices":"Macierze").click();
 await button(page,en?enLevel:plLevel).click();
 for(const family of [
  {id:"matrix-rectangular-evaluation",title:en?/Rectangular matrix expression calculations/:/Obliczenia na macierzach prostokątnych/},
  {id:"matrix-transpose-dimensions",title:en?/Dimensions of expressions with transposes/:/Wymiary działań z transpozycją/},
 ]){
  await page.getByRole("button",{name:family.title}).click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id",family.id);
  const question=await page.locator(".question").innerText();
  const match=question.match(/^(?:Oblicz|Calculate|Określ, czy można wykonać|Decide whether) ([^ ]+)/);
  expect(match).not.toBeNull();
  const name=match![1];
  const matrices=await displayed(page);
  expect(matrices.length).toBeGreaterThanOrEqual(name==="A+Aᵀ"?1:2);
  if(name==="3A−B")expect(matrices.map(m=>[m.length,m[0].length])).toEqual([[2,3],[2,3]]);
  if(name==="A+Aᵀ")expect(matrices.map(m=>[m.length,m[0].length])).toEqual([[3,3]]);
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  if(family.id==="matrix-rectangular-evaluation"){
    const answer=calculate(name,matrices);
    for(let i=0;i<answer.length;i++)for(let j=0;j<answer[i].length;j++){
      const field=page.locator(i===0&&j===0?"#answer":"#answer-"+i+"-"+j);
      await field.fill(i===0&&j===0?"999999":f(answer[i][j]));
    }
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").fill(f(answer[0][0]));
  }else{
    const expected=dimension(name,matrices);
    const bad=expected==="not-possible"?"2x2":"not-possible";
    await page.locator("#answer").selectOption(bad);
    await button(page,en?"Check":"Sprawdź").click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.locator("#answer").selectOption(expected);
  }
  await button(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect(errors).toEqual([]);
});
