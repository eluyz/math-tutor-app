import { describe, expect, it } from "vitest";
import type { AnswerInput } from "../answers";
import { hasUnsubmittedAnswer } from "./unsavedWork";

describe("unsubmitted work warning", () => {
  it.each<AnswerInput>([
    "", "  ",
    { kind: "primitive", coefficients: ["", " "], hasConstant: false },
    { kind: "system", classification: "", values: [] },
    { kind: "roots", classification: "", values: [] },
    { kind: "limit", classification: "", value: "" },
    { kind: "list", values: ["", " "] },
    { kind: "matrix", values: [["", ""], ["", " "]] },
    { kind: "choice", value: "" },
    { kind: "multi-choice", values: { left: "", right: " " } },
  ])("does not warn for a blank answer: %j", (answer) => {
    expect(hasUnsubmittedAnswer(answer, false)).toBe(false);
  });

  it.each<AnswerInput>([
    "0",
    { kind: "primitive", coefficients: ["", "2"], hasConstant: false },
    { kind: "primitive", coefficients: [""], hasConstant: true },
    { kind: "system", classification: "system-none", values: [] },
    { kind: "roots", classification: "none", values: [] },
    { kind: "limit", classification: "positive-infinity", value: "" },
    { kind: "list", values: ["", "0"] },
    { kind: "matrix", values: [["", ""], ["", "3"]] },
    { kind: "choice", value: "no" },
    { kind: "multi-choice", values: { left: "", right: "negative" } },
  ])("warns for a partial or complete draft, until submitted: %j", (answer) => {
    expect(hasUnsubmittedAnswer(answer, false)).toBe(true);
    expect(hasUnsubmittedAnswer(answer, true)).toBe(false);
  });
});
