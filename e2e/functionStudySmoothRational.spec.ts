import { expect, test, type Page } from "@playwright/test";
import { taskPool } from "../src/generators";
import { localizeTask } from "../src/locales/catalog";
import { getAnswerSpec } from "../src/exercises";
import { addRational as add, rational as r } from "../src/rational";
import { formatRational as f } from "../src/answers";
import { polishLearningText } from "./helpers/localization";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const ID = "analysis-study-smooth-rational";

for (const width of [375, 1280])
  for (const en of [false, true])
    for (const level of ["hard", "advanced", "expert"] as const)
      test("MT-SYLLABUS-D08 smooth rational source-method " + level + " " + width + "px " + (en ? "EN" : "PL"), async ({ page }) => {
        test.setTimeout(110_000);
        const errors: string[] = [];
        page.on("pageerror", err => errors.push(err.message));
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        if (en) await button(page, "English").click();
        await button(page, en ? "University mathematics" : "Matematyka na studia").click();
        await button(page, en ? "Derivatives" : "Pochodne").click();
        await button(page,
          level === "hard" ? (en ? "Hard" : "Trudny")
            : level === "advanced" ? (en ? "Advanced" : "Zaawansowany") : (en ? "Expert" : "Ekspert"),
        ).click();
        const title = en ? "Study of a smooth rational function" : "Badanie funkcji wymiernej bez biegunów";
        await page.locator("button.exercise-item").filter({ hasText: title }).click();
        await expect(page.locator(".question")).toHaveAttribute("data-template-id", ID);
        await expect(page.locator(".question")).toContainText("f′");
        await expect(page.locator(".question")).toContainText("f″");
        await expect(page.locator(".question")).toContainText("f(x)=");
        const question = (await page.locator(".question").innerText()).trim();
        const task = taskPool("derivatives", level)
          .filter(row => row.templateId === ID)
          .map(row => localizeTask(row, en ? "en" : "pl"))
          .find(row => row.question === question);
        expect(task, "The rendered problem must be one of 24 catalog variants").toBeDefined();
        const spec = getAnswerSpec(task!);
        expect(spec.kind).toBe("list");
        if (spec.kind !== "list") throw Error("Expected list answer");
        expect(spec.values).toHaveLength(2);

        await expect(page.locator(".solution-panel ol")).toHaveCount(0);
        await expect(button(page, en ? "Show solution" : "Pokaż rozwiązanie")).toBeVisible();
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        for (let i = 0; i < spec.values.length; i++)
          await page.locator(i === 0 ? "#answer" : "#answer-" + i)
            .fill(f(i === 0 ? add(spec.values[i], r(1)) : spec.values[i]));
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await page.locator("#answer").fill(f(spec.values[0]));
        await button(page, en ? "Check" : "Sprawdź").click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");

        await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
        await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
        const panel = page.locator(".solution-panel");
        await expect(panel).toContainText("f′(x)");
        await expect(panel).toContainText("f″(x)");
        await expect(panel).toContainText("√3");
        await expect(panel).toContainText(en ? "horizontal asymptote" : "asymptot");
        if (en) expect(await panel.innerText()).not.toMatch(polishLearningText);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
        expect(errors).toEqual([]);
      });
