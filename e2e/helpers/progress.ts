import { expect, type Page } from "@playwright/test";
import { HISTORY_KEY } from "../../src/progress/model";

export async function expectOnlyProgressStorage(page: Page) {
  const stored = await page.evaluate(
    (key) => ({
      keys: Object.keys(localStorage),
      sessionCount: sessionStorage.length,
      raw: localStorage.getItem(key),
    }),
    HISTORY_KEY,
  );
  expect(stored.sessionCount).toBe(0);
  expect(stored.keys.filter((key) => key !== HISTORY_KEY)).toEqual([]);
  if (stored.raw) {
    const data = JSON.parse(stored.raw);
    expect(data.version).toBe(1);
    expect(data.sessions.length).toBeGreaterThan(0);
    expect(data.sessions.length).toBeLessThanOrEqual(200);
    expect(stored.raw).not.toMatch(
      /"(?:answer|notes|strokes|locale|exerciseId|question|parameters)":/,
    );
  }
}
