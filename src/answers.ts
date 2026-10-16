import { equalRational, parseAnswer, type Rational, type ParsedAnswer } from "./rational";
import type { Matrix } from "./matrices";

export type AnswerSpec =
  | { kind: "roots"; values: readonly Rational[] }
  | { kind: "scalar"; value: Rational }
  | { kind: "list"; values: readonly Rational[]; labels: readonly string[]; unordered?: boolean }
  | { kind: "matrix"; values: Matrix }
  | { kind: "choice"; value: string; options: readonly { value: string; label: string }[] };
export type AnswerInput = string
  | { kind: "roots"; classification: string; values: readonly string[] }
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
  if (spec.kind === "roots") return { kind: "roots", classification: "", values: [] };
  if (spec.kind === "scalar") return "";
  if (spec.kind === "choice") return { kind: "choice", value: "" };
  if (spec.kind === "list") return { kind: "list", values: spec.values.map(() => "") };
  return { kind: "matrix", values: spec.values.map((row) => row.map(() => "")) };
}

export function describeInput(input: AnswerInput, spec?: AnswerSpec): string {
  if (typeof input === "string") return input;
  if (input.kind === "choice") return spec?.kind === "choice" ? spec.options.find((option) => option.value === input.value)?.label ?? "" : input.value;
  if (input.kind === "roots") return input.classification === "none" ? "Brak pierwiastków rzeczywistych" : input.values.join("; ");
  return input.kind === "list" ? input.values.join("; ") : input.values.map((row) => `[${row.join("; ")}]`).join(" ");
}

export function assessAnswer(spec: AnswerSpec, input: AnswerInput): AnswerAssessment {
  const invalid = (reason: "structure" | "choice"): AnswerAssessment => ({ kind: "invalid", reason });
  if (spec.kind === "roots") {
    if (typeof input === "string" || input.kind !== "roots" || !["none", "double", "two"].includes(input.classification)) return invalid("choice");
    const count = input.classification === "two" ? 2 : input.classification === "double" ? 1 : 0;
    if (input.values.length !== count) return invalid("structure");
    const parsed = input.values.map(parseAnswer);
    const failed = parsed.find((value) => value.kind === "invalid");
    if (failed?.kind === "invalid") return failed;
    if (count !== spec.values.length) return { kind: "incorrect" };
    return assessAnswer({ kind: "list", values: spec.values, labels: [], unordered: true }, { kind: "list", values: input.values });
  }
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
