import { test, expect } from "@playwright/test";

for (const width of [375, 768, 1280])
  test(`P0 ${width}px: rzeczywista kolejność Expand → Hide, PL/EN, fokus i historia`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
    const heading = page.locator(".scratchpad-heading");
    const notes = page.locator("#scratchpad-text");
    const editor = (await notes.elementHandle())!;
    for (const en of [false, true]) {
      if (en) await page.getByRole("button", { name: "English", exact: true }).click();
      const [show, hide, expand, close, write, auto] = en
        ? ["Show scratchpad", "Hide scratchpad", "Expand", "Close", "Write", "Clear the scratchpad for a new exercise"]
        : ["Pokaż brudnopis", "Schowaj brudnopis", "Powiększ", "Zamknij", "Pisz", "Czyść brudnopis przy nowym zadaniu"];
      const button = (name: string) => page.getByRole("button", { name, exact: true });
      await expect(heading.locator("button:visible")).toHaveText([show]);
      await button(show).click();
      await expect(heading.locator("button:visible")).toHaveText([expand, hide]);
      const left = (await button(expand).boundingBox())!, right = (await button(hide).boundingBox())!;
      expect(left.x).toBeLessThan(right.x);
      await button(expand).focus();
      await page.keyboard.press("Tab");
      await expect(button(hide)).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(button(expand)).toBeFocused();
      await button(write).click();
      await page.getByLabel(auto).uncheck();
      await notes.pressSequentially("scratchpad history");
      await notes.press("ControlOrMeta+a"); await notes.press("Backspace");
      await button(expand).click();
      await expect(button(close)).toBeFocused();
      await button(close).click();
      await expect(button(expand)).toBeFocused();
      await notes.press("ControlOrMeta+z"); await expect(notes).toHaveValue("scratchpad history");
      await notes.press("ControlOrMeta+Shift+z"); await expect(notes).toHaveValue("");
      await notes.press("ControlOrMeta+z");
      await notes.evaluate((el: HTMLTextAreaElement) => { el.setSelectionRange(2, 7); el.dispatchEvent(new Event("select", { bubbles: true })); });
      await button(hide).click();
      await expect(button(show)).toBeFocused();
      await button(show).click();
      await expect(notes).toHaveValue("scratchpad history");
      expect(await notes.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd])).toEqual([2, 7]);
      expect(await editor.evaluate((el) => el.isConnected)).toBe(true);
      await expect(page.getByLabel(auto)).not.toBeChecked();
      await button(expand).click(); await page.keyboard.press("Escape");
      await expect(button(expand)).toBeFocused();
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
      await notes.press("ControlOrMeta+a"); await notes.press("Backspace");
      await button(hide).click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
