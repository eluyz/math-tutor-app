import type { Difficulty } from "./generators";
import { difficultyLabels, sessionCopy } from "./locales/pl";
import { suggestLevel, type SessionSummary } from "./session";

type Props = {
  summary: SessionSummary;
  difficulty: Difficulty;
  onStartSession: (level: Difficulty) => void;
  onPractice: () => void;
};

export function SessionSummaryPanel({ summary, difficulty, onStartSession, onPractice }: Props) {
  const suggestion = suggestLevel(difficulty, summary);
  return (
    <section className="session-summary" aria-labelledby="session-complete">
      <h3 id="session-complete" tabIndex={-1} aria-describedby="session-summary-counts">
        {sessionCopy.complete}
      </h3>
      <dl id="session-summary-counts">
        <div><dt>{sessionCopy.shown}</dt><dd>{summary.shown}</dd></div>
        <div><dt>{sessionCopy.correct}</dt><dd>{summary.correct}/{summary.shown}</dd></div>
        <div><dt>{sessionCopy.incorrect}</dt><dd>{summary.incorrect}</dd></div>
        <div><dt>{sessionCopy.skipped}</dt><dd>{summary.skipped}</dd></div>
      </dl>
      <p>{sessionCopy.counting}</p>
      <p>{sessionCopy.caveat}</p>
      {suggestion.kind === "insufficient" ? (
        <>
          <p role="status"><strong>{sessionCopy.insufficient}</strong></p>
          <p>{sessionCopy.minimum}</p>
        </>
      ) : (
        <p role="status"><strong>{sessionCopy.suggested}: {difficultyLabels[suggestion.difficulty]}</strong></p>
      )}
      <div className="summary-actions">
        {suggestion.kind === "suggestion" && (
          <button type="button" className="next-button" onClick={() => onStartSession(suggestion.difficulty)}>
            {sessionCopy.accept}
          </button>
        )}
        {(suggestion.kind === "insufficient" || suggestion.difficulty !== difficulty) && (
          <button type="button" className="next-button" onClick={() => onStartSession(difficulty)}>
            {sessionCopy.repeat}
          </button>
        )}
        <button type="button" className="next-button" onClick={onPractice}>{sessionCopy.practice}</button>
      </div>
    </section>
  );
}
