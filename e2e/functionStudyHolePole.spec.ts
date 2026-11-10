import {expect, test, type Page} from "@playwright/test";
import {taskPool} from "../src/generators";
import {localizeTask} from "../src/locales/catalog";
import {getAnswerSpec} from "../src/exercises";
import {addRational as add, rational as r} from "../src/rational";
import {formatRational as fmt} from "../src/answers";
import {polishLearningText} from "./helpers/localization";

const click=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});
const ID="analysis-study-hole-pole";

for(const width of [375,1280])
  for(const en of [false,true])
    for(const level of ["hard","advanced","expert"] as const)
      test("D08 removable hole + pole "+level+" "+width+"px "+(en?"EN":"PL"),async ({page})=>{
        test.setTimeout(110_000);
        const errors:string[]=[];
        page.on("pageerror",e=>errors.push(e.message));
        await page.setViewportSize({width,height:900});
        await page.goto("/");
        if(en)await click(page,"English").click();
        await click(page,en?"University mathematics":"Matematyka na studia").click();
        await click(page,en?"Derivatives":"Pochodne").click();
        await click(page,level==="hard"?(en?"Hard":"Trudny")
          :level==="advanced"?(en?"Advanced":"Zaawansowany"):(en?"Expert":"Ekspert")).click();
        const title=en?"Complete study of a rational function with a hole and pole"
          :"Pełne badanie funkcji z dziurą i biegunem";
        await page.locator("button.exercise-item").filter({hasText:title}).click();
        await expect(page.locator(".question")).toHaveAttribute("data-template-id",ID);
        await expect(page.locator(".question")).toContainText("f′");
        await expect(page.locator(".question")).toContainText("f″");
        const question=(await page.locator(".question").innerText()).trim();
        const task=taskPool("derivatives",level)
          .filter(x=>x.templateId===ID)
          .map(x=>localizeTask(x,en?"en":"pl"))
          .find(x=>x.question===question);
        expect(task,"Visible question must match catalog variant").toBeDefined();
        const spec=getAnswerSpec(task!);
        expect(spec.kind).toBe("list");
        if(spec.kind!=="list")throw Error("Expected list answer");
        expect(spec.values).toHaveLength(4);
        await click(page,en?"Check":"Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        for(let i=0;i<spec.values.length;i++)
          await page.locator(i===0?"#answer":"#answer-"+i)
            .fill(fmt(i===0?add(spec.values[i],r(1)):spec.values[i]));
        await click(page,en?"Check":"Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await page.locator("#answer").fill(fmt(spec.values[0]));
        await click(page,en?"Check":"Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await click(page,en?"Show solution":"Pokaż rozwiązanie").click();
        await click(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
        const panel=page.locator(".solution-panel");
        await expect(panel).toContainText("f′(x)");
        await expect(panel).toContainText("f″(x)");
        await expect(panel).toContainText(en?"vertical asymptote":"asymptot");
        if(en)expect(await panel.innerText()).not.toMatch(polishLearningText);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
        expect(errors).toEqual([]);
      });
