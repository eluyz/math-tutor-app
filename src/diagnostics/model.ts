import { assessAnswer, type AnswerInput } from "../answers";
import { checkAnswer, checkStep, getAnswerSpec, type FeedbackCopy } from "../exercises";
import { seededRandom, taskPool, type GeneratedTask } from "../generators";

export type MistakeInsight =
  | { kind: "confirmed"; errorCode: "MISSING_INTEGRATION_CONSTANT"; explanation: string; hint: string }
  | { kind: "possible"; candidates: readonly { errorCode: string; explanation: string; hint: string }[] }
  | { kind: "unknown"; explanation: string; hint: string };

/** A final answer can suggest a mistake but cannot certify which calculation was performed. */
export function inspectMistake(task: GeneratedTask, input: AnswerInput, feedback: FeedbackCopy): MistakeInsight | null {
  const result = checkAnswer(task, input, feedback);
  if (result.kind !== "incorrect") return null;
  const diagnosis = result.diagnosis;
  if (diagnosis.kind === "known") return {
    kind: "confirmed", errorCode: diagnosis.errorCode,
    explanation: diagnosis.explanation, hint: diagnosis.hint,
  };
  if (diagnosis.kind === "hypotheses") return {
    kind: "possible", candidates: diagnosis.candidates.map(({ errorCode, explanation, hint }) =>
      ({ errorCode, explanation, hint })),
  };
  return { kind: "unknown", explanation: diagnosis.explanation, hint: diagnosis.hint };
}

/** Only a submitted, checked intermediate answer can confirm a mistake in that step. */
export function inspectSubmittedStep(task: GeneratedTask, input: string, feedback: FeedbackCopy) {
  return task.step ? checkStep(task, input, feedback) : null;
}

/** Three distinct variants in exactly the same family and difficulty, excluding the original. */
export function pickRepairTasks(source: GeneratedTask, seed: number, count = 3): GeneratedTask[] {
  if (!Number.isInteger(count) || count < 1) return [];
  const seen = new Set([source.contentKey]);
  const candidates = taskPool(source.category, source.difficulty).filter((task) => {
    if (task.templateId !== source.templateId || seen.has(task.contentKey)) return false;
    seen.add(task.contentKey);
    return true;
  });
  const random = seededRandom(seed);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.length >= count ? candidates.slice(0, count) : [];
}

export function assessRepairAttempt(task: GeneratedTask, answer: AnswerInput) {
  return assessAnswer(getAnswerSpec(task), answer).kind;
}
