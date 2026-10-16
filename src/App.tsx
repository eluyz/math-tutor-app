import { useState, type FormEvent } from "react";
import { checkAnswer, type CheckResult } from "./exercises";
import { exercises, feedback, ui } from "./locales/pl";

export default function App() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const active = activeIndex === null ? null : exercises[activeIndex];

  function selectExercise(index: number) {
    setActiveIndex(index);
    setAnswer("");
    setResult(null);
  }

  function startExercises() {
    selectExercise(0);
    document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" });
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const nextResult = checkAnswer(active, answer, feedback);
    setResult(nextResult);
    if (nextResult.kind === "correct") {
      setCompleted((previous) =>
        previous.includes(active.id) ? previous : [...previous, active.id],
      );
    }
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
              <span>01 — 03</span>
              <span>TRZY KRÓTKIE ZADANIA NA START</span>
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
              <span className="eyebrow">NA DOBRY POCZĄTEK</span>
              <h2 id="practice-title">
                Wybierz temat<span className="period">.</span>
              </h2>
            </div>
            <p>
              Nie musisz pamiętać wszystkiego. Zacznij od jednego zadania i
              zobacz, co już potrafisz.
            </p>
          </div>
          <div className="exercise-layout">
            <div className="exercise-list" aria-label="Lista ćwiczeń">
              {exercises.map((exercise, index) => (
                <button
                  type="button"
                  key={exercise.id}
                  className={`exercise-item ${activeIndex === index ? "selected" : ""}`}
                  onClick={() => selectExercise(index)}
                  aria-current={activeIndex === index ? "step" : undefined}
                >
                  <span className="exercise-number">0{index + 1}</span>
                  <span className="exercise-text">
                    <strong>{exercise.topic}</strong>
                    <small>{exercise.title}</small>
                  </span>
                  <span
                    className="exercise-state"
                    aria-label={
                      completed.includes(exercise.id) ? ui.completed : ui.open
                    }
                  >
                    {completed.includes(exercise.id) ? "✓" : "↗"}
                  </span>
                </button>
              ))}
            </div>
            <div className="exercise-panel">
              {active ? (
                <>
                  <div className="panel-top">
                    <span>ZADANIE 0{activeIndex! + 1} / 03</span>
                    <span>✳</span>
                  </div>
                  <h3>{active.topic}</h3>
                  <p className="panel-intro">
                    Spróbuj rozwiązać zadanie. Jeśli się pomylisz, dostaniesz
                    wskazówkę.
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
                        inputMode="decimal"
                        autoComplete="off"
                        value={answer}
                        onChange={(event) => {
                          setAnswer(event.target.value);
                          setResult(null);
                        }}
                        placeholder={ui.answerPlaceholder}
                      />
                      <button type="submit" className="check-button">
                        {ui.check} <span aria-hidden="true">→</span>
                      </button>
                    </div>
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
                      <p>{result.message}</p>
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
