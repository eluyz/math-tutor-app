import { SolutionPanel } from "./solutions/SolutionPanel";
import { Scratchpad } from "./scratchpad/Scratchpad";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  checkAnswer,
  checkStep,
  getAnswerSpec,
  type CategoryId,
  type CheckResult,
  type StepResult,
} from "./exercises";
import { categories, studyCategories, difficultyLabels, feedback, ui, answerHints } from "./locales/pl";
import { createGenerator, allTemplates, type Difficulty, type GeneratedTask } from "./generators";
import { emptyAnswer, describeInput, type AnswerInput } from "./answers";
import { AnswerFields } from "./AnswerFields";
import { MatrixDisplay } from "./MatrixDisplay";
import { advanceSession, createSession, recordFirstAttempt, recordSolutionViewed, summarizeSession, SESSION_LENGTH, type SessionState } from "./session";
import { SessionSummaryPanel } from "./SessionSummaryPanel";

export default function App() {
  const generator = useRef<ReturnType<typeof createGenerator> | null>(null);
  const [run, setRun] = useState(0);
  const [active, setActive] = useState<GeneratedTask | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("order");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [session, setSession] = useState<SessionState | null>(null);
  const sessionRef = useRef<SessionState | null>(null);
  const sessionNumber = session && !session.completed ? session.entries.length : 0;
  const sessionDone = session?.completed ?? false;
  const summary = session ? summarizeSession(session) : null;
  const [repeated, setRepeated] = useState(false);
  const [answer, setAnswer] = useState<AnswerInput>("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [hintExpanded, setHintExpanded] = useState(false);
  const [stepVisible, setStepVisible] = useState(false);
  const [stepAnswer, setStepAnswer] = useState("");
  const [stepResult, setStepResult] = useState<StepResult | null>(null);
  const visibleTemplates = allTemplates.filter((template) => template.category === selectedCategory);
  const studying = studyCategories.some((category) => category.id === selectedCategory);
  const visibleCategories = (studying ? studyCategories : categories).filter((category) => allTemplates.some((template) => template.category === category.id));

  useEffect(() => {
    if (active) document.getElementById("answer")?.focus();
  }, [active]);

  useEffect(() => {
    if (sessionDone) document.getElementById("session-complete")?.focus();
  }, [sessionDone]);

  function resetAnswer(exercise: GeneratedTask | null = null) {
    setAnswer(exercise ? emptyAnswer(getAnswerSpec(exercise)) : "");
    setSubmittedAnswer("");
    setResult(null);
    setHintExpanded(false);
    setStepVisible(false);
    setStepAnswer("");
    setStepResult(null);
  }

  function updateSession(next: SessionState | null) {
    // Keep event guards current even before React renders a queued state update.
    sessionRef.current = next;
    setSession(next);
  }

  function showExercise(next: { exercise: GeneratedTask; repeated: boolean }) {
    setRun((current) => current + 1);
    setActive({ ...next.exercise });
    setRepeated(next.repeated);
    resetAnswer(next.exercise);
  }

  function newExercise(category = selectedCategory, level = difficulty, templateId?: string) {
    generator.current ??= createGenerator();
    const next = generator.current.next(category, level, templateId);
    updateSession(null);
    showExercise(next);
  }

  function startExercises() {
    newPracticeExample();
    document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" });
  }

  function newPracticeExample(level = difficulty) {
    newExercise(selectedCategory, level, active?.templateId);
  }

  function startSession(level = difficulty) {
    if (sessionRef.current && !sessionRef.current.completed) return;
    generator.current = createGenerator();
    const next = generator.current.next(selectedCategory, level);
    updateSession(createSession(selectedCategory, level, next.exercise.id));
    setDifficulty(level);
    showExercise(next);
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const nextResult = checkAnswer(active, answer, feedback);
    if (sessionRef.current) {
      updateSession(recordFirstAttempt(sessionRef.current, active.id, nextResult.kind));
    }
    setSubmittedAnswer(describeInput(answer, getAnswerSpec(active)));
    setResult(nextResult);
    setHintExpanded(false);
    setStepVisible(false);
    setStepAnswer("");
    setStepResult(null);
  }

  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active?.step) setStepResult(checkStep(active, stepAnswer, feedback));
  }

  function nextExercise() {
    const current = sessionRef.current;
    if (current) {
      if (!active || current.completed || current.entries[current.entries.length - 1].exerciseId !== active.id) return;
      const next = current.entries.length < SESSION_LENGTH
        ? generator.current!.next(current.category, current.difficulty) : undefined;
      const updated = advanceSession(current, active.id, next?.exercise.id);
      if (updated === current) return;
      updateSession(updated);
      if (next) showExercise(next);
      else {
        setActive(null);
        setRepeated(false);
        resetAnswer();
      }
      return;
    }
    newPracticeExample();
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a
          className="brand"
          href="/math-tutor-app/"
          onClick={(event) => {
            event.preventDefault();
            setActive(null);
            updateSession(null);
            resetAnswer();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="Math Tutor — strona startowa"
        >
          <span className="brand-mark" aria-hidden="true">
            ∑
          </span>
          <span>
            math<span className="brand-accent">tutor</span>
            <small>UCZ SIĘ WE WŁASNYM TEMPIE</small>
          </span>
        </a>
        <span className="topbar-note">
          MATEMATYKA DLA DOROSŁYCH <span aria-hidden="true">✳</span> ZA DARMO
        </span>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-line" /> BEZ PRESJI. KROK PO KROKU.
            </span>
            <h1 id="hero-title">
              Matematyka
              <br />
              <em>zaczyna się</em>
              <br />
              od nowa.
            </h1>
            <p>
              Wracasz do matematyki po przerwie? Jesteś w dobrym miejscu. Ćwicz
              podstawy, sprawdzaj odpowiedzi i ucz się na błędach — spokojnie,
              we własnym tempie.
            </p>
            <button
              className="primary-button"
              type="button"
              onClick={startExercises}
            >
              {ui.start} <span aria-hidden="true">↗</span>
            </button>
            <div className="hero-meta">
              <span>{allTemplates.length} RODZIN</span>
              <span>PODSTAWY I MATEMATYKA NA STUDIA</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-grid" />
            <span className="art-spark art-spark-one">✳</span>
            <span className="art-spark art-spark-two">✦</span>
            <div className="art-card">
              <span className="art-label">MAŁE KROKI. DUŻY POSTĘP.</span>
              <span className="art-equation">
                2x <span>+</span> 3 <span>=</span> 11
              </span>
              <span className="art-answer">
                x = <strong>4</strong>
                <span className="art-check">✓</span>
              </span>
            </div>
            <div className="art-bottom">
              ZROZUMIENIE <span>›</span> PEWNOŚĆ SIEBIE
            </div>
          </div>
        </section>

        <section
          className="practice"
          id="practice"
          aria-labelledby="practice-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">UCZ SIĘ KROK PO KROKU</span>
              <h2 id="practice-title">
                Wybierz temat<span className="period">.</span>
              </h2>
            </div>
            <p>
              Wybierz dział i rodzinę ćwiczeń. Po pomyłce możesz
              skorzystać ze wskazówek i spróbować ponownie.
            </p>
          </div>
          <div className="study-groups" role="group" aria-label="Działy nauki">
            <button type="button" disabled={sessionNumber > 0} aria-pressed={!studying} onClick={() => { setSelectedCategory("order"); newExercise("order"); }}>Powtórka podstaw</button>
            <button type="button" disabled={sessionNumber > 0} aria-pressed={studying} onClick={() => { setSelectedCategory("quadratics"); newExercise("quadratics"); }}>Matematyka na studia</button>
          </div>
          {studying && <p className="input-help">Autorskie materiały do samodzielnej nauki. Nie są oficjalnymi materiałami UWM.</p>}
          <div
            className="category-picker"
            role="group"
            aria-label="Kategorie ćwiczeń"
          >
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={selectedCategory === category.id ? "active" : ""}
                aria-pressed={selectedCategory === category.id}
                disabled={sessionNumber > 0}
                onClick={() => {
                  setSelectedCategory(category.id);
                  newExercise(category.id);
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="practice-controls">
            <div className="difficulty-picker" role="group" aria-label="Poziom trudności">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <button key={level} type="button" disabled={sessionNumber > 0}
                  aria-pressed={difficulty === level}
                  onClick={() => {
                    setDifficulty(level);
                    newPracticeExample(level);
                  }}>
                  {difficultyLabels[level]}
                </button>
              ))}
            </div>
            {sessionNumber === 0 && (
              <div className="practice-actions">
                <button type="button" onClick={() => newPracticeExample()}>{ui.newExample}</button>
                <button type="button" onClick={() => startSession()}>Rozpocznij sesję (10 zadań)</button>
              </div>
            )}
          </div>
          {sessionNumber > 0 && <p className="session-progress" role="status">Sesja: zadanie {sessionNumber} z 10</p>}
          {repeated && active && <p className="session-progress">Pula wariantów w tym temacie i poziomie się wyczerpała; zaczynamy ją ponownie.</p>}
          <div className="exercise-layout">
            <div className="exercise-list" aria-label="Rodziny ćwiczeń">
              {visibleTemplates.map((template, index) => (
                <button
                  type="button"
                  key={template.id}
                  disabled={sessionNumber > 0}
                  className={`exercise-item ${active?.templateId === template.id ? "selected" : ""}`}
                  onClick={() => newExercise(selectedCategory, difficulty, template.id)}
                  aria-current={active?.templateId === template.id ? "step" : undefined}
                >
                  <span className="exercise-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="exercise-text">
                    <strong>{template.title}</strong>
                    <small>Losuj kolejny wariant</small>
                  </span>
                  <span
                    className="exercise-state"
                    aria-label={ui.open}
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
            <div className="exercise-panel">
              {active ? (
                <>
                  <div className="panel-top">
                    <span>
                      {sessionNumber > 0 ? `SESJA ${sessionNumber} / 10` : "ĆWICZENIE"} · {difficultyLabels[difficulty].toUpperCase()}
                    </span>
                    <span>✳</span>
                  </div>
                  <h3>{active.title}</h3>
                  <p className="panel-intro">
                    Spróbuj rozwiązać zadanie. Wskazówki pomogą Ci samodzielnie
                    poprawić odpowiedź.
                  </p>
                  <div
                    className="question"
                    data-template-id={active.templateId}
                    data-difficulty={active.difficulty}
                    aria-label={`Zadanie: ${active.question}`}
                    aria-live="polite"
                  >
                    {active.question}
                  </div>
                  {"matrices" in active && active.matrices && <div className="given-matrices">
                    {active.matrices.map((matrix) => <MatrixDisplay key={matrix.label} {...matrix} />)}
                  </div>}
                  {"startingHint" in active && <p className="starting-hint"><strong>Jak zacząć:</strong> {active.startingHint}</p>}
                </>
              ) : null}
              <Scratchpad run={run} active={!!active} />
              {active ? (
                <>
                  <form onSubmit={submitAnswer}>
                    <AnswerFields spec={getAnswerSpec(active)} value={answer} fractionInput={active.category === "fractions" || "startingHint" in active}
                        onChange={(value) => {
                          setAnswer(value);
                          setSubmittedAnswer("");
                          setResult(null);
                          setHintExpanded(false);
                          setStepVisible(false);
                          setStepAnswer("");
                          setStepResult(null);
                        }}
                      />
                    <p id="answer-help" className="input-help">
                      {answerHints[getAnswerSpec(active).kind]}
                    </p>
                  </form>
                  {result && (
                    <div className={`feedback ${result.kind}`} role="status">
                      <strong>
                        {result.kind === "correct"
                          ? ui.correct
                          : result.kind === "incorrect"
                            ? ui.incorrect
                            : ui.invalid}
                      </strong>
                      {result.kind !== "invalid" && (
                        <span className="submitted-answer">
                          Odpowiedź: {submittedAnswer}
                        </span>
                      )}
                      <p>{result.message}</p>
                      {result.kind === "incorrect" && (
                        <>
                          {result.diagnosis.kind === "hypotheses" ? (
                            <div className="diagnosis">
                              <strong>
                                {result.diagnosis.ambiguous
                                  ? "Kilka możliwych przyczyn"
                                  : "Możliwa przyczyna"}
                              </strong>
                              <ul>
                                {result.diagnosis.candidates.map(
                                  (candidate) => (
                                    <li key={candidate.errorCode}>
                                      {candidate.explanation}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          ) : (
                            <p className="diagnosis">
                              {result.diagnosis.explanation}
                            </p>
                          )}
                          <p className="learning-hint">
                            <strong>Pierwsza wskazówka:</strong> {active.hint}
                          </p>
                          <div className="hint-actions">
                            <button
                              type="button"
                              onClick={() => setHintExpanded(true)}
                              disabled={hintExpanded}
                            >
                              {ui.moreHint}
                            </button>
                            {active.step && (
                              <button
                                type="button"
                                onClick={() => setStepVisible(true)}
                                disabled={stepVisible}
                              >
                                {ui.step}
                              </button>
                            )}
                          </div>
                          {hintExpanded && (
                            <p className="learning-hint">
                              <strong>Kolejna wskazówka:</strong>{" "}
                              {result.diagnosis.kind === "hypotheses" &&
                              !result.diagnosis.ambiguous
                                ? result.diagnosis.candidates[0].hint
                                : active.nextHint}
                            </p>
                          )}
                          {stepVisible && active.step && (
                            <form className="step-form" onSubmit={submitStep}>
                              <label htmlFor="step-answer">
                                {active.step.question}
                              </label>
                              <div className="answer-row">
                                <input
                                  id="step-answer"
                                  type="text"
                                  inputMode="decimal"
                                  autoComplete="off"
                                  value={stepAnswer}
                                  onChange={(event) => {
                                    setStepAnswer(event.target.value);
                                    setStepResult(null);
                                  }}
                                  placeholder="Wpisz wynik pierwszego kroku"
                                />
                                <button type="submit" className="check-button">
                                  Sprawdź krok
                                </button>
                              </div>
                              {stepResult && (
                                <p
                                  className={`step-feedback ${stepResult.kind}`}
                                  aria-live="polite"
                                >
                                  {stepResult.message}
                                </p>
                              )}
                            </form>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  <SolutionPanel key={run} task={active} inSession={sessionNumber > 0} onReveal={() => {
                    if (sessionRef.current) updateSession(recordSolutionViewed(sessionRef.current, active.id));
                  }} />
                  {(sessionNumber > 0 || result?.kind === "correct") && (
                    <button key={active.id} type="button" className="next-button" onClick={(event) => { if (event.detail < 2) nextExercise(); }}>
                      {sessionNumber === 10 ? "Zakończ sesję" : sessionNumber > 0 ? ui.next : ui.nextExample} <span aria-hidden="true">→</span>
                    </button>
                  )}
                  <p className="panel-footnote">
                    Błędy są częścią nauki. Możesz próbować tyle razy, ile
                    potrzebujesz.
                  </p>
                </>
              ) : summary && session ? (
                <SessionSummaryPanel summary={summary} difficulty={session.difficulty}
                  onStartSession={startSession} onPractice={() => newExercise()} />
              ) : (
                <div className="empty-panel">
                  <span className="empty-symbol" aria-hidden="true">
                    ↗
                  </span>
                  <span className="eyebrow">TWOJA PRZESTRZEŃ DO NAUKI</span>
                  <h3>
                    Gotowy na<br /><em>pierwszy krok?</em>
                  </h3>
                  <p>
                    Wybierz temat z listy po lewej, aby rozpocząć krótkie ćwiczenie.
                  </p>
                  <button type="button" onClick={() => newExercise()}>
                    Zacznij od pierwszego zadania{" "}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer>
        <span>
          math<span className="brand-accent">tutor</span>
        </span>
        <p>
          Matematyka jest dla każdego. © {new Date().getFullYear()} Math Tutor
          · MIT
        </p>
      </footer>
    </div>
  );
}
