import { isLegacyDifficulty, type Difficulty } from "../difficulty";
import { assessModeAnswer, generateModeTask, type ModeAssessment, type ModeTask } from "./modeTasks";

export type ModePracticeTask = ModeTask & Readonly<{ lesson: "mode" }>;

export function createModePracticeTask(difficulty: Difficulty, seed: number): ModePracticeTask {
  if (!isLegacyDifficulty(difficulty)) throw new RangeError("Unavailable Statistics difficulty");
  return Object.freeze({ ...generateModeTask(difficulty, seed), lesson: "mode" });
}

export function assessModeResponse(task: ModePracticeTask, raw: unknown): ModeAssessment {
  return assessModeAnswer(task, raw);
}
