import { useRef, useState } from "react";
import type { CategoryId } from "../exercises";
import { difficultyConfig, type Difficulty } from "../difficulty";
import { useLocale } from "../locales/LocaleProvider";
import {
  aggregate,
  breakdown,
  filterHistory,
  MAX_SESSIONS,
  serializeHistory,
  type History,
  type HistoryIssue,
  type Totals,
} from "./model";
import "./progress.css";

function Statistics({ totals }: { totals: Totals }) {
  const { copy, locale } = useLocale();
  const p = copy.progress;
  return (
    <>
      <dl className="progress-statistics">
        {(
          [
            ["sessions", p.sessions],
            ["correct", p.correct],
            ["incorrect", p.incorrect],
            ["solutionViewed", p.viewed],
            ["skipped", p.skipped],
            ["shown", p.shown],
            ["assessed", p.assessed],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd data-stat={key}>{totals[key]}</dd>
          </div>
        ))}
        <div className="progress-accuracy">
          <dt>{p.accuracy}</dt>
          <dd data-stat="accuracy">
            {totals.accuracy === null
              ? p.noAssessments
              : `${totals.correct} / ${totals.assessed} (${new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(totals.accuracy)})`}
          </dd>
        </div>
      </dl>
      {totals.assessed < 7 && <p className="input-help">{p.insufficient}</p>}
    </>
  );
}

export function ProgressDashboard({
  active,
  history,
  issue,
  onDelete,
  onLearn,
}: {
  active: boolean;
  history: History;
  issue: HistoryIssue | null;
  onDelete: () => boolean;
  onLearn: () => void;
}) {
  const { copy, locale, difficultyLabels } = useLocale();
  const p = copy.progress;
  const [category, setCategory] = useState<CategoryId | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [period, setPeriod] = useState("all");
  const [limit, setLimit] = useState(10);
  const [notice, setNotice] = useState<"deleted" | "exportFailed" | null>(null);
  const confirm = useRef<HTMLDialogElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const categories = [...copy.categories, ...copy.studyCategories];
  const sessions = filterHistory(history, {
    category: category || undefined,
    difficulty: difficulty || undefined,
    since: period === "30" ? Date.now() - 30 * 24 * 60 * 60 * 1000 : undefined,
  });
  const recent = [...sessions].reverse().slice(0, limit);
  const categoryLabel = (id: CategoryId) =>
    categories.find((entry) => entry.id === id)!.label;

  function exportHistory() {
    try {
      const url = URL.createObjectURL(
        new Blob([serializeHistory(history)], { type: "application/json" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "math-tutor-progress.json";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(null);
    } catch {
      setNotice("exportFailed");
    }
  }

  return (
    <section
      className="progress-dashboard"
      hidden={!active}
      aria-labelledby="progress-title"
    >
      <div className="progress-heading">
        <h1 id="progress-title" tabIndex={-1}>
          {p.title}
        </h1>
        <button type="button" onClick={onLearn}>
          {p.back}
        </button>
      </div>
      <p>{p.privacy}</p>
      <p className="input-help">{p.temporary}</p>
      <p className="input-help">{p.retention(MAX_SESSIONS)}</p>
      <fieldset className="progress-filters">
        <legend>{p.filters}</legend>
        <label>
          {p.category}
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value as CategoryId | "");
              setLimit(10);
            }}
          >
            <option value="">{p.allCategories}</option>
            {categories.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {p.difficulty}
          <select
            value={difficulty}
            onChange={(event) => {
              setDifficulty(event.target.value as Difficulty | "");
              setLimit(10);
            }}
          >
            <option value="">{p.allLevels}</option>
            {difficultyConfig.map(({ id }) => (
              <option key={id} value={id}>
                {difficultyLabels[id]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {p.period}
          <select
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value);
              setLimit(10);
            }}
          >
            <option value="all">{p.allTime}</option>
            <option value="30">{p.last30}</option>
          </select>
        </label>
      </fieldset>
      <section
        className="progress-totals"
        aria-labelledby="progress-totals-title"
      >
        <h2 id="progress-totals-title">{p.totals}</h2>
        <Statistics totals={aggregate(sessions)} />
        <p>{p.counting}</p>
      </section>
      {!history.sessions.length ? (
        <p className="progress-empty">{p.empty}</p>
      ) : !sessions.length ? (
        <p className="progress-empty">{p.noMatches}</p>
      ) : (
        <>
          <h2>{p.breakdown}</h2>
          <ul className="progress-breakdown">
            {breakdown(sessions).map((group) => (
              <li key={`${group.category}:${group.difficulty}`}>
                <h3>
                  {categoryLabel(group.category)} ·{" "}
                  {difficultyLabels[group.difficulty]}
                </h3>
                <Statistics totals={group.totals} />
              </li>
            ))}
          </ul>
          <h2>{p.recent}</h2>
          <p>{p.recentCount(recent.length, sessions.length)}</p>
          <ol className="progress-recent">
            {recent.map((session) => (
              <li key={session.id}>
                <h3>
                  {categoryLabel(session.category)} ·{" "}
                  {difficultyLabels[session.difficulty]}
                </h3>
                <time dateTime={session.completedAt}>
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(session.completedAt))}
                </time>
                <Statistics totals={aggregate([session])} />
              </li>
            ))}
          </ol>
          {recent.length < sessions.length && (
            <button type="button" onClick={() => setLimit((n) => n + 10)}>
              {p.more}
            </button>
          )}
        </>
      )}
      <div className="progress-actions">
        <button
          type="button"
          disabled={!history.sessions.length}
          onClick={exportHistory}
        >
          {p.export}
        </button>
        <button
          type="button"
          ref={deleteButton}
          disabled={!history.sessions.length && !issue}
          onClick={() => {
            confirm.current?.showModal();
            cancelButton.current?.focus();
          }}
        >
          {p.delete}
        </button>
      </div>
      <p className="input-help">{p.exportHelp}</p>
      {notice && <p role="status">{p[notice]}</p>}
      <dialog
        ref={confirm}
        className="progress-confirm"
        aria-labelledby="history-confirm-title"
        aria-describedby="history-confirm-text"
        onClose={() => {
          if (deleteButton.current?.disabled)
            document.getElementById("progress-title")?.focus();
          else deleteButton.current?.focus();
        }}
      >
        <h2 id="history-confirm-title">{p.confirmTitle}</h2>
        <p id="history-confirm-text">{p.confirmText}</p>
        <div className="progress-actions">
          <button
            type="button"
            ref={cancelButton}
            onClick={() => confirm.current?.close()}
          >
            {p.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              const deleted = onDelete();
              setNotice(deleted ? "deleted" : null);
              confirm.current?.close();
            }}
          >
            {p.confirmDelete}
          </button>
        </div>
      </dialog>
    </section>
  );
}
