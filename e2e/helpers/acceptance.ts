import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { makeUniversityTask, localizeUniversity } from "../../src/university/catalog";
import type { AnswerInput } from "../../src/answers";
import type { Difficulty } from "../../src/difficulty";
import { polishLearningText } from "./localization";
import { parseAnswer, equalRational } from "../../src/rational";

type Task = ReturnType<typeof makeUniversityTask>;
export type AcceptanceRow = { family: string; level: Difficulty; variants: readonly number[] };
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const categories = {
  "sequence-limits": ["Granice ciągów", "Limits of sequences"],
  "functions": ["Funkcje", "Functions"],
  "function-limits": ["Granice funkcji", "Limits of functions"],
  "derivatives": ["Pochodne", "Derivatives"],
  "matrices": ["Macierze", "Matrices"],
  "determinants": ["Wyznaczniki", "Determinants"],
  "systems": ["Układy równań", "Systems of equations"],
};
const levels = { easy: ["Łatwy", "Easy"], medium: ["Średni", "Medium"], hard: ["Trudny", "Hard"], advanced: ["Zaawansowany", "Advanced"], expert: ["Ekspert", "Expert"] };
async function fill(page: Page, input: AnswerInput) {
  if (typeof input === "string") {
    await page.locator("#answer").fill(input);
  } else if (input.kind === "matrix") {
    for (let i = 0; i < input.values.length; i++) for (let j = 0; j < input.values[i].length; j++)
      await page.locator(i === 0 && j === 0 ? "#answer" : `#answer-${i}-${j}`).fill(input.values[i][j]);
  } else if (input.kind === "system") {
    await page.locator("#answer").selectOption(input.classification);
    if (input.classification === "system-one") for (let i = 0; i < input.values.length; i++)
      await page.locator(`#system-value-${i}`).fill(input.values[i]);
  } else if (input.kind === "limit") {
    await page.locator("#answer").selectOption(input.classification);
    if (input.classification === "finite") await page.locator("#limit-value").fill(input.value);
  } else if (input.kind === "roots") {
    await page.locator("#answer").selectOption(input.classification);
    for (let i=0;i<input.values.length;i++) await page.locator(`#root-${i}`).fill(input.values[i]);
  } else if (input.kind === "list") {
    const fields = page.locator("form .coefficient-field input");
    await expect(fields).toHaveCount(input.values.length);
    for (let i = 0; i < input.values.length; i++) await fields.nth(i).fill(input.values[i]);
  } else if (input.kind === "choice") await page.locator("#answer").selectOption(input.value);
  else throw Error("Unexpected input");
}

