import { useState, type FormEvent } from "react";
import { AnswerFields } from "../AnswerFields";
import { DeterminantDisplay } from "../DeterminantDisplay";
import { LinearAlgebraDisplay } from "../LinearAlgebraDisplay";
import { MatrixDisplay } from "../MatrixDisplay";
import { emptyAnswer, formatRational, type AnswerInput } from "../answers";
import { getAnswerSpec } from "../exercises";
import type { GeneratedTask } from "../generators";
import { localizeTask } from "../locales/catalog";
import { useLocale } from "../locales/LocaleProvider";
import { FinalAnswer, SolutionPanel } from "../solutions/SolutionPanel";
import { isUniversityTask } from "../university/catalog";
import { isLinearAlgebraProblem } from "../university/schema";
import { mistakeCopy } from "./copy";
import { assessRepairAttempt, inspectMistake, inspectSubmittedStep, pickRepairTasks } from "./model";
import "./mistake.css";

function RecoveryQuestion({ task }: { task: GeneratedTask }) {
  const { locale } = useLocale();
  return <>
    <p className="question" data-template-id={task.templateId}>{task.question}</p>
    {isUniversityTask(task) && task.university.kind === "determinant" &&
      <DeterminantDisplay matrix={task.university.matrix} locale={locale} />}
    {isUniversityTask(task) && isLinearAlgebraProblem(task.university) &&
      <LinearAlgebraDisplay problem={task.university} />}
    {"matrices" in task && task.matrices &&
      <div className="given-matrices">{task.matrices.map((item) =>
        <MatrixDisplay key={item.label} {...item} />)}</div>}
  </>;
}

