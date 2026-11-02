import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { makeUniversityTask, localizeUniversity } from "./catalog";
import { integratedPunctureOracle, punctureHasHeight } from "./graphIntegratedPunctures";
import { makeGraphPuncturedSymmetry, puncturedParity } from "./graphPuncturedSymmetry";
import { jumpOracle } from "./graphIntegratedJump";
import { integratedAsymptoteOracle } from "./graphIntegratedAsymptotes";

/** PUBLIC SYNTHETIC METHOD proxies only. No source P20/P21 coordinates or key;
 * these invariants DO NOT constitute exact private-source witness acceptance.
 */
const sixFields = ["domain", "range", "increasing", "decreasing", "injective", "parity"];

function sixAnswerFields(id: string, variant: number) {
  for (const locale of ["pl", "en"] as const) {
    const task = makeUniversityTask(id, variant, "hard");
    const spec = localizeUniversity(task, locale).answer;
    expect(spec.kind).toBe("multi-choice");
    if (spec.kind !== "multi-choice") continue;
    expect(spec.fields.map(f => f.id)).toEqual(sixFields);
    expect(spec.fields.every(f => f.options.some(o => o.value === f.value))).toBe(true);
  }
}
describe("F05 publicly reproducible proxy-method evidence (NOT original figure acceptance)", () => {
  it("a-like proxy: odd symmetric excluded x values whose y heights are restored elsewhere", () => {
    const task = makeUniversityTask("function-integrated-punctures", 1, "hard");
    if (task.university.kind !== "function-integrated-punctures") throw Error("Wrong family");
    const p = task.university, excluded = p.nodes.filter((_x, i) => !p.included[i]);
    expect(excluded).toHaveLength(2);
    expect(excluded[0].x).toBe(-excluded[1].x);
    expect(excluded.every(n => punctureHasHeight(p, n.y))).toBe(true);
    expect(integratedPunctureOracle(p).parity).toBe("odd");
    sixAnswerFields("function-integrated-punctures", 1);
  });
  it("b-like proxy: parity-only symmetric holes, not a six-field original witness", () => {
    const p = makeGraphPuncturedSymmetry(4, "hard");
    expect(p.included[1]).toBe(false);
    expect(p.included[3]).toBe(false);
    expect(puncturedParity(p)).toBe("even");
    const spec = makeUniversityTask("function-punctured-symmetry", 4, "hard").answer;
    expect(spec.kind).toBe("choice");
  });
  it("c-like proxy: filled and hollow values share an x, but the graph is bounded", () => {
    const task = makeUniversityTask("function-integrated-jump", 1, "hard");
    if (task.university.kind !== "function-integrated-jump") throw Error("Wrong family");
    const p = task.university;
    expect(p.topology).toBe("overlap");
    expect(p.left[1].x).toBe(p.right[0].x);
    expect(jumpOracle(p).injective).toBe("no");
    expect(jumpOracle(p).range).not.toBe("ℝ");
    sixAnswerFields("function-integrated-jump", 1);
  });
  it("d-like proxy: real-image rational middle plus sloping exterior pieces, six fields", () => {
    const task = makeUniversityTask("function-integrated-asymptotes", 0, "hard");
    if (task.university.kind !== "function-integrated-asymptotes") throw Error("Wrong family");
    const p = task.university, oracle = integratedAsymptoteOracle(p);
    expect(p.left[0].y).not.toBe(p.left[1].y);
    expect(p.right[0].y).not.toBe(p.right[1].y);
    expect(oracle.range).toBe("ℝ");
    expect(oracle.injective).toBe("no");
    sixAnswerFields("function-integrated-asymptotes", 0);
  });
  it("e-like proxy: distinct missing abscissae, not multiple y holes at one missing x", () => {
    const task = makeUniversityTask("function-integrated-punctures", 3, "hard");
    if (task.university.kind !== "function-integrated-punctures") throw Error("Wrong family");
    const p = task.university, excluded = p.nodes.filter((_x, i) => !p.included[i]);
    expect(excluded).toHaveLength(2);
    expect(excluded[0].x).not.toBe(excluded[1].x);
    expect(excluded.every(n => punctureHasHeight(p, n.y))).toBe(true);
    sixAnswerFields("function-integrated-punctures", 3);
  });
  it("f-like proxy: disconnected y-ranges yet injective; two bounded segments", () => {
    const task = makeUniversityTask("function-integrated-jump", 0, "hard");
    if (task.university.kind !== "function-integrated-jump") throw Error("Wrong family");
    const p = task.university, oracle = jumpOracle(p);
    expect(p.topology).toBe("separated");
    expect(p.left[1].x).toBe(p.right[0].x);
    expect(oracle.injective).toBe("yes");
    expect(oracle.range).toContain(" ∪ ");
    expect(oracle.range).not.toBe("ℝ");
    sixAnswerFields("function-integrated-jump", 0);
  });
  it("explicit ledger cannot equate METHOD_PROXY with any SOURCE_PASS", () => {
    const doc = readFileSync(new URL("../../docs/F05_SOURCE_WITNESS_ACCEPTANCE.md", import.meta.url), "utf8");
    expect(doc).toContain("Acceptance score: 0/6");
    const rows = doc.split("\n").filter(row => /^\| [a-f] \|/.test(row));
    expect(rows.map(row => row.split("|")[1].trim())).toEqual(["a", "b", "c", "d", "e", "f"]);
    for (const row of rows) {
      const cols = row.split("|").slice(1, -1).map(s => s.trim());
      expect(cols).toHaveLength(10);
      expect(cols[9]).toContain("SOURCE_NOT_VERIFIED");
      expect(cols.slice(3, 9).every(c => c === "METHOD_PROXY" || c === "METHOD_GAP")).toBe(true);
    }
  });
});
