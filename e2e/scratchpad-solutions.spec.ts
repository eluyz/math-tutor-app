import { expect, test, type Page, type Locator } from "@playwright/test";

async function draw(page: Page, svg: Locator, erase = false) {
  await svg.scrollIntoViewIfNeeded();
  const box = (await svg.boundingBox())!;
  await page.mouse.move(box.x + box.width * .2, box.y + box.height * .3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .7, box.y + box.height * (erase ? .3 : .6), { steps: 8 });
  await page.mouse.up();
}
function solve(question: string) {
  const values = question.match(/\d+/g)!.map(Number);
  return String(question.startsWith("(") ? (values[0] + values[1]) * values[2] : question.includes("−") ? values[0] - values[1] * values[2] : values[0] + values[1] * values[2]);
}
for (const { name, viewport } of [
  { name: "desktop", viewport: { width: 1280, height: 900 } },
  { name: "telefon", viewport: { width: 375, height: 812 } },
  { name: "tablet", viewport: { width: 768, height: 1024 } },
]) test.describe(`MT-EDU-002A — ${name}`, () => {
  test.use({ viewport, hasTouch: name !== "desktop" }); test.setTimeout(60_000);
  const external = new WeakMap<Page, string[]>();
  test.beforeEach(async ({ page }) => {
    const requests: string[] = []; external.set(page, requests);
    page.on("request", (request) => { if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)) requests.push(request.url()); });
    await page.addInitScript(() => { Date.now = () => 42; });
    await page.goto("/");
    await page.getByRole("button", { name: /Najpierw mnożenie/ }).click();
  });
  test.afterEach(async ({ page }) => {
    expect(external.get(page)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  });

  test("notatki, symbole w zaznaczeniu, natywne undo/redo, tryby, rysunki i clear z undo", async ({ page }) => {
    const notes = page.getByRole("region", { name: "Brudnopis", exact: true });
    const text = page.getByLabel("Notatki tekstowe"), svg = page.getByRole("img", { name: "Pole rysowania" });
    await notes.getByRole("button", { name: "Pisz", exact: true }).click();
    await text.fill("abc def");
    await text.evaluate((el: HTMLTextAreaElement) => { el.focus(); el.setSelectionRange(1, 3); el.dispatchEvent(new Event("select", { bubbles: true })); });
    await notes.getByRole("button", { name: "Wstaw Δ", exact: true }).click();
    await expect(text).toHaveValue("aΔ def"); await expect(text).toBeFocused();
    await text.press("Control+z"); await expect(text).toHaveValue("abc def");
    await text.press("Control+Shift+z"); await expect(text).toHaveValue("aΔ def");
    await notes.getByRole("button", { name: "Rysuj", exact: true }).click();
    await draw(page, svg); await expect(svg.locator("[data-stroke]")).toHaveCount(1);
    await notes.getByRole("button", { name: "Cofnij", exact: true }).click(); await expect(svg.locator("[data-stroke]")).toHaveCount(0);
    await notes.getByRole("button", { name: "Ponów", exact: true }).click(); await expect(svg.locator("[data-stroke]")).toHaveCount(1);
    const points = await svg.locator("[data-stroke]").getAttribute("points");
    await notes.getByRole("button", { name: "Gumka", exact: true }).click(); await draw(page, svg, true);
    await expect(svg.locator("[data-stroke]")).toHaveCount(0);
    await notes.getByRole("button", { name: "Cofnij", exact: true }).click();
    await expect(svg.locator("[data-stroke]")).toHaveAttribute("points", points!);
    await notes.getByRole("button", { name: "Pisz", exact: true }).click(); await expect(text).toHaveValue("aΔ def");
    await notes.getByRole("button", { name: "Wyczyść wszystko", exact: true }).click(); await expect(text).toHaveValue("");
    await notes.getByRole("button", { name: "Cofnij", exact: true }).click(); await expect(text).toHaveValue("aΔ def");
    await notes.getByRole("button", { name: "Rysuj", exact: true }).click(); await expect(svg.locator("[data-stroke]")).toHaveCount(1);
    await notes.getByRole("button", { name: "Ponów", exact: true }).click(); await expect(svg.locator("[data-stroke]")).toHaveCount(0);
    await notes.getByRole("button", { name: "Pisz", exact: true }).click(); await expect(text).toHaveValue("");
  });

  test("powiększenie, focus trap, resize i anulowany/dotykowy wskaźnik nie tracą pracy", async ({ page }) => {
    const svg = page.getByRole("img", { name: "Pole rysowania" });
    await draw(page, svg);
    const points = await svg.locator("[data-stroke]").getAttribute("points");
    await page.getByRole("button", { name: "Powiększ", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Brudnopis", exact: true });
    await expect(dialog).toBeVisible(); await expect(dialog.getByRole("button", { name: "Zamknij", exact: true })).toBeFocused();
    await page.keyboard.press("Shift+Tab"); await expect(dialog.getByLabel("Czyść brudnopis przy nowym zadaniu")).toBeFocused();
    await page.keyboard.press("Tab"); await expect(dialog.getByRole("button", { name: "Zamknij", exact: true })).toBeFocused();
    await page.setViewportSize({ width: viewport.height, height: viewport.width });
    await expect(svg.locator("[data-stroke]")).toHaveAttribute("points", points!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.keyboard.press("Escape"); await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Powiększ", exact: true })).toBeFocused();
    await page.setViewportSize(viewport);
    // Real Chromium touch input establishes pointer capture and cancellation.
    await svg.scrollIntoViewIfNeeded();
    const box = (await svg.boundingBox())!;
    const cdp = await page.context().newCDPSession(page);
    const position = { x: box.x + 20, y: box.y + 20 };
    const scroll = await page.evaluate(() => scrollY);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [position] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...position, x: position.x + 60 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await expect(svg.locator("polyline")).toHaveCount(1);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [position] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...position, x: position.x + 60 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(svg.locator("[data-stroke]")).toHaveCount(2);
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    await cdp.detach();
  });

  test("auto-clear ON/OFF, przejścia między zadaniami i sesjami, niezależny reset rozwiązania", async ({ page }) => {
    const notes = page.getByLabel("Notatki tekstowe");
    const auto = page.getByLabel("Czyść brudnopis przy nowym zadaniu");
    await expect(auto).toBeChecked();
    await page.getByRole("button", { name: "Pisz", exact: true }).click(); await notes.fill("poprzednie zadanie");
    await page.getByRole("button", { name: "Nowy przykład", exact: true }).click(); await expect(notes).toHaveValue("");
    await expect(page.getByRole("button", { name: "Cofnij", exact: true })).toBeDisabled();
    await notes.focus(); await notes.press("Control+z"); await expect(notes).toHaveValue("");
    await auto.uncheck(); await notes.fill("zachowaj x²");
    await page.getByRole("button", { name: "Rysuj", exact: true }).click(); await draw(page, page.getByRole("img", { name: "Pole rysowania" }));
    await page.getByRole("button", { name: "Pisz", exact: true }).click();
    await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).click();
    await expect(page.locator(".solution-panel li")).toHaveCount(1);
    await page.getByRole("button", { name: "Pokaż wszystkie kroki", exact: true }).click(); await expect(page.locator(".solution-final")).toBeVisible();
    await page.getByLabel("Twoja odpowiedź", { exact: true }).fill("9999"); await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
    await page.getByRole("button", { name: "Pokaż kolejną podpowiedź" }).click(); await expect(notes).toHaveValue("zachowaj x²");
    const transitions = [
      page.getByRole("button", { name: "Nowy przykład", exact: true }),
      page.getByRole("button", { name: "Trudny", exact: true }),
      page.getByRole("button", { name: /Nawias ma pierwszeństwo/ }),
      page.getByRole("button", { name: "Matematyka na studia", exact: true }),
      page.getByRole("button", { name: "Macierze", exact: true }),
      page.getByRole("button", { name: /Mnożenie macierzy AB/ }),
    ];
    for (const target of transitions) {
      await target.click(); await expect(notes).toHaveValue("zachowaj x²");
      await expect(page.locator(".solution-panel li")).toHaveCount(0);
      await expect(page.locator(".exercise-panel > form input, .exercise-panel > form select").first()).toHaveValue("");
    }
    await page.getByRole("button", { name: "Rysuj", exact: true }).click();
    await expect(page.locator("[data-stroke]")).toHaveCount(1);
    await page.getByRole("button", { name: "Pisz", exact: true }).click();
    await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)", exact: true }).click();
    for (let i = 0; i < 10; i++) { await expect(notes).toHaveValue("zachowaj x²"); await page.getByRole("button", { name: i === 9 ? "Zakończ sesję" : "Następne zadanie", exact: true }).click(); }
    await page.getByRole("button", { name: "Rozpocznij sesję na obecnym poziomie", exact: true }).click(); await expect(notes).toHaveValue("zachowaj x²");
    await auto.check(); await page.getByRole("button", { name: "Następne zadanie", exact: true }).click();
    await expect(notes).toHaveValue(""); await expect(page.locator("[data-stroke]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cofnij", exact: true })).toBeDisabled();
  });

  test("pełne rozwiązanie podstawowe i macierzowe: bez przecieku, kolejne kroki i poprawny wynik", async ({ page }) => {
    const right = solve(await page.locator(".question").innerText());
    await expect(page.locator(".solution-panel li")).toHaveCount(0); await expect(page.locator(".solution-final")).toHaveCount(0);
    await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).focus(); await page.keyboard.press("Enter");
    await expect(page.locator(".solution-panel li")).toHaveCount(1); await expect(page.locator(".solution-panel h5")).toBeFocused();
    await page.keyboard.press("Tab"); await page.keyboard.press("Enter"); await expect(page.locator(".solution-panel li")).toHaveCount(2);
    await page.getByRole("button", { name: "Pokaż wszystkie kroki", exact: true }).click();
    await expect(page.locator(".solution-final .solution-answer")).toHaveText(right.replace(/-/g, "−"));
    await page.getByRole("button", { name: "Matematyka na studia", exact: true }).click();
    await page.getByRole("button", { name: "Macierze", exact: true }).click(); await page.getByRole("button", { name: /Mnożenie macierzy AB/ }).click();
    const read = async (label: string) => page.getByRole("table", { name: `Macierz ${label}`, exact: true }).locator("tbody tr").evaluateAll((rows) => rows.map((row) => [...row.querySelectorAll("td")].map((td) => Number(td.textContent!.replace(/−/g, "-")))));
    const a = await read("A"), b = await read("B");
    const result = a.map((row) => b[0].map((_, j) => row.reduce((sum, value, k) => sum + value * b[k][j], 0)));
    await expect(page.getByRole("table", { name: "Macierz wynikowa", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).click();
    await expect(page.locator(".solution-panel li")).toHaveCount(1);
    await page.getByRole("button", { name: "Następny krok", exact: true }).click(); await expect(page.locator(".solution-panel")).toContainText("wiersz 1 macierzy A × kolumna 1 macierzy B");
    await page.getByRole("button", { name: "Pokaż wszystkie kroki", exact: true }).click();
    expect(await read("wynikowa")).toEqual(result);
    await expect(page.getByRole("button", { name: "Następny krok", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Nowy przykład", exact: true }).click();
    await expect(page.locator(".solution-panel li")).toHaveCount(0);
  });

  test("auto-clear ON tworzy granicę historii także przy ponownym uruchomieniu identycznego zadania", async ({ page }) => {
    await page.getByRole("button", { name: "Pisz", exact: true }).click();
    const notes = page.getByLabel("Notatki tekstowe");
    for (const target of [
      page.getByRole("button", { name: "Średni", exact: true }),
      page.getByRole("button", { name: /Nawias ma pierwszeństwo/ }),
      page.getByRole("button", { name: "Liczby dodatnie i ujemne", exact: true }),
      page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)", exact: true }),
    ]) {
      await notes.fill("nie przywracaj"); await target.click();
      await expect(notes).toHaveValue(""); await expect(page.getByRole("button", { name: "Cofnij", exact: true })).toBeDisabled();
    }
    const question = await page.locator(".question").innerText();
    await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).click();
    await notes.fill("poprzednie uruchomienie");
    await page.getByRole("link", { name: "Math Tutor — strona startowa", exact: true }).click();
    await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)", exact: true }).click();
    await expect(page.locator(".question")).toHaveText(question);
    await expect(notes).toHaveValue(""); await expect(page.locator(".solution-panel li")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cofnij", exact: true })).toBeDisabled();
    await notes.focus(); await notes.press("Control+z"); await expect(notes).toHaveValue("");
  });

  test("długie rozwiązania ułamkowe: Sarrus i trzy klasyfikacje pierwiastków", async ({ page }) => {
    await page.getByRole("button", { name: "Matematyka na studia", exact: true }).click();
    await page.getByRole("button", { name: "Wyznaczniki", exact: true }).click();
    await page.getByRole("button", { name: /Wyznacznik 3×3 — Sarrus/ }).click();
    await page.getByRole("button", { name: "Trudny", exact: true }).click();
    await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).click();
    await page.getByRole("button", { name: "Pokaż wszystkie kroki", exact: true }).click();
    await expect(page.locator(".solution-panel li")).toHaveCount(10);
    await expect(page.locator(".solution-panel li").filter({ hasText: /Iloczyn [1-6]:/ })).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.getByRole("button", { name: "Wzory i równania kwadratowe", exact: true }).click();
    await page.getByRole("button", { name: /Rozwiązywanie równania kwadratowego/ }).click();
    const seen = new Set<string>();
    for (let i = 0; i < 24 && seen.size < 3; i++) {
      const q = await page.locator(".question").innerText();
      const m = q.match(/(\d+)x² ([+−]) (\d+)x ([+−]) (\d+) = 0/)!;
      const a = Number(m[1]), b = Number(m[3]) * (m[2] === "−" ? -1 : 1), c = Number(m[5]) * (m[4] === "−" ? -1 : 1);
      const delta = b * b - 4 * a * c;
      const classification = delta < 0 ? "Brak pierwiastków rzeczywistych" : delta === 0 ? "Jeden pierwiastek podwójny" : "Dwa różne pierwiastki rzeczywiste";
      await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).click();
      await page.getByRole("button", { name: "Pokaż wszystkie kroki", exact: true }).click();
      await expect(page.locator(".solution-final")).toContainText(classification);
      await expect(page.locator(".solution-panel")).toContainText("Δ = b² − 4ac");
      seen.add(classification);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      await page.getByRole("button", { name: "Nowy przykład", exact: true }).click();
    }
    expect(seen.size).toBe(3);
  });

  test("sesja: reveal przed oceną, po incorrect/correct i skip dają rzetelną sumę 10", async ({ page }) => {
    await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)", exact: true }).click();
    for (let i = 0; i < 10; i++) {
      const answer = page.getByLabel("Twoja odpowiedź", { exact: true });
      const submit = async (value: string) => { await answer.fill(value); await page.getByRole("button", { name: "Sprawdź", exact: true }).click(); };
      const right = solve(await page.locator(".question").innerText());
      if (i === 0 || i === 1) {
        if (i === 0) await submit("abc");
        await expect(page.locator("#solution-warning")).toBeVisible();
        await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).click();
        await page.getByRole("button", { name: "Pokaż wszystkie kroki", exact: true }).click(); await submit(right);
      } else if (i === 2) {
        await submit("99999"); await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).click(); await submit(right);
      } else if (i !== 9) {
        await submit(right);
        if (i === 3) await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).click();
      }
      await page.getByRole("button", { name: i === 9 ? "Zakończ sesję" : "Następne zadanie", exact: true }).click();
    }
    const summary = page.getByRole("region", { name: "Sesja zakończona!" });
    for (const [label, value] of [["Poprawne za pierwszą ważną próbą", "6/10"], ["Wymagały poprawy po pierwszej ważnej próbie", "1"], ["Rozwiązanie obejrzane przed pierwszą ważną oceną", "2"], ["Pominięte bez ważnej oceny", "1"]])
      await expect(summary.getByText(label, { exact: true }).locator("..").locator("dd")).toHaveText(value);
    await expect(summary).toContainText("Sugerowany poziom: Łatwy");
  });
});
