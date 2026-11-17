import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnswerFields } from "./AnswerFields";
import { LocaleProvider } from "./locales/LocaleProvider";
import { emptyAnswer, type AnswerSpec } from "./answers";

const one = { numerator: 1n, denominator: 1n };
const choices = [{ value: "yes", label: "Tak" }, { value: "no", label: "Nie" }];
const scalar: AnswerSpec = { kind: "scalar", value: one };
const choice: AnswerSpec = { kind: "choice", value: "yes", options: choices };
const structured: AnswerSpec[] = [
  { kind: "primitive", terms: [{ basis: "x", coefficient: one }] },
  { kind: "system", classification: "system-one", variables: ["x", "y"], values: [one, one] },
  { kind: "limit", value: { kind: "finite", value: one } },
  { kind: "roots", values: [one] },
  { kind: "multi-choice", fields: [{ id: "domain", label: "Dziedzina", value: "yes", options: choices }] },
  { kind: "list", labels: ["x", "y"], values: [one, one] },
  { kind: "matrix", values: [[one, one], [one, one]] },
];

function render(spec: AnswerSpec, props: Partial<ComponentProps<typeof AnswerFields>> & {
  invalid?: boolean; feedbackId?: string;
} = {}) {
  return renderToStaticMarkup(createElement(LocaleProvider, null,
    createElement(AnswerFields, { spec, value: emptyAnswer(spec), onChange: () => {}, ...props })));
}

function answerContainer(markup: string, spec: AnswerSpec) {
  const tag = spec.kind === "scalar" ? "input" : spec.kind === "choice" ? "select" : "fieldset";
  const openingTag = markup.match(new RegExp(`<${tag}\\b[^>]*>`))?.[0];
  expect(openingTag).toBeDefined();
  return openingTag!;
}

describe("answer feedback accessibility", () => {
  // Removing feedback associations from any answer branch must break these cases.
  it.each([scalar, choice])("associates the $kind control with help and feedback", (spec) => {
    const control = answerContainer(render(spec, { idPrefix: "review-", invalid: true, feedbackId: "review-feedback" }), spec);
    expect(control).toContain('aria-describedby="review-answer-help review-feedback"');
    expect(control).toContain('aria-invalid="true"');
  });

  // An aggregate incorrect result must not claim every coefficient/cell is wrong.
  it.each(structured)("marks only the $kind group invalid and associates its feedback", (spec) => {
    const markup = render(spec, { idPrefix: "review-", invalid: true, feedbackId: "review-feedback" });
    const group = answerContainer(markup, spec);
    expect(group).toContain('aria-describedby="review-answer-help review-feedback"');
    expect(group).toContain('aria-invalid="true"');
    const controls = markup.match(/<(?:input|select)\b[^>]*>/g) ?? [];
    expect(controls.length).toBeGreaterThan(0);
    for (const control of controls) expect(control).not.toContain("aria-invalid");
  });

  it.each([scalar, choice, ...structured])("keeps untouched $kind answers free from error claims", (spec) => {
    const markup = render(spec);
    expect(answerContainer(markup, spec)).toContain('aria-describedby="answer-help"');
    expect(markup).not.toContain("aria-invalid");
    expect(markup).not.toContain("undefined");
  });

  it("removes the invalid state while keeping feedback available for a corrected answer", () => {
    const control = answerContainer(render(scalar, { invalid: false, feedbackId: "answer-feedback", value: "-1/2", fractionInput: true }), scalar);
    expect(control).not.toContain("aria-invalid");
    expect(control).toContain('aria-describedby="answer-help answer-feedback"');
    expect(control).toContain('type="text"');
    expect(control).toContain('inputMode="text"');
    expect(control).toContain('value="-1/2"');
  });

  it("keeps the submit name separate from its decorative arrow and supports review without submit", () => {
    const markup = render(scalar);
    expect(markup).toMatch(/<button[^>]*type="submit"[^>]*>Sprawdź <span aria-hidden="true">→<\/span><\/button>/);
    expect(render(scalar, { showSubmit: false })).not.toContain("<button");
  });
});