/** On-demand follow-up after feedback or AFTER exam submission; never renders during an exam. */
export function MistakeHelp({ task, answer }: { task: GeneratedTask; answer: AnswerInput }) {
  const { locale, copy } = useLocale();
  const c = mistakeCopy[locale];
  const insight = inspectMistake(task, answer, copy.feedback);
  const [opened, setOpened] = useState(false);
  const [stepInput, setStepInput] = useState("");
  const [checkedStep, setCheckedStep] = useState<string | null>(null);
  const [repairTasks, setRepairTasks] = useState<readonly GeneratedTask[]>([]);
  const [repairIndex, setRepairIndex] = useState(0);
  const [repairInput, setRepairInput] = useState<AnswerInput>("");
  const [repairOutcome, setRepairOutcome] = useState<"correct" | "incorrect" | "invalid" | null>(null);
  const [firstValidOutcome, setFirstValidOutcome] = useState<"correct" | "incorrect" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [repairFinished, setRepairFinished] = useState(false);
  const [repairUnavailable, setRepairUnavailable] = useState(false);
  const step = checkedStep === null ? null : inspectSubmittedStep(task, checkedStep, copy.feedback);
  const selected = repairTasks[repairIndex];
  const current = selected ? localizeTask(selected, locale) : null;
  if (!insight) return null;

  function startRepair() {
    const selected = pickRepairTasks(task, Math.floor(Math.random() * 0x7fffffff));
    setRepairTasks(selected);
    setRepairUnavailable(selected.length === 0);
    setRepairIndex(0);
    setRepairFinished(false);
    setCorrectCount(0);
    setRepairOutcome(null);
    setFirstValidOutcome(null);
    setRepairInput(selected.length ? emptyAnswer(getAnswerSpec(selected[0])) : "");
  }
  function submitRepair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || firstValidOutcome !== null) return;
    const outcome = assessRepairAttempt(selected, repairInput);
    setRepairOutcome(outcome);
    if (outcome !== "invalid") {
      setFirstValidOutcome(outcome);
      if (outcome === "correct") setCorrectCount((value) => value + 1);
    }
  }
  function nextRepair() {
    if (firstValidOutcome === null) return;
    if (repairIndex + 1 === repairTasks.length) {
      setRepairFinished(true);
      return;
    }
    const next = repairIndex + 1;
    setRepairIndex(next);
    setRepairInput(emptyAnswer(getAnswerSpec(repairTasks[next])));
    setRepairOutcome(null);
    setFirstValidOutcome(null);
  }
  function stopRepair() {
    setRepairTasks([]);
    setRepairUnavailable(false);
    setRepairFinished(false);
    setRepairIndex(0);
    setRepairOutcome(null);
    setFirstValidOutcome(null);
    setCorrectCount(0);
    setRepairInput("");
  }

  return <section className="mistake-help" aria-label={c.title}>
    <button type="button" aria-expanded={opened} onClick={() => setOpened((value) => !value)}>
      {opened ? c.close : c.open}
    </button>
    {opened && <div className="mistake-details">
      <h4>{c.title}</h4>
      {insight.kind === "confirmed" ? <>
        <strong>{c.confirmed}</strong>
        <p>{insight.explanation}</p>
        <p>{insight.hint}</p>
      </> : insight.kind === "possible" ? <>
        <strong>{insight.candidates.length > 1 ? c.multiple : c.possible}</strong>
        <ul>{insight.candidates.map((candidate) =>
          <li key={candidate.errorCode}>{candidate.explanation}
            <p><strong>{c.rule}:</strong> {candidate.hint}</p>
          </li>)}</ul>
      </> : <>
        <strong>{c.unknown}</strong>
        <p>{insight.explanation}</p>
        <p><strong>{c.rule}:</strong> {task.hint}</p>
      </>}
      {task.step && <div className="mistake-step">
        <h5>{c.optionalStep}</h5>
        <p>{c.stepInfo}</p>
        <form onSubmit={(event) => { event.preventDefault(); setCheckedStep(stepInput); }}>
          <label htmlFor={`diag-step-${task.id}`}>{task.step.question}</label>
          <div className="mistake-step-actions">
            <input id={`diag-step-${task.id}`} type="text" inputMode="decimal" value={stepInput}
              onChange={(event) => { setStepInput(event.target.value); setCheckedStep(null); }} />
            <button type="submit">{c.testStep}</button>
          </div>
        </form>
        {step && <div role="status">
          <strong>{step.kind === "incorrect" ? c.stepIncorrect : step.kind === "correct" ? c.stepCorrect : c.stepInvalid}</strong>
          <p>{step.message}</p>
          {step.kind === "incorrect" && <p>{c.stepAnswer}: {formatRational(task.step.answer)}</p>}
        </div>}
      </div>}
      <div className="mistake-recovery">
        {!repairTasks.length && !repairFinished && <button type="button"
          onClick={startRepair}>{c.remediation}</button>}
        {repairUnavailable && <p role="status">{c.noRemediation}</p>}
        {repairTasks.length > 0 && !repairFinished && current && <div className="mistake-recovery-active">
          <h5>{c.question(repairIndex + 1, repairTasks.length)}</h5>
          <p>{c.practiceIntro}</p>
          <RecoveryQuestion task={current} />
          <form onSubmit={submitRepair}>
            <fieldset disabled={firstValidOutcome !== null}>
              <AnswerFields spec={getAnswerSpec(current)} value={repairInput}
                showSubmit={false} idPrefix={`diag-repair-${task.id}-${repairIndex}-`}
                fractionInput={current.category === "fractions" || "startingHint" in current}
                onChange={(value) => { setRepairInput(value); setRepairOutcome(null); }} />
            </fieldset>
            {firstValidOutcome === null && <button type="submit">{c.check}</button>}
          </form>
          {repairOutcome && <div role="status">
            <strong>{repairOutcome === "correct" ? c.correct : repairOutcome === "incorrect" ? c.incorrect : c.invalid}</strong>
          </div>}
          {firstValidOutcome !== null && <>
            <div><strong>{c.stepAnswer}:</strong> <FinalAnswer answer={getAnswerSpec(current)} /></div>
            <SolutionPanel key={current.id} task={current} inSession={false} onReveal={() => {}} />
            <button type="button" onClick={nextRepair}>{c.next}</button>
          </>}
          <button type="button" onClick={stopRepair}>{c.stop}</button>
        </div>}
        {repairFinished && <div role="status">
          <strong>{c.done(correctCount, repairTasks.length)}</strong>
          <div><button type="button" onClick={stopRepair}>{c.stop}</button></div>
        </div>}
      </div>
      <p className="mistake-privacy">{c.privacy}</p>
    </div>}
  </section>;
}
