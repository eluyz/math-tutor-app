import { expect, test } from "@playwright/test";

test("MT-002: poprawa odpowiedzi, hipoteza i pytanie pomocnicze w nowym wariancie", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Matematyka/ })).toBeVisible();
  await page.getByRole("button", { name: /Rozpocznij ćwiczenia/ }).click();
  await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
  const question = await page.locator(".question").innerText();
  const match = question.match(/^(\d+) \+ (\d+) × (\d+) = \?$/);
  expect(match).not.toBeNull();
  const [, a, b, c] = match!.map(Number);
  const answer = page.getByLabel("Twoja odpowiedź");
  await answer.fill(String((a + b) * c));
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback")).toContainText("Możliwe, że");
  await expect(page.locator(".feedback")).not.toContainText(`potem ${a} + ${b * c}`);
  await page.getByRole("button", { name: "Pokaż kolejną podpowiedź" }).click();
  await expect(page.locator(".feedback")).toContainText("Najpierw wykonaj mnożenie");
  await page.getByRole("button", { name: "Sprawdź pierwszy krok" }).click();
  await page.getByLabel(`Ile wynosi ${b} × ${c}?`).fill(String(b * c + 1));
  await page.getByRole("button", { name: "Sprawdź krok" }).click();
  await expect(page.locator(".step-feedback")).toContainText("Ten krok wymaga poprawy");
  await page.getByLabel(`Ile wynosi ${b} × ${c}?`).fill(String(b * c));
  await page.getByRole("button", { name: "Sprawdź krok" }).click();
  await expect(page.locator(".step-feedback")).toContainText("Ten krok jest poprawny");
  await answer.fill(String(a + b * c));
  await expect(page.locator(".question")).toHaveText(question);
  await expect(page.locator(".feedback")).toHaveCount(0);
  await expect(page.locator(".step-feedback")).toHaveCount(0);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback")).toContainText(`Najpierw ${b} × ${c} = ${b * c}`);
  await page.getByRole("button", { name: "Następny przykład" }).click();
  await expect(page.locator(".question")).not.toHaveText(question);
});

test("niejednoznaczny wynik algebry pozostaje hipotezą po obu odpowiedziach pomocniczych", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Podstawy algebry", exact: true }).click();
  const family = page.getByRole("button", { name: /Podstawianie do wyrażenia/ });
  let selected: { x: number; k: number } | undefined;
  for (let attempt = 0; attempt < 10; attempt++) {
    await family.click();
    const question = await page.locator(".question").innerText();
    const match = question.match(/^Oblicz x² \+ (\d+)x dla x = (\d+)\.$/);
    expect(match).not.toBeNull();
    const [, k, x] = match!.map(Number);
    // The supplemental x=2, k=1 makes both formulas correct; choose a genuinely wrong collision.
    if (x === k + 1 && x !== 2) { selected = { x, k }; break; }
  }
  expect(selected).toBeDefined();
  await page.getByLabel("Twoja odpowiedź").fill(String(selected!.x * (selected!.k + 2)));
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback")).toContainText("Kilka możliwych przyczyn");
  await page.getByRole("button", { name: "Sprawdź pierwszy krok" }).click();
  const step = page.getByLabel(`Ile wynosi x² dla x = ${selected!.x}?`);
  await step.fill(String(selected!.x * selected!.x));
  await page.getByRole("button", { name: "Sprawdź krok" }).click();
  await expect(page.locator(".step-feedback")).toContainText("Nie ustala to przyczyny wcześniejszej odpowiedzi");
  await expect(page.locator(".feedback")).toContainText("Kilka możliwych przyczyn");
  await step.fill("0");
  await page.getByRole("button", { name: "Sprawdź krok" }).click();
  await expect(page.locator(".step-feedback")).toContainText("Ten krok wymaga poprawy");
  await expect(page.locator(".step-feedback")).toContainText("Nie ustala to przyczyny wcześniejszej odpowiedzi");
});

test("ułamki: dokładna odpowiedź, walidacja i brak starej oceny", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ułamki", exact: true }).click();
  await page.getByRole("button", { name: /Dodawanie ułamków/ }).click();
  const question = await page.locator(".question").innerText();
  const match = question.match(/^(\d+)\/(\d+) \+ (\d+)\/(\d+) = \?$/);
  expect(match).not.toBeNull();
  const [, p, a, q, b] = match!.map(Number);
  const answer = page.getByLabel("Twoja odpowiedź");
  await answer.fill("1/0");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback")).toContainText("Mianownik nie może być zerem");
  await answer.fill(`${p * b + q * a}/${a * b}`);
  await expect(page.locator(".feedback")).toHaveCount(0);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback")).toContainText("Brawo!");
});

test("poziom trudności i kategoria tworzą nowe zadanie bez starej informacji zwrotnej", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Podstawy algebry", exact: true }).click();
  await page.getByRole("button", { name: /Podstawianie do wyrażenia/ }).click();
  await page.getByLabel("Twoja odpowiedź").fill("9999");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback")).toContainText("Nieustalona przyczyna");
  await page.getByRole("button", { name: "Trudny", exact: true }).click();
  await expect(page.locator(".feedback")).toHaveCount(0);
  await expect(page.locator(".panel-top")).toContainText("TRUDNY");
  await page.getByRole("button", { name: "Równania liniowe", exact: true }).click();
  await page.getByRole("button", { name: /Równanie z ułamkiem/ }).click();
  await expect(page.locator(".question")).toContainText("x/");
  await expect(page.getByLabel("Twoja odpowiedź")).toHaveValue("");
});

test("telefon: kategorie, poziom i formularz działają z klawiatury", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("group", { name: "Kategorie ćwiczeń" }).getByRole("button")).toHaveCount(5);
  await page.getByRole("button", { name: "Liczby dodatnie i ujemne", exact: true }).click();
  await page.getByRole("button", { name: "Średni" }).click();
  await page.getByLabel("Twoja odpowiedź").fill("0");
  await page.getByLabel("Twoja odpowiedź").press("Enter");
  await expect(page.locator(".feedback")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.getByRole("button", { name: "Równania liniowe", exact: true }).click();
  await page.getByRole("button", { name: "Trudny", exact: true }).click();
  await page.getByRole("button", { name: /Równanie z ułamkiem/ }).click();
  await expect(page.locator(".question")).toContainText("x/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("desktop: odpowiedzi nie są wysyłane do zewnętrznych serwerów", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const external: string[] = [];
  page.on("request", (request) => {
    if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)) external.push(request.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Równania liniowe", exact: true }).click();
  await page.getByLabel("Twoja odpowiedź").fill("8");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await page.getByRole("button", { name: "Nowy przykład" }).click();
  expect(external).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
