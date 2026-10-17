import type { Rational } from "../rational";
import { addRational, subtractRational, multiplyRational, divideRational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";

export type Calculation = Readonly<{ operation: "sum" | "difference" | "product" | "quotient"; operands: readonly Rational[]; result: Rational }>;
export type SolutionStep = Readonly<{ kind: "working"; action: string; reason: string; calculations: readonly Calculation[] }>
  | Readonly<{ kind: "answer"; action: string; reason: string; answer: AnswerSpec }>;
export type Solution = readonly [SolutionStep, ...SolutionStep[]];
const operators = { sum: addRational, difference: subtractRational, product: multiplyRational, quotient: divideRational };
export function calculate(operation: Calculation["operation"], ...operands: Rational[]): Calculation {
  if (operands.length < 2) throw new Error("A calculation needs two operands");
  return { operation, operands, result: operands.slice(1).reduce(operators[operation], operands[0]) };
}
export function calculationText(c: Calculation): string {
  const sign = { sum: " + ", difference: " − ", product: " × ", quotient: " ÷ " }[c.operation];
  return `${c.operands.map((v) => `(${f(v)})`).join(sign)} = ${f(c.result)}`;
}
