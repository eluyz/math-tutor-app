import { equalRational, parseAnswer, type Rational } from "./rational";
import { assessAnswer, type AnswerSpec, type AnswerInput, type AnswerAssessment } from "./answers";
import type { Solution } from "./solutions/types";
import type { Matrix } from "./matrices";

export type CategoryId =
  | "order"
  | "signed"
  | "fractions"
  | "algebra"
  | "equations"
  | "quadratics"
  | "matrices"
  | "determinants"
  | "systems"
  | "functions"
  | "sequence-limits"
  | "function-limits"
  | "derivatives"
  | "integrals";

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

/** Legacy scalar exercises keep their public shape; new exercises use a tagged answer. */
export type TypedExercise = Omit<Exercise, "answer"> & {
  answer: AnswerSpec;
  startingHint: string;
  solution?: Solution;
  matrices?: readonly { label: string; values: Matrix }[];
};
export type AnyExercise = Exercise | TypedExercise;
export function getAnswerSpec(exercise: AnyExercise): AnswerSpec {
  return "numerator" in exercise.answer ? { kind: "scalar", value: exercise.answer } : exercise.answer;
}

export type Hypothesis = Omit<ErrorRule, "wrongAnswer">;
export type Diagnosis =
  | { kind: "hypotheses"; candidates: Hypothesis[]; ambiguous: boolean }
  | { kind: "known"; errorCode: "MISSING_INTEGRATION_CONSTANT"; category: CategoryId; explanation: string; hint: string }
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
  missingConstant: string;
  empty: string;
  invalidNumber: string;
  divisionByZero: string;
  tooLong: string;
  invalidStructure: string;
  invalidChoice: string;
  correctPrefix: string;
  incorrectPrefix: string;
  stepCorrectPrefix: string;
  stepIncorrectPrefix: string;
  undeterminedExplanation: string;
  undeterminedHint: string;
};

function invalidMessage(
  reason: Extract<AnswerAssessment, { kind: "invalid" }>["reason"],
  feedback: FeedbackCopy,
): string {
  switch (reason) {
    case "structure":
      return feedback.invalidStructure;
    case "choice":
      return feedback.invalidChoice;
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
  exercise: AnyExercise,
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
  exercise: AnyExercise,
  rawAnswer: AnswerInput,
  feedback: FeedbackCopy,
): CheckResult {
  const spec = getAnswerSpec(exercise);
  const parsed = assessAnswer(spec, rawAnswer);
  if (parsed.kind === "invalid") {
    return {
      kind: "invalid",
      message: invalidMessage(parsed.reason, feedback),
    };
  }
  if (parsed.kind === "correct") {
    return {
      kind: "correct",
      message: `${feedback.correctPrefix} ${exercise.explanation}`,
    };
  }
  if (parsed.kind === "incorrect" && parsed.reason === "missing-constant") {
    return {
      kind: "incorrect", message: feedback.incorrectPrefix,
      diagnosis: { kind: "known", errorCode: "MISSING_INTEGRATION_CONSTANT", category: exercise.category,
        explanation: feedback.missingConstant, hint: feedback.missingConstant },
    };
  }
  return {
    kind: "incorrect",
    message: feedback.incorrectPrefix,
    diagnosis: spec.kind === "scalar" && typeof rawAnswer === "string"
      ? diagnose(exercise, (parseAnswer(rawAnswer) as { kind: "valid"; value: Rational }).value, feedback)
      : { kind: "undetermined", errorCode: "UNDETERMINED", category: exercise.category,
        confidence: "none", explanation: feedback.undeterminedExplanation, hint: feedback.undeterminedHint },
  };
}

export function checkStep(
  exercise: AnyExercise,
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
