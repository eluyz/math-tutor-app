import { describe, expect, it, vi } from "vitest";
import { advanceSession, createSession, recordFirstAttempt, recordSolutionViewed, type SessionState } from "../session";
import { checkAnswer } from "../exercises";
import { taskPool } from "../generators";
import { localizeTask } from "../locales/catalog";
import { uiCopy } from "../locales/ui";
import { aggregate, appendSession, breakdown, completedSession, decodeHistory, emptyHistory, filterHistory,
  HISTORY_KEY, MAX_HISTORY_LENGTH, MAX_SESSIONS, serializeHistory } from "./model";
import { deleteProgress, loadProgress, saveCompletion } from "./storage";

function session(kinds = ["correct", "incorrect", "viewed", "skip"]): SessionState {
  let state = createSession("order", "easy", "e0", "order-add-product");
  for (let i = 0; i < 10; i++) {
    const id = `e${i}`;
    state = recordFirstAttempt(state, id, "invalid");
    if (kinds[i % kinds.length] === "viewed") state = recordSolutionViewed(state, id);
    if (kinds[i % kinds.length] !== "skip") {
      state = recordFirstAttempt(state, id, kinds[i % kinds.length] === "incorrect" ? "incorrect" : "correct");
      // Neither viewing after assessment nor later correct attempts replace the first result.
      state = recordSolutionViewed(state, id);
      state = recordFirstAttempt(state, id, "correct");
    }
    state = advanceSession(state, id, `e${i + 1}`, "order-parentheses");
  }
  return state;
}
const timestamp = "2026-10-18T10:00:00.000Z";
const record = (id = "session-1") => completedSession(session(), id, timestamp)!;
function memoryStorage() {
  const data = new Map<string, string>();
  return { data, getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { data.set(key, value); }),
    removeItem: vi.fn((key: string) => { data.delete(key); }) };
}

describe("ukończone sesje: istniejąca semantyka i minimum danych", () => {
  it("nie zapisuje niedokończonej sesji i zachowuje cztery wykluczające się wyniki", () => {
    expect(completedSession(createSession("order", "easy", "e"), "id", timestamp)).toBeNull();
    expect(record()).toMatchObject({ shown: 10, correct: 3, incorrect: 3, solutionViewed: 2, skipped: 2 });
    expect(aggregate([record()])).toMatchObject({ sessions: 1, assessed: 6, accuracy: .5 });
  });
  it("serializacja nie zawiera treści odpowiedzi, notatek, ćwiczeń ani języka", () => {
    const serialized = serializeHistory(appendSession(emptyHistory(), record()));
    expect(serialized).not.toMatch(/exerciseId|answer|notes|locale|question|parameters|e0/);
    expect(JSON.parse(serialized).sessions[0].entries[0]).toEqual({ templateId: "order-add-product", outcome: "correct" });
    const dirty = JSON.parse(serialized); dirty.sessions[0].answer = "private"; dirty.sessions[0].entries[0].notes = "secret";
    expect(serializeHistory(decodeHistory(JSON.stringify(dirty)).history)).toBe(serialized);
  });
  it.each(["pl", "en"] as const)("%s: tę samą ocenę zapisuje niezależnie od prezentacji", (locale) => {
    const task = localizeTask(taskPool("order", "easy")[0], locale);
    let state = createSession("order", "easy", task.id, task.templateId);
    const spec = task.answer;
    if (!("numerator" in spec)) throw new Error("Expected scalar");
    const kind = checkAnswer(task, `${spec.numerator}/${spec.denominator}`, uiCopy[locale].feedback).kind;
    for (let i = 0; i < 10; i++) {
      const id = state.entries.at(-1)!.exerciseId;
      state = recordFirstAttempt(state, id, kind);
      state = advanceSession(state, id, `next${i}`, task.templateId);
    }
    expect(completedSession(state, locale, timestamp)?.correct).toBe(10);
  });
  it.each(["easy", "medium", "hard", "advanced", "expert"] as const)("waliduje poziom %s i rodzinę", (difficulty) => {
    const state = { ...session(), difficulty };
    expect(completedSession(state, difficulty, timestamp)?.difficulty).toBe(difficulty);
    const limited = completedSession({ ...state, category: "signed", entries: state.entries.map((e) => ({ ...e, templateId: "signed-add" })) }, difficulty, timestamp);
    expect(limited === null).toBe(difficulty === "advanced" || difficulty === "expert");
  });
});

