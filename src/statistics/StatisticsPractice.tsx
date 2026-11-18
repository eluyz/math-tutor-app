import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Locale } from "../locales/types";
import { difficultyConfig, isLegacyDifficulty } from "../difficulty";
import { formatRational } from "../answers";
import { equalRational, parseAnswer } from "../rational";
import { subjectCopy, subjectStatus } from "../subjectRoadmap";
import { statisticsPracticeCopy } from "../locales/statistics";
import type { DatasetDifficulty } from "./datasets";
import { createStatisticsPracticeTask } from "./practiceModel";
import { statisticsCurriculum, type StatisticsTrack, type StatisticsLesson } from "./curriculum";
import { medianCopy } from "./st102Copy";
import { meanCopy } from "./st101Copy";

type Assessment = "correct" | "incorrect" | "empty" | "invalid";

/** Real next-task policy, shared by the click handler and its uint32-boundary test. */
export function nextStatisticsSeed(seed: number): number {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError("Invalid Statistics seed");
  return seed === 0xffffffff ? 0 : seed + 1;
}

/** Mean/median pilot. State never enters Mathematics sessions, grading or storage. */
export function StatisticsPractice({locale, onDraftChange}: {locale: Locale; onDraftChange?: (draft: boolean) => void}) {
  const c=statisticsPracticeCopy[locale];
  const subjects=subjectCopy[locale];
  const [track,setTrack]=useState<StatisticsTrack>("fundamentals");
  const [lesson,setLesson]=useState<StatisticsLesson|null>("mean");
  const [difficulty,setDifficulty]=useState<DatasetDifficulty>("easy");
  const [seed,setSeed]=useState(0);
  const [raw,setRaw]=useState("");
  const [assessment,setAssessment]=useState<Assessment|null>(null);
  const [hints,setHints]=useState(0);
  const [solution,setSolution]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const input=useRef<HTMLInputElement>(null);
  const focusRequested=useRef(false);
  const task=useMemo(()=>lesson?createStatisticsPracticeTask(lesson,difficulty,seed):null,[lesson,difficulty,seed]);
  const teaching=useMemo(()=>task?(task.lesson==="median"?medianCopy(task.values,locale):meanCopy(task.values,locale)):null,[task,locale]);
  const topics=statisticsCurriculum.find(t=>t.id===track)!.topics;
  useEffect(()=>{ heading.current?.focus(); },[]);
  useEffect(()=>{ onDraftChange?.(raw.trim().length > 0 && assessment === null); },[raw, assessment, onDraftChange]);

  useEffect(()=>{
    if(focusRequested.current && task) input.current?.focus();
    focusRequested.current=false;
  },[task]);

  function canReplaceTask() {
    return !raw.trim() || assessment !== null || window.confirm(c.discard);
  }

  function reset(focusAnswer=true) {
    setRaw(""); setAssessment(null); setHints(0); setSolution(false);
    focusRequested.current=focusAnswer;
  }
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!task) return;
    const parsed=parseAnswer(raw);
    setAssessment(parsed.kind==="invalid" ? (parsed.reason==="empty"?"empty":"invalid")
      : equalRational(parsed.value,task.answer)?"correct":"incorrect");
  }
  return (
    <section className="statistics-practice subject-roadmap-panel learning-workspace" aria-labelledby="statistics-title">
      <div className="subject-roadmap-inner">
        <span className="subject-status subject-status--in-progress">{subjects.status[subjectStatus.statistics]}</span>
        <h1 id="statistics-title" ref={heading} tabIndex={-1}>{subjects.subjects.statistics.title}</h1>
        <p className="subject-roadmap-description">{subjects.subjects.statistics.description}</p>
        <div className="study-groups" role="group" aria-label={c.trackLabel}>
          {statisticsCurriculum.map(t=><button key={t.id} type="button" data-track={t.id} aria-pressed={track===t.id} onClick={()=>{
            if(t.id!==track && canReplaceTask()) {setTrack(t.id);setLesson(t.id==="fundamentals"?"mean":null);setDifficulty("easy");setSeed(0);reset(t.id==="fundamentals");}
          }}>{c.trackLabels[t.id]}</button>)}
        </div>
        <div className="category-picker" role="group" aria-label={c.topicLabel}>
          {topics.map(topic=>{
            const available="lesson" in topic?topic.lesson:null;
            return <button key={topic.id} type="button" data-topic={topic.id} disabled={!available}
              className={available===lesson && available?"active":""} aria-pressed={!!available && available===lesson}
              aria-describedby={!available?"statistics-topic-unavailable":undefined}
              onClick={()=>{if(available && available!==lesson && canReplaceTask()) {setLesson(available);setDifficulty("easy");setSeed(0);reset();}}}>
              {c.topicLabels[topic.id]}
            </button>;
          })}
        </div>
        <p className="panel-intro" id="statistics-topic-unavailable">{c.topicsUnavailable}</p>
        <h2>{lesson?lesson==="median"?c.medianTitle:c.title:c.plannedTitle}</h2>
        <div className="practice-controls">
          <div className="difficulty-picker" role="group" aria-label={c.difficulty}>
            {difficultyConfig.map(level=><button key={level.id} type="button" data-level={level.id}
              disabled={!lesson || !isLegacyDifficulty(level.id)} aria-pressed={!!lesson && difficulty===level.id}
              aria-describedby={!lesson || !isLegacyDifficulty(level.id)?"statistics-level-unavailable":undefined}
              onClick={()=>{if(lesson && isLegacyDifficulty(level.id) && level.id!==difficulty && canReplaceTask()) {setDifficulty(level.id);setSeed(0);reset();}}}>
              {level.labels[locale]}
            </button>)}
          </div>
        </div>
        <p id="statistics-level-unavailable" className="panel-intro">{lesson?c.levelsUnavailable:c.universityPlan}</p>
        {task && teaching ? <div className="exercise-panel">
          <p id="statistics-question" className="question university-question" data-lesson={task.lesson} data-seed={seed} data-difficulty={difficulty}>{teaching.prompt}</p>
          <form onSubmit={submit} noValidate>
            <label htmlFor="statistics-answer">{c.answer}</label>
            <p id="statistics-format" className="panel-intro">{c.format}</p>
            <div className="answer-row">
              <input id="statistics-answer" ref={input} type="text" inputMode="text" autoComplete="off" spellCheck={false}
                value={raw} aria-describedby="statistics-question statistics-format statistics-feedback"
                aria-invalid={assessment==="empty"||assessment==="invalid"}
                onChange={event=>{setRaw(event.target.value);setAssessment(null);}} />
              <button className="check-button" type="submit">{c.check}</button>
            </div>
          </form>
          <div id="statistics-feedback" role="status" aria-live="polite" aria-atomic="true">
            {assessment && <div className={`feedback ${assessment==="empty"?"invalid":assessment}`}>
              <p>{teaching.feedback[assessment]}</p>
              {assessment==="correct" && <strong>{formatRational(task.answer)}</strong>}
            </div>}
          </div>
          <div className="hint-actions">
            <button type="button" aria-controls="statistics-hints" aria-expanded={hints>0} disabled={hints===2}
              onClick={()=>setHints(current=>Math.min(2,current+1))}>{hints===0?c.hint1:hints===1?c.hint2:c.hintsDone}</button>
            <button type="button" aria-controls="statistics-solution" aria-expanded={solution} onClick={()=>setSolution(current=>!current)}>{solution?c.hide:c.show}</button>
          </div>
          <div id="statistics-hints">{teaching.hints.slice(0,hints).map((hint,index)=><p className="learning-hint" key={index}>{hint}</p>)}</div>
          <div id="statistics-solution" hidden={!solution}>
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
          <button className="next-button" type="button" onClick={()=>{if(!canReplaceTask()) return; setSeed(current=>nextStatisticsSeed(current));reset();}}>{c.next}</button>
        </div> : <p role="status" className="panel-intro">{c.plannedGuidance}</p>}
        <p className="subject-roadmap-disclaimer">{c.memory}</p>
      </div>
    </section>
  );
}
