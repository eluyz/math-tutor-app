import type { makeUniversityTask } from "../university/catalog";
import type { SolutionStep } from "../solutions/types";
import { parseAnswer } from "../rational";
import { r, add, mul, div, same, identity, augment, requireMath, type Matrix } from "./batchDMath";

/** Replay the actual displayed elementary row operations using an independent
 * implementation. This verifies each printed matrix, not the production trace. */
export function auditDisplayedRows(task: ReturnType<typeof makeUniversityTask>, steps: readonly SolutionStep[]): number {
  const p = task.university;
  let initial: Matrix | undefined;
  if (p.kind === "determinant" || p.kind === "linear-rank") initial = p.matrix;
  if (p.kind === "linear-inverse" || p.kind === "linear-application") initial = p.matrix.map((row, i) => [...row, ...identity(p.matrix.length)[i]]);
  if (p.kind === "linear-system" || p.kind === "linear-cramer-four" || p.kind === "linear-cramer-diagnostic") initial = augment(p.matrix, p.rhs);
  if (!initial) return 0;
  let current = initial.map(row => [...row]), checked = 0;
  const fraction = (text: string) => {
    const parsed = parseAnswer(text.trim());
    requireMath(parsed.kind === "valid", "printed row operation contains exact numbers");
    return parsed.value;
  };
  for (const step of steps) {
    if (step.kind !== "working" || !/^R\d+\s*(?:←|↔)/.test(step.action)) continue;
    const colon = step.action.indexOf(":"), action = step.action.slice(0, colon);
    // Some determinant dependency proofs state an operation without a matrix.
    // Their claimed dependency is checked directly on the original rows.
    if (colon < 0) continue;
    const shown = [...step.action.slice(colon + 1).matchAll(/\[([^\[\]]+)\]/g)].map(match => match[1].split(",").map(fraction));
    const next = current.map(row => [...row]);
    let match = /^R(\d+)\s*↔\s*R(\d+)$/.exec(action);
    if (match) {
      const i = Number(match[1]) - 1, j = Number(match[2]) - 1;
      [next[i], next[j]] = [next[j], next[i]];
    } else if ((match = /^R(\d+)\s*←\s*R\d+\s*\/\s*\(([^)]+)\)$/.exec(action))) {
      const i = Number(match[1]) - 1, divisor = fraction(match[2]);
      requireMath(divisor.numerator !== 0n, "never divide by a zero pivot");
      next[i] = next[i].map(x => div(x, divisor));
    } else if ((match = /^R(\d+)\s*←\s*R\d+\s*([+−-])\s*\(([^)]+)\)\s*R(\d+)$/.exec(action))) {
      const i = Number(match[1]) - 1, j = Number(match[4]) - 1;
      const factor = mul(r(match[2] === "+" ? 1 : -1), fraction(match[3]));
      next[i] = next[i].map((x, k) => add(x, mul(factor, current[j][k])));
    } else if ((match = /^R(\d+)\s*←\s*\(([^)]+)\)\s*R\d+$/.exec(action))) {
      const i = Number(match[1]) - 1, factor = fraction(match[2]);
      requireMath(factor.numerator !== 0n, "row scaling must be invertible");
      next[i] = next[i].map(x => mul(x, factor));
    } else throw Error("Uncovered printed row operation: " + action);
    requireMath(same(next, shown), "each displayed row operation reconstructs its printed matrix: " + action);
    current = shown;
    checked++;
  }
  return checked;
}
