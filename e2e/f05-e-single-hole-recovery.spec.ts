import { test, expect, type Page } from "@playwright/test";

/**
 * F05/e PUBLIC SYNTHETIC browser witness.
 * This does not recreate or certify the private P21/e figure.
 */
const fields = ["domain", "range", "increasing", "decreasing", "injective", "parity"] as const;
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const targetHoles = [[-3, -5], [-3, -7]];
const targetFilled = [[1, -2], [3, -3]];

for (const width of [375, 1280]) for (const locale of ["pl", "en"] as const) {
  test("F05/e single-hole recovered heights hard:2 " + locale + " " + width + "px", async ({ page }, info) => {
    test.setTimeout(120_000);
    const pl = locale === "pl", errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    page.on("response", response => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
    page.on("requestfailed", request => errors.push(request.url()));
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => { Date.now = () => 151169; });
    await page.goto("/");
    if (!pl) await button(page, "English").click();
    await button(page, pl ? "Matematyka na studia" : "University mathematics").click();
    await button(page, pl ? "Funkcje" : "Functions").click();
    await button(page, pl ? "Trudny" : "Hard").click();

    const title = pl
      ? "Sześć własności wykresu z dwiema pustymi kropkami przy jednym x"
      : "Six properties of a graph with two hollow points at one x";
    await page.locator("button.exercise-item")
      .filter({ has: page.getByText(title, { exact: true }) }).click();

    const figure = page.locator('figure[data-graph-kind="function-single-hole-recovery"]');
    let found = false;
    for (let i = 0; i < 24; i++) {
      const holes = await figure.getByTestId("single-hole-hollow").evaluateAll(nodes =>
        nodes.map(n => [Number(n.getAttribute("data-x")), Number(n.getAttribute("data-y"))]));
      const filled = await figure.getByTestId("single-hole-filled").evaluateAll(nodes =>
        nodes.map(n => [Number(n.getAttribute("data-x")), Number(n.getAttribute("data-y"))]));
      if (JSON.stringify(holes) === JSON.stringify(targetHoles) &&
          JSON.stringify(filled) === JSON.stringify(targetFilled)) { found = true; break; }
      await button(page, pl ? "Nowy przykład" : "New example").click();
    }
    expect(found, "bounded task cycle must contain synthetic hard:2").toBe(true);
    await expect(page.locator(".question")).toHaveAttribute("data-difficulty", "hard");
    await expect(page.locator(".question")).toHaveAttribute("data-template-id", "function-single-hole-recovery");
    await expect(figure.locator('svg[role="img"]')).toBeVisible();
    await expect(figure.getByTestId("single-hole-hollow")).toHaveCount(2);
    await expect(figure.getByTestId("single-hole-filled")).toHaveCount(2);
    await expect(figure.getByTestId("single-hole-tail-arrow")).toHaveCount(1);
    await expect(figure.getByTestId("single-hole-x-tick")).toHaveCount(3);
    for (const circle of await figure.getByTestId("single-hole-hollow").all()) {
      await expect(circle).toHaveAttribute("fill", "var(--color-bg, white)");
      await expect(circle).toHaveAttribute("stroke-width", "2.5");
    }
    for (const circle of await figure.getByTestId("single-hole-filled").all())
      await expect(circle).toHaveAttribute("fill", "#087f70");

    // Independent mathematical hard:2 model and SVG projection:
    // c=-3,B=-7,A=-5,H=-2,t=1,R=3,E=-3; left slope 3.
    // x-range [-8,4], y-range [-19,0].
    const px = (x: number) => 35 + (x + 8) * 330 / 12;
    const py = (y: number) => 230 - (y + 19) * 200 / 19;
    const branches = [
      { testid: "single-hole-left-tail", endpoints: [[-7, -17], [-3, -5]] },
      { testid: "single-hole-rise", endpoints: [[-3, -7], [1, -2]] },
      { testid: "single-hole-fall", endpoints: [[1, -2], [3, -3]] },
    ] as const;
    for (const branch of branches) {
      const line = figure.getByTestId(branch.testid);
      await expect(line).toHaveCount(1);
      const p1 = branch.endpoints[0], p2 = branch.endpoints[1];
      expect(Number(await line.getAttribute("x1"))).toBeCloseTo(px(p1[0]), 9);
      expect(Number(await line.getAttribute("y1"))).toBeCloseTo(py(p1[1]), 9);
      expect(Number(await line.getAttribute("x2"))).toBeCloseTo(px(p2[0]), 9);
      expect(Number(await line.getAttribute("y2"))).toBeCloseTo(py(p2[1]), 9);
    }
    expect(await figure.getByTestId("single-hole-x-tick").evaluateAll(nodes =>
      nodes.map(n => Number(n.getAttribute("data-x"))))).toEqual([-3, 1, 3]);

    const expected: Record<typeof fields[number], string> = {
      domain: "(−∞; −3) ∪ (−3; 3]",
      range: "(−∞; −2]",
      increasing: "(−∞; −3) ∪ (−3; 1]",
      decreasing: "[1; 3]",
      injective: pl ? "Nie" : "No",
      parity: pl ? "Ani parzysta, ani nieparzysta" : "Neither",
    };
    const select = (id: string) => page.locator(id === "domain" ? "#answer" : "#answer-" + id);
    const check = async (result: string) => {
      await button(page, pl ? "Sprawdź" : "Check").click();
      await expect(page.locator(".feedback")).toHaveClass("feedback " + result);
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
        nodes.map(n => ({ value: (n as HTMLOptionElement).value, label: n.textContent }))
          .find(n => n.value && n.label !== label)!.value, expected[id]);
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
    await expect(panel).toContainText(pl ? "Parzystość: żadna" : "Parity: neither");
    await expect(panel).toContainText("f(");
    await expect(page.locator(".solution-final")).toBeVisible();
    await expect(figure.locator("figcaption")).toContainText(pl ? "puste" : "hollow");
    await figure.locator("summary").click();
    await expect(figure.locator(".function-graph-text")).toContainText(pl ? "Obie puste wysokości" : "Both missing endpoint heights");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]);

    await info.attach("synthetic-F05e-six-field-witness", {
      body: JSON.stringify({ id: "function-single-hole-recovery:hard:2",
        locale, width, holes: targetHoles, filled: targetFilled, answers: expected, errors }),
      contentType: "application/json",
    });
    await info.attach("F05e-completed-screen", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });
}
