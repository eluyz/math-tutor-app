import { describe, expect, it } from "vitest";
import { emptyAnswer, formatRational, type AnswerInput, type AnswerSpec } from "../answers";
import { getAnswerSpec } from "../exercises";
import { allTemplates, taskPool } from "../generators";
import { addRational, rational } from "../rational";
import { appendExamReport, decodeExamHistory, emptyExamHistory, EXAM_HISTORY_KEY,
  loadExamHistory, reportForExam, saveExamReport } from "./history";
import { editExamAnswer, examCapacity, examConfigError, examTotals, isBlankAnswer,
  moveExam, scoreExam, selectExamTasks, startExam, submitExam, type ExamConfig } from "./model";

const config: ExamConfig = { categories: ["order", "integrals"], difficulty: "easy", count: 10, minutes: 15 };
const number = (value: ReturnType<typeof rational>) => formatRational(value);
function correct(spec: AnswerSpec): AnswerInput {
  switch (spec.kind) {
    case "primitive": return { kind: "primitive", coefficients: spec.terms.map((term) => number(term.coefficient)), hasConstant: true };
    case "system": return { kind: "system", classification: spec.classification,
      values: spec.classification === "system-one" ? spec.values.map(number) : [] };
    case "limit": return { kind: "limit", classification: spec.value.kind,
      value: spec.value.kind === "finite" ? number(spec.value.value) : "" };
    case "roots": return { kind: "roots", classification: spec.values.length === 0 ? "none" : spec.values.length === 1 ? "double" : "two", values: spec.values.map(number) };
    case "scalar": return number(spec.value);
    case "list": return { kind: "list", values: spec.values.map(number) };
    case "matrix": return { kind: "matrix", values: spec.values.map((row) => row.map(number)) };
    case "choice": return { kind: "choice", value: spec.value };
  }
}
function malformed(spec: AnswerSpec): AnswerInput {
  const valid = correct(spec);
  if (typeof valid === "string") return "1/0";
  if (valid.kind === "primitive") return { ...valid, coefficients: ["1/0", ...valid.coefficients.slice(1)] };
  if (valid.kind === "system") return { ...valid, classification: "" };
  if (valid.kind === "limit") return { ...valid, classification: "" };
  if (valid.kind === "roots") return { ...valid, classification: "" };
  if (valid.kind === "choice") return { ...valid, value: "unknown" };
  if (valid.kind === "list") return { ...valid, values: ["1/0", ...valid.values.slice(1)] };
  return { ...valid, values: valid.values.map((row, i) => i ? row : ["1/0", ...row.slice(1)]) };
}
function incorrect(spec: AnswerSpec): AnswerInput {
  const plusOne = (value: ReturnType<typeof rational>) => number(addRational(value, rational(1)));
  switch (spec.kind) {
    case "primitive": return { kind: "primitive", hasConstant: true,
      coefficients: [plusOne(spec.terms[0].coefficient), ...spec.terms.slice(1).map((term) => number(term.coefficient))] };
    case "system": return { kind: "system", classification: spec.classification === "system-one" ? "system-none" : "system-one",
      values: spec.classification === "system-one" ? [] : spec.variables.map(() => "0") };
    case "limit": return { kind: "limit", classification: spec.value.kind === "finite" ? "does-not-exist" : "finite", value: "0" };
    case "roots": return { kind: "roots", classification: spec.values.length ? "none" : "double", values: spec.values.length ? [] : ["0"] };
    case "scalar": return plusOne(spec.value);
    case "list": return { kind: "list", values: [plusOne(spec.values[0]), ...spec.values.slice(1).map(number)] };
    case "matrix": return { kind: "matrix", values: spec.values.map((row, i) =>
      row.map((value, j) => i === 0 && j === 0 ? plusOne(value) : number(value))) };
    case "choice": return { kind: "choice", value: spec.options.find((option) => option.value !== spec.value)!.value };
  }
}

