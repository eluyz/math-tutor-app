import { useEffect, useMemo, useRef, useState } from "react";
import { AnswerFields } from "../AnswerFields";
import { DeterminantDisplay } from "../DeterminantDisplay";
import { LinearAlgebraDisplay } from "../LinearAlgebraDisplay";
import { MatrixDisplay } from "../MatrixDisplay";
import { describeInput } from "../answers";
import { getAnswerSpec, type CategoryId } from "../exercises";
import { difficultyConfig } from "../difficulty";
import { taskPool, type GeneratedTask } from "../generators";
import { categoryTitle } from "../catalogSearch";
import { localizeTask } from "../locales/catalog";
import { useLocale } from "../locales/LocaleProvider";
import { Scratchpad } from "../scratchpad/Scratchpad";
import { FinalAnswer, SolutionPanel } from "../solutions/SolutionPanel";
import { isUniversityTask } from "../university/catalog";
import { isLinearAlgebraProblem } from "../university/schema";
import { examCopy } from "./copy";
import { clearExamHistory, loadExamHistory, reportForExam,
  saveExamReport } from "./history";
import { editExamAnswer, examCapacity, examConfigError, examTotals, isBlankAnswer,
  moveExam, startExam, submitExam, type ExamConfig, type ExamCount, type ExamMinutes,
  type ExamState } from "./model";
import "./exam.css";

const storage = () => window.localStorage;
const timeText = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

function ExamQuestion({ task }: { task: GeneratedTask }) {
  const { locale, copy } = useLocale();
  const a = copy.app;
  return <>
    <div className={`question${"university" in task ? " university-question" : ""}`}
      data-template-id={task.templateId} data-difficulty={task.difficulty}
      aria-label={`${a.problem}: ${task.question}`}>
      {task.question}
    </div>
    {isUniversityTask(task) && task.university.kind === "determinant" &&
      <DeterminantDisplay matrix={task.university.matrix} locale={locale} />}
    {isUniversityTask(task) && isLinearAlgebraProblem(task.university) &&
      <LinearAlgebraDisplay problem={task.university} />}
    {"matrices" in task && task.matrices && <div className="given-matrices">
      {task.matrices.map((matrix) => <MatrixDisplay key={matrix.label} {...matrix} />)}
    </div>}
  </>;
}

