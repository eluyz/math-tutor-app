import { describe, expect, it } from "vitest";
import { formatRational } from "../answers";
import { taskPool } from "../generators";
import { determinant } from "../matrices";
import { addRational, equalRational, rational } from "../rational";
import { isUniversityTask } from "../university/catalog";
import { checkProbe, probeFor } from "./probes";

const select = (category: Parameters<typeof taskPool>[0], level: Parameters<typeof taskPool>[1], family: string) => {
  const task = taskPool(category, level).find((item) => item.templateId === family);
  if (!task) throw new Error(`No task ${family} ${level}`);
  return task;
};

describe("MT-DIAG-001 exact intermediate probes", () => {
  it("detects real submitted errors for determinant, Sarrus and matrix products", () => {
    for (const [category, family] of [["determinants", "determinant-two"], ["determinants", "determinant-sarrus"],
      ["matrices", "matrix-product"]] as const) {
      const task = select(category, "easy", family);
      const probe = probeFor(task);
      expect(probe).not.toBeNull();
      if (!probe) continue;
      expect(checkProbe(probe, formatRational(probe.answer))).toBe("correct");
      expect(checkProbe(probe, formatRational(addRational(probe.answer, rational(1))))).toBe("incorrect");
      expect(checkProbe(probe, "1/0")).toBe("invalid");
      expect(probe.question.pl).toBeTruthy();
      expect(probe.question.en).toBeTruthy();
    }
  });

  it("checks Cramer D independently against existing exact 2x2/3x3 determinant", () => {
    for (const [family, difficulty] of [["system-cramer-two", "easy"], ["system-cramer-three", "hard"]] as const) {
      const task = select("systems", difficulty, family);
      expect(isUniversityTask(task)).toBe(true);
      const probe = probeFor(task);
      expect(probe?.code).toBe("CRAMER_MAIN_DETERMINANT");
      if (!probe || !isUniversityTask(task) || task.university.kind !== "system") continue;
      expect(equalRational(probe.answer, determinant(task.university.coefficients))).toBe(true);
    }
  });

  it("computes Laplace minors for 4x4 and 5x5, not the full determinant", () => {
    for (const [family, level] of [["determinant-laplace-four", "hard"], ["determinant-laplace-five", "advanced"]] as const) {
      const task = select("determinants", level, family);
      const probe = probeFor(task);
      expect(probe?.code).toBe("LAPLACE_MINOR");
      expect(probe?.question.pl).toContain("minor");
      expect(checkProbe(probe!, formatRational(probe!.answer))).toBe("correct");
    }
  });

  it("does not fabricate a probe where no independently auditable step is available", () => {
    const task = select("order", "easy", "order-add-product");
    expect(probeFor(task)).toBeNull();
  });
});
