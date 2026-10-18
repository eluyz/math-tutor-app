import type { Locale } from "../locales/types";
import {
  calculate,
  calculationText,
  type Calculation,
  type Solution,
  type SolutionStep,
} from "../solutions/types";
import type { AnswerSpec } from "../answers";
export { calculate };
export type Presentation = {
  question: string;
  answer: AnswerSpec;
  solution: Solution;
  hint: string;
  nextHint: string;
  explanation: string;
};
export const pick = (locale: Locale) => (pl: string, en: string) =>
  locale === "pl" ? pl : en;
export function teaching(locale: Locale) {
  const t = pick(locale);
  const steps: SolutionStep[] = [];
  return {
    t,
    work(action: string, reason: string, ...calculations: Calculation[]) {
      steps.push({ kind: "working", action, reason, calculations });
    },
    finish(
      question: string,
      answer: AnswerSpec,
      hint: string,
      nextHint: string,
    ): Presentation {
      if (!steps.length) throw new Error("Missing mathematical working");
      const final: SolutionStep = {
        kind: "answer",
        action: t("Końcowa odpowiedź", "Final answer"),
        reason: t(
          "Wynik wynika z powyższych przekształceń i zachowuje wymagane warunki.",
          "The preceding transformations give this result under the stated conditions.",
        ),
        answer,
      };
      const solution: Solution = [steps[0], ...steps.slice(1), final];
      return {
        question,
        answer,
        solution,
        hint,
        nextHint,
        explanation: steps
          .map(
            (s) =>
              `${s.action}. ${s.reason}${s.kind === "working" ? ` ${s.calculations.map(calculationText).join("; ")}` : ""}`,
          )
          .join("\n"),
      };
    },
  };
}
