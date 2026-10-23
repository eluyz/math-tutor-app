import { test, expect, type Page } from "@playwright/test";
import { shownFraction } from "./helpers/functions";
import { addRational as add, subtractRational as sub, equalRational as eq, rational as r } from "../src/rational";
import { formatRational as f } from "../src/answers";
import { polishLearningText } from "./helpers/localization";

const btn=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
async function evaluate(page:Page,expectedLabel:string,en:boolean) {
  const labels=await page.locator("#answer option").evaluateAll(nodes=>nodes.map(el=>({
    label:(el as HTMLOptionElement).textContent?.trim()??"",
    value:(el as HTMLOptionElement).value,
  })));
  const correct=labels.filter(item=>item.label===expectedLabel);
  expect(correct, "one option matches the independently computed answer").toHaveLength(1);
  await btn(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  const wrong=labels.find(item=>item.value&&item.value!==correct[0].value);
  expect(wrong).toBeTruthy();
  await page.locator("#answer").selectOption(wrong!.value);
  await btn(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").selectOption(correct[0].value);
  await btn(page,en?"Check":"Sprawdź").click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await btn(page,en?"Show solution":"Pokaż rozwiązanie").click();
  await btn(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
  await expect(page.locator(".solution-panel")).toBeVisible();
  await expect(page.locator(".solution-panel")).toContainText(en?"Final answer":"Końcowa odpowiedź");
}
for(const width of [375,1280])for(const en of [false,true])
for(const [level,plLevel,enLevel] of [["easy","Łatwy","Easy"],["medium","Średni","Medium"],["hard","Trudny","Hard"]] as const)
  test("MT-EDU-016 P0 "+level+" "+width+"px "+(en?"EN":"PL")+" one-sided derivatives and corners",async({page})=>{
    test.setTimeout(90_000);
    const errors:string[]=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.setViewportSize({width,height:900});
    await page.goto("/");
    if(en)await btn(page,"English").click();
    await btn(page,en?"University mathematics":"Matematyka na studia").click();
    await btn(page,en?"Derivatives":"Pochodne").click();
    await btn(page,en?enLevel:plLevel).click();

    await page.getByRole("button",{name:en?/One-sided derivatives at an absolute-value corner/:/Pochodne jednostronne i ostry wierzchołek/}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","derivative-absolute-one-sided");
    const text=await page.locator(".question").innerText();
    const match=text.match(/f\(x\) = \(([^()]*)\)\|\(x−\(([^()]*)\)\)\| \+ \(([^()]*)\)\(x−\(([^()]*)\)\)/);
    expect(match,"public absolute-value formula must be parseable").not.toBeNull();
    const coefficient=shownFraction(match![1]),at=shownFraction(match![2]),linear=shownFraction(match![3]);
    expect(eq(at,shownFraction(match![4]))).toBe(true);
    const left=sub(linear,coefficient),right=add(linear,coefficient);
    expect(eq(left,right)).toBe(false);
    const answer="f′₋("+f(at)+") = "+f(left)+"; f′₊("+f(at)+") = "+f(right);
    await evaluate(page,answer,en);

    await page.getByRole("button",{name:en?/Differentiability of a piecewise function/:/Różniczkowalność funkcji przedziałami/}).click();
    await expect(page.locator(".question")).toHaveAttribute("data-template-id","derivative-piecewise-point");
    const piece=await page.locator(".question").innerText();
    const parts=piece.match(/f\(x\) = \{\s*\(([^()]*)\)\(x−\(([^()]*)\)\) \+ \(([^()]*)\)[\s\S]*?\n\s*\(([^()]*)\)\(x−\(([^()]*)\)\) \+ \(([^()]*)\) \+ \(([^()]*)\)/);
    expect(parts,"public piecewise formula must be parseable").not.toBeNull();
    const slopeLeft=shownFraction(parts![1]),slopeRight=shownFraction(parts![4]),jump=shownFraction(parts![7]);
    expect(eq(shownFraction(parts![2]),shownFraction(parts![5]))).toBe(true);
    expect(eq(shownFraction(parts![3]),shownFraction(parts![6]))).toBe(true);
    const classification=!eq(jump,r(0))?"jump":eq(slopeLeft,slopeRight)?"smooth":"corner";
    const labels=en?{
      smooth:"continuous and differentiable",
      corner:"continuous but not differentiable (corner)",
      jump:"discontinuous (jump)",
    }:{
      smooth:"ciągła i różniczkowalna",
      corner:"ciągła, ale nieróżniczkowalna (załamanie)",
      jump:"nieciągła (skok)",
    };
    await evaluate(page,labels[classification],en);
    if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
