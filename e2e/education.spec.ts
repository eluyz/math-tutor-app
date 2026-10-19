import { expect, test, type Page } from "@playwright/test";
import { expectOnlyProgressStorage } from "./helpers/progress";
import { parseAnswer, rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, type Rational } from "../src/rational";

const format = (value: Rational) => `${value.numerator}/${value.denominator}`;
type Expected = { kind: "scalar"; value: Rational } | { kind: "list"; values: Rational[] } | { kind: "matrix"; values: Rational[][] };
async function readMatrix(page: Page, label: string): Promise<Rational[][]> {
  const result: Rational[][] = [];
  for (const row of await page.getByRole("table", { name: `Macierz ${label}`, exact: true }).locator("tbody tr").all()) {
    const values: Rational[] = [];
    for (const cell of await row.getByRole("cell").all()) {
      const parsed = parseAnswer(await cell.innerText()); expect(parsed.kind).toBe("valid");
      if (parsed.kind === "valid") values.push(parsed.value);
    }
    result.push(values);
  }
  return result;
}
function product(a: Rational[][], b: Rational[][]) {
  return a.map((row) => b[0].map((_, j) => row.map((value, k) => mul(value, b[k][j])).reduce(add, r(0))));
}
function laplace(a: Rational[][]): Rational {
  if (a.length === 1) return a[0][0];
  return a[0].map((value, j) => mul(r(j % 2 ? -1 : 1), mul(value, laplace(a.slice(1).map((row) => row.filter((_, k) => k !== j)))))).reduce(add, r(0));
}
async function matrixAnswer(page: Page): Promise<Expected> {
  const id = await page.locator(".question").getAttribute("data-template-id"), a = await readMatrix(page, "A");
  if (id === "matrix-dimensions") return { kind: "list", values: [r(a.length), r(a[0].length)] };
  if (id === "matrix-entry") {
    const question = await page.locator(".question").innerText(), match = question.match(/a([₁₂₃])([₁₂₃])/)!;
    return { kind: "scalar", value: a["₁₂₃".indexOf(match[1])]["₁₂₃".indexOf(match[2])] };
  }
  if (id === "matrix-scale") {
    const raw = (await page.locator(".question").innerText()).match(/\(([^)]+)\)·A/)![1], k = parseAnswer(raw);
    if (k.kind !== "valid") throw new Error("Invalid scalar");
    return { kind: "matrix", values: a.map((row) => row.map((value) => mul(value, k.value))) };
  }
  if (id === "matrix-transpose") return { kind: "matrix", values: a[0].map((_, j) => a.map((row) => row[j])) };
  if (id === "inverse-two") {
    const det = sub(mul(a[0][0], a[1][1]), mul(a[0][1], a[1][0]));
    expect(det.numerator).not.toBe(0n);
    const numerator = [[a[1][1], mul(r(-1), a[0][1])], [mul(r(-1), a[1][0]), a[0][0]]];
    return { kind: "matrix", values: numerator.map((row) => row.map((value) => r(value.numerator * det.denominator, value.denominator * det.numerator))) };
  }
  const b = await readMatrix(page, "B");
  if (id === "matrix-product") return { kind: "matrix", values: product(a, b) };
  return { kind: "matrix", values: a.map((row, i) => row.map((value, j) => id === "matrix-add" ? add(value, b[i][j]) : sub(value, b[i][j]))) };
}
async function fill(page: Page, expected: Expected, wrong = false) {
  if (expected.kind === "scalar") await page.getByLabel("Twoja odpowiedź", { exact: true }).fill(format(wrong ? add(expected.value, r(1)) : expected.value));
  else if (expected.kind === "list") {
    const fields = page.locator(".structured-answer input");
    await expect(fields).toHaveCount(expected.values.length);
    for (const [i, value] of expected.values.entries()) await fields.nth(i).fill(format(wrong && i === 0 ? add(value, r(1)) : value));
  } else for (const [i, row] of expected.values.entries()) for (const [j, value] of row.entries())
    await page.getByLabel(`Wiersz ${i + 1}, kolumna ${j + 1}`, { exact: true }).fill(format(wrong && i === 0 && j === 0 ? add(value, r(1)) : value));
}
async function check(page: Page, kind: "correct" | "incorrect" | "invalid") {
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback")).toHaveClass(`feedback ${kind}`);
}
function rootsOf(question: string) {
  const m = question.match(/(\d+)x² ([+−]) (\d+)x ([+−]) (\d+) = 0/)!;
  expect(m).not.toBeNull();
  const a = BigInt(m[1]), b = BigInt(m[3]) * (m[2] === "−" ? -1n : 1n), c = BigInt(m[5]) * (m[4] === "−" ? -1n : 1n);
  const delta = b * b - 4n * a * c;
  if (delta < 0n) return { classification: "none", values: [] };
  if (delta === 0n) return { classification: "double", values: [r(-b, 2n * a)] };
  let square = 0n; while (square * square < delta) square++;
  expect(square * square).toBe(delta);
  return { classification: "two", values: [r(-b + square, 2n * a), r(-b - square, 2n * a)] };
}