describe("walidacja, ograniczenia i agregacja", () => {
  it("ma jawny mianownik, puste dane oraz rozdzielone pominięcia i podglądy", () => {
    expect(aggregate([])).toEqual({ sessions: 0, shown: 0, correct: 0, incorrect: 0, solutionViewed: 0, skipped: 0, assessed: 0, accuracy: null });
    const viewed = completedSession(session(["viewed", "skip"]), "viewed", timestamp)!;
    expect(aggregate([viewed])).toMatchObject({ correct: 0, incorrect: 0, solutionViewed: 5, skipped: 5, assessed: 0, accuracy: null });
    expect(aggregate([record(), viewed])).toMatchObject({ shown: 20, assessed: 6, correct: 3, accuracy: .5 });
  });
  it("filtruje kategorie, poziomy i daty bez modyfikowania historii", () => {
    const a = record("a"), b = { ...record("b"), difficulty: "expert" as const, completedAt: "2026-08-01T00:00:00.000Z" };
    const c = { ...record("c"), category: "fractions" as const, entries: a.entries.map((e) => ({ ...e, templateId: "fraction-add" })) };
    const history = [a, b, c].reduce(appendSession, emptyHistory());
    expect(filterHistory(history, { category: "order", difficulty: "expert" })).toEqual([b]);
    expect(filterHistory(history, { since: Date.parse("2026-10-01") })).toEqual([a, c]);
    expect(breakdown(history.sessions)).toHaveLength(3);
    expect(history.sessions).toHaveLength(3);
  });
  it.each(["{", "null", "[]", '{"version":1}', JSON.stringify({ version: 1, sessions: Array(201).fill(record()) }), "x".repeat(MAX_HISTORY_LENGTH + 1)])("odrzuca uszkodzoną lub zbyt dużą historię (%#)", (raw) => {
    expect(decodeHistory(raw)).toEqual({ history: emptyHistory(), issue: "invalid" });
  });
  it("wykrywa nieznaną wersję, duplikaty, fałszywe sumy i nieobsługiwane warianty", () => {
    expect(decodeHistory('{"version":2,"sessions":[]}').issue).toBe("unsupported");
    for (const entries of [[record(), record()], [{ ...record(), correct: 10 }], [{ ...record(), category: "unknown" }], [{ ...record(), difficulty: "legendary" }], [{ ...record(), completedAt: "invalid" }], [{ ...record(), entries: [{ templateId: "unknown", outcome: "correct" }] }]])
      expect(decodeHistory(JSON.stringify({ version: 1, sessions: entries })).issue).toBe("invalid");
  });
  it("zachowuje dokładnie najnowsze 200 ukończeń i deduplikuje przed przycinaniem", () => {
    let history = emptyHistory();
    for (let i = 0; i < MAX_SESSIONS + 3; i++) history = appendSession(history, record(`id-${i}`));
    expect(history.sessions).toHaveLength(MAX_SESSIONS);
    expect(history.sessions[0].id).toBe("id-3");
    expect(appendSession(history, history.sessions[0])).toBe(history);
    expect(decodeHistory(serializeHistory(history))).toEqual({ history, issue: null });
  });
});

describe("localStorage: ukończenie, ponowne wyświetlenie i usuwanie", () => {
  it("zapisuje raz; ponowne wyświetlenie i odczyt nie zapisują ani nie duplikują", () => {
    const storage = memoryStorage(), access = () => storage;
    const first = saveCompletion(loadProgress(access), record(), access);
    expect(saveCompletion(first, record(), access)).toBe(first);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(loadProgress(access)).toEqual(first);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(saveCompletion(loadProgress(access), record(), access).history.sessions).toHaveLength(1);
    // A fresh state also knows that this completion was already saved.
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });
  it("usuwa tylko własny klucz; reload i powrót do wyniku nie odtwarzają historii", () => {
    const storage = memoryStorage(), access = () => storage;
    storage.data.set("unrelated", "keep");
    const state = saveCompletion(loadProgress(access), record(), access);
    expect(deleteProgress(state, access)).toEqual({ history: emptyHistory(), issue: null });
    expect(loadProgress(access).history.sessions).toEqual([]);
    expect(storage.data.get("unrelated")).toBe("keep");
  });
  it("odmowa dostępu i quota nie przerywają pracy, a nowe dane pozostają w pamięci", () => {
    const denied = () => { throw new Error("SecurityError"); };
    expect(loadProgress(denied).issue).toBe("unavailable");
    expect(saveCompletion(loadProgress(denied), record(), denied)).toMatchObject({ issue: "unavailable", history: { sessions: [record()] } });
    const storage = memoryStorage(), access = () => storage;
    storage.setItem.mockImplementation(() => { throw new Error("QuotaExceededError"); });
    const failed = saveCompletion(loadProgress(access), record(), access);
    expect(failed.history.sessions).toHaveLength(1);
    expect(failed.issue).toBe("unavailable");
    expect(deleteProgress(failed, denied)).toMatchObject({ issue: "delete-failed", history: failed.history });
    storage.setItem.mockImplementation((key, value) => { storage.data.set(key, value); });
    expect(saveCompletion(failed, record("second"), access).history.sessions).toHaveLength(2);
    expect(loadProgress(access).history.sessions).toHaveLength(2);
  });
  it.each(["{", '{"version":42,"sessions":[]}'])("nie nadpisuje uszkodzonych lub przyszłych danych (%s)", (raw) => {
    const storage = memoryStorage(), access = () => storage;
    storage.data.set(HISTORY_KEY, raw);
    const next = saveCompletion(loadProgress(access), record(), access);
    expect(next.history.sessions).toHaveLength(1);
    expect(storage.data.get(HISTORY_KEY)).toBe(raw);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(deleteProgress(next, access).issue).toBeNull();
    expect(loadProgress(access).history.sessions).toHaveLength(0);
  });
  it("scala kolejne ukończenia z dwóch otwartych kart", () => {
    const storage = memoryStorage(), access = () => storage;
    const tabA = loadProgress(access), tabB = loadProgress(access);
    saveCompletion(tabA, record("A"), access);
    saveCompletion(tabB, record("B"), access);
    expect(loadProgress(access).history.sessions.map((r) => r.id)).toEqual(["A", "B"]);
  });
});
