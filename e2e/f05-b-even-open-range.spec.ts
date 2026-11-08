import { test, expect, type Page } from "@playwright/test";

/** Public synthetic math witness; never assert source worksheet equivalence. */
const expectedHollows = [[-3, -3], [-3, 2], [3, 2], [3, -3]];
const fields = ["domain", "range", "increasing", "decreasing", "injective", "parity"] as const;
const button = (p: Page, name: string) => p.getByRole("button", { name, exact: true });

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  test("F05/b integrated six-field hard:2 " + locale + " at " + width + "px", async ({ page }, info) => {
    test.setTimeout(120_000);
    const pl = locale === "pl";
    const runtimeErrors: string[] = [];
    page.on("pageerror", err => runtimeErrors.push(err.message));
    page.on("console", msg => { if (msg.type() === "error") runtimeErrors.push(msg.text()); });
    page.on("requestfailed", req => runtimeErrors.push(req.url()));
    page.on("response", response => {
      if (response.status() >= 400) runtimeErrors.push(response.status() + " " + response.url());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => { Date.now = () => 151169; });
    await page.goto("/");
    if (!pl) await button(page, "English").click();
    await button(page, pl ? "Matematyka na studia" : "University mathematics").click();
    await button(page, pl ? "Funkcje" : "Functions").click();
    await button(page, pl ? "Trudny" : "Hard").click();

    const title = pl
      ? "Sześć właściwości parzystego wykresu z dziurami i otwartym zbiorem wartości"
      : "Six properties of an even graph with holes and an open range";
    await page.locator("button.exercise-item").filter({ has: page.getByText(title, { exact: true }) }).click();

    const figure = page.locator('figure[data-graph-kind="function-even-open-range"]');
    let selected = false;
    for (let attempt = 0; attempt < 24; attempt++) {
      const actual = await figure.getByTestId("even-open-hollow").evaluateAll(nodes =>
        nodes.map(node => [Number(node.getAttribute("data-x")), Number(node.getAttribute("data-y"))]));
      if (JSON.stringify(actual) === JSON.stringify(expectedHollows)) {
        // Variant 2 also has slope 3; it is unique within the 24 synthetic hard profiles.
        const outer = figure.getByTestId("even-open-outer");
        const x2 = Number(await outer.first().getAttribute("x2"));
        const x1 = Number(await outer.first().getAttribute("x1"));
        const y2 = Number(await outer.first().getAttribute("y2"));
        const y1 = Number(await outer.first().getAttribute("y1"));
        if (x2 > x1 && y2 > y1) { selected = true; break; }
      }
      await button(page, pl ? "Nowy przykład" : "New example").click();
    }
    expect(selected, "expected exact hard:2 hollow geometry in bounded variant cycle").toBe(true);
    await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", "function-even-open-range");

    await expect(figure.getByTestId("even-open-hollow")).toHaveCount(4);
    await expect(figure.getByTestId("even-open-tail-arrow")).toHaveCount(2);
    await expect(figure.getByTestId("even-open-outer")).toHaveCount(2);
    await expect(figure.getByTestId("even-open-inner")).toHaveCount(1);
    await expect(figure.getByTestId("even-open-center")).toHaveAttribute("data-y", "0");
    expect(await figure.getByTestId("even-open-x-tick").evaluateAll(nodes =>
      nodes.map(node => Number(node.getAttribute("data-x"))))).toEqual([-3, 0, 3]);
    for (const circle of await figure.getByTestId("even-open-hollow").all()) {
      await expect(circle).toHaveAttribute("fill", "var(--color-bg, white)");
      await expect(circle).toHaveAttribute("stroke-width", "2.3");
    }
    await expect(figure.locator("svg[role=img]")).toBeVisible();

    // Compare all 199 SVG samples to an independently calculated quadratic.
    // hard:2: f(x)=2(x/3)^2 on (-3,3), viewport x in [-7,7], y in [-4,10].
    const d = (await figure.getByTestId("even-open-inner").getAttribute("d"))!;
    const samples = [...d.matchAll(/[ML]\s+([\d.e+-]+)\s+([\d.e+-]+)/g)]
      .map(match => [Number(match[1]), Number(match[2])]);
    expect(samples).toHaveLength(199);
    for (let i = 0; i < 199; i++) {
      const x = -3 + 6 * (i + 1) / 200;
      const y = 2 * (x / 3) ** 2;
      expect(samples[i][0]).toBeCloseTo(32 + 336 * (x + 7) / 14, 8);
      expect(samples[i][1]).toBeCloseTo(225 - 195 * (y + 4) / 14, 8);
    }

    const expected: Record<typeof fields[number], string> = {
      domain: "(−∞; −3) ∪ (−3; 3) ∪ (3; +∞)",
      range: "(−3; +∞)",
      increasing: "[0; 3) ∪ (3; +∞)",
      decreasing: "(−∞; −3) ∪ (−3; 0]",
      injective: pl ? "Nie" : "No",
      parity: pl ? "Parzysta" : "Even",
    };
    const select = (id: string) => page.locator(id === "domain" ? "#answer" : "#answer-" + id);
    const check = async (status: string) => {
      await button(page, pl ? "Sprawdź" : "Check").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback " + status);
    };
    await check("invalid");
    await expect(page.locator('[data-field-result="missing"]')).toHaveCount(6);
    for (const id of fields) await select(id).selectOption({ label: expected[id] });
    await check("correct");
    await expect(page.locator('[data-field-result="correct"]')).toHaveCount(6);
    for (const id of fields) {
      await select(id).selectOption("");
      await check("invalid");
      await expect(page.locator('[data-field-result="missing"]')).toHaveCount(1);
      await select(id).selectOption({ label: expected[id] });
      const wrong = await select(id).locator("option").evaluateAll((nodes, label) =>
        nodes.map(node => ({ value: (node as HTMLOptionElement).value, label: node.textContent }))
          .find(option => option.value && option.label !== label)!.value, expected[id]);
      await select(id).selectOption(wrong);
      await check("incorrect");
      await expect(page.locator('[data-field-result="incorrect"]')).toHaveCount(1);
      await expect(page.locator('[data-field-result="correct"]')).toHaveCount(5);
      await select(id).selectOption({ label: expected[id] });
    }
    await check("correct");
    await button(page, pl ? "Pokaż rozwiązanie" : "Show solution").click();
    await button(page, pl ? "Pokaż wszystkie kroki" : "Show all steps").click();
    const panel = page.locator(".solution-panel");
    for (const id of fields.slice(0, 4)) await expect(panel).toContainText(expected[id]);
    await expect(panel).toContainText(pl ? "Różnowartościowość: nie" : "Injectivity: no");
    await expect(panel).toContainText(pl ? "Parzystość: parzysta" : "Parity: even");
    await expect(page.locator(".solution-final")).toBeVisible();
    await expect(figure.locator("figcaption")).toContainText(pl ? "puste" : "hollow");
    await figure.locator("summary").click();
    await expect(figure.locator(".function-graph-text")).toContainText(pl ? "parzysty" : "Even graph");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(runtimeErrors).toEqual([]);
    await info.attach("synthetic-six-field-witness", {
      body: JSON.stringify({ id: "function-even-open-range:hard:2", locale, width, hollows: expectedHollows, answers: expected, runtimeErrors }),
      contentType: "application/json",
    });
  });
}