for (const { name, viewport } of [
  { name: "desktop", viewport: { width: 1280, height: 800 } },
  { name: "telefon", viewport: { width: 375, height: 812 } },
]) test.describe(`MT-EDU-001 — ${name}`, () => {
  test.use({ viewport }); test.setTimeout(60_000);
  const external = new WeakMap<Page, string[]>();
  test.beforeEach(async ({ page }) => {
    const requests: string[] = []; external.set(page, requests);
    page.on("request", (request) => { if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)) requests.push(request.url()); });
    await page.addInitScript(() => { Date.now = () => 42; });
    await page.goto("/");
    await page.getByRole("button", { name: "Matematyka na studia", exact: true }).click();
  });
  test.afterEach(async ({ page }) => {
    expect(external.get(page)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await expectOnlyProgressStorage(page);
  });

  test("pełna macierz: błąd, wskazówki, poprawa, reset, tab i poziom; transpozycja i mnożenie", async ({ page }) => {
    await page.getByRole("button", { name: "Macierze", exact: true }).click();
    await page.getByRole("button", { name: /Dodawanie macierzy/ }).click();
    await expect(page.locator(".starting-hint")).toBeVisible();
    const first = page.getByLabel("Wiersz 1, kolumna 1", { exact: true });
    await expect(first).toBeFocused(); await first.press("Tab");
    await expect(page.getByLabel("Wiersz 1, kolumna 2", { exact: true })).toBeFocused();
    await check(page, "invalid");
    const expected = await matrixAnswer(page);
    await fill(page, expected, true); await check(page, "incorrect");
    await expect(page.locator(".feedback")).toContainText("Nieustalona przyczyna");
    await expect(page.locator(".feedback")).not.toContainText("Obie macierze mają wymiar");
    await page.getByRole("button", { name: "Pokaż kolejną podpowiedź" }).click();
    await expect(page.locator(".learning-hint")).toHaveCount(2);
    await fill(page, expected); await check(page, "correct");
    await expect(page.locator(".feedback")).toContainText("c₁₁");
    const previous = await page.getByRole("table", { name: "Macierz A", exact: true }).innerText();
    await page.getByRole("button", { name: "Następny przykład" }).click();
    await expect(page.getByRole("table", { name: "Macierz A", exact: true })).not.toHaveText(previous);
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", "matrix-add");
    await expect(page.locator(".feedback")).toHaveCount(0);
    for (const field of await page.locator(".matrix-grid input").all()) await expect(field).toHaveValue("");
    await page.getByRole("button", { name: "Średni", exact: true }).click();
    await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "medium");
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", "matrix-add");
    await expect(page.locator(".matrix-grid input")).toHaveCount(6);
    for (const title of [/Transpozycja Aᵀ/, /Mnożenie macierzy AB/]) {
      await page.getByRole("button", { name: title }).click();
      await fill(page, await matrixAnswer(page)); await check(page, "correct");
    }
  });

  test("wzory i kwadratowe: poprawne znaki, trzy przypadki delty, odwrotna kolejność pierwiastków", async ({ page }) => {
    await page.getByRole("button", { name: /Kwadrat różnicy/ }).click();
    const m = (await page.locator(".question").innerText()).match(/\((\d+)x − (\d+)\)²/)!;
    const a = Number(m[1]), b = Number(m[2]);
    const expected: Expected = { kind: "list", values: [r(a * a), r(-2 * a * b), r(b * b)] };
    await fill(page, expected, true); await check(page, "incorrect");
    await fill(page, expected); await check(page, "correct");
    await page.getByRole("button", { name: "Trudny", exact: true }).click();
    await page.getByRole("button", { name: /Rozwiązywanie równania kwadratowego/ }).click();
    const cases = new Set<string>();
    for (let attempt = 0; attempt < 24 && cases.size < 3; attempt++) {
      await expect(page.getByLabel("Liczba pierwiastków rzeczywistych")).toHaveValue("");
      await expect(page.locator('[id^="root-"]')).toHaveCount(0);
      const result = rootsOf(await page.locator(".question").innerText());
      if (!cases.has(result.classification)) {
        const select = page.getByLabel("Liczba pierwiastków rzeczywistych");
        await select.selectOption(result.classification === "none" ? "double" : "none");
        if (result.classification === "none") await page.getByLabel("Pierwiastek 1", { exact: true }).fill("0");
        await check(page, "incorrect");
        await page.getByRole("button", { name: "Pokaż kolejną podpowiedź" }).click();
        await select.selectOption(result.classification);
        for (const [i, value] of result.values.entries()) await page.getByLabel(`Pierwiastek ${i + 1}`, { exact: true }).fill(format(value));
        await check(page, "correct"); await expect(page.locator(".feedback")).toContainText("Δ =");
        cases.add(result.classification);
      }
      await page.getByRole("button", { name: "Nowy przykład" }).click();
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", "quadratic-roots");
      await expect(page.locator(".feedback")).toHaveCount(0);
    }
    expect(cases).toEqual(new Set(["two", "double", "none"]));
  });

  test("Sarrus pokazuje sześć iloczynów, a zerowy wiersz pozwala użyć własności", async ({ page }) => {
    await page.getByRole("button", { name: "Wyznaczniki", exact: true }).click();
    await page.getByRole("button", { name: /Wyznacznik 3×3 — Sarrus/ }).click();
    const expected = laplace(await readMatrix(page, "A"));
    await fill(page, { kind: "scalar", value: expected }, true); await check(page, "incorrect");
    await fill(page, { kind: "scalar", value: expected }); await check(page, "correct");
    const explanation = await page.locator(".feedback").innerText();
    expect(explanation.match(/^↘/gm)).toHaveLength(3); expect(explanation.match(/^↗/gm)).toHaveLength(3);
    await page.getByRole("button", { name: /Wyznacznik — zerowy wiersz/ }).click();
    await fill(page, { kind: "scalar", value: r(0) }); await check(page, "correct");
    await expect(page.locator(".feedback")).toContainText("Trzeci wiersz składa się wyłącznie z zer");
  });

  test("sesja macierzowa zachowuje pierwsze próby, podsumowanie i świadomą sugestię", async ({ page }) => {
    await page.getByRole("button", { name: "Macierze", exact: true }).click();
    await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)" }).click();
    const families = new Set<string>();
    for (let index = 0; index < 10; index++) {
      await expect(page.locator(".session-progress")).toHaveText(`Sesja: zadanie ${index + 1} z 10`);
      families.add((await page.locator(".question").getAttribute("data-template-id"))!);
      if (index === 1) await check(page, "invalid");
      else {
        const expected = await matrixAnswer(page);
        if (index === 0) { await fill(page, expected, true); await check(page, "incorrect"); }
        await fill(page, expected); await check(page, "correct");
      }
      await page.getByRole("button", { name: index === 9 ? "Zakończ sesję" : "Następne zadanie" }).click();
    }
    expect(families.size).toBeGreaterThan(1);
    const summary = page.getByRole("region", { name: "Sesja zakończona!" });
    await expect(page.getByRole("heading", { name: "Sesja zakończona!" })).toBeFocused();
    for (const [label, value] of [["Poprawne za pierwszą ważną próbą", "8/10"], ["Wymagały poprawy po pierwszej ważnej próbie", "1"], ["Pominięte bez ważnej oceny", "1"]])
      await expect(summary.getByText(label, { exact: true }).locator("..").locator("dd")).toHaveText(value);
    await expect(page.getByRole("button", { name: "Łatwy", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Rozpocznij kolejną sesję na sugerowanym poziomie" }).click();
    await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "medium");
    await expect(page.locator(".session-progress")).toHaveText("Sesja: zadanie 1 z 10");
  });
});
