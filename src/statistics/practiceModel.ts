import { isLegacyDifficulty, type Difficulty } from "../difficulty";
import type { Rational } from "../rational";
import type { StatisticsLesson } from "./curriculum";
import { generateMeanDataset, type DatasetDifficulty } from "./datasets";
import { generateMedianTask } from "./medianTasks";
import { generateVarianceTask } from "./varianceTasks";

export type StatisticsPracticeTask = Readonly<{
  lesson: StatisticsLesson;
  difficulty: DatasetDifficulty;
  seed: number;
  values: readonly number[];
  answer: Rational;
}>;

/** Connects independently tested lessons without altering generated/displayed datasets. */
export function createStatisticsPracticeTask(lesson: StatisticsLesson, difficulty: Difficulty, seed: number): StatisticsPracticeTask {
  if (lesson !== "mean" && lesson !== "median" && lesson !== "variance") throw new RangeError("Unavailable Statistics lesson");
  if (!isLegacyDifficulty(difficulty)) throw new RangeError("Unavailable Statistics difficulty");
  if (lesson === "median") {
    const task = generateMedianTask(difficulty, seed);
    return Object.freeze({ lesson, difficulty, seed, values: task.values, answer: task.median });
  }
  if (lesson === "variance") {
    const task = generateVarianceTask(difficulty, seed);
    return Object.freeze({ lesson, difficulty, seed, values: task.values, answer: task.populationVariance });
  }
  const task = generateMeanDataset(difficulty, seed);
  return Object.freeze({ lesson, difficulty, seed, values: task.values, answer: task.mean });
}
