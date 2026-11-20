import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

/** ST-103 obeys the canonical task-first design of PR #341. */
for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  test(`ST-103 variance in shared selector layout ${width}px ${locale}`,async({page},info)=>{
    await page.setViewportSize({width,height:820});
    await page.goto("/");
    const en=locale==="en";
    if(en) await page.getByRole("button",{name:"English",exact:true}).click();
    await page.locator(".subject-navigation").getByRole("button",{name:/Statystyka|Statistics/}).click();
    const stats=page.locator(".statistics-practice");
    const selector=stats.locator(".statistics-catalog");
    await expect(selector.locator("summary")).toContainText(en?"Change topic and level":"Zmień temat i poziom");
    await selector.locator("[data-topic=dispersion]").click();
    const card=stats.locator(".statistics-task-panel");
    const lessonTitle=en?"ST-103 — Population variance":"ST-103 — Wariancja populacyjna";
    await expect(card.getByRole("heading",{name:lessonTitle,exact:true})).toBeVisible();
    await expect(stats.locator(".question")).toHaveAttribute("data-lesson","variance");
    await expect(selector.locator("summary")).toContainText(lessonTitle);
    const taskBox=await card.boundingBox(),selectorBox=await selector.boundingBox();
    expect(taskBox).not.toBeNull();
    expect(selectorBox).not.toBeNull();
    expect(selectorBox!.y).toBeGreaterThanOrEqual(taskBox!.y+taskBox!.height-1);
    expect(Math.abs(taskBox!.x-selectorBox!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(taskBox!.width-selectorBox!.width)).toBeLessThanOrEqual(2);
    await expect(selector.locator("[data-topic=mean]")).toBeEnabled();
    await expect(selector.locator("[data-topic=median]")).toBeEnabled();
    await expect(selector.locator("[data-topic=mode]")).toBeEnabled();
    await expect(selector.locator("[data-level=advanced]")).toBeDisabled();
    await expect(selector.locator("[data-level=expert]")).toBeDisabled();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    if(!en){
      mkdirSync("test-results/ui-evidence",{recursive:true});
      const path=`test-results/ui-evidence/st103-integrated-${width}-pl.png`;
      await page.screenshot({path,fullPage:true});
      await info.attach("st103-task-first",{path,contentType:"image/png"});
    }
  });
}
