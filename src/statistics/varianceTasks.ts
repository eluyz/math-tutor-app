/** Unreleased ST-103 population (not sample) variance exercises. */
import type { Rational } from "../rational";
import { generateMeanDataset, type DatasetDifficulty } from "./datasets";
import { summarizeIntegerDataset } from "./descriptive";

export type VarianceTask = Readonly<{
  id: string;
  difficulty: DatasetDifficulty;
  seed: number;
  values: readonly number[];
  mean: Rational;
  populationVariance: Rational;
}>;

export function generateVarianceTask(difficulty: DatasetDifficulty, seed: number): VarianceTask {
  const dataset = generateMeanDataset(difficulty, seed);
  const summary = summarizeIntegerDataset(dataset.values);
  return Object.freeze({
    id: `st103-${difficulty}-${seed}`,
    difficulty,
    seed,
    values: dataset.values,
    mean: Object.freeze(summary.mean),
    populationVariance: Object.freeze(summary.populationVariance),
  });
}
