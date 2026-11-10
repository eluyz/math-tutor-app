import { expect, test, type Page } from "@playwright/test";
import { parseAnswer, rational as r, addRational as add,
  subtractRational as sub, multiplyRational as mul, type Rational } from "../src/rational";
import { formatRational as fmt } from "../src/answers";

type M=Rational[][];
function visibleMat(text:string):Record<"A"|"B",M>{
  const matches=[...text.matchAll(/\b([AB])=(\[\[[^\]]+\];\s*\[[^\]]+\];\s*\[[^\]]+\]\])/g)];
  expect(matches.map(m=>m[1])).toEqual(["A","B"]);
  return Object.fromEntries(matches.map(m=>[m[1],m[2].slice(2,-2)
    .split(/\];\s*\[/).map(row=>row.split(",").map(cell=>{
      const parsed=parseAnswer(cell.trim());
      if(parsed.kind!=="valid")throw Error("Unparseable displayed coefficient "+cell);
      return parsed.value;
    }))])) as Record<"A"|"B",M>;
}
const prod=(a:M,b:M):M=>a.map(row=>b[0].map((_,j)=>
  row.reduce((sum,v,k)=>add(sum,mul(v,b[k][j])),r(0))));
function expected(text:string):Rational[]{
  const {A,B}=visibleMat(text);
  expect(A).toHaveLength(3);expect(B).toHaveLength(3);
  expect(A.every(row=>row.length===3)&&B.every(row=>row.length===3)).toBe(true);
  const AB=prod(A,B),BA=prod(B,A);
  const ans=AB.map((row,i)=>row.map((v,j)=>sub(v,BA[i][j])));
  expect(ans.some(row=>row.some(v=>v.numerator!==0n))).toBe(true);
  return ans.flat();
}
async function navigate(page:Page,en:boolean,width:number){
  await page.setViewportSize({width,height:950});
  await page.goto("/");
  if(en)await page.getByRole("button",{name:"English",exact:true}).click();
  await page.getByRole("button",{name:en?"University mathematics":"Matematyka na studia",exact:true}).click();
  await page.getByRole("button",{name:en?"Matrices":"Macierze",exact:true}).click();
  await page.getByRole("button",{name:en?"Hard":"Trudny",exact:true}).click();
  const title=en?"3×3 matrix commutator: AB−BA":"Komutator macierzy 3×3: AB−BA";
  const option=page.locator(".exercise-list-items button.exercise-item").filter({hasText:title});
  await expect(option).toHaveCount(1);
  await option.click();
}
for(const width of [375,1280])for(const en of [false,true])
  test("M04 AB−BA from visible matrix, "+width+" "+(en?"EN":"PL"),async({page})=>{
    test.setTimeout(110000);
    const errors:string[]=[];page.on("pageerror",err=>errors.push(err.message));
    await navigate(page,en,width);
    const question=page.locator(".question");
    await expect(question).toHaveAttribute("data-template-id","matrix-commutator-three");
    const answer=expected(await question.innerText());
    const inputs=page.locator("form .matrix-grid input");
    await expect(inputs).toHaveCount(9);
    const check=page.getByRole("button",{name:en?"Check":"Sprawdź",exact:true});
    await check.click();
    await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
    for(let i=0;i<9;i++)await inputs.nth(i).fill(fmt(answer[i]));
    await inputs.first().fill(fmt(add(answer[0],r(1))));
    await check.click();
    await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
    await page.getByRole("button",{name:en?"Show another hint":"Pokaż kolejną podpowiedź",exact:true}).click();
    await expect(page.locator(".learning-hint").last()).toContainText("AB−BA");
    await inputs.first().fill(fmt(answer[0]));
    await check.click();
    await expect(page.locator(".feedback")).toHaveClass("feedback correct");
    await page.getByRole("button",{name:en?"Show solution":"Pokaż rozwiązanie",exact:true}).click();
    await page.getByRole("button",{name:en?"Show all steps":"Pokaż wszystkie kroki",exact:true}).click();
    await expect(page.locator(".solution-panel")).toContainText("BA=");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });