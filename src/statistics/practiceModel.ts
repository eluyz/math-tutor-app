import { isLegacyDifficulty, type Difficulty } from "../difficulty";
import type { Rational } from "../rational";
import type { StatisticsLesson } from "./curriculum";
import { generateMeanDataset, type DatasetDifficulty } from "./datasets";
import { generateMedianTask } from "./medianTasks";

export type StatisticsPracticeTask = Readonly<{
  lesson: StatisticsLesson;
  difficulty: DatasetDifficulty;
  seed: number;
  values: readonly number[];
  answer: Rational;
}>;

/** Adapts existing lessons; never regenerates median display values from mean data. */
export function createStatisticsPracticeTask(lesson: StatisticsLesson, difficulty: Difficulty, seed: number): StatisticsPracticeTask {
  if (lesson !== "mean" && lesson !== "median") throw new RangeError("Unavailable Statistics lesson");
  if (!isLegacyDifficulty(difficulty)) throw new RangeError("Unavailable Statistics difficulty");
  if (lesson === "median") {
    const task = generateMedianTask(difficulty, seed);
    return Object.freeze({ lesson, difficulty, seed, values: task.values, answer: task.median });
  }
  const task = generateMeanDataset(difficulty, seed);
  return Object.freeze({ lesson, difficulty, seed, values: task.values, answer: task.mean });
}
