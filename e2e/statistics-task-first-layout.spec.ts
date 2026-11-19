import { expect, test } from "@playwright/test";

// Statistics and Mathematics should both put task selection below active exercises.
for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  const en = locale === "en";
  test(`Statistics task-first configuration placement ${width}px ${locale}`, async ({page}) => {
    await page.setViewportSize({width, height: 820});
    await page.goto("/");
    if (en) await page.getByRole("button",{name:"English",exact:true}).click();
    await page.locator(".subject-navigation").getByRole("button",{name:/Statystyka|Statistics/}).click();
    const stats = page.locator(".statistics-practice");
    const config = stats.locator(".statistics-catalog");
    const question = stats.locator(".exercise-panel");
    await expect(question).toBeVisible();
    await expect(config).toHaveAttribute("open","");
    await expect(config.locator(".study-groups")).toBeVisible();
    const qBox = await question.boundingBox();
    const cBox = await config.boundingBox();
    expect(qBox).not.toBeNull();
    expect(cBox).not.toBeNull();
    expect(cBox!.y).toBeGreaterThan(qBox!.y + qBox!.height - 1);
    await expect(config.locator("[data-topic=median]")).toBeEnabled();

    // The future university track must still be reachable with no active exercise.
    await config.locator("[data-track=university]").click();
    await expect(stats.locator(".exercise-panel")).toHaveCount(0);
    await expect(stats.locator(".statistics-catalog")).toBeVisible();
    await expect(config.locator("[data-track=university]")).toHaveAttribute("aria-pressed","true");
    await config.locator("[data-track=fundamentals]").click();
    await expect(stats.locator(".question")).toHaveAttribute("data-lesson","mean");
    await expect(config.locator("[data-track=fundamentals]")).toHaveAttribute("aria-pressed","true");
    const qAgain = await question.boundingBox();
    const cAgain = await config.boundingBox();
    expect(cAgain!.y).toBeGreaterThan(qAgain!.y + qAgain!.height - 1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  });
}
