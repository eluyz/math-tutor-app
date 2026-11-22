import { isLegacyDifficulty, type Difficulty } from "../difficulty";
import { assessFrequencyAnswer, generateFrequencyTask, type FrequencyAssessment, type FrequencyTask } from "./frequencyTasks";

export type FrequencyPracticeTask = FrequencyTask & Readonly<{ lesson: "frequency-tables" }>;

export function createFrequencyPracticeTask(difficulty: Difficulty, seed: number): FrequencyPracticeTask {
  if (!isLegacyDifficulty(difficulty)) throw new RangeError("Unavailable Statistics difficulty");
  return Object.freeze({ ...generateFrequencyTask(difficulty, seed), lesson: "frequency-tables" });
}

export function assessFrequencyResponse(task: FrequencyPracticeTask, raw: unknown): FrequencyAssessment {
  return assessFrequencyAnswer(task, raw);
}
