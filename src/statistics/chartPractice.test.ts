import { expect, it } from "vitest";
import { assessChartResponse, createChartPracticeTask } from "./chartPractice";
import { chartCopy } from "./st107Copy";

it("connects the chart lesson and preserves its exact four answer states", () => {
  const task = createChartPracticeTask("easy", 0);
  expect(task.lesson).toBe("charts");
  const correct = task.options.find(({ answer }) => answer.kind === "count" && answer.value === 0)!;
  const incorrect = task.options.find(option => option.id !== correct.id)!;
  expect(assessChartResponse(task, correct.id)).toBe("correct");
  expect(assessChartResponse(task, incorrect.id)).toBe("incorrect");
  expect(assessChartResponse(task, "")).toBe("empty");
  expect(assessChartResponse(task, "invalid")).toBe("invalid");
  expect(() => createChartPracticeTask("advanced", 0)).toThrow(RangeError);
  expect(() => createChartPracticeTask("expert", 0)).toThrow(RangeError);
});

it("presents the same measured counts, question identity and exact worked numbers in both languages", () => {
  for (const level of ["easy", "medium", "hard"] as const) {
    for (let seed = 0; seed < 256; seed++) {
      const task = createChartPracticeTask(level, seed);
      const en = chartCopy(task, "en");
      const pl = chartCopy(task, "pl");
      const expected = task.rows.map(({ category, value }) => ({ value: category, frequency: value }));
      expect(en.table.rows).toEqual(expected);
      expect(pl.table.rows).toEqual(expected);
      expect(en.chart.categoryAxis).toBe("Room");
      expect(pl.chart.categoryAxis).toBe("Sala");
      expect(en.chart.countAxis).toBe("Number of visits");
      expect(pl.chart.countAxis).toBe("Liczba wizyt");
      expect(en.options.map(option => option.id)).toEqual(task.options.map(option => option.id));
      expect(pl.options.map(option => option.id)).toEqual(en.options.map(option => option.id));
      expect(new Set(en.options.map(option => option.label)).size).toBe(3);
      expect(new Set(pl.options.map(option => option.label)).size).toBe(3);
      expect(en.prompt).toContain("Monday");
      expect(pl.prompt).toContain("poniedziałek");
      expect(en.hints).toHaveLength(2);
      expect(pl.hints).toHaveLength(2);
      expect(en.hints[0]).not.toBe(en.hints[1]);
      expect(pl.hints[0]).not.toBe(pl.hints[1]);
      expect(pl.steps[0].calculation).toBe(en.steps[0].calculation);
      expect(en.steps[0].calculation).toMatch(/^[A-E] = \d/);
      for (const copy of [en, pl]) {
        const correct = copy.options.find(({ id }) => assessChartResponse(task, id) === "correct")!;
        expect(copy.conclusion).toContain(correct.label);
        for (const { title, calculation, explanation } of copy.steps) {
          expect(title.length * calculation.length * explanation.length).toBeGreaterThan(0);
        }
      }
    }
  }
});

it("explains exactly what evidence is missing for cause, future and unplotted rooms", () => {
  for (const [seed, enLimit, plLimit] of [
    [1, /why people visited/, /powodach wizyt/],
    [3, /no observations from Tuesday/, /brak danych z wtorku/],
    [5, /other rooms in the building/, /pozostałych salach w budynku/],
  ] as const) {
    const task = createChartPracticeTask("hard", seed);
    const en = chartCopy(task, "en");
    const pl = chartCopy(task, "pl");
    expect(en.prompt).toContain("cannot be determined");
    expect(pl.prompt).toContain("nie da się ustalić");
    expect(en.steps.filter(step => step.title === "Supported by the counts")).toHaveLength(2);
    expect(pl.steps.filter(step => step.title === "Potwierdzają to liczby")).toHaveLength(2);
    expect(en.steps.find(step => step.title === "Evidence is missing")?.explanation).toMatch(enLimit);
    expect(pl.steps.find(step => step.title === "Brakuje danych")?.explanation).toMatch(plLimit);
  }
});

it("spells out direction, distinct sum operands and equality for the shown data", () => {
  for (let seed = 0; seed < 3; seed++) {
    const task = createChartPracticeTask("medium", seed);
    const query = task.query;
    if (!("left" in query)) throw new Error("Expected two rooms");
    const left = task.rows.find(row => row.category === query.left)!.value;
    const right = task.rows.find(row => row.category === query.right)!.value;
    const result = [`${left} = ${right}`, `|${left} − ${right}| = ${Math.abs(left - right)}`, `${left} + ${right} = ${left + right}`][seed];
    for (const locale of ["en", "pl"] as const) {
      const copy = chartCopy(task, locale);
      expect(copy.prompt).toContain(query.left);
      expect(copy.prompt).toContain(query.right);
      expect(copy.steps[0].calculation).toBe(`${query.left} = ${left}, ${query.right} = ${right}`);
      expect(copy.steps[1].calculation).toBe(result);
    }
  }
  expect(chartCopy(createChartPracticeTask("medium", 1), "en").prompt).toMatch(/absolute difference/);
  expect(chartCopy(createChartPracticeTask("medium", 1), "pl").prompt).toMatch(/wartość bezwzględna/);
  expect(() => chartCopy(createChartPracticeTask("easy", 0), "es" as "en")).toThrow(RangeError);
});