export function ExamMode({ onLockedChange }: { onLockedChange: (locked: boolean) => void }) {
  const { locale, copy, difficultyLabels } = useLocale();
  const c = examCopy[locale];
  const categoryOptions = [...copy.categories, ...copy.studyCategories]
    .filter((category) => taskPool(category.id, "easy").length ||
      difficultyConfig.some(({ id }) => taskPool(category.id, id).length));
  const [config, setConfig] = useState<ExamConfig>({ categories: ["order"], difficulty: "easy", count: 5, minutes: 0 });
  const [exam, setExam] = useState<ExamState | null>(null);
  const examRef = useRef<ExamState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [history, setHistory] = useState(() => loadExamHistory(storage));
  const error = useMemo(() => examConfigError(config), [config]);
  const capacity = useMemo(() => config.categories.length ? examCapacity(config) : 0, [config]);
  const active = exam !== null && exam.submittedAt === null;
  const task = exam ? localizeTask(exam.tasks[exam.index], locale) : null;

  function commit(next: ExamState) {
    const previous = examRef.current;
    if (previous && previous.submittedAt !== null) return;
    examRef.current = next;
    setExam(next);
    if (next.submittedAt !== null && previous?.submittedAt === null) {
      const report = reportForExam(next);
      if (report) setHistory((current) => saveExamReport(current, report, storage));
      setConfirmSubmit(false);
      onLockedChange(false);
    }
  }

  useEffect(() => onLockedChange(active), [active, onLockedChange]);
  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const current = examRef.current;
      const clock = Date.now();
      setNow(clock);
      if (current?.deadline !== null && current?.deadline !== undefined && clock >= current.deadline)
        commit(submitExam(current, clock));
    };
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [active]);
  useEffect(() => {
    if (exam?.submittedAt !== null && exam) document.getElementById("exam-result-title")?.focus();
    else if (exam) document.getElementById("exam-question-title")?.focus();
  }, [exam?.id, exam?.index, exam?.submittedAt]);

  function begin() {
    if (error) return;
    const clock = Date.now();
    const next = startExam(config, clock ^ Math.floor(Math.random() * 0x7fffffff), clock, crypto.randomUUID());
    examRef.current = next;
    setExam(next);
    setNow(clock);
    setConfirmSubmit(false);
    onLockedChange(true);
  }
  function finish() {
    const current = examRef.current;
    if (current) commit(submitExam(current, Date.now()));
  }
  function selectCategory(category: CategoryId, checked: boolean) {
    setConfig((current) => ({ ...current, categories: checked
      ? [...current.categories, category]
      : current.categories.filter((item) => item !== category) }));
  }
  const totals = exam?.entries ? examTotals(exam.entries) : null;
  const outcomeText = { correct: c.correct, incorrect: c.incorrect,
    invalid: c.invalid, skipped: c.skipped };

  return <section className="exam-mode" aria-labelledby="exam-title">
    <div className="section-heading"><div><span className="eyebrow">MT-EXAM-001</span>
      <h2 id="exam-title" tabIndex={-1}>{c.title}</h2></div><p>{c.introduction}</p></div>
    {!exam && <>
      <div className="exam-setup">
        <h3>{c.setup}</h3>
        <fieldset className="exam-categories"><legend>{c.categories}</legend>
          {categoryOptions.map((category) => <label key={category.id}>
            <input type="checkbox" checked={config.categories.includes(category.id)}
              onChange={(event) => selectCategory(category.id, event.target.checked)} />
            {category.label}
            <small>{taskPool(category.id, config.difficulty).length}</small>
          </label>)}
        </fieldset>
        <fieldset className="exam-options"><legend>{c.level}</legend>
          {difficultyConfig.map(({ id }) => <label key={id}><input type="radio" name="exam-level"
            checked={config.difficulty === id}
            onChange={() => setConfig((current) => ({ ...current, difficulty: id }))} />
            {difficultyLabels[id]}</label>)}
        </fieldset>
        <fieldset className="exam-options"><legend>{c.count}</legend>
          {([5, 10, 20] as const).map((count: ExamCount) => <label key={count}>
            <input type="radio" name="exam-count" checked={config.count === count}
              onChange={() => setConfig((current) => ({ ...current, count }))} />{count}</label>)}
        </fieldset>
        <fieldset className="exam-options"><legend>{c.time}</legend>
          {([0, 15, 30] as const).map((minutes: ExamMinutes) => <label key={minutes}>
            <input type="radio" name="exam-time" checked={config.minutes === minutes}
              onChange={() => setConfig((current) => ({ ...current, minutes }))} />
            {minutes ? c.minutes(minutes) : c.noLimit}</label>)}
        </fieldset>
        <p className="input-help">{c.capacity(capacity)}</p>
        {error && <p className="exam-error" role="status">{error === "categories" ? c.errorCategories
          : error === "unavailable" ? c.errorUnavailable : c.errorCapacity}</p>}
        <p className="input-help">{c.refreshWarning}</p>
        <p className="input-help">{c.unofficial}</p>
        <button type="button" className="primary-button" disabled={!!error} onClick={begin}>{c.start}</button>
      </div>
      <div className="exam-history"><h3>{c.history}</h3>
        {history.issue && <p className="storage-notice" role="status">
          {history.issue === "delete-failed" ? c.storageDeleteIssue : c.storageIssue}</p>}
        {history.history.reports.length ? <>
          <ul>{[...history.history.reports].reverse().map((report) => <li key={report.id}>
            <time dateTime={report.completedAt}>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.completedAt))}</time>
            <span>{report.categories.map((category) => categoryTitle(category, locale)).join(", ")}</span>
            <span>{difficultyLabels[report.difficulty]} · {c.score(report.correct, report.total,
              Math.round(100 * report.correct / report.total))}</span>
            <small>{report.timedOut ? c.timedOut : c.elapsed(timeText(Math.floor(report.elapsedMs / 1000)))}</small>
          </li>)}</ul>
          {!confirmDelete ? <button type="button" onClick={() => setConfirmDelete(true)}>{c.deleteHistory}</button>
            : <div className="exam-actions"><button type="button" onClick={() => {
              setHistory((current) => clearExamHistory(current, storage)); setConfirmDelete(false);
            }}>{c.confirmDelete}</button>
              <button type="button" onClick={() => setConfirmDelete(false)}>{c.cancelDelete}</button></div>}
        </> : <p>{c.historyEmpty}</p>}
      </div>
    </>}
    {active && exam && task && <div className="exam-work">
      <div className="exam-status"><strong>{c.question(exam.index + 1, exam.tasks.length)}</strong>
        <span role="timer" aria-live="off">{exam.deadline === null
          ? c.elapsed(timeText(Math.floor(Math.max(0, now - exam.startedAt) / 1000)))
          : c.remaining(timeText(Math.ceil(Math.max(0, exam.deadline - now) / 1000)))}</span></div>
      <p className="input-help">{c.refreshWarning}</p>
      <nav className="exam-question-nav" aria-label={c.review}>
        {exam.tasks.map((_, index) => <button type="button" key={index}
          aria-current={exam.index === index ? "step" : undefined}
          aria-label={c.question(index + 1, exam.tasks.length)}
          className={isBlankAnswer(exam.answers[index]) ? "" : "answered"}
          onClick={() => { commit(moveExam(examRef.current!, index, Date.now())); setConfirmSubmit(false); }}>
          {index + 1}</button>)}
      </nav>
      <div className="exercise-panel">
        <h3 id="exam-question-title" tabIndex={-1}>{task.title}</h3>
        <ExamQuestion task={task} />
        <Scratchpad key={exam.id} run={1} active idPrefix="exam-" />
        <div className="exam-answer"><AnswerFields spec={getAnswerSpec(task)} value={exam.answers[exam.index]}
          showSubmit={false} idPrefix="exam-" fractionInput={task.category === "fractions" || "startingHint" in task}
          onChange={(answer) => commit(editExamAnswer(examRef.current!, answer, Date.now()))} />
          <p id="exam-answer-help" className="input-help">{c.saved}</p></div>
        <p className="input-help">{c.noHints}</p>
        <div className="exam-actions">
          <button type="button" disabled={exam.index === 0}
            onClick={() => { commit(moveExam(examRef.current!, exam.index - 1, Date.now())); setConfirmSubmit(false); }}>{c.previous}</button>
          <button type="button" disabled={exam.index === exam.tasks.length - 1}
            onClick={() => { commit(moveExam(examRef.current!, exam.index + 1, Date.now())); setConfirmSubmit(false); }}>{c.next}</button>
        </div>
        {!confirmSubmit ? <button type="button" className="check-button"
          onClick={() => setConfirmSubmit(true)}>{c.reviewSubmit}</button>
          : <div className="exam-confirm" role="group" aria-label={c.reviewSubmit}>
            <p role="status">{c.confirmWarning(exam.answers.filter(isBlankAnswer).length)}</p>
            <div className="exam-actions"><button type="button" className="check-button" onClick={finish}>{c.confirm}</button>
              <button type="button" onClick={() => setConfirmSubmit(false)}>{c.cancel}</button></div>
          </div>}
      </div>
    </div>}
    {exam && totals && <div className="exam-results">
      <h3 id="exam-result-title" tabIndex={-1}>{c.result}</h3>
      {history.issue && <p className="storage-notice" role="status">
        {history.issue === "delete-failed" ? c.storageDeleteIssue : c.storageIssue}</p>}
      {exam.timedOut && <p role="status">{c.timedOut}</p>}
      <p className="exam-score">{c.score(totals.correct, totals.total, totals.percent)}</p>
      <dl className="exam-totals">{(["correct", "incorrect", "invalid", "skipped"] as const).map((outcome) =>
        <div key={outcome}><dt>{outcomeText[outcome]}</dt><dd>{totals[outcome]}</dd></div>)}</dl>
      <p>{c.progressSeparate}</p><p>{c.unofficial}</p>
      <h4>{c.review}</h4>
      <ol className="exam-review">{exam.entries?.map((entry, index) => {
        const item = localizeTask(entry.task, locale);
        const answer = getAnswerSpec(item);
        const own = isBlankAnswer(entry.answer) ? c.skipped
          : typeof entry.answer !== "string" && entry.answer.kind === "roots" && entry.answer.classification === "none"
            ? c.noRoots : describeInput(entry.answer, answer);
        return <li key={item.id}>
          <h5>{c.question(index + 1, exam.tasks.length)}: {item.title}</h5>
          <ExamQuestion task={item} />
          <p><strong>{c.ownAnswer}:</strong> {own}</p>
          <p><strong>{outcomeText[entry.outcome]}</strong></p>
          <div><strong>{c.correctAnswer}:</strong> <FinalAnswer answer={answer} /></div>
          <SolutionPanel key={item.id} task={item} inSession={false} onReveal={() => {}} />
        </li>;
      })}</ol>
      <button type="button" className="primary-button" onClick={() => {
        examRef.current = null; setExam(null); setConfirmSubmit(false);
      }}>{c.newExam}</button>
    </div>}
  </section>;
}