describe("MT-EXAM-001 model", () => {
  it("selects a deterministic, balanced set without repeated content or silent difficulty changes", () => {
    const selected = selectExamTasks(config, 123);
    expect(selected).toHaveLength(10);
    expect(selected.map((task) => task.id)).toEqual(selectExamTasks(config, 123).map((task) => task.id));
    expect(new Set(selected.map((task) => task.contentKey)).size).toBe(10);
    expect(selected.every((task) => task.difficulty === "easy")).toBe(true);
    expect(selected.filter((task) => task.category === "order")).toHaveLength(5);
    expect(selected.filter((task) => task.category === "integrals")).toHaveLength(5);
    expect(new Set(selected.map((task) => task.templateId)).size).toBeGreaterThan(2);
    expect(examCapacity(config)).toBeGreaterThan(10);
    expect(examConfigError({ ...config, categories: [] })).toBe("categories");
    expect(examConfigError({ ...config, categories: ["order", "order"] })).toBe("categories");
    expect(examConfigError({ ...config, categories: ["integrals"], difficulty: "expert", count: 20 })).toBeNull();
    expect(examConfigError({ ...config, categories: ["order"], difficulty: "expert" })).toBeNull();
    expect(examConfigError({ ...config, count: 1000 as 20 })).toBe("capacity");
  });

  it("keeps the latest answer while navigating; scores exactly once and locks after manual or timed submission", () => {
    let state = startExam(config, 7, 1_000, "exam-1");
    expect(state.deadline).toBe(901_000);
    state = editExamAnswer(state, "4", 2_000);
    state = moveExam(state, 1, 2_000);
    state = editExamAnswer(state, "1/0", 3_000);
    state = moveExam(state, 0, 3_000);
    expect(state.answers[0]).toBe("4");
    state = editExamAnswer(state, correct(getAnswerSpec(state.tasks[0])), 4_000);
    const submitted = submitExam(state, 5_000);
    expect(submitted.entries?.[0].outcome).toBe("correct");
    expect(submitted.entries?.[1].outcome).toBe("invalid");
    expect(submitted.entries?.[2].outcome).toBe("skipped");
    const totals = examTotals(submitted.entries!);
    expect(totals.correct + totals.incorrect + totals.invalid + totals.skipped).toBe(10);
    expect(totals.percent).toBe(10);
    expect(submitExam(submitted, 8_000)).toBe(submitted);
    expect(editExamAnswer(submitted, "999", 8_000)).toBe(submitted);
    expect(moveExam(submitted, 2, 8_000)).toBe(submitted);
    const timed = submitExam(state, state.deadline!);
    expect(timed.timedOut).toBe(true);
    expect(editExamAnswer(state, "999", state.deadline!)).toEqual(timed);
    expect(moveExam(state, 3, state.deadline!)).toEqual(timed);
  });

  it("distinguishes blank, partial/invalid, incorrect and correct for every answer class", () => {
    const specimens = new Map<AnswerSpec["kind"], ReturnType<typeof taskPool>[number]>();
    for (const family of allTemplates) for (const level of family.supportedDifficulties) {
      const task = taskPool(family.category, level).find((item) => item.templateId === family.id);
      if (task) specimens.set(getAnswerSpec(task).kind, specimens.get(getAnswerSpec(task).kind) ?? task);
    }
    expect([...specimens.keys()].sort()).toEqual(["choice", "limit", "list", "matrix", "primitive", "roots", "scalar", "system"]);
    for (const task of specimens.values()) {
      const spec = getAnswerSpec(task);
      const state = { ...startExam({ categories: [task.category], difficulty: task.difficulty,
        count: 5, minutes: 0 }, 4, 100, task.id), tasks: [task], answers: [correct(spec)] };
      expect(scoreExam(state)[0].outcome, spec.kind).toBe("correct");
      expect(scoreExam({ ...state, answers: [malformed(spec)] })[0].outcome, spec.kind).toBe("invalid");
      expect(scoreExam({ ...state, answers: [incorrect(spec)] })[0].outcome, spec.kind).toBe("incorrect");
      expect(scoreExam({ ...state, answers: [emptyAnswer(spec)] })[0].outcome, spec.kind).toBe("skipped");
      expect(isBlankAnswer(state.answers[0])).toBe(false);
    }
  });
});

describe("MT-EXAM-001 local history", () => {
  const report = reportForExam(submitExam(startExam(config, 5, 100, "exam-1"), 200))!;
  it("uses a separate versioned key, validates totals, and caps history at 50", () => {
    expect(EXAM_HISTORY_KEY).not.toBe("math-tutor.progress.v1");
    expect(report.total).toBe(10);
    expect(report.skipped).toBe(10);
    const one = appendExamReport(emptyExamHistory(), report);
    expect(appendExamReport(one, report)).toBe(one);
    expect(decodeExamHistory(JSON.stringify(one)).history).toEqual(one);
    expect(decodeExamHistory(JSON.stringify({ ...one, reports: [{ ...report, answer: "private" }] }))
      .history.reports[0]).not.toHaveProperty("answer");
    expect(decodeExamHistory(JSON.stringify({ ...one, reports: [{ ...report, correct: 1 }] })).issue).toBe("invalid");
    expect(decodeExamHistory(JSON.stringify({ ...one, version: 2 })).issue).toBe("unsupported");
    const many = Array.from({ length: 55 }, (_, n) => ({ ...report, id: `exam-${n}` }))
      .reduce(appendExamReport, emptyExamHistory());
    expect(many.reports).toHaveLength(50);
    expect(many.reports[0].id).toBe("exam-5");
  });
  it("does not overwrite corrupt or future storage, and tolerates unavailable storage", () => {
    let raw: string | null = JSON.stringify({ version: 99, reports: [] });
    let writes = 0;
    const storage = () => ({ getItem: () => raw, setItem: (_key: string, value: string) => { writes++; raw = value; }, removeItem: () => { raw = null; } });
    const saved = saveExamReport(loadExamHistory(storage), report, storage);
    expect(saved.issue).toBe("unsupported");
    expect(writes).toBe(0);
    raw = null;
    const good = saveExamReport(loadExamHistory(storage), report, storage);
    expect(good.issue).toBeNull();
    expect(writes).toBe(1);
    expect(saveExamReport(good, report, storage).history).toEqual(good.history);
    expect(writes).toBe(1);
    expect(loadExamHistory(() => { throw Error("blocked"); }).issue).toBe("unavailable");
  });
});
