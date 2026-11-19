import { expect, test, type Page } from "@playwright/test";

/**
 * One canonical exercise-first interface for both playable subjects.
 * Tests actual DOM/geometry and keyboard controls, not screenshots alone.
 */
for (const width of [375, 390, 768, 1280]) for (const locale of ["pl", "en"] as const) {
  const en = locale === "en";
  const select = (page: Page) => page.locator(".subject-navigation").getByRole("button", {name:/Statystyka|Statistics/});
  test(`unified exercise shell ${width}px ${locale}`, async ({ page }) => {
    await page.setViewportSize({width,height:820});
    await page.goto("/");
    if (en) await page.getByRole("button",{name:"English",exact:true}).click();
    const math = page.locator(".practice");
    // Mathematics deliberately starts with no active task: launch one via its public UI.
    await math.locator(".practice-entry .primary-button").click();
    const mathTask = math.locator(".exercise-layout.has-task");
    const mathConfig = math.locator(".catalog-config");
    await expect(mathTask).toBeVisible();
    await expect(mathConfig).toBeVisible();
    await expect(mathConfig.locator("summary")).toContainText(en?"Change topic and level":"Zmień temat i poziom");
    const mathBox=await mathTask.boundingBox();
    const mathSelectorBox=await mathConfig.boundingBox();
    expect(mathBox).not.toBeNull();
    expect(mathSelectorBox).not.toBeNull();
    expect(mathSelectorBox!.y).toBeGreaterThanOrEqual(mathBox!.y+mathBox!.height-1);
    const family=mathConfig.locator(".exercise-list");
    await expect(family).toBeVisible();
    const familyBox=await family.boundingBox();
    expect(familyBox!.y).toBeGreaterThan(mathBox!.y+mathBox!.height-1);
    // The former desktop right-hand sidebar must never sit beside the exercise.
    expect(math.locator(".exercise-layout .exercise-list")).toHaveCount(0);

    await select(page).click();
    const stats=page.locator(".statistics-practice");
    const statsTask=stats.locator(".statistics-task-panel");
    const statsConfig=stats.locator(".catalog-config");
    await expect(statsTask).toBeVisible();
    await expect(statsConfig).toBeVisible();
    await expect(statsConfig.locator("summary")).toContainText(en?"Change topic and level":"Zmień temat i poziom");
    const statsBox=await statsTask.boundingBox();
    const statsSelectorBox=await statsConfig.boundingBox();
    expect(statsBox).not.toBeNull();
    expect(statsSelectorBox).not.toBeNull();
    expect(statsSelectorBox!.y).toBeGreaterThanOrEqual(statsBox!.y+statsBox!.height-1);
    // One-width task cards and the same full-width selector geometry.
    expect(Math.abs(statsBox!.x-mathBox!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(statsBox!.width-mathBox!.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(statsSelectorBox!.x-mathSelectorBox!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(statsSelectorBox!.width-mathSelectorBox!.width)).toBeLessThanOrEqual(2);
    await expect(statsConfig.locator(".study-groups")).toBeVisible();
    await expect(statsConfig.locator(".difficulty-picker")).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);

    // Repeated lesson changes must keep the same shell and a focusable selector.
    const median=statsConfig.locator("[data-topic=median]");
    await median.click();
    await expect(stats.locator(".question")).toHaveAttribute("data-lesson","median");
    await expect(statsConfig).toBeVisible();
    const medianBox=await statsTask.boundingBox();
    const medianSelectorBox=await statsConfig.boundingBox();
    expect(medianSelectorBox!.y).toBeGreaterThanOrEqual(medianBox!.y+medianBox!.height-1);
  });
}

test("planned subjects stay honest placeholders without fake practice controls",async({page})=>{
  await page.goto("/");
  for(const label of [/Ekonometria/,/Matematyka finansowa/]) {
    await page.locator(".subject-navigation").getByRole("button",{name:label}).click();
    await expect(page.getByText("Planowane").last()).toBeVisible();
    const planned=page.locator(".planned-practice");
    const emptyCard=planned.locator(".planned-subject-card");
    const topicsPanel=planned.locator(".catalog-config");
    await expect(emptyCard).toBeVisible();
    await expect(topicsPanel).toBeVisible();
    const emptyBox=await emptyCard.boundingBox();
    const topicsBox=await topicsPanel.boundingBox();
    expect(emptyBox).not.toBeNull();
    expect(topicsBox).not.toBeNull();
    expect(topicsBox!.y).toBeGreaterThanOrEqual(emptyBox!.y+emptyBox!.height-1);
    expect(Math.abs(topicsBox!.x-emptyBox!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(topicsBox!.width-emptyBox!.width)).toBeLessThanOrEqual(2);
    await expect(page.locator(".statistics-task-panel,.practice .exercise-layout:visible")).toHaveCount(0);
  }
});
