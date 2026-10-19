import { it, expect } from "vitest";
import { createGenerator, availableDifficulties } from "../generators";
import { difficulties } from "../difficulty";
import { getAnswerSpec, checkAnswer } from "../exercises";
import {
  emptyAnswer,
  formatRational as f,
  type AnswerSpec,
  type AnswerInput,
} from "../answers";
import { feedback } from "../locales/pl";
import {
  createSession,
  recordFirstAttempt,
  recordSolutionViewed,
  advanceSession,
  summarizeSession,
  suggestLevel,
} from "../session";
import {
  completedSession,
  decodeHistory,
  serializeHistory,
} from "../progress/model";
function correct(spec: AnswerSpec): AnswerInput {
  switch (spec.kind) {
    case "scalar":
      return f(spec.value);
    case "list":
      return { kind: "list", values: spec.values.map(f) };
    case "choice":
      return { kind: "choice", value: spec.value };
    case "limit":
      return {
        kind: "limit",
        classification: spec.value.kind,
        value: spec.value.kind === "finite" ? f(spec.value.value) : "",
      };
    default:
      throw new Error("Unexpected calculus answer kind");
  }
}
for (const category of ["function-limits", "derivatives"] as const)
  for (const level of difficulties)
    it(`${category}/${level}: invalid is not an attempt, viewed solution is not independent success, history and recommendation are valid`, () => {
      const generator = createGenerator(185),
        tasks = Array.from(
          { length: 10 },
          () => generator.next(category, level).exercise,
        );
      let session = createSession(
        category,
        level,
        tasks[0].id,
        tasks[0].templateId,
      );
      expect(
        completedSession(session, "incomplete", "2026-10-19T00:00:00.000Z"),
      ).toBeNull();
      for (let i = 0; i < 10; i++) {
        const task = tasks[i],
          spec = getAnswerSpec(task),
          invalid = checkAnswer(task, emptyAnswer(spec), feedback);
        expect(invalid.kind).toBe("invalid");
        expect(recordFirstAttempt(session, task.id, invalid.kind)).toBe(
          session,
        );
        if (i === 0) session = recordSolutionViewed(session, task.id);
        if (i !== 1) {
          const result = checkAnswer(task, correct(spec), feedback);
          expect(result.kind).toBe("correct");
          const next = recordFirstAttempt(session, task.id, result.kind);
          if (i === 0) expect(next).toBe(session);
          session = next;
        }
        session = advanceSession(
          session,
          task.id,
          tasks[i + 1]?.id,
          tasks[i + 1]?.templateId,
        );
      }
      const summary = summarizeSession(session)!;
      expect(summary).toEqual({
        shown: 10,
        correct: 8,
        incorrect: 0,
        solutionViewed: 1,
        skipped: 1,
      });
      const saved = completedSession(
        session,
        `calculus-${category}-${level}`,
        "2026-10-19T00:00:00.000Z",
      )!;
      expect(saved).not.toBeNull();
      const history = { version: 1 as const, sessions: [saved] };
      expect(decodeHistory(serializeHistory(history))).toEqual({
        history,
        issue: null,
      });
      const expected =
        difficulties[Math.min(difficulties.indexOf(level) + 1, 4)];
      expect(
        suggestLevel(level, summary, availableDifficulties(category)),
      ).toEqual({ kind: "suggestion", difficulty: expected });
    });
