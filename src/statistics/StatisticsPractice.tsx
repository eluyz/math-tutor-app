import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Locale } from "../locales/types";
import { difficultyConfig, legacyDifficulties } from "../difficulty";
import { formatRational } from "../answers";
import { equalRational, parseAnswer } from "../rational";
import { subjectCopy, subjectStatus } from "../subjectRoadmap";
import { generateMeanDataset, type DatasetDifficulty } from "./datasets";
import { meanCopy } from "./st101Copy";

type Assessment = "correct" | "incorrect" | "empty" | "invalid";
const pl = {
  title: "ST-101 — Średnia arytmetyczna",
  difficulty: "Poziom trudności", answer: "Twoja odpowiedź", check: "Sprawdź",
  next: "Następne zadanie", hint1: "Pokaż podpowiedź", hint2: "Pokaż drugą podpowiedź",
  hintsDone: "Obie podpowiedzi pokazane", show: "Pokaż rozwiązanie", hide: "Ukryj rozwiązanie",
  solution: "Rozwiązanie krok po kroku",
  format: "Podaj dokładny wynik: liczbę całkowitą, skończony zapis dziesiętny lub ułamek. Nie zaokrąglaj. Limit: 100 znaków.",
  memory: "Te ćwiczenia nie zapisują postępów i nie zmieniają wyników Matematyki. Po wyjściu z działu lub odświeżeniu strony pilotaż zaczyna się od pierwszego zadania.",
};
const ui: Record<Locale, typeof pl> = {
  pl,
  en: {
    title: "ST-101 — Arithmetic mean",
    difficulty: "Difficulty", answer: "Your answer", check: "Check", next: "Next exercise",
    hint1: "Show hint", hint2: "Show second hint", hintsDone: "Both hints shown",
    show: "Show solution", hide: "Hide solution", solution: "Step-by-step solution",
    format: "Enter an exact result: an integer, a finite decimal or a fraction. Do not round. Limit: 100 characters.",
    memory: "These exercises do not save progress or change Mathematics results. Leaving this subject or refreshing the page restarts the pilot from its first exercise.",
  },
};

/** Real next-task policy, shared by the click handler and its uint32-boundary test. */
export function nextStatisticsSeed(seed: number): number {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError("Invalid Statistics seed");
  return seed === 0xffffffff ? 0 : seed + 1;
}

/** Mean-only pilot. State never enters Mathematics sessions, grading or storage. */
export function StatisticsPractice({locale}: {locale: Locale}) {
  const c=ui[locale];
  const subjects=subjectCopy[locale];
  const [difficulty,setDifficulty]=useState<DatasetDifficulty>("easy");
  const [seed,setSeed]=useState(0);
  const [raw,setRaw]=useState("");
  const [assessment,setAssessment]=useState<Assessment|null>(null);
  const [hints,setHints]=useState(0);
  const [solution,setSolution]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const input=useRef<HTMLInputElement>(null);
  const task=useMemo(()=>generateMeanDataset(difficulty,seed),[difficulty,seed]);
  const teaching=useMemo(()=>meanCopy(task.values,locale),[task,locale]);
  useEffect(()=>{ heading.current?.focus(); },[]);

  function reset() {
    setRaw(""); setAssessment(null); setHints(0); setSolution(false);
    input.current?.focus();
  }
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed=parseAnswer(raw);
    setAssessment(parsed.kind==="invalid" ? (parsed.reason==="empty"?"empty":"invalid")
      : equalRational(parsed.value,task.mean)?"correct":"incorrect");
  }
  return (
    <section className="statistics-practice subject-roadmap-panel" aria-labelledby="st101-title">
      <div className="subject-roadmap-inner">
        <span className="subject-status subject-status--in-progress">{subjects.status[subjectStatus.statistics]}</span>
        <h1 id="st101-title" ref={heading} tabIndex={-1}>{subjects.subjects.statistics.title}</h1>
        <p className="subject-roadmap-description">{subjects.subjects.statistics.description}</p>
        <h2>{c.title}</h2>
        <div className="practice-controls">
          <div className="difficulty-picker" role="group" aria-label={c.difficulty}>
            {legacyDifficulties.map(id=><button key={id} type="button" aria-pressed={difficulty===id} onClick={()=>{
              if(id!==difficulty) {setDifficulty(id); setSeed(0); reset();}
            }}>{difficultyConfig.find(level=>level.id===id)!.labels[locale]}</button>)}
          </div>
        </div>
        <div className="exercise-panel">
          <p className="question university-question" data-seed={seed} data-difficulty={difficulty}>{teaching.prompt}</p>
          <form onSubmit={submit} noValidate>
            <label htmlFor="st101-answer">{c.answer}</label>
            <p id="st101-format" className="panel-intro">{c.format}</p>
            <div className="answer-row">
              <input id="st101-answer" ref={input} type="text" inputMode="text" autoComplete="off" spellCheck={false}
                value={raw} aria-describedby="st101-format st101-feedback"
                aria-invalid={assessment==="empty"||assessment==="invalid"}
                onChange={event=>{setRaw(event.target.value);setAssessment(null);}} />
              <button className="check-button" type="submit">{c.check}</button>
            </div>
          </form>
          <div id="st101-feedback" role="status" aria-live="polite" aria-atomic="true">
            {assessment && <div className={`feedback ${assessment==="empty"?"invalid":assessment}`}>
              <p>{teaching.feedback[assessment]}</p>
              {assessment==="correct" && <strong>{formatRational(task.mean)}</strong>}
            </div>}
          </div>
          <div className="hint-actions">
            <button type="button" aria-controls="st101-hints" aria-expanded={hints>0} disabled={hints===2}
              onClick={()=>setHints(current=>Math.min(2,current+1))}>{hints===0?c.hint1:hints===1?c.hint2:c.hintsDone}</button>
            <button type="button" aria-controls="st101-solution" aria-expanded={solution} onClick={()=>setSolution(current=>!current)}>{solution?c.hide:c.show}</button>
          </div>
          <div id="st101-hints">{teaching.hints.slice(0,hints).map((hint,index)=><p className="learning-hint" key={index}>{hint}</p>)}</div>
          <div id="st101-solution" hidden={!solution}>
            {solution && <section className="solution-panel" aria-label={c.solution}>
              <h3>{c.solution}</h3>
              <ol>{teaching.steps.map((step,index)=><li key={index}>
                <h4>{step.title}</h4>
                <p className="solution-calculation">{step.calculation}</p>
                <p className="solution-step-explanation">{step.explanation}</p>
              </li>)}</ol>
              <p className="solution-answer">{teaching.conclusion}</p>
            </section>}
          </div>
          <button className="next-button" type="button" onClick={()=>{setSeed(current=>nextStatisticsSeed(current));reset();}}>{c.next}</button>
        </div>
        <p className="subject-roadmap-disclaimer">{c.memory}</p>
      </div>
    </section>
  );
}
