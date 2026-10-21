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


// Independent literal fixtures: expected results were calculated manually,
// never copied from probeFor(). All values exercise the exact rational parser.
describe("MT-DIAG-001 independently worked probe fixtures", () => {
  const rat = (n: number, d = 1) => rational(n, d);
  const setMatrices = (family: string, first: ReturnType<typeof rat>[][], second?: ReturnType<typeof rat>[][]) => {
    const base = select(family === "matrix-product" ? "matrices" : "determinants", "easy", family);
    return { ...base, matrices: [{ label: "A", values: first }, ...(second ? [{ label: "B", values: second }] : [])] };
  };
  const university = (family: string, level: "easy" | "hard" | "advanced",
    matrix: ReturnType<typeof rat>[][]) => {
    const source = select(family.includes("cramer") ? "systems" : "determinants", level, family);
    if (!isUniversityTask(source)) throw new Error("University fixture expected");
    return { ...source,
      university: source.university.kind === "system"
        ? { ...source.university, coefficients: matrix }
        : source.university.kind === "determinant"
          ? { ...source.university, matrix } : source.university,
    };
  };
  const cases = [
    { task: setMatrices("determinant-two", [[rat(-2), rat(3)], [rat(4), rat(5, 2)]]), expected: "-5", code: "DETERMINANT_MAIN_DIAGONAL" },
    { task: setMatrices("determinant-two", [[rat(0), rat(-1)], [rat(3), rat(4)]]), expected: "0", code: "DETERMINANT_MAIN_DIAGONAL" },
    { task: setMatrices("determinant-sarrus", [[rat(-2), rat(1), rat(0)],
        [rat(3), rat(-1), rat(4)], [rat(1), rat(1), rat(2)]]), expected: "4", code: "SARRUS_FIRST_POSITIVE_PRODUCT" },
    { task: setMatrices("matrix-product", [[rat(-2), rat(1, 2)], [rat(3), rat(4)]],
        [[rat(1), rat(4)], [rat(6), rat(-1)]]), expected: "1", code: "MATRIX_PRODUCT_FIRST_CELL" },
    { task: university("system-cramer-two", "easy",
        [[rat(-2), rat(3)], [rat(4), rat(1)]]), expected: "-14", code: "CRAMER_MAIN_DETERMINANT" },
    { task: university("system-cramer-three", "hard",
        [[rat(1), rat(2), rat(0)], [rat(0), rat(-1), rat(3)], [rat(2), rat(0), rat(1)]]),
      expected: "11", code: "CRAMER_MAIN_DETERMINANT" },
    { task: university("determinant-laplace-four", "hard",
        [[rat(1), rat(2), rat(0), rat(0)], [rat(0), rat(1), rat(2), rat(0)],
          [rat(0), rat(0), rat(1), rat(3)], [rat(0), rat(4), rat(0), rat(1)]]),
      expected: "25", code: "LAPLACE_MINOR" },
    { task: university("determinant-laplace-five", "advanced",
        [[rat(2), rat(0), rat(0), rat(0), rat(0)],
          [rat(0), rat(1), rat(2), rat(0), rat(0)],
          [rat(0), rat(0), rat(-1), rat(3), rat(0)],
          [rat(0), rat(0), rat(0), rat(2), rat(4)],
          [rat(0), rat(5), rat(0), rat(0), rat(1)]]),
      expected: "-122", code: "LAPLACE_MINOR" },
  ];
  for (const { task, expected, code } of cases) {
    it(`independently checks ${code} = ${expected}`, () => {
      const probe = probeFor(task);
      expect(probe?.code).toBe(code);
      expect(probe?.question.pl.length).toBeGreaterThan(8);
      expect(probe?.question.en.length).toBeGreaterThan(8);
      expect(formatRational(probe!.answer).replace(/−/g, "-")).toBe(expected);
      expect(checkProbe(probe!, expected)).toBe("correct");
      expect(checkProbe(probe!, "999999")).toBe("incorrect");
      expect(checkProbe(probe!, "1/0")).toBe("invalid");
    });
  }
});
