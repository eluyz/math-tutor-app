import type { AnswerInput } from "../answers";

/** UI-only draft detection; it never interprets or grades an answer. */
export function hasUnsubmittedAnswer(answer: AnswerInput, submitted: boolean): boolean {
  if (submitted) return false;
  const filled = (value: string) => value.trim().length > 0;
  if (typeof answer === "string") return filled(answer);
  switch (answer.kind) {
    case "primitive": return answer.hasConstant || answer.coefficients.some(filled);
    case "system":
    case "roots": return filled(answer.classification) || answer.values.some(filled);
    case "limit": return filled(answer.classification) || filled(answer.value);
    case "choice": return filled(answer.value);
    case "multi-choice": return Object.values(answer.values).some(filled);
    case "list": return answer.values.some(filled);
    case "matrix": return answer.values.some(row => row.some(filled));
  }
}
