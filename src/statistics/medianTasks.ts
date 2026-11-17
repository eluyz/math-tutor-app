/** Unreleased ST-102 exercises; no public catalog or grading integration. */
import type { Rational } from "../rational";
import { generateMeanDataset, type DatasetDifficulty } from "./datasets";
import { summarizeIntegerDataset } from "./descriptive";

export type MedianTask = Readonly<{
  id: string;
  difficulty: DatasetDifficulty;
  seed: number;
  values: readonly number[];
  median: Rational;
}>;

/** Seeded Fisher–Yates only for easy median lessons. A's mean datasets stay unchanged.
 * This avoids always presenting the median as the third observation.
 * The permutation is repeatable teaching data, not a uniform random sample.
 */
function reorderEasyMedian(values: readonly number[], seed: number): readonly number[] {
  const result = [...values];
  let state = ((seed ^ 0x9e3779b9) >>> 0) || 0x6d2b79f5;
  for (let i = result.length - 1; i > 0; i -= 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return Object.freeze(result);
}

export function generateMedianTask(difficulty: DatasetDifficulty, seed: number): MedianTask {
  const dataset = generateMeanDataset(difficulty, seed);
  const values = difficulty === "easy" ? reorderEasyMedian(dataset.values, seed) : dataset.values;
  const median = summarizeIntegerDataset(values).median;
  return Object.freeze({
    id: `st102-${difficulty}-${seed}`,
    difficulty,
    seed,
    values,
    median: Object.freeze(median),
  });
}
