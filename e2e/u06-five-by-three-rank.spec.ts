import {test,expect,type Page} from "@playwright/test";
import {readSystem} from "./helpers/systems";
import {polishLearningText} from "./helpers/localization";

/** U06 5x3 oracle uses only the visible 5x4 augmented matrix, never the
 * hidden exercise generator or the app's computed rank/classification. */
const button=(page:Page,label:string)=>page.getByRole("button",{name:label,exact:true});
for(const width of [375,1280])
  for(const en of [false,true])
    for(const level of ["hard","advanced","expert"] as const)
      test(`U06 source-shape five-by-three ${width}px ${en?"EN":"PL"} ${level}`,async({page})=>{
        test.setTimeout(120_000);
        const errors:string[]=[];
        page.on("pageerror",error=>errors.push(error.message));
        await page.setViewportSize({width,height:900});
        await page.goto("/");
        if(en)await button(page,"English").click();
        await button(page,en?"University mathematics":"Matematyka na studia").click();
        await button(page,en?"Systems of equations":"Układy równań").click();
        const levelName={
          hard:en?"Hard":"Trudny",
          advanced:en?"Advanced":"Zaawansowany",
          expert:en?"Expert":"Ekspert",
        }[level];
        await button(page,levelName).click();
        const title=en?"U06: classify a 5×3 system by ranks":"U06: klasyfikacja układu 5×3 przez rzędy";
        const selector=page.locator(".exercise-list-items button.exercise-item").filter({hasText:title});
        await expect(selector).toHaveCount(1);
        await selector.click();
        await expect(page.locator(".question")).toHaveAttribute("data-template-id","system-rectangular-5x3-classification");
        const matrix=page.locator(".linear-algebra-matrices .given-matrix").first();
        await expect(matrix.locator("tbody tr")).toHaveCount(5);
        await expect(matrix.locator("tbody tr").first().locator("td")).toHaveCount(4);
        const oracle=await readSystem(page);
        const input=page.locator("#answer");
        await expect(input).toHaveJSProperty("tagName","SELECT");
        await button(page,en?"Check":"Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        await input.selectOption(oracle.classification==="system-none"?"system-one":"system-none");
        await button(page,en?"Check":"Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await input.selectOption(oracle.classification);
        await button(page,en?"Check":"Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await button(page,en?"Show solution":"Pokaż rozwiązanie").click();
        await button(page,en?"Show all steps":"Pokaż wszystkie kroki").click();
        await expect(page.locator(".solution-panel")).toContainText("rank(A)");
        await expect(page.locator(".solution-panel")).toContainText("rank([A|b])");
        if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
        expect(errors).toEqual([]);
      });
