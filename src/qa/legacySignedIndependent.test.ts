import { describe, expect, it } from "vitest";
import { assessAnswer } from "../answers";
import { getAnswerSpec } from "../exercises";
import { taskPool } from "../generators";

/**
 * QA-003 follow-up: legacy signed arithmetic, independently reconstructed
 * from the *visible question string*, not from task.parameters or from
 * the implementation's calculation of task.answer.
 *
 * Bounded scope: three legacy families × easy/medium/hard, including the
 * explicit supplemental exercises. This is a separate in-repository oracle
 * regression suite, not a human PL/EN pedagogical sign-off.
 */
const families = ["signed-add", "signed-subtract-negative", "signed-product"] as const;
const levels = ["easy", "medium", "hard"] as const;
type Family = (typeof families)[number];

function readVisibleQuestion(family: Family, visibleQuestion: string): {
  answer: bigint;
  explainedCalculation: string;
  absoluteDifference?: bigint;
} {
  // Production typography uses U+2212; normalize only its notation.
  const q = visibleQuestion.replace(/−/g, "-");
  if (family === "signed-add") {
    const m = /^-(\d+) \+ (\d+) = \?$/.exec(q);
    if (!m) throw Error("Unexpected visible signed addition: " + visibleQuestion);
    const a = BigInt(m[1]), b = BigInt(m[2]);
    return { answer: b - a, explainedCalculation: `${b} - ${a} = ${b - a}`,
      absoluteDifference: a > b ? a - b : b - a };
  }
  if (family === "signed-subtract-negative") {
    const m = /^(-?\d+) - \(-(?<b>\d+)\) = \?$/.exec(q);
    if (!m) throw Error("Unexpected visible subtract-negative: " + visibleQuestion);
    const a = BigInt(m[1]), b = BigInt(m.groups!.b);
    return { answer: a + b, explainedCalculation: `${a} + ${b} = ${a + b}` };
  }
  const m = /^\(-(\d+)\) × (\d+)(?: × \((-?\d+)\))? = \?$/.exec(q);
  if (!m) throw Error("Unexpected visible signed multiplication: " + visibleQuestion);
  const a = BigInt(m[1]), b = BigInt(m[2]), c = m[3] === undefined ? 1n : BigInt(m[3]);
  const first = -a * b;
  return { answer: first * c,
    explainedCalculation: c === 1n
      ? `-${a} × ${b} = ${first}`
      : `${first} × (${c}) = ${first * c}` };
}

describe("QA-003 independent oracle — legacy signed arithmetic", () => {
  it("checks every supported visible question, answer, explanation and grading route", () => {
    const checkedKeys = new Set<string>();
    const perFamily = new Map<Family, number>();
    let checks = 0;
    let supplementary = 0;
    for (const family of families) {
      let familyCount = 0;
      for (const level of levels) {
        const tasks = taskPool("signed", level).filter((task) => task.templateId === family);
        // Nine grid combinations + one explicitly added supplemental question.
        expect(tasks, family + "/" + level).toHaveLength(10);
        for (const task of tasks) {
          const witness = readVisibleQuestion(family, task.question);
          const key = family + ":" + level + ":" + task.contentKey;
          expect(checkedKeys.has(key), "duplicate visible question: " + key).toBe(false);
          checkedKeys.add(key);
          const spec = getAnswerSpec(task);
          if (spec.kind !== "scalar") throw Error("Signed exercise must have scalar answer");
          // Fraction-free mathematical oracle based strictly on displayed operands.
          expect(spec.value.denominator).toBe(1n);
          expect(spec.value.numerator, key).toBe(witness.answer);
          checks += 2;
          expect(task.explanation.replace(/−/g, "-")).toContain(witness.explainedCalculation);
          expect(task.hint.trim().length).toBeGreaterThan(0);
          expect(task.nextHint.trim().length).toBeGreaterThan(0);
          checks += 3;

          if (family === "signed-add") {
            expect(task.step?.answer.denominator).toBe(1n);
            expect(task.step?.answer.numerator).toBe(witness.absoluteDifference);
            checks += 2;
          }
          // Distinct correct, equivalent fraction, perturbation, missing and malformed.
          expect(assessAnswer(spec, witness.answer.toString()).kind).toBe("correct");
          expect(assessAnswer(spec, (witness.answer * 2n) + "/2").kind).toBe("correct");
          expect(assessAnswer(spec, (witness.answer + 1n).toString()).kind).toBe("incorrect");
          expect(assessAnswer(spec, (witness.answer - 1n).toString()).kind).toBe("incorrect");
          expect(assessAnswer(spec, "").kind).toBe("invalid");
          expect(assessAnswer(spec, "1/0").kind).toBe("invalid");
          expect(assessAnswer(spec, "not-a-number").kind).toBe("invalid");
          checks += 7;
          for (const rule of task.errorRules) {
            // Diagnostics must not suggest the mathematically correct answer is wrong.
            expect(rule.wrongAnswer.numerator * 1n).not.toBe(witness.answer * rule.wrongAnswer.denominator);
            checks++;
          }
          if (task.supplemental) supplementary++;
          familyCount++;
        }
      }
      expect(familyCount).toBe(30);
      perFamily.set(family, familyCount);
    }
    expect(checkedKeys.size).toBe(90);
    expect(supplementary).toBe(9);
    expect([...perFamily.values()]).toEqual([30, 30, 30]);
    expect(checks).toBeGreaterThan(1000);
  });
});
