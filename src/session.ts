import type { CategoryId, CheckResult } from "./exercises";
import type { Difficulty } from "./generators";

export const SESSION_LENGTH = 10;
type FirstAttempt = "correct" | "incorrect" | null;
type SessionEntry = Readonly<{ exerciseId: string; firstAttempt: FirstAttempt }>;
export type SessionState = Readonly<{
  category: CategoryId;
  difficulty: Difficulty;
  entries: readonly SessionEntry[];
  completed: boolean;
}>;
export type SessionSummary = Readonly<{
  shown: number;
  correct: number;
  incorrect: number;
  skipped: number;
}>;
export type LevelSuggestion =
  | { kind: "insufficient" }
  | { kind: "suggestion"; difficulty: Difficulty };

export function createSession(category: CategoryId, difficulty: Difficulty, exerciseId: string): SessionState {
  return { category, difficulty, entries: [{ exerciseId, firstAttempt: null }], completed: false };
}

/** Only the first valid main answer for the current exercise is recorded. */
export function recordFirstAttempt(session: SessionState, exerciseId: string, kind: CheckResult["kind"]): SessionState {
  const current = session.entries[session.entries.length - 1];
  if (session.completed || current.exerciseId !== exerciseId || current.firstAttempt !== null || kind === "invalid")
    return session;
  return {
    ...session,
    entries: [...session.entries.slice(0, -1), { ...current, firstAttempt: kind }],
  };
}

/** Exercise identity makes repeated or stale navigation events a no-op. */
export function advanceSession(session: SessionState, exerciseId: string, nextExerciseId?: string): SessionState {
  const current = session.entries[session.entries.length - 1];
  if (session.completed || current.exerciseId !== exerciseId) return session;
  if (session.entries.length === SESSION_LENGTH) return { ...session, completed: true };
  if (!nextExerciseId || session.entries.some((entry) => entry.exerciseId === nextExerciseId)) return session;
  return { ...session, entries: [...session.entries, { exerciseId: nextExerciseId, firstAttempt: null }] };
}

export function summarizeSession(session: SessionState): SessionSummary | null {
  if (!session.completed) return null;
  return {
    shown: session.entries.length,
    correct: session.entries.filter((entry) => entry.firstAttempt === "correct").length,
    incorrect: session.entries.filter((entry) => entry.firstAttempt === "incorrect").length,
    skipped: session.entries.filter((entry) => entry.firstAttempt === null).length,
  };
}

/** One-session indicator, not an assessment of a person's mathematical ability. */
export function suggestLevel(current: Difficulty, summary: SessionSummary): LevelSuggestion {
  if (summary.shown !== SESSION_LENGTH || summary.correct + summary.incorrect < 7)
    return { kind: "insufficient" };
  const levels: Difficulty[] = ["easy", "medium", "hard"];
  const direction = summary.correct >= 8 ? 1 : summary.correct <= 4 ? -1 : 0;
  const index = Math.max(0, Math.min(levels.length - 1, levels.indexOf(current) + direction));
  return { kind: "suggestion", difficulty: levels[index] };
}
