import { difficulties, type Difficulty } from "../difficulty";
import { allTemplates } from "../generators";
import type { CategoryId } from "../exercises";
import { examTotals, type ExamState } from "./model";

export const EXAM_HISTORY_KEY = "math-tutor.exam-history.v1";
export const EXAM_HISTORY_VERSION = 1;
export const MAX_EXAM_REPORTS = 50;
const MAX_STORAGE_LENGTH = 100_000;
export type ExamReport = Readonly<{
  id: string; completedAt: string; categories: readonly CategoryId[]; difficulty: Difficulty;
  total: number; correct: number; incorrect: number; invalid: number; skipped: number;
  elapsedMs: number; minutes: 0 | 15 | 30; timedOut: boolean;
}>;
export type ExamHistory = Readonly<{ version: 1; reports: readonly ExamReport[] }>;
export type ExamHistoryIssue = "invalid" | "unsupported" | "unavailable" | "delete-failed" | null;
export type ExamHistoryState = Readonly<{ history: ExamHistory; issue: ExamHistoryIssue }>;
export const emptyExamHistory = (): ExamHistory => ({ version: 1, reports: [] });
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const categories = new Set(allTemplates.map((template) => template.category));

function validateReport(value: unknown): ExamReport | null {
  if (!object(value) || typeof value.id !== "string" || !/^[\w-]{1,80}$/.test(value.id) ||
    typeof value.completedAt !== "string" || !Number.isFinite(Date.parse(value.completedAt)) ||
    new Date(value.completedAt).toISOString() !== value.completedAt ||
    !Array.isArray(value.categories) || !value.categories.length ||
    new Set(value.categories).size !== value.categories.length ||
    value.categories.some((category) => !categories.has(category)) ||
    !difficulties.includes(value.difficulty as Difficulty) ||
    ![5, 10, 20].includes(value.total as number) ||
    ![0, 15, 30].includes(value.minutes as number) ||
    typeof value.timedOut !== "boolean" ||
    typeof value.elapsedMs !== "number" || !Number.isInteger(value.elapsedMs) || value.elapsedMs < 0 ||
    ["correct", "incorrect", "invalid", "skipped"].some((key) =>
      !Number.isInteger(value[key]) || (value[key] as number) < 0) ||
    (value.correct as number) + (value.incorrect as number) + (value.invalid as number) +
      (value.skipped as number) !== value.total) return null;
  return { id: value.id as string, completedAt: value.completedAt as string,
    categories: [...value.categories] as CategoryId[], difficulty: value.difficulty as Difficulty,
    total: value.total as number, correct: value.correct as number,
    incorrect: value.incorrect as number, invalid: value.invalid as number,
    skipped: value.skipped as number, elapsedMs: value.elapsedMs as number,
    minutes: value.minutes as 0 | 15 | 30, timedOut: value.timedOut as boolean };
}

export function decodeExamHistory(raw: string | null): ExamHistoryState {
  if (raw === null) return { history: emptyExamHistory(), issue: null };
  try {
    if (raw.length > MAX_STORAGE_LENGTH) throw new Error("Oversized exam history");
    const data: unknown = JSON.parse(raw);
    if (!object(data) || !Number.isInteger(data.version)) throw new Error("Invalid history envelope");
    if (data.version !== EXAM_HISTORY_VERSION)
      return { history: emptyExamHistory(), issue: "unsupported" };
    if (!Array.isArray(data.reports) || data.reports.length > MAX_EXAM_REPORTS)
      throw new Error("Invalid reports");
    const seen = new Set<string>();
    const reports = data.reports.map((value) => {
      const report = validateReport(value);
      if (!report || seen.has(report.id)) throw new Error("Invalid or duplicate report");
      seen.add(report.id);
      return report;
    });
    return { history: { version: 1, reports }, issue: null };
  } catch { return { history: emptyExamHistory(), issue: "invalid" }; }
}

export function reportForExam(state: ExamState): ExamReport | null {
  if (state.submittedAt === null || !state.entries) return null;
  const { correct, incorrect, invalid, skipped, total } = examTotals(state.entries);
  return { id: state.id, completedAt: new Date(state.submittedAt).toISOString(),
    categories: [...state.config.categories], difficulty: state.config.difficulty,
    correct, incorrect, invalid, skipped, total,
    elapsedMs: Math.max(0, state.submittedAt - state.startedAt),
    minutes: state.config.minutes, timedOut: state.timedOut };
}

export function appendExamReport(history: ExamHistory, report: ExamReport): ExamHistory {
  if (history.reports.some((item) => item.id === report.id)) return history;
  return { version: 1, reports: [...history.reports, report].slice(-MAX_EXAM_REPORTS) };
}

export type ExamStorage = () => Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function loadExamHistory(storage: ExamStorage): ExamHistoryState {
  try { return decodeExamHistory(storage().getItem(EXAM_HISTORY_KEY)); }
  catch { return { history: emptyExamHistory(), issue: "unavailable" }; }
}
export function saveExamReport(state: ExamHistoryState, report: ExamReport, storage: ExamStorage): ExamHistoryState {
  const inMemory = appendExamReport(state.history, report);
  try {
    const stored = loadExamHistory(storage);
    // Unknown or damaged data must never be overwritten.
    if (stored.issue) return { history: inMemory, issue: stored.issue };
    const merged = appendExamReport(stored.history, report);
    if (merged !== stored.history) storage().setItem(EXAM_HISTORY_KEY, JSON.stringify(merged));
    return { history: merged, issue: null };
  } catch { return { history: inMemory, issue: "unavailable" }; }
}
export function clearExamHistory(state: ExamHistoryState, storage: ExamStorage): ExamHistoryState {
  try { storage().removeItem(EXAM_HISTORY_KEY); return { history: emptyExamHistory(), issue: null }; }
  catch { return { ...state, issue: "delete-failed" }; }
}
