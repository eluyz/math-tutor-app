import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { examCopy } from "./copy";
import { ExamQuestionNavigation } from "./ExamQuestionNavigation";

describe("ExamQuestionNavigation", () => {
  for (const locale of ["pl", "en"] as const) {
    const c = examCopy[locale];
    const render = (currentIndex: number) => renderToStaticMarkup(createElement(ExamQuestionNavigation, {
      answerPresence: [true, false], currentIndex, copy: c, onSelect: () => {},
    }));

    it(`shows visible and accessible answer presence in ${locale}`, () => {
      const html = render(0);
      const answered = locale === "pl" ? "Wpisano odpowiedź" : "Answer entered";
      const unanswered = locale === "pl" ? "Brak odpowiedzi" : "No answer";
      expect(html).toContain(`aria-label="${c.question(1, 2)}: ${answered}"`);
      expect(html).toContain(`aria-label="${c.question(2, 2)}: ${unanswered}"`);
      expect(html).toContain(`>${answered}</span>`);
      expect(html).toContain(`>${unanswered}</span>`);
      expect(html).toContain(`aria-label="${c.review}"`);
    });

    it(`keeps the current step independent of answer presence in ${locale}`, () => {
      const firstCurrent = render(0).match(/<button[^>]*aria-current="step"[^>]*>/g);
      const secondCurrent = render(1).match(/<button[^>]*aria-current="step"[^>]*>/g);
      expect(firstCurrent).toHaveLength(1);
      expect(secondCurrent).toHaveLength(1);
      expect(firstCurrent![0]).toContain(c.question(1, 2));
      expect(secondCurrent![0]).toContain(c.question(2, 2));
      expect(render(0)).toContain('class="answered"');
      expect(render(1)).toContain('class="answered"');
    });

    it(`does not reveal correctness or scoring in ${locale}`, () => {
      const html = render(0);
      for (const outcome of [c.correct, c.incorrect, c.invalid, c.skipped, c.correctAnswer]) {
        expect(html).not.toContain(outcome);
      }
      expect(html).not.toMatch(/data-(?:correct|outcome|score)|aria-pressed/);
    });
  }
});
