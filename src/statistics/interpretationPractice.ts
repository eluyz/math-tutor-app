import { isLegacyDifficulty, type Difficulty } from "../difficulty";
import type { DatasetDifficulty } from "./datasets";
import { assessInterpretationAnswer, compareCentres, compareReplacement, generateInterpretationTask, type InterpretationAssessment, type InterpretationTask } from "./interpretationTasks";

export type InterpretationPracticeTask = Readonly<{
  lesson: "interpretation";
  id: string;
  difficulty: DatasetDifficulty;
  seed: number;
  values: readonly number[];
  engine: InterpretationTask;
}>;

export function createInterpretationPracticeTask(difficulty: Difficulty, seed: number): InterpretationPracticeTask {
  if (!isLegacyDifficulty(difficulty)) throw new RangeError("Unavailable Statistics difficulty");
  const engine=generateInterpretationTask(difficulty,seed);
  return Object.freeze({lesson:"interpretation",id:engine.id,difficulty,seed,values:engine.original.values,engine});
}

export function assessInterpretationResponse(task: InterpretationPracticeTask, raw: unknown): InterpretationAssessment {
  if(typeof raw!=="string") return "invalid";
  const engine=task.engine;
  const expected=engine.kind==="compare-centres" ? compareCentres(engine.original.values)
    : compareReplacement(engine.original.values,engine.replacement.index,engine.replacement.to);
  const choices:readonly string[]=engine.options;
  if(choices.length!==3 || new Set(choices).size!==3 || expected.options.some(id=>!choices.includes(id))) return "invalid";
  return assessInterpretationAnswer(engine,raw);
}
