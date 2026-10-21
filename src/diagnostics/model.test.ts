import { describe, expect, it } from "vitest";
import { formatRational } from "../answers";
import { getAnswerSpec } from "../exercises";
import { taskPool } from "../generators";
import { feedback } from "../locales/pl";
import { addRational, rational } from "../rational";
import { assessRepairAttempt, inspectMistake, inspectSubmittedStep, pickRepairTasks } from "./model";

const order = taskPool("order", "easy").find((task) => task.templateId === "order-add-product")!;
const matrix = taskPool("matrices", "easy").find((task) => task.templateId === "matrix-add")!;
const integral = taskPool("integrals", "easy").find((task) => task.templateId === "integral-direct")!;

describe("MT-DIAG-001 conservative analysis", () => {
  it("reports modeled final-answer mistakes as hypotheses, not observed steps", () => {
    const { a, b, c } = order.parameters;
    const wrong = String((a + b) * c);
    const result = inspectMistake(order, wrong, feedback);
    expect(result?.kind).toBe("possible");
    if (result?.kind === "possible") {
      expect(result.candidates).toEqual(expect.arrayContaining([expect.objectContaining({ errorCode: "ORDER_LEFT_TO_RIGHT" })]));
      expect(result.candidates.every((entry) => entry.hint.length > 0)).toBe(true);
    }
  });

  it("does not invent a cause for an unmatched numerical result or structured matrix", () => {
    expect(inspectMistake(order, "999999", feedback)?.kind).toBe("unknown");
    const spec = getAnswerSpec(matrix);
    expect(spec.kind).toBe("matrix");
    if (spec.kind !== "matrix") return;
    const altered = spec.values.map((row, i) => row.map((entry, j) =>
      formatRational(i === 0 && j === 0 ? addRational(entry, rational(1)) : entry)));
    expect(inspectMistake(matrix, { kind: "matrix", values: altered }, feedback)?.kind).toBe("unknown");
  });

  it("confirms only the already proven missing integration constant", () => {
    const spec = getAnswerSpec(integral);
    expect(spec.kind).toBe("primitive");
    if (spec.kind !== "primitive") return;
    const answer = { kind: "primitive" as const,
      coefficients: spec.terms.map((term) => formatRational(term.coefficient)), hasConstant: false };
    expect(inspectMistake(integral, answer, feedback)).toMatchObject({
      kind: "confirmed", errorCode: "MISSING_INTEGRATION_CONSTANT",
    });
    expect(inspectMistake(integral, { ...answer, hasConstant: true }, feedback)).toBeNull();
    expect(inspectMistake(integral, { ...answer, coefficients: ["1/0", ...answer.coefficients.slice(1)] }, feedback)).toBeNull();
  });

  it("checks the submitted intermediate step, not imagined working", () => {
    expect(order.step).toBeDefined();
    const correct = formatRational(order.step!.answer);
    const wrong = formatRational(addRational(order.step!.answer, rational(1)));
    expect(inspectSubmittedStep(order, correct, feedback)?.kind).toBe("correct");
    expect(inspectSubmittedStep(order, wrong, feedback)?.kind).toBe("incorrect");
    expect(inspectSubmittedStep(order, "1/0", feedback)?.kind).toBe("invalid");
    expect(inspectSubmittedStep(matrix, "42", feedback)).toBeNull();
  });

  it("chooses exactly three distinct fresh questions from the original family and difficulty", () => {
    for (const source of [order, matrix, integral]) {
      const selected = pickRepairTasks(source, 42);
      expect(selected).toHaveLength(3);
      expect(new Set(selected.map((task) => task.contentKey)).size).toBe(3);
      expect(selected.every((task) => task.templateId === source.templateId &&
        task.category === source.category && task.difficulty === source.difficulty &&
        task.contentKey !== source.contentKey)).toBe(true);
      expect(selected.map((task) => task.id)).toEqual(pickRepairTasks(source, 42).map((task) => task.id));
      expect(pickRepairTasks(source, 42, 1000)).toHaveLength(0);
    }
  });

  it("uses the shared exact answer parser in recovery, including malformed fractions", () => {
    const spec = getAnswerSpec(order);
    expect(spec.kind).toBe("scalar");
    if (spec.kind !== "scalar") return;
    expect(assessRepairAttempt(order, formatRational(spec.value))).toBe("correct");
    expect(assessRepairAttempt(order, "1/0")).toBe("invalid");
    expect(assessRepairAttempt(order, "99999")).toBe("incorrect");
  });
});
