import { expect, test } from "@playwright/test";

test("MT-001: start, poprawa odpowiedzi i następne ćwiczenie", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Matematyka/ })).toBeVisible();
  await page.getByRole("button", { name: /Rozpocznij ćwiczenia/ }).click();
  await expect(page.locator(".question")).toHaveText("3 + 4 × 2 = ?");

  await page.getByLabel("Twoja odpowiedź").fill("14");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Możliwe, że");
  await expect(page.getByRole("status")).not.toContainText(
    "Następnie 3 + 8 = 11",
  );
  await page.getByRole("button", { name: "Pokaż kolejną podpowiedź" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Mnożenie ma pierwszeństwo",
  );

  await page.getByRole("button", { name: "Sprawdź pierwszy krok" }).click();
  await page.getByLabel("Ile wynosi 4 × 2?").fill("9");
  await page.getByRole("button", { name: "Sprawdź krok" }).click();
  await expect(page.locator(".step-feedback")).toContainText(
    "Ten krok wymaga poprawy",
  );
  await page.getByLabel("Ile wynosi 4 × 2?").fill("8");
  await page.getByRole("button", { name: "Sprawdź krok" }).click();
  await expect(page.locator(".step-feedback")).toContainText(
    "Ten krok jest poprawny",
  );

  await page.getByLabel("Twoja odpowiedź").fill("11");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Najpierw 4 × 2 = 8");
  await page.getByRole("button", { name: "Następne zadanie" }).click();
  await expect(page.locator(".question")).toHaveText("(6 + 2) × 3 = ?");
});

test("ułamki: nieprawidłowy mianownik i równoważna liczba dziesiętna", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ułamki", exact: true }).click();
  await expect(page.locator(".question")).toHaveText("1/2 + 1/4 = ?");
  await page.getByLabel("Twoja odpowiedź").fill("1/0");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Mianownik nie może być zerem",
  );
  await page.getByLabel("Twoja odpowiedź").fill("0,75");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("2/4 + 1/4 = 3/4");
});

test("niejednoznaczny wynik pokazuje obie hipotezy i pytanie pomocnicze", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Podstawy algebry", exact: true })
    .click();
  await page.getByRole("button", { name: /Podstawianie do wyrażenia/ }).click();
  await page.getByLabel("Twoja odpowiedź").fill("12");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Kilka możliwych przyczyn",
  );
  await expect(page.getByRole("status")).toContainText("x² policzono jako 2x");
  await expect(page.getByRole("status")).toContainText(
    "pominięto współczynnik 2",
  );
  await page.getByRole("button", { name: "Sprawdź pierwszy krok" }).click();
  await page.getByLabel("Ile wynosi x² dla x = 3?").fill("9");
  await page.getByRole("button", { name: "Sprawdź krok" }).click();
  await expect(page.locator(".step-feedback")).toContainText(
    "policz osobno 2x",
  );
});

test("telefon: wszystkie kategorie są osiągalne, a formularz działa z klawiatury", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(
    page.getByRole("group", { name: "Kategorie ćwiczeń" }).getByRole("button"),
  ).toHaveCount(5);
  await page
    .getByRole("button", { name: "Liczby dodatnie i ujemne", exact: true })
    .click();
  await expect(page.locator(".question")).toHaveText("−7 + 12 = ?");
  await page.getByLabel("Twoja odpowiedź").fill("5");
  await page.getByLabel("Twoja odpowiedź").press("Enter");
  await expect(page.getByRole("status")).toContainText("pozostałych 5 kroków");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test("desktop: aplikacja nie wysyła odpowiedzi do zewnętrznych serwerów", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const external: string[] = [];
  page.on("request", (request) => {
    if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname))
      external.push(request.url());
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Równania liniowe", exact: true })
    .click();
  await page.getByLabel("Twoja odpowiedź").fill("8");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Możliwe, że");
  await page.getByLabel("Twoja odpowiedź").fill("100");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Nieustalona przyczyna");
  expect(external).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
