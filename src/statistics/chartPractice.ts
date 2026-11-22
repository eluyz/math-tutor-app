import { isLegacyDifficulty, type Difficulty } from "../difficulty";
import { assessChartAnswer, generateChartTask, type ChartAssessment, type ChartTask } from "./chartTasks";

export type ChartPracticeTask = ChartTask & Readonly<{ lesson: "charts" }>;

export function createChartPracticeTask(difficulty: Difficulty, seed: number): ChartPracticeTask {
  if (!isLegacyDifficulty(difficulty)) throw new RangeError("Unavailable Statistics difficulty");
  return Object.freeze({ ...generateChartTask(difficulty, seed), lesson: "charts" });
}

export function assessChartResponse(task: ChartPracticeTask, raw: unknown): ChartAssessment {
  return assessChartAnswer(task, raw);
}
