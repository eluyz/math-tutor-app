import { describe, expect, it } from "vitest";
import { medianCopy } from "./st102Copy";
import { varianceCopy } from "./st103Copy";
import { generateMeanDataset } from "./datasets";

const medians = [
  {values:[4,1,4,8,2], ordered:"[1, 2, 4, 4, 8]", ranks:"n = 5; k = 3", result:"Me = x[3] = 4"},
  {values:[5,0,-2,1], ordered:"[-2, 0, 1, 5]", ranks:"n = 4; k₁ = 2; k₂ = 3", result:"Me = (x[2] + x[3])/2 = ((0) + (1))/2 = 1/2"},
  {values:[-5,-1,-1,3,4], ordered:"[-5, -1, -1, 3, 4]", ranks:"n = 5; k = 3", result:"Me = x[3] = −1"},
  {values:[1,1,1,1], ordered:"[1, 1, 1, 1]", ranks:"n = 4; k₁ = 2; k₂ = 3", result:"Me = (x[2] + x[3])/2 = ((1) + (1))/2 = 1"},
  {values:[-3,-2,-1,0], ordered:"[-3, -2, -1, 0]", ranks:"n = 4; k₁ = 2; k₂ = 3", result:"Me = (x[2] + x[3])/2 = ((−2) + (−1))/2 = −3/2"},
];
const variances = [
  {values:[0,0,0,1,1,1], mean:"μ = (0 + 0 + 0 + 1 + 1 + 1)/6 = 1/2", deviations:[
    "(0 − (1/2))² = (−1/2)² = 1/4", "(0 − (1/2))² = (−1/2)² = 1/4", "(0 − (1/2))² = (−1/2)² = 1/4",
    "(1 − (1/2))² = (1/2)² = 1/4", "(1 − (1/2))² = (1/2)² = 1/4", "(1 − (1/2))² = (1/2)² = 1/4",
  ], sum:"Σ(x − μ)² = 1/4 + 1/4 + 1/4 + 1/4 + 1/4 + 1/4 = 3/2", result:"σ² = (3/2)/6 = 1/4"},
  {values:[2,2,2,2,2], mean:"μ = (2 + 2 + 2 + 2 + 2)/5 = 2", deviations:[
    "(2 − (2))² = (0)² = 0", "(2 − (2))² = (0)² = 0", "(2 − (2))² = (0)² = 0", "(2 − (2))² = (0)² = 0", "(2 − (2))² = (0)² = 0",
  ], sum:"Σ(x − μ)² = 0 + 0 + 0 + 0 + 0 = 0", result:"σ² = (0)/5 = 0"},
  {values:[-1,1], mean:"μ = ((-1) + 1)/2 = 0", deviations:[
    "(-1 − (0))² = (−1)² = 1", "(1 − (0))² = (1)² = 1",
  ], sum:"Σ(x − μ)² = 1 + 1 = 2", result:"σ² = (2)/2 = 1"},
  {values:[-5,-1,-1,3,4], mean:"μ = ((-5) + (-1) + (-1) + 3 + 4)/5 = 0", deviations:[
    "(-5 − (0))² = (−5)² = 25", "(-1 − (0))² = (−1)² = 1", "(-1 − (0))² = (−1)² = 1", "(3 − (0))² = (3)² = 9", "(4 − (0))² = (4)² = 16",
  ], sum:"Σ(x − μ)² = 25 + 1 + 1 + 9 + 16 = 52", result:"σ² = (52)/5 = 52/5"},
  {values:[-2,-1,0,0,0], mean:"μ = ((-2) + (-1) + 0 + 0 + 0)/5 = −3/5", deviations:[
    "(-2 − (−3/5))² = (−7/5)² = 49/25", "(-1 − (−3/5))² = (−2/5)² = 4/25", "(0 − (−3/5))² = (3/5)² = 9/25", "(0 − (−3/5))² = (3/5)² = 9/25", "(0 − (−3/5))² = (3/5)² = 9/25",
  ], sum:"Σ(x − μ)² = 49/25 + 4/25 + 9/25 + 9/25 + 9/25 = 16/5", result:"σ² = (16/5)/5 = 16/25"},
];

