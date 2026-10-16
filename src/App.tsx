import { useState, type FormEvent } from "react";
import {
  checkAnswer,
  checkStep,
  type CategoryId,
  type CheckResult,
  type StepResult,
} from "./exercises";
import { categories, exercises, feedback, ui } from "./locales/pl";

export default function App() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("order");
  const [answer, setAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [hintExpanded, setHintExpanded] = useState(false);
  const [stepVisible, setStepVisible] = useState(false);
  const [stepAnswer, setStepAnswer] = useState("");
  const [stepResult, setStepResult] = useState<StepResult | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const active = activeIndex === null ? null : exercises[activeIndex];
  const visibleExercises = exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(({ exercise }) => exercise.category === selectedCategory);

  function selectExercise(index: number) {
    setActiveIndex(index);
    setSelectedCategory(exercises[index].category);
    setAnswer("");
    setSubmittedAnswer("");
    setResult(null);
    setHintExpanded(false);
    setStepVisible(false);
    setStepAnswer("");
    setStepResult(null);
  }

  function startExercises() {
    selectExercise(0);
    document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" });
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const nextResult = checkAnswer(active, answer, feedback);
    setSubmittedAnswer(answer);
    setResult(nextResult);
    setHintExpanded(false);
    setStepVisible(false);
    setStepAnswer("");
    setStepResult(null);
    if (nextResult.kind === "correct") {
      setCompleted((previous) =>
        previous.includes(active.id) ? previous : [...previous, active.id],
      );
    }
  }

  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active?.step) setStepResult(checkStep(active, stepAnswer, feedback));
  }

  function nextExercise() {
    selectExercise(
      activeIndex === null || activeIndex === exercises.length - 1
        ? 0
        : activeIndex + 1,
    );
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a
          className="brand"
          href="/math-tutor-app/"
          onClick={(event) => {
            event.preventDefault();
            setActiveIndex(null);
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
              <span>01 — 15</span>
              <span>PIĘĆ TEMATÓW DO ĆWICZENIA</span>
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
              Pięć obszarów i piętnaście krótkich zadań. Po pomyłce możesz
              skorzystać ze wskazówek i spróbować ponownie.
            </p>
          </div>
          <div
            className="category-picker"
            role="group"
            aria-label="Kategorie ćwiczeń"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={selectedCategory === category.id ? "active" : ""}
                aria-pressed={selectedCategory === category.id}
                onClick={() =>
                  selectExercise(
                    exercises.findIndex(
                      (exercise) => exercise.category === category.id,
                    ),
                  )
                }
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="exercise-layout">
            <div className="exercise-list" aria-label="Lista ćwiczeń">
              {visibleExercises.map(({ exercise, index }) => (
                <button
                  type="button"
                  key={exercise.id}
                  className={`exercise-item ${activeIndex === index ? "selected" : ""}`}
                  onClick={() => selectExercise(index)}
                  aria-current={activeIndex === index ? "step" : undefined}
                >
                  <span className="exercise-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="exercise-text">
                    <strong>{exercise.title}</strong>
                    <small>{exercise.question}</small>
                  </span>
                  <span
                    className="exercise-state"
                    aria-label={
                      completed.includes(exercise.id) ? ui.completed : ui.open
                    }
                  >
                    {completed.includes(exercise.id) ? "✓" : "→"}
                  </span>
                </button>
              ))}
            </div>
            <div className="exercise-panel">
              {active ? (
                <>
                  <div className="panel-top">
                    <span>
                      ZADANIE {String(activeIndex! + 1).padStart(2, "0")} /{" "}
                      {exercises.length}
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
                    aria-label={`Zadanie: ${active.question}`}
                  >
                    {active.question}
                  </div>
                  <form onSubmit={submitAnswer}>
                    <label htmlFor="answer">{ui.answer}</label>
                    <div className="answer-row">
                      <input
                        id="answer"
                        type="text"
                        inputMode={
                          active.category === "fractions" ? "text" : "decimal"
                        }
                        autoComplete="off"
                        aria-describedby="answer-help"
                        value={answer}
                        onChange={(event) => {
                          setAnswer(event.target.value);
                          setSubmittedAnswer("");
                          setResult(null);
                          setHintExpanded(false);
                          setStepVisible(false);
                          setStepAnswer("");
                          setStepResult(null);
                        }}
                        placeholder={ui.answerPlaceholder}
                      />
                      <button type="submit" className="check-button">
                        {ui.check} <span aria-hidden="true">→</span>
                      </button>
                    </div>
                    <p id="answer-help" className="input-help">
                      Możesz wpisać liczbę, ułamek a/b lub równoważną wartość
                      dziesiętną.
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
                      {result.kind === "correct" && (
                        <button
                          type="button"
                          className="next-button"
                          onClick={nextExercise}
                        >
                          {activeIndex === exercises.length - 1
                            ? "Wróć do pierwszego zadania"
                            : ui.next}{" "}
                          <span aria-hidden="true">→</span>
                        </button>
                      )}
                    </div>
                  )}
                  <p className="panel-footnote">
                    Błędy są częścią nauki. Możesz próbować tyle razy, ile
                    potrzebujesz.
                  </p>
                </>
              ) : (
                <div className="empty-panel">
                  <span className="empty-symbol" aria-hidden="true">
                    ↗
                  </span>
                  <span className="eyebrow">TWOJA PRZESTRZEŃ DO NAUKI</span>
                  <h3>
                    Gotowy na
                    <br />
                    <em>pierwszy krok?</em>
                  </h3>
                  <p>
                    Wybierz temat z listy po lewej, aby rozpocząć krótkie
                    ćwiczenie.
                  </p>
                  <button type="button" onClick={() => selectExercise(0)}>
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
