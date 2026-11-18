import { expect, type Page } from "@playwright/test";

/** Explicit user consent for an action that intentionally replaces unfinished work. */
export async function confirmTaskReplacement(page: Page, action: () => Promise<unknown>) {
  const question = page.locator(".question");
  const run = await question.getAttribute("data-exercise-run");
  expect(run).not.toBeNull();
  await Promise.all([
    page.waitForEvent("dialog").then(async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toMatch(/Zmiana zadania|Changing tasks/);
      await dialog.accept();
    }),
    action(),
  ]);
  await expect(question).not.toHaveAttribute("data-exercise-run", run!);
}
