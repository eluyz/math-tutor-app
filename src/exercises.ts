export type Exercise = {
  id: string;
  topic: string;
  title: string;
  question: string;
  hint: string;
  answer: number;
  explanation: string;
  commonMistakes: Record<number, string>;
};

export type CheckResult =
  | { kind: "invalid"; message: string }
  | { kind: "correct"; message: string }
  | { kind: "incorrect"; message: string };

export type FeedbackCopy = {
  invalidNumber: string;
  correctPrefix: string;
  incorrectPrefix: string;
  hintPrefix: string;
};

export function checkAnswer(
  exercise: Exercise,
  rawAnswer: string,
  feedback: FeedbackCopy,
): CheckResult {
  const normalized = rawAnswer.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return { kind: "invalid", message: feedback.invalidNumber };
  }

  const answer = Number(normalized);
  if (!Number.isFinite(answer)) {
    return { kind: "invalid", message: feedback.invalidNumber };
  }

  if (answer === exercise.answer) {
    return {
      kind: "correct",
      message: `${feedback.correctPrefix} ${exercise.explanation}`,
    };
  }

  return {
    kind: "incorrect",
    message:
      exercise.commonMistakes[answer] ??
      `${feedback.incorrectPrefix} ${feedback.hintPrefix} ${exercise.hint}`,
  };
}
