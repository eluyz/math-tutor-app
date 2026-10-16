import { equalRational, parseAnswer, type Rational, type ParsedAnswer } from "./rational";
import type { Matrix } from "./matrices";

export type AnswerSpec =
  | { kind: "scalar"; value: Rational }
  | { kind: "list"; values: readonly Rational[]; labels: readonly string[]; unordered?: boolean }
  | { kind: "matrix"; values: Matrix }
  | { kind: "choice"; value: string; options: readonly { value: string; label: string }[] };
export type AnswerInput = string
  | { kind: "list"; values: readonly string[] }
  | { kind: "matrix"; values: readonly (readonly string[])[] }
  | { kind: "choice"; value: string };
type ParseReason = Extract<ParsedAnswer, { kind: "invalid" }>["reason"];
export type AnswerAssessment = { kind: "correct" | "incorrect" }
  | { kind: "invalid"; reason: ParseReason | "structure" | "choice" };

export function formatRational(value: Rational): string {
  return (value.denominator === 1n ? String(value.numerator) : `${value.numerator}/${value.denominator}`).replace(/-/g, "−");
}

export function emptyAnswer(spec: AnswerSpec): AnswerInput {
  if (spec.kind === "scalar") return "";
  if (spec.kind === "choice") return { kind: "choice", value: "" };
  if (spec.kind === "list") return { kind: "list", values: spec.values.map(() => "") };
  return { kind: "matrix", values: spec.values.map((row) => row.map(() => "")) };
}

export function describeInput(input: AnswerInput): string {
  if (typeof input === "string") return input;
  if (input.kind === "choice") return input.value;
  return input.kind === "list" ? input.values.join("; ") : input.values.map((row) => `[${row.join("; ")}]`).join(" ");
}

export function assessAnswer(spec: AnswerSpec, input: AnswerInput): AnswerAssessment {
  const invalid = (reason: "structure" | "choice"): AnswerAssessment => ({ kind: "invalid", reason });
  if (spec.kind === "choice") {
    if (typeof input === "string" || input.kind !== "choice" || !spec.options.some((option) => option.value === input.value))
      return invalid("choice");
    return { kind: input.value === spec.value ? "correct" : "incorrect" };
  }
  let expected: readonly Rational[], raw: readonly string[];
  if (spec.kind === "scalar") {
    if (typeof input !== "string") return invalid("structure");
    expected = [spec.value]; raw = [input];
  } else if (spec.kind === "list") {
    if (typeof input === "string" || input.kind !== "list" || input.values.length !== spec.values.length) return invalid("structure");
    expected = spec.values; raw = input.values;
  } else {
    if (typeof input === "string" || input.kind !== "matrix" || input.values.length !== spec.values.length ||
      input.values.some((row, i) => row.length !== spec.values[i].length)) return invalid("structure");
    expected = spec.values.flat(); raw = input.values.flat();
  }
  const parsed = raw.map(parseAnswer);
  const failed = parsed.find((value) => value.kind === "invalid");
  if (failed?.kind === "invalid") return failed;
  const values = parsed.map((value) => (value as Extract<ParsedAnswer, { kind: "valid" }>).value);
  const remaining = [...expected];
  const correct = spec.kind === "list" && spec.unordered
    ? values.every((value) => {
      const index = remaining.findIndex((candidate) => equalRational(candidate, value));
      if (index < 0) return false;
      remaining.splice(index, 1); return true;
    })
    : values.every((value, index) => equalRational(value, expected[index]));
  return { kind: correct ? "correct" : "incorrect" };
}