export async function runPinnedAcceptance(
  page: Page, info: TestInfo, row: AcceptanceRow, locale: "pl" | "en", width: number,
  oracle: (task: Task) => AnswerInput,
  wrong: (answer: AnswerInput, task: Task) => AnswerInput,
  extensions?: {inspectPinned?: (page:Page,task:Task)=>Promise<void>},
) {
    test.setTimeout(180_000);
    const en = locale === "en", lang = en ? 1 : 0;
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text() + " " + message.location().url); });
    page.on("response", response => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
    page.on("requestfailed", request => errors.push(request.url() + ": " + request.failure()?.errorText));
    await page.setViewportSize({ width, height: 900 });
    // Reproducible generator order; production code has no QA backdoor.
    await page.addInitScript(() => { Date.now = () => 151169; });
    await page.goto("/");
    if (en) await button(page, "English").click();
    await button(page, en ? "University mathematics" : "Matematyka na studia").click();
    const candidates = Array.from({ length: 24 }, (_, v) => makeUniversityTask(row.family, v, row.level));
    const category = candidates[0].category as keyof typeof categories;
    await button(page, categories[category][lang]).click();
    await button(page, levels[row.level][lang]).click();
    const title = localizeUniversity(candidates[0], locale).title;
    await page.locator("button.exercise-item").filter({ has: page.getByText(title, { exact: true }) }).click();
    const pending = new Set<number>(row.variants);
    const witnessed: string[] = [];
    for (let attempt = 0; attempt < 24 && pending.size; attempt++) {
      await expect(page.locator(".question")).toHaveAttribute("data-template-id", row.family);
      await expect(page.locator(".question")).toHaveAttribute("data-difficulty", row.level);
      const displayed = await page.locator(".question").innerText();
      // Browser innerText collapses whitespace at line breaks. Mathematical
      // content must still identify exactly one variant after normalization.
      const normalized=(text:string)=>text.replace(/\s+/g," ").trim();
      let matches = candidates.filter(task => normalized(localizeUniversity(task, locale).question) === normalized(displayed));
      const rationalMatrices = (task: Task) => {
        const p = task.university;
        if (p.kind === "linear-matrix-practice") return p.matrices.map(item => item.values);
        if (p.kind === "determinant" || p.kind === "linear-inverse" || p.kind === "linear-rank") return [p.matrix];
        if (p.kind === "linear-application") return [p.matrix, p.rhs];
        if (p.kind === "linear-system" || p.kind === "linear-cramer-four" || p.kind === "linear-cramer-diagnostic") return [p.matrix.map((row, i) => [...row, p.rhs[i]])];
        if (p.kind === "linear-matrix-pair") return [p.first, p.second];
        if (p.kind === "linear-matrix-equation") return p.mode === "axb" ? [p.left, p.right, p.rhs] : [p.left, p.rhs];
        return [];
      };
      if (matches.some(task => rationalMatrices(task).length)) {
        // Read all operands in one browser call: some families put their data
        // entirely outside .question. Match both shapes and every exact entry.
        const tables = await page.locator(".linear-algebra-matrices .given-matrix, .determinant-display:not(.determinant-radical)").evaluateAll(nodes => nodes.map(table =>
          Array.from(table.querySelectorAll("tbody tr"), row => Array.from(row.querySelectorAll("td"), cell => cell.textContent ?? ""))));
        matches = matches.filter(task => {
          const expected = rationalMatrices(task);
          return expected.length === tables.length && expected.every((matrix, i) => matrix.length === tables[i].length && matrix.every((row, j) => row.length === tables[i][j].length && row.every((value, k) => {
            const parsed = parseAnswer(tables[i][j][k]);
            return parsed.kind === "valid" && equalRational(value, parsed.value);
          })));
        });
      }
      if (matches.some(task => task.university.kind === "determinant-radical-two")) {
        const shown = await page.locator(".determinant-radical td").allTextContents();
        // Parse visible a+b√d independently of the production radical formatter.
        const read = (text: string) => {
          const clean = text.replaceAll("−", "-").replaceAll(/\s/g, "");
          const [prefix, radicand] = clean.split("√");
          if (radicand === undefined) return { whole: Number(prefix), root: 0, radicand: null };
          const pair = /^(-?\d+)([+-])(\d*)$/.exec(prefix);
          return pair ? { whole: Number(pair[1]), root: (pair[2] === "-" ? -1 : 1) * Number(pair[3] || 1), radicand: Number(radicand) }
            : { whole: 0, root: Number(prefix === "-" ? -1 : prefix === "" || prefix === "+" ? 1 : prefix), radicand: Number(radicand) };
        };
        const cells = shown.map(read);
        matches = matches.filter(task => task.university.kind === "determinant-radical-two" && task.university.matrix.flat().length === cells.length && task.university.matrix.flat().every((value, i) =>
          value.whole === cells[i].whole && value.root === cells[i].root && (value.root === 0 || cells[i].radicand === (task.university as Extract<Task["university"], { kind: "determinant-radical-two" }>).radicand)));
      }
      expect(matches, "Rendered question must identify one exact variant").toHaveLength(1);
      const task = matches[0], variant = Number(task.id.split(":").at(-1));
      if (pending.has(variant)) {
        const view = localizeUniversity(task, locale), expected = oracle(task);
        const checked = async (kind: string) => {
          await button(page, en ? "Check" : "Sprawdź").click();
          await expect(page.locator(".feedback")).toHaveClass("feedback " + kind);
        };
        await checked("invalid");
        await fill(page, wrong(expected, task));
        await checked("incorrect");
        await expect(page.locator(".learning-hint")).toHaveCount(1);
        await expect(page.locator(".learning-hint").first()).toContainText(view.hint);
        await button(page, en ? "Show another hint" : "Pokaż kolejną podpowiedź").click();
        await expect(page.locator(".learning-hint")).toHaveCount(2);
        await expect(page.locator(".learning-hint").nth(1)).toContainText(view.nextHint);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
        await fill(page, expected);
        await checked("correct");
        await button(page, en ? "Show solution" : "Pokaż rozwiązanie").click();
        await button(page, en ? "Show all steps" : "Pokaż wszystkie kroki").click();
        await expect(page.locator(".solution-final")).toBeVisible();
        for (const step of view.solution ?? []) if (step.kind === "working") {
          await expect(page.locator(".solution-panel")).toContainText(step.action);
          await expect(page.locator(".solution-panel")).toContainText(step.reason);
        }
        await extensions?.inspectPinned?.(page,task);
        if (en) expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
        expect(errors).toEqual([]);
        witnessed.push(task.id);
        pending.delete(variant);
        if (pending.size === 0) await info.attach("solution", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
      }
      if (pending.size) await button(page, en ? "New example" : "Nowy przykład").click();
    }
    expect([...pending], "Every pinned variant must be visited").toEqual([]);
    expect(errors).toEqual([]);
    await info.attach("witnesses", { body: JSON.stringify({ locale, width, witnessed, errors }), contentType: "application/json" });
}
