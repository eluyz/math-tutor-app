import { describe, expect, it } from "vitest";
import { meanCopy } from "./st101Copy";

const fixtures = [
  { values: [3, 2, 2, 1, 2], total: "10", count: "5", mean: "2" },
  { values: [3, 3, 1, 16, 7, 13], total: "43", count: "6", mean: "43/6" },
  { values: [-5, -1, -1, 3, 4], total: "0", count: "5", mean: "0" },
  { values: [-2, -1, 0, 0, 0], total: "-3", count: "5", mean: "-3/5" },
];

describe("ST-101 original bilingual teaching", () => {
  it.each(fixtures)("explains every operation for $values in PL/EN", ({ values, total, count, mean }) => {
    const input = Object.freeze([...values]);
    const pl = meanCopy(input, "pl");
    const en = meanCopy(input, "en");
    for (const copy of [pl, en]) {
      expect(copy.prompt).toContain(values.join(", "));
      expect(copy.hints).toHaveLength(2);
      expect(copy.steps).toHaveLength(3);
      expect(copy.steps[0].calculation).toBe(`n = ${count}`);
      const terms = values.map((value) => value < 0 ? `(${value})` : String(value)).join(" + ");
      expect(copy.steps[1].calculation).toBe(`Σx = ${terms} = ${total}`);
      expect(copy.steps[2].calculation).toBe(`μ = (${total})/${count} = ${mean}`);
      expect(copy.conclusion).toContain(mean);
      for (const step of copy.steps) {
        expect(step.title.length).toBeGreaterThan(3);
        expect(step.explanation.length).toBeGreaterThan(15);
      }
      for (const feedback of Object.values(copy.feedback)) expect(feedback.length).toBeGreaterThan(10);
    }
    expect(pl.steps.map((step) => step.calculation)).toEqual(en.steps.map((step) => step.calculation));
    expect(pl.prompt).not.toBe(en.prompt);
    expect(pl.steps.map((step) => step.explanation)).not.toEqual(en.steps.map((step) => step.explanation));
    expect(Object.keys(pl.feedback)).toEqual(Object.keys(en.feedback));
    expect(input).toEqual(values);
  });

  it("does not leak the fractional answer into prompts or hints, or reuse an old answer", () => {
    for (const locale of ["pl", "en"] as const) {
      const first = meanCopy([3, 3, 1, 16, 7, 13], locale);
      expect(first.prompt + first.hints.join(" ")).not.toContain("43/6");
      const second = meanCopy([0, 0, 0, 1, 1, 1], locale);
      expect(second.steps[2].calculation).toBe("μ = (3)/6 = 1/2");
      expect(JSON.stringify(second)).not.toContain("43/6");
      expect(first.feedback.incorrect).not.toMatch(/you forgot|you divided|zapomniałeś|podzieliłeś/i);
    }
  });

  it("rejects invalid source data and unsupported locales instead of inventing a solution", () => {
    expect(() => meanCopy([], "pl")).toThrow();
    expect(() => meanCopy([1, NaN], "en")).toThrow();
    expect(() => meanCopy([1, 2], "de" as "pl")).toThrow(RangeError);
  });
});
