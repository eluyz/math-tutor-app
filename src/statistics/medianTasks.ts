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

export function generateMedianTask(difficulty: DatasetDifficulty, seed: number): MedianTask {
  const dataset = generateMeanDataset(difficulty, seed);
  const median = summarizeIntegerDataset(dataset.values).median;
  return Object.freeze({
    id: `st102-${difficulty}-${seed}`,
    difficulty,
    seed,
    values: dataset.values,
    median: Object.freeze(median),
  });
}
