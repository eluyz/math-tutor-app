import { expect, test } from "@playwright/test";
import { HISTORY_KEY } from "../src/progress/model";

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
]) {
  for (const en of [false, true]) {
    test(`MT-UX-001 ${viewport.width}px ${en ? "EN" : "PL"}: global search, category and level`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      if (en) await page.getByRole("button", { name: "English", exact: true }).click();
      const search = page.getByRole("searchbox", {
        name: en ? "Search exercise families" : "Szukaj rodziny zadań",
      });
      await search.fill("MNOZENIE PRZEZ NAWIAS"); // Also works in English UI.
      await expect(page.locator(".catalog-search-list li")).toHaveCount(1);
      await expect(page.locator(".catalog-search-list")).toContainText(en ? "Algebra basics" : "Podstawy algebry");
      await expect(page.locator(".catalog-search-list")).toContainText(en ? "Easy" : "Łatwy");
      await page.locator(".catalog-search-list button").click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", "algebra-distribute");
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "easy");
      await expect(page.locator(".exercise-panel #exercise-title")).toBeFocused();
      await expect(page.locator(".category-picker button.active")).toHaveText(en ? "Algebra basics" : "Podstawy algebry");
      await expect(page.locator(".exercise-list-heading")).toContainText(en ? "Algebra basics" : "Podstawy algebry");
      await expect(search).toHaveValue("");

      await page.getByRole("button", { name: en ? "Hard" : "Trudny", exact: true }).click();
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
      await page.locator("#answer").fill("42");
      const run = await page.locator(".question").getAttribute("data-exercise-run");
      await search.fill("zzzz-no-such-family");
      await expect(page.getByText(en ? "No matching families. Try another name." : "Brak pasujących rodzin. Spróbuj innej nazwy.")).toBeVisible();
      await expect(page.locator(".question")).toHaveAttribute("data-exercise-run", run!);
      await expect(page.locator("#answer")).toHaveValue("42");
      await page.getByRole("button", { name: en ? "Clear search" : "Wyczyść wyszukiwanie" }).click();
      await expect(search).toBeFocused();
      await expect(search).toHaveValue("");

      await search.fill(en ? "four unknowns" : "cztery niewiadome");
      const cramer = page.locator(".catalog-search-list button").filter({ hasText: en ? "Cramer's rule" : "Reguła Cramera" });
      await expect(cramer).toContainText(en ? "Advanced" : "Zaawansowany");
      await cramer.click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", "cramer-four");
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "advanced");
      await expect(page.locator(".category-picker button.active")).toHaveText(en ? "Systems of equations" : "Układy równań");
      await expect(page.locator(".study-groups button").nth(1)).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".search-level-notice")).toContainText(en ? "Selected Advanced instead" : "Wybrano poziom Zaawansowany");
      await expect(page.locator(".exercise-panel #exercise-title")).toBeFocused();
      if (viewport.width === 375) {
        const list = page.locator(".exercise-list-items");
        expect((await list.boundingBox())!.height).toBeLessThanOrEqual(301);
        expect(await list.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
  }
}

test("MT-UX-001: search cannot change an active session and does not overwrite completed history", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Szukaj rodziny zadań" });
  await search.fill("cztery niewiadome");
  await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)" }).click();
  const run = await page.locator(".question").getAttribute("data-exercise-run");
  await expect(search).toBeDisabled();
  await expect(page.locator(".catalog-search-list button")).toBeDisabled();
  await expect(page.locator(".question")).toHaveAttribute("data-exercise-run", run!);
  await expect(page.locator(".session-progress")).toHaveText("Sesja: zadanie 1 z 10");
  for (let index = 0; index < 10; index++) {
    await page.getByRole("button", { name: index === 9 ? "Zakończ sesję" : "Następne zadanie" }).click();
  }
  const before = await page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY);
  expect(before).not.toBeNull();
  await expect(search).toBeEnabled();
  await page.locator(".catalog-search-list button").click();
  await expect(page.locator(".question")).toHaveAttribute("data-template-id", "cramer-four");
  expect(await page.evaluate((key) => localStorage.getItem(key), HISTORY_KEY)).toBe(before);
});

test("MT-UX-001: searching preserves scratchpad notes and native Undo/Redo with auto-clear off", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
  await page.getByRole("button", { name: "Pokaż brudnopis" }).click();
  await page.getByRole("button", { name: "Pisz", exact: true }).click();
  await page.getByLabel("Czyść brudnopis przy nowym zadaniu").uncheck();
  const notes = page.getByLabel("Notatki tekstowe");
  const editor = await notes.elementHandle();
  await notes.pressSequentially("zachowaj notatki");
  await page.getByRole("searchbox", { name: "Szukaj rodziny zadań" }).fill("cztery niewiadome");
  await page.locator(".catalog-search-list button").click();
  expect(await editor!.evaluate((element) => element.isConnected)).toBe(true);
  await expect(notes).toHaveValue("zachowaj notatki");
  await notes.press("ControlOrMeta+a");
  await notes.press("Backspace");
  await expect(notes).toHaveValue("");
  await notes.press("ControlOrMeta+z");
  await expect(notes).toHaveValue("zachowaj notatki");
  await notes.press("ControlOrMeta+Shift+z");
  await expect(notes).toHaveValue("");
});

test("MT-UX-001: switching language during search keeps the query and active exercise", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
  const run = await page.locator(".question").getAttribute("data-exercise-run");
  const search = page.getByRole("searchbox");
  await search.fill("cztery niewiadome");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(search).toHaveValue("cztery niewiadome");
  await expect(page.locator(".catalog-search-list")).toContainText("Cramer's rule: four unknowns");
  await expect(page.locator(".question")).toHaveAttribute("data-exercise-run", run!);
});

test("MT-UX-001: keyboard opens a search result and moves focus to the exercise", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Szukaj rodziny zadań" });
  await search.fill("mnozenie przez nawias");
  await search.press("Tab");
  await expect(page.getByRole("button", { name: "Wyczyść wyszukiwanie" })).toBeFocused();
  await page.keyboard.press("Tab");
  const result = page.locator(".catalog-search-list button");
  await expect(result).toBeFocused();
  await expect(result).toHaveAttribute("aria-label", /Dostępne poziomy: Łatwy/);
  await page.keyboard.press("Enter");
  await expect(page.locator(".question")).toHaveAttribute("data-template-id", "algebra-distribute");
  await expect(page.locator("#exercise-title")).toBeFocused();
});
