import {expect,test,type Page} from "@playwright/test";
import {readSystem,fillSystem} from "./helpers/systems";
import {polishLearningText} from "./helpers/localization";

/** U07: only public synthetic systems; oracle derives a 3x3 minor exclusively
 * from the student-visible 4x3 augmented matrix, then checks all four rows. */
const id="gauss-overdetermined-4x3-unique";
const button=(page:Page,name:string)=>page.getByRole("button",{name,exact:true});
const levels={
  hard:{pl:"Trudny",en:"Hard"},
  advanced:{pl:"Zaawansowany",en:"Advanced"},
  expert:{pl:"Ekspert",en:"Expert"},
} as const;
for(const width of [375,1280])
  for(const en of [false,true])
    for(const level of ["hard","advanced","expert"] as const)
      test(`U07 four-by-three full grading ${width}px ${en?"EN":"PL"} ${level}`,async({page})=>{
        test.setTimeout(120_000);
        await page.setViewportSize({width,height:900});
        const errors:string[]=[];
        page.on("pageerror",error=>errors.push(error.message));
        await page.goto("/");
        if(en)await button(page,"English").click();
        await button(page,en?"University mathematics":"Matematyka na studia").click();
        await button(page,en?"Systems of equations":"Układy równań").click();
        await button(page,levels[level][en?"en":"pl"]).click();
        const title=en?"Gaussian elimination 4×3: find x, y, z":"Gauss 4×3: oblicz x, y, z";
        const family=page.locator(".exercise-list-items button.exercise-item").filter({hasText:title});
        await expect(family).toHaveCount(1);
        await family.click();
        const question=page.locator(".question");
        await expect(question).toHaveAttribute("data-template-id",id);
        const matrix=page.locator(".linear-algebra-matrices .given-matrix").first();
        await expect(matrix.locator("tbody tr")).toHaveCount(4);
        await expect(matrix.locator("tbody tr").first().locator("td")).toHaveCount(4);
        const solved=await readSystem(page);
        expect(solved.classification).toBe("system-one");
        expect(solved.values).toHaveLength(3);
        await button(page,en?"Check":"Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        await fillSystem(page);
        await expect(page.locator("#system-value-0")).toBeVisible();
        await expect(page.locator("#system-value-1")).toBeVisible();
        await expect(page.locator("#system-value-2")).toBeVisible();
        await page.locator("#system-value-1").fill("999999");
        await button(page,en?"Check":"Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await fillSystem(page);
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
