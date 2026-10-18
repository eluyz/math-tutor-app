import { parse, numeric } from "./helpers/arithmetic";
import { test, expect, type Page } from "@playwright/test";
import {
  rational as r,
  addRational as add,
  subtractRational as sub,
  multiplyRational as mul,
  divideRational as div,
  parseAnswer,
  type Rational,
} from "../src/rational";
const text = (v: Rational) => `${v.numerator}/${v.denominator}`;
async function matrix(page: Page, name: string) {
  const rows = await page
    .getByRole("table", { name: `Macierz ${name}`, exact: true })
    .locator("tbody tr")
    .all();
  const result: Rational[][] = [];
  for (const row of rows) {
    const values: Rational[] = [];
    for (const cell of await row.getByRole("cell").all()) {
      const v = parseAnswer(await cell.innerText());
      if (v.kind !== "valid") throw new Error("Invalid cell");
      values.push(v.value);
    }
    result.push(values);
  }
  return result;
}
for (const viewport of [
  { width: 1280, height: 900 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
])
  test.describe(`MT-EDU-003 ${viewport.width}px`, () => {
    test.use({ viewport });
    test.setTimeout(90_000);
    const errors = new WeakMap<Page, string[]>(),
      external = new WeakMap<Page, string[]>();
    test.beforeEach(async ({ page }) => {
      errors.set(page, []);
      external.set(page, []);
      page.on("pageerror", (e) => errors.get(page)!.push(e.message));
      page.on("request", (r) => {
        if (!["127.0.0.1", "localhost"].includes(new URL(r.url()).hostname))
          external.get(page)!.push(r.url());
      });
      await page.addInitScript(() => {
        Date.now = () => 42;
      });
      await page.goto("/");
      await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
      await page.getByRole("button", { name: "Pokaż brudnopis", exact: true }).click();
    });
    test.afterEach(async ({ page }) => {
      expect(errors.get(page)).toEqual([]);
      expect(external.get(page)).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
    });
    test("pięć rzeczywistych poziomów i niedostępna rodzina bez podmiany trudności", async ({
      page,
    }) => {
      const picker = page.getByRole("group", { name: "Poziom trudności" });
      await expect(picker.getByRole("button")).toHaveCount(5);
      for (const [label, id] of [
        ["Łatwy", "easy"],
        ["Średni", "medium"],
        ["Trudny", "hard"],
        ["Zaawansowany", "advanced"],
        ["Ekspert", "expert"],
      ]) {
        await picker.getByRole("button", { name: label, exact: true }).click();
        await expect(page.locator(".question")).toHaveAttribute(
          "data-difficulty",
          id,
        );
        await page
          .getByLabel("Twoja odpowiedź", { exact: true })
          .fill(text(numeric(await page.locator(".question").innerText())));
        await page
          .getByRole("button", { name: "Sprawdź", exact: true })
          .click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await page
          .getByRole("button", { name: "Pokaż rozwiązanie", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Pokaż wszystkie kroki", exact: true })
          .click();
        await expect(page.locator(".solution-final")).toBeVisible();
      }
      await page
        .getByRole("button", { name: "Matematyka na studia", exact: true })
        .click();
      await page.getByRole("button", { name: "Macierze", exact: true }).click();
      await expect(
        page.getByRole("button", { name: /Wymiar macierzy/ }),
      ).toBeDisabled();
      await picker.getByRole("button", { name: "Trudny", exact: true }).click();
      await page.getByRole("button", { name: /Wymiar macierzy/ }).click();
      await picker
        .getByRole("button", { name: "Ekspert", exact: true })
        .click();
      await expect(page.locator(".unavailable")).toContainText(
        "Ta rodzina nie ma zadań",
      );
      await expect(page.locator(".question")).toHaveCount(0);
      await page
        .getByRole("button", { name: "Nowy przykład", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Wybierz dostępne zadanie", exact: true })
        .click();
      await expect(page.locator(".question")).toHaveAttribute(
        "data-difficulty",
        "expert",
      );
      await expect(page.locator(".question")).not.toHaveAttribute(
        "data-template-id",
        "matrix-dimensions",
      );
    });
    test("eksperckie macierze, pełne pola, reset kroków oraz granica historii brudnopisu", async ({
      page,
    }) => {
      await page
        .getByRole("button", { name: "Matematyka na studia", exact: true })
        .click();
      await page.getByRole("button", { name: "Macierze", exact: true }).click();
      await page.getByRole("button", { name: /Mnożenie macierzy AB/ }).click();
      await page.getByRole("button", { name: "Ekspert", exact: true }).click();
      const a = await matrix(page, "A"),
        b = await matrix(page, "B"),
        c = await matrix(page, "C");
      const ab = a.map((row) =>
        b[0].map((_, j) =>
          row.map((v, k) => mul(v, b[k][j])).reduce(add, r(0)),
        ),
      );
      const expected = ab[0].map((_, j) =>
        ab.map((row, i) => sub(row[j], mul(r(3, 2), c[j][i]))),
      );
      await expect(
        page.getByRole("table", { name: "Macierz wynikowa", exact: true }),
      ).toHaveCount(0);
      await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
      await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
      for (const [i, row] of expected.entries())
        for (const [j, v] of row.entries())
          await page
            .getByLabel(`Wiersz ${i + 1}, kolumna ${j + 1}`, { exact: true })
            .fill(text(v));
      await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
      await expect(page.locator(".feedback")).toHaveClass("feedback correct");
      await page
        .getByRole("button", { name: "Pokaż rozwiązanie", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Pokaż wszystkie kroki", exact: true })
        .click();
      expect(await matrix(page, "wynikowa")).toEqual(expected);
      await page.getByRole("button", { name: "Pisz", exact: true }).click();
      const notes = page.getByLabel("Notatki tekstowe");
      await notes.pressSequentially("poprzednie obliczenia");
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      await page
        .getByRole("button", { name: "Zaawansowany", exact: true })
        .click();
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("");
      await expect(page.locator(".solution-panel li")).toHaveCount(0);
      for (const field of await page.locator(".matrix-grid input").all())
        await expect(field).toHaveValue("");
      await page.getByLabel("Czyść brudnopis przy nowym zadaniu").uncheck();
      await notes.pressSequentially("zachowane");
      await notes.press("ControlOrMeta+a");
      await notes.press("Backspace");
      await page.getByRole("button", { name: "Ekspert", exact: true }).click();
      await notes.press("ControlOrMeta+z");
      await expect(notes).toHaveValue("zachowane");
    });
    test("eksperckie równanie liniowe i trzy przypadki równania kwadratowego po uproszczeniu", async ({
      page,
    }) => {
      await page
        .getByRole("button", { name: "Równania liniowe", exact: true })
        .click();
      await page.getByRole("button", { name: /Równanie z ułamkiem/ }).click();
      await page.getByRole("button", { name: "Ekspert", exact: true }).click();
      const sides = (await page.locator(".question").innerText())
        .split(":")[1]
        .replace(/\.$/, "")
        .split("=");
      const f = (x: Rational) => sub(parse(sides[0], x), parse(sides[1], x)),
        constant = f(r(0)),
        coefficient = sub(f(r(1)), constant),
        root = div(mul(r(-1), constant), coefficient);
      await page
        .getByLabel("Twoja odpowiedź", { exact: true })
        .fill(text(root));
      await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
      await expect(page.locator(".feedback")).toHaveClass("feedback correct");
      await page
        .getByRole("button", { name: "Matematyka na studia", exact: true })
        .click();
      await page
        .getByRole("button", { name: /Rozwiązywanie równania kwadratowego/ })
        .click();
      const seen = new Set<string>();
      for (let i = 0; i < 24 && seen.size < 3; i++) {
        const [left, right] = (await page.locator(".question").innerText())
          .split(":")[1]
          .replace(/\.$/, "")
          .split("=");
        const f = (x: Rational) => sub(parse(left, x), parse(right, x)),
          c = f(r(0)),
          b = div(sub(f(r(1)), f(r(-1))), r(2)),
          a = div(sub(add(f(r(1)), f(r(-1))), mul(r(2), c)), r(2));
        const delta = sub(mul(b, b), mul(r(4), mul(a, c)));
        const kind =
          delta.numerator < 0n
            ? "none"
            : delta.numerator === 0n
              ? "double"
              : "two";
        seen.add(kind);
        await page
          .getByLabel("Liczba pierwiastków rzeczywistych")
          .selectOption(kind);
        if (kind !== "none") {
          const sqrt = (n: bigint) => {
            let v = 0n;
            while (v * v < n) v++;
            expect(v * v).toBe(n);
            return v;
          };
          const s = r(sqrt(delta.numerator), sqrt(delta.denominator));
          const roots =
            kind === "double"
              ? [div(mul(r(-1), b), mul(r(2), a))]
              : [
                  div(sub(mul(r(-1), b), s), mul(r(2), a)),
                  div(add(mul(r(-1), b), s), mul(r(2), a)),
                ];
          for (const [i, v] of roots.entries())
            await page
              .getByLabel(`Pierwiastek ${i + 1}`, { exact: true })
              .fill(text(v));
        }
        await page
          .getByRole("button", { name: "Sprawdź", exact: true })
          .click();
        await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await page
          .getByRole("button", { name: "Pokaż rozwiązanie", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Pokaż wszystkie kroki", exact: true })
          .click();
        await expect(page.locator(".solution-panel")).toContainText(
          "Δ = b² − 4ac",
        );
        await page
          .getByRole("button", { name: "Nowy przykład", exact: true })
          .click();
      }
      expect(seen.size).toBe(3);
    });
    test("sesje advanced/expert: uczciwe pierwsze próby i rekomendacje przy górnej granicy", async ({
      page,
    }) => {
      await page
        .getByRole("button", { name: "Zaawansowany", exact: true })
        .click();
      await page
        .getByRole("button", {
          name: "Rozpocznij sesję (10 zadań)",
          exact: true,
        })
        .click();
      const complete = async (low = false) => {
        for (let i = 0; i < 10; i++) {
          await expect(page.locator(".question")).toHaveAttribute(
            "data-difficulty",
            low ? "expert" : /advanced|expert/,
          );
          const right = numeric(await page.locator(".question").innerText());
          if (i < (low ? 4 : 8)) {
            await page
              .getByLabel("Twoja odpowiedź", { exact: true })
              .fill(text(right));
            await page
              .getByRole("button", { name: "Sprawdź", exact: true })
              .click();
          } else if (low && i < 7) {
            await page
              .getByLabel("Twoja odpowiedź", { exact: true })
              .fill("99999");
            await page
              .getByRole("button", { name: "Sprawdź", exact: true })
              .click();
          } else if (!low && i === 8) {
            await page
              .getByRole("button", { name: "Pokaż rozwiązanie", exact: true })
              .click();
            await page
              .getByLabel("Twoja odpowiedź", { exact: true })
              .fill(text(right));
            await page
              .getByRole("button", { name: "Sprawdź", exact: true })
              .click();
          }
          await page
            .getByRole("button", {
              name: i === 9 ? "Zakończ sesję" : "Następne zadanie",
              exact: true,
            })
            .click();
        }
      };
      await complete();
      await expect(page.getByRole("status")).toHaveText(
        "Sugerowany poziom: Ekspert",
      );
      await page
        .getByRole("button", {
          name: "Rozpocznij kolejną sesję na sugerowanym poziomie",
          exact: true,
        })
        .click();
      await expect(page.locator(".question")).toHaveAttribute(
        "data-difficulty",
        "expert",
      );
      await complete();
      await expect(page.getByRole("status")).toHaveText(
        "Sugerowany poziom: Ekspert",
      );
      await page
        .getByRole("button", {
          name: "Rozpocznij kolejną sesję na sugerowanym poziomie",
          exact: true,
        })
        .click();
      await complete(true);
      await expect(page.getByRole("status")).toHaveText(
        "Sugerowany poziom: Zaawansowany",
      );
    });
  });