describe("ST-102/103 original bilingual teaching", () => {
  it.each(medians)("shows every median calculation for $values", ({values,ordered,ranks,result}) => {
    const source=Object.freeze([...values]);
    for (const locale of ["pl","en"] as const) {
      const copy=medianCopy(source,locale);
      expect(copy.prompt).toContain(values.join(", "));
      expect(copy.steps.map(x=>x.calculation)).toEqual([`x↑ = ${ordered}`,ranks,result]);
      expect(copy.hints).toHaveLength(2);
      for (const step of copy.steps) expect(step.explanation.length).toBeGreaterThan(15);
    }
    expect(source).toEqual(values);
  });

  it.each(variances)("shows mean, every squared deviation, sum and divisor n for $values", ({values,mean,deviations,sum,result}) => {
    const source=Object.freeze([...values]);
    for (const locale of ["pl","en"] as const) {
      const copy=varianceCopy(source,locale);
      expect(copy.prompt).toContain(values.join(", "));
      expect(copy.prompt).toMatch(locale==="pl" ? /wariancję populacyjną/ : /population variance/);
      expect(copy.steps.map(x=>x.calculation)).toEqual([mean,deviations.join("\n"),sum,result]);
      expect(copy.hints).toHaveLength(2);
      expect(copy.steps[3].explanation).toContain("n−1");
      for (const step of copy.steps) expect(step.explanation.length).toBeGreaterThan(15);
    }
    expect(source).toEqual(values);
  });

  it.each(["easy","medium","hard"] as const)("has complete equivalent PL/EN calculations and feedback for %s data", (difficulty) => {
    for (let seed=0;seed<16;seed++) {
      const {values}=generateMeanDataset(difficulty,seed);
      for (const makeCopy of [medianCopy,varianceCopy]) {
        const pl=makeCopy(values,"pl"); const en=makeCopy(values,"en");
        expect(pl.steps.map(x=>x.calculation)).toEqual(en.steps.map(x=>x.calculation));
        expect(pl.prompt).not.toBe(en.prompt);
        expect(pl.steps.map(x=>x.explanation)).not.toEqual(en.steps.map(x=>x.explanation));
        expect(Object.keys(pl.feedback)).toEqual(Object.keys(en.feedback));
        for (const copy of [pl,en]) {
          expect(copy.hints.every(h=>h.length>15)).toBe(true);
          for (const feedback of Object.values(copy.feedback)) expect(feedback.length).toBeGreaterThan(10);
          expect(copy.feedback.incorrect).not.toMatch(/you forgot|you used|zapomniałeś|użyłeś/i);
          expect(copy.conclusion).toContain(copy.steps.at(-1)!.calculation.split(" = ").at(-1)!);
        }
      }
    }
  });

  it("does not leak fractional answers into prompts/hints or retain another dataset's answer", () => {
    for (const locale of ["pl","en"] as const) {
      const median=medianCopy([5,0,-2,1],locale);
      expect(median.prompt+median.hints.join(" ")).not.toContain("1/2");
      const variance=varianceCopy([0,0,0,1,1,1],locale);
      expect(variance.prompt+variance.hints.join(" ")).not.toContain("1/4");
      expect(JSON.stringify(varianceCopy([2,2,2,2,2],locale))).not.toContain("1/4");
    }
  });

  it("rejects malformed data and unsupported locales", () => {
    for (const copy of [medianCopy,varianceCopy]) {
      expect(()=>copy([],"pl")).toThrow();
      expect(()=>copy([1,Infinity],"en")).toThrow();
      expect(()=>copy([1,2],"de" as "pl")).toThrow(RangeError);
    }
  });
});
