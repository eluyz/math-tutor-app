import { appendSession, decodeHistory, emptyHistory, HISTORY_KEY, serializeHistory, type CompletedSession, type ProgressState } from "./model";

export type StorageAccess = () => Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function loadProgress(storage: StorageAccess): ProgressState {
  try { return decodeHistory(storage().getItem(HISTORY_KEY)); }
  catch { return { history: emptyHistory(), issue: "unavailable" }; }
}

// Call only for a completion event, never from rendering or a state updater.
export function saveCompletion(state: ProgressState, session: CompletedSession, storage: StorageAccess): ProgressState {
  if (state.history.sessions.some((entry) => entry.id === session.id)) return state;
  let history = appendSession(state.history, session);
  try {
    // Merge a fresh read so sequential completions in other tabs are not overwritten.
    const stored = loadProgress(storage);
    if (stored.issue) return { history, issue: stored.issue };
    // Include every in-memory entry, including completions made while storage failed.
    history = state.history.sessions.reduce(appendSession, stored.history);
    history = appendSession(history, session);
    storage().setItem(HISTORY_KEY, serializeHistory(history));
    return { history, issue: null };
  } catch { return { history, issue: "unavailable" }; }
}

export function deleteProgress(state: ProgressState, storage: StorageAccess): ProgressState {
  try {
    storage().removeItem(HISTORY_KEY);
    return { history: emptyHistory(), issue: null };
  } catch { return { ...state, issue: "delete-failed" }; }
}
