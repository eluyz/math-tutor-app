import { expect, test, type Page } from "@playwright/test";

// Never disable Chromium sandbox for sprint evidence.
test.use({launchOptions:{chromiumSandbox:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined}});

async function unloadIsProtected(page: Page) {
  return page.evaluate(() => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
}

for (const width of [1280, 375]) {
  test.describe(`unfinished work navigation at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test.beforeEach(async ({ page }) => { await page.goto("/"); });

    test("logo, progress, subjects and locale preserve an active session", async ({ page }) => {
      const workspace = page.locator(".learning-workspace:not(.statistics-practice)");
      await page.getByRole("button", { name: "Rozpocznij sesję (10 zadań)", exact: true }).click();
      await page.getByLabel("Twoja odpowiedź", { exact: true }).fill("123");
      await page.getByRole("button", { name: "Pokaż brudnopis", exact: true }).click();
      await page.getByRole("button", { name: "Pisz", exact: true }).click();
      await page.getByLabel("Notatki tekstowe").fill("Własny tok obliczeń");
      await page.getByRole("button", { name: "Pokaż rozwiązanie", exact: true }).click();
      const question = await workspace.locator(".question").textContent();
      const run = await workspace.locator(".question").getAttribute("data-exercise-run");
      await page.locator(".brand").click();
      await expect(page.getByLabel("Twoja odpowiedź", { exact: true })).toHaveValue("123");
      await page.getByRole("button", { name: "Moje postępy", exact: true }).click();
      await page.getByRole("button", { name: "Ćwiczenia", exact: true }).click();
      await page.getByRole("button", { name: /Statystyka i prawdopodobieństwo/ }).click();
      await page.getByRole("button", { name: /Ekonometria/ }).click();
      await page.locator(".brand").click();
      await page.getByRole("button", { name: "English", exact: true }).click();
      await expect(workspace.locator("#answer")).toHaveValue("123");
      await expect(workspace.locator(".scratchpad textarea")).toHaveValue("Własny tok obliczeń");
      await expect(workspace.locator(".solution-panel ol > li")).toHaveCount(1);
      await expect(workspace.locator(".question")).toHaveText(question!);
      await expect(workspace.locator(".question")).toHaveAttribute("data-exercise-run", run!);
      await expect(workspace.locator(".session-progress")).toContainText("exercise 1 of 10");
      await expect(workspace.locator(".category-picker button").first()).toBeDisabled();
      await expect(workspace.locator(".difficulty-picker button").first()).toBeDisabled();
      await expect(page.locator(".view-navigation button").last()).toBeDisabled();
      expect(await unloadIsProtected(page)).toBe(true);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.locator("#main-content")).toHaveCount(1);
      await page.locator(".skip-link").focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("main")).toBeFocused();
    });

    test("Statistics keeps draft, hints and task while hidden without stealing initial focus", async ({ page }) => {
      await expect(page.locator("#st101-answer")).toHaveCount(0);
      await page.getByRole("button", { name: "Nowy przykład", exact: true }).click();
      await expect(page.locator("#answer")).toBeFocused();
      await page.getByRole("button", { name: /Statystyka i prawdopodobieństwo/ }).click();
      const stats = page.locator(".statistics-practice");
      await stats.getByLabel("Twoja odpowiedź", { exact: true }).fill("7/3");
      await stats.getByRole("button", { name: "Pokaż podpowiedź", exact: true }).click();
      const question = await stats.locator(".question").textContent();
      await page.getByRole("button", { name: /Ekonometria/ }).click();
      expect(await unloadIsProtected(page)).toBe(true);
      await page.getByRole("button", { name: /Statystyka i prawdopodobieństwo/ }).click();
      await expect(stats.getByLabel("Twoja odpowiedź", { exact: true })).toHaveValue("7/3");
      await expect(stats.locator(".question")).toHaveText(question!);
      await expect(stats.locator(".learning-hint")).toHaveCount(1);
      await page.getByRole("button", { name: "English", exact: true }).click();
      await expect(stats.getByLabel("Your answer", { exact: true })).toHaveValue("7/3");
      await stats.getByRole("button", { name: "Check", exact: true }).click();
      expect(await unloadIsProtected(page)).toBe(false);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.locator("#main-content")).toHaveCount(1);
    });

    test("free-practice draft warns on unload, clearing or submitting releases it", async ({ page }) => {
      expect(await unloadIsProtected(page)).toBe(false);
      await page.getByRole("button", { name: "Nowy przykład", exact: true }).click();
      await page.locator("#answer").fill("0");
      expect(await unloadIsProtected(page)).toBe(true);
      await page.locator("#answer").fill("");
      expect(await unloadIsProtected(page)).toBe(false);
      await page.locator("#answer").fill("0");
      await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
      expect(await unloadIsProtected(page)).toBe(false);
      await page.locator("#answer").fill("1");
      expect(await unloadIsProtected(page)).toBe(true);
    });
  });
}

test('cancel replacing a free draft and deliberately accept a new task', async ({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Rozpocznij ćwiczenie',exact:true}).click();
  const answer=page.locator('.learning-workspace #answer'); await answer.fill('123');
  const question=await page.locator('.learning-workspace .question').textContent();
  page.once('dialog',dialog=>dialog.dismiss());
  await page.locator('.learning-workspace .difficulty-picker').getByRole('button',{name:'Średni',exact:true}).click();
  await expect(answer).toHaveValue('123'); await expect(page.locator('.learning-workspace .question')).toHaveText(question!);
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('.learning-workspace .difficulty-picker').getByRole('button',{name:'Średni',exact:true}).click();
  await expect(answer).toHaveValue('');
});

test('cancel replacing a Statistics draft',async({page})=>{
  await page.goto('/'); await page.getByRole('button',{name:/Statystyka i prawdopodobieństwo/}).click();
  const stats=page.locator('.statistics-practice'); await stats.locator('#st101-answer').fill('123');
  page.once('dialog',dialog=>dialog.dismiss());
  await stats.getByRole('button',{name:'Średni',exact:true}).click();
  await expect(stats.locator('#st101-answer')).toHaveValue('123');
  await expect(stats.getByRole('button',{name:'Łatwy',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('native reload warning can be cancelled without losing the draft',async({page})=>{
  await page.goto('/'); await page.getByRole('button',{name:'Rozpocznij ćwiczenie',exact:true}).click();
  await page.locator('.learning-workspace #answer').fill('123');
  const dialog=page.waitForEvent('dialog');
  const reload=page.reload().catch(()=>null);
  const warning=await dialog; expect(warning.type()).toBe('beforeunload'); await warning.dismiss(); await reload;
  await expect(page.locator('.learning-workspace #answer')).toHaveValue('123');
});

test('unsupported difficulty retains scratchpad with auto-clear disabled',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Matematyka na studia',exact:true}).click();
  await page.getByRole('button',{name:'Macierze',exact:true}).click();
  await page.locator('.learning-workspace:not(.statistics-practice) .difficulty-picker').getByRole('button',{name:'Trudny',exact:true}).click();
  await page.getByRole('button',{name:/Wymiar macierzy/}).click();
  await page.getByRole('button',{name:'Pokaż brudnopis',exact:true}).click();
  await page.getByRole('button',{name:'Pisz',exact:true}).click();
  const scratch=page.locator('.learning-workspace:not(.statistics-practice) .scratchpad');
  await scratch.getByRole('checkbox').uncheck();
  await page.getByLabel('Notatki tekstowe').fill('Nie gub obliczeń');
  await page.locator('.learning-workspace:not(.statistics-practice) .difficulty-picker').getByRole('button',{name:'Ekspert',exact:true}).click();
  await expect(page.locator('.unavailable')).toBeVisible();
  await page.getByRole('button',{name:'Wybierz dostępne zadanie',exact:true}).click();
  await expect(page.getByLabel('Notatki tekstowe')).toHaveValue('Nie gub obliczeń');
  await expect(scratch.getByRole('checkbox')).not.toBeChecked();
});
