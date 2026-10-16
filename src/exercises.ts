import { equalRational, parseAnswer, type Rational } from "./rational";

export type CategoryId =
  | "order"
  | "signed"
  | "fractions"
  | "algebra"
  | "equations";

export type ErrorRule = {
  errorCode: string;
  category: CategoryId;
  confidence: "low" | "medium";
  wrongAnswer: Rational;
  explanation: string;
  hint: string;
};

export type Exercise = {
  id: string;
  category: CategoryId;
  title: string;
  question: string;
  answer: Rational;
  explanation: string;
  hint: string;
  nextHint: string;
  errorRules: ErrorRule[];
  step?: {
    question: string;
    answer: Rational;
    correctHint: string;
    incorrectHint: string;
  };
};

export type Hypothesis = Omit<ErrorRule, "wrongAnswer">;
export type Diagnosis =
  | { kind: "hypotheses"; candidates: Hypothesis[]; ambiguous: boolean }
  | {
      kind: "undetermined";
      errorCode: "UNDETERMINED";
      category: CategoryId;
      confidence: "none";
      explanation: string;
      hint: string;
    };

export type CheckResult =
  | { kind: "invalid"; message: string }
  | { kind: "correct"; message: string }
  | { kind: "incorrect"; message: string; diagnosis: Diagnosis };

export type StepResult = {
  kind: "invalid" | "correct" | "incorrect";
  message: string;
};

export type FeedbackCopy = {
  empty: string;
  invalidNumber: string;
  divisionByZero: string;
  tooLong: string;
  correctPrefix: string;
  incorrectPrefix: string;
  stepCorrectPrefix: string;
  stepIncorrectPrefix: string;
  undeterminedExplanation: string;
  undeterminedHint: string;
};

function invalidMessage(
  reason: "empty" | "format" | "division-by-zero" | "too-long",
  feedback: FeedbackCopy,
): string {
  switch (reason) {
    case "empty":
      return feedback.empty;
    case "division-by-zero":
      return feedback.divisionByZero;
    case "too-long":
      return feedback.tooLong;
    case "format":
      return feedback.invalidNumber;
  }
}

export function diagnose(
  exercise: Exercise,
  answer: Rational,
  feedback: FeedbackCopy,
): Diagnosis {
  const candidates = exercise.errorRules
    .filter((rule) => equalRational(rule.wrongAnswer, answer))
    .map(({ wrongAnswer: _wrongAnswer, ...hypothesis }) => hypothesis);

  if (!candidates.length) {
    return {
      kind: "undetermined",
      errorCode: "UNDETERMINED",
      category: exercise.category,
      confidence: "none",
      explanation: feedback.undeterminedExplanation,
      hint: feedback.undeterminedHint,
    };
  }
  return { kind: "hypotheses", candidates, ambiguous: candidates.length > 1 };
}

export function checkAnswer(
  exercise: Exercise,
  rawAnswer: string,
  feedback: FeedbackCopy,
): CheckResult {
  const parsed = parseAnswer(rawAnswer);
  if (parsed.kind === "invalid") {
    return {
      kind: "invalid",
      message: invalidMessage(parsed.reason, feedback),
    };
  }
  if (equalRational(parsed.value, exercise.answer)) {
    return {
      kind: "correct",
      message: `${feedback.correctPrefix} ${exercise.explanation}`,
    };
  }
  return {
    kind: "incorrect",
    message: feedback.incorrectPrefix,
    diagnosis: diagnose(exercise, parsed.value, feedback),
  };
}

export function checkStep(
  exercise: Exercise,
  rawAnswer: string,
  feedback: FeedbackCopy,
): StepResult {
  if (!exercise.step)
    throw new Error(`Exercise ${exercise.id} has no intermediate step`);
  const parsed = parseAnswer(rawAnswer);
  if (parsed.kind === "invalid") {
    return {
      kind: "invalid",
      message: invalidMessage(parsed.reason, feedback),
    };
  }
  if (equalRational(parsed.value, exercise.step.answer)) {
    return {
      kind: "correct",
      message: `${feedback.stepCorrectPrefix} ${exercise.step.correctHint}`,
    };
  }
  return {
    kind: "incorrect",
    message: `${feedback.stepIncorrectPrefix} ${exercise.step.incorrectHint}`,
  };
}
