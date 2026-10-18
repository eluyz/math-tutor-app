import type { CategoryId } from "../exercises";
import { difficulties, type Difficulty } from "../difficulty";
import { allTemplates } from "../generators";
import {
  SESSION_LENGTH,
  summarizeSession,
  type SessionState,
  type SessionSummary,
} from "../session";

export const HISTORY_KEY = "math-tutor.progress.v1";
export const HISTORY_VERSION = 1;
export const MAX_SESSIONS = 200;
export const MAX_HISTORY_LENGTH = 1_000_000;
export type Outcome = "correct" | "incorrect" | "solution-viewed" | "skipped";
export type CompletedSession = Readonly<
  SessionSummary & {
    id: string;
    completedAt: string;
    category: CategoryId;
    difficulty: Difficulty;
    entries: readonly Readonly<{ templateId: string; outcome: Outcome }>[];
  }
>;
export type History = Readonly<{
  version: typeof HISTORY_VERSION;
  sessions: readonly CompletedSession[];
}>;
export type HistoryIssue =
  | "unavailable"
  | "invalid"
  | "unsupported"
  | "delete-failed";
export type ProgressState = Readonly<{
  history: History;
  issue: HistoryIssue | null;
  unsavedIds?: readonly string[];
}>;
export const emptyHistory = (): History => ({
  version: HISTORY_VERSION,
  sessions: [],
});
const templates = new Map(
  allTemplates.map((template) => [template.id, template]),
);
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const outcomes: readonly Outcome[] = [
  "correct",
  "incorrect",
  "solution-viewed",
  "skipped",
];

// Reconstruct a whitelist of metadata: never retain answers or arbitrary extra fields.
function validateSession(value: unknown): CompletedSession | null {
  if (
    !object(value) ||
    typeof value.id !== "string" ||
    !/^[\w-]{1,80}$/.test(value.id) ||
    typeof value.completedAt !== "string" ||
    value.completedAt.length !== 24 ||
    !Number.isFinite(Date.parse(value.completedAt)) ||
    new Date(value.completedAt).toISOString() !== value.completedAt ||
    !difficulties.includes(value.difficulty as Difficulty) ||
    value.shown !== SESSION_LENGTH ||
    !Array.isArray(value.entries) ||
    value.entries.length !== SESSION_LENGTH
  )
    return null;
  const entries: { templateId: string; outcome: Outcome }[] = [];
  for (const entry of value.entries) {
    if (
      !object(entry) ||
      typeof entry.templateId !== "string" ||
      !outcomes.includes(entry.outcome as Outcome)
    )
      return null;
    const template = templates.get(entry.templateId);
    if (
      !template ||
      template.category !== value.category ||
      !template.supportedDifficulties.includes(value.difficulty as Difficulty)
    )
      return null;
    entries.push({
      templateId: entry.templateId,
      outcome: entry.outcome as Outcome,
    });
  }
  const counts = {
    shown: SESSION_LENGTH,
    correct: entries.filter((entry) => entry.outcome === "correct").length,
    incorrect: entries.filter((entry) => entry.outcome === "incorrect").length,
    solutionViewed: entries.filter(
      (entry) => entry.outcome === "solution-viewed",
    ).length,
    skipped: entries.filter((entry) => entry.outcome === "skipped").length,
  };
  for (const key of [
    "correct",
    "incorrect",
    "solutionViewed",
    "skipped",
  ] as const)
    if (value[key] !== counts[key]) return null;
  return {
    id: value.id,
    completedAt: value.completedAt,
    category: value.category as CategoryId,
    difficulty: value.difficulty as Difficulty,
    ...counts,
    entries,
  };
}

export function completedSession(
  session: SessionState,
  id: string,
  completedAt: string,
): CompletedSession | null {
  const summary = summarizeSession(session);
  if (!summary) return null;
  return validateSession({
    id,
    completedAt,
    category: session.category,
    difficulty: session.difficulty,
    ...summary,
    entries: session.entries.map((entry) => ({
      templateId: entry.templateId,
      outcome: entry.firstAttempt ?? "skipped",
    })),
  });
}

export function decodeHistory(raw: string | null): ProgressState {
  if (raw === null) return { history: emptyHistory(), issue: null };
  try {
    if (raw.length > MAX_HISTORY_LENGTH) throw new Error("History too large");
    const data: unknown = JSON.parse(raw);
    if (!object(data) || !Number.isInteger(data.version))
      throw new Error("Invalid envelope");
    if (data.version !== HISTORY_VERSION)
      return { history: emptyHistory(), issue: "unsupported" };
    if (!Array.isArray(data.sessions) || data.sessions.length > MAX_SESSIONS)
      throw new Error("Invalid sessions");
    const ids = new Set<string>();
    const sessions = data.sessions.map((value) => {
      const session = validateSession(value);
      if (!session || ids.has(session.id))
        throw new Error("Invalid or duplicate session");
      ids.add(session.id);
      return session;
    });
    return { history: { version: HISTORY_VERSION, sessions }, issue: null };
  } catch {
    return { history: emptyHistory(), issue: "invalid" };
  }
}

export function appendSession(
  history: History,
  session: CompletedSession,
): History {
  if (history.sessions.some((entry) => entry.id === session.id)) return history;
  // Completion order remains meaningful even if the device clock moves backwards.
  return {
    version: HISTORY_VERSION,
    sessions: [...history.sessions, session].slice(-MAX_SESSIONS),
  };
}
export function serializeHistory(history: History): string {
  return JSON.stringify(history);
}

export type Totals = SessionSummary & {
  sessions: number;
  assessed: number;
  accuracy: number | null;
};
export function aggregate(sessions: readonly CompletedSession[]): Totals {
  const totals = sessions.reduce(
    (sum, session) => ({
      sessions: sum.sessions + 1,
      shown: sum.shown + session.shown,
      correct: sum.correct + session.correct,
      incorrect: sum.incorrect + session.incorrect,
      solutionViewed: sum.solutionViewed + session.solutionViewed,
      skipped: sum.skipped + session.skipped,
    }),
    {
      sessions: 0,
      shown: 0,
      correct: 0,
      incorrect: 0,
      solutionViewed: 0,
      skipped: 0,
    },
  );
  const assessed = totals.correct + totals.incorrect;
  return {
    ...totals,
    assessed,
    accuracy: assessed ? totals.correct / assessed : null,
  };
}
export type HistoryFilter = {
  category?: CategoryId;
  difficulty?: Difficulty;
  since?: number;
};
export function filterHistory(
  history: History,
  filter: HistoryFilter,
): readonly CompletedSession[] {
  return history.sessions.filter(
    (session) =>
      (!filter.category || session.category === filter.category) &&
      (!filter.difficulty || session.difficulty === filter.difficulty) &&
      (filter.since === undefined ||
        Date.parse(session.completedAt) >= filter.since),
  );
}
export function breakdown(sessions: readonly CompletedSession[]) {
  const groups = new Map<string, CompletedSession[]>();
  for (const session of sessions) {
    const key = `${session.category}:${session.difficulty}`;
    groups.set(key, [...(groups.get(key) ?? []), session]);
  }
  return [...groups.values()].map((group) => ({
    category: group[0].category,
    difficulty: group[0].difficulty,
    totals: aggregate(group),
  }));
}
