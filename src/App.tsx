import { difficultyConfig } from "./difficulty";
import { SolutionPanel } from "./solutions/SolutionPanel";
import { MistakeHelp } from "./diagnostics/MistakeHelp";
import { Scratchpad } from "./scratchpad/Scratchpad";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  checkAnswer,
  checkStep,
  getAnswerSpec,
  type CategoryId,
} from "./exercises";
import { useLocale, LanguagePicker } from "./locales/LocaleProvider";
import { localizeTask, familyTitle } from "./locales/catalog";
import {
  createGenerator,
  allTemplates,
  supportsDifficulty,
  availableDifficulties,
  type Difficulty,
  type GeneratedTask,
} from "./generators";
import { emptyAnswer, describeInput, type AnswerInput } from "./answers";
import { IntegratedGraphDisplay } from "./IntegratedGraphDisplay";
import { IntegratedJumpDisplay } from "./IntegratedJumpDisplay";
import { AnswerFields } from "./AnswerFields";
import { MatrixDisplay } from "./MatrixDisplay";
import { DeterminantDisplay } from "./DeterminantDisplay";
import { RadicalDeterminantDisplay } from "./RadicalDeterminantDisplay";
import { FunctionGraphDisplay } from "./FunctionGraphDisplay";
import { GraphGapDisplay } from "./GraphGapDisplay";
import { PuncturedSymmetryDisplay } from "./PuncturedSymmetryDisplay";
import { AsymptoteRangeDisplay } from "./AsymptoteRangeDisplay";
import { IntegratedAsymptoteDisplay } from "./IntegratedAsymptoteDisplay";
import { DerivativeSketchDisplay } from "./DerivativeSketchDisplay";
import { isUniversityTask } from "./university/catalog";
import { LinearAlgebraDisplay } from "./LinearAlgebraDisplay";
import { isLinearAlgebraProblem, isFunctionGraphProblem } from "./university/schema";
import {
  advanceSession,
  createSession,
  recordFirstAttempt,
  recordSolutionViewed,
  summarizeSession,
  SESSION_LENGTH,
  type SessionState,
} from "./session";
import { SessionSummaryPanel } from "./SessionSummaryPanel";
import { completedSession } from "./progress/model";
import { useProgress } from "./progress/useProgress";
import { ProgressDashboard } from "./progress/ProgressDashboard";
import { categoryTitle, resolveCatalogCompetency, searchCatalog, selectCatalogFamily } from "./catalogSearch";
import { ExamMode } from "./exam/ExamMode";
import { examCopy } from "./exam/copy";

export default function App() {
  const { copy, locale, difficultyLabels } = useLocale();
  const { categories, studyCategories, feedback, ui, answerHints } = copy;
  const a = copy.app;
  const progress = useProgress();
  const [view, setView] = useState<"learn" | "progress" | "exam">("learn");
  const [examLocked, setExamLocked] = useState(false);
  const sessionId = useRef<string | null>(null);
  const previousView = useRef(view);
  const generator = useRef<ReturnType<typeof createGenerator> | null>(null);
  const [run, setRun] = useState(0);
  const [source, setActive] = useState<GeneratedTask | null>(null);
  const active = useMemo(
    () => (source ? localizeTask(source, locale) : null),
    [source, locale],
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("order");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLevelChange, setSearchLevelChange] = useState<{ from: Difficulty; to: Difficulty } | null>(null);
  const searchFocusRequested = useRef(false);
  const [session, setSession] = useState<SessionState | null>(null);
  const sessionRef = useRef<SessionState | null>(null);
  const sessionNumber =
    session && !session.completed ? session.entries.length : 0;
  const sessionDone = session?.completed ?? false;
  const summary = session ? summarizeSession(session) : null;
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [repeated, setRepeated] = useState(false);
  const [answer, setAnswer] = useState<AnswerInput>("");
  const [checkedInput, setCheckedInput] = useState<AnswerInput | null>(null);
  const result =
    active && checkedInput !== null
      ? checkAnswer(active, checkedInput, feedback)
      : null;
  const activeSpec = active ? getAnswerSpec(active) : null;
  const functionZeros = activeSpec?.kind === "roots" && activeSpec.context === "zeros";
  const submittedAnswer =
    checkedInput === null
      ? ""
      : typeof checkedInput !== "string" &&
          checkedInput.kind === "roots" &&
          checkedInput.classification === "none"
        ? functionZeros ? copy.answers.zeros.none : copy.answers.none
        : describeInput(
            checkedInput,
            active ? getAnswerSpec(active) : undefined,
          );
  const [hintExpanded, setHintExpanded] = useState(false);
  const [stepVisible, setStepVisible] = useState(false);
  const [stepAnswer, setStepAnswer] = useState("");
  const [checkedStep, setCheckedStep] = useState<string | null>(null);
  const stepResult =
    active?.step && checkedStep !== null
      ? checkStep(active, checkedStep, feedback)
      : null;
  const visibleTemplates = allTemplates.filter(
    (template) => template.category === selectedCategory,
  );
  const searchResults = useMemo(() => searchCatalog(searchQuery), [searchQuery]);
  const searchCompetency = useMemo(() => resolveCatalogCompetency(searchQuery), [searchQuery]);
  const studying = studyCategories.some(
    (category) => category.id === selectedCategory,
  );
  const visibleCategories = (studying ? studyCategories : categories).filter(
    (category) =>
      allTemplates.some((template) => template.category === category.id),
  );

  useEffect(() => {
    if (active) {
      document.getElementById(searchFocusRequested.current ? "exercise-title" : "answer")?.focus();
      searchFocusRequested.current = false;
    }
  }, [source]);

  useEffect(() => {
    if (sessionDone) document.getElementById("session-complete")?.focus();
  }, [sessionDone]);

  useEffect(() => {
    if (previousView.current !== view)
      document
        .getElementById(view === "progress" ? "progress-title" : view === "exam" ? "exam-title" : "practice-title")
        ?.focus();
    previousView.current = view;
  }, [view]);

  function resetAnswer(exercise: GeneratedTask | null = null) {
    setAnswer(exercise ? emptyAnswer(getAnswerSpec(exercise)) : "");
    setCheckedInput(null);
    setHintExpanded(false);
    setStepVisible(false);
    setStepAnswer("");
    setCheckedStep(null);
  }

  function updateSession(next: SessionState | null) {
    if (next?.completed && !sessionRef.current?.completed && sessionId.current) {
      const record = completedSession(
        next, sessionId.current, new Date().toISOString(),
      );
      if (record) progress.record(record);
    }
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

  function newExercise(
    category = selectedCategory,
    level = difficulty,
    templateId?: string,
  ) {
    if (
      (templateId && !supportsDifficulty(templateId, level)) ||
      !availableDifficulties(category).includes(level)
    ) {
      updateSession(null);
      setActive(null);
      setUnavailable(templateId ?? "category");
      setRun((current) => current + 1);
      resetAnswer();
      return;
    }
    setUnavailable(null);
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
    setSearchLevelChange(null);
    newExercise(
      selectedCategory,
      level,
      active?.templateId ??
        (unavailable && unavailable !== "category" ? unavailable : undefined),
    );
  }

  function openSearchResult(template: (typeof allTemplates)[number]) {
    if (sessionRef.current && !sessionRef.current.completed) return;
    const selection = selectCatalogFamily(template, difficulty);
    searchFocusRequested.current = true;
    setSelectedCategory(selection.category);
    setDifficulty(selection.difficulty);
    setSearchLevelChange(selection.changedDifficulty
      ? { from: difficulty, to: selection.difficulty } : null);
    setSearchQuery("");
    newExercise(selection.category, selection.difficulty, selection.templateId);
  }

  function startSession(level = difficulty) {
    if (sessionRef.current && !sessionRef.current.completed) return;
    if (!availableDifficulties(selectedCategory).includes(level)) return;
    setSearchLevelChange(null);
    setUnavailable(null);
    generator.current = createGenerator();
    const next = generator.current.next(selectedCategory, level);
    sessionId.current = crypto.randomUUID();
    updateSession(createSession(
      selectedCategory, level, next.exercise.id, next.exercise.templateId,
    ));
    setDifficulty(level);
    showExercise(next);
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const nextResult = checkAnswer(active, answer, feedback);
    if (sessionRef.current) {
      updateSession(
        recordFirstAttempt(sessionRef.current, active.id, nextResult.kind),
      );
    }
    setCheckedInput(answer);
    setHintExpanded(false);
    setStepVisible(false);
    setStepAnswer("");
    setCheckedStep(null);
  }

  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active?.step) setCheckedStep(stepAnswer);
  }

  function nextExercise() {
    const current = sessionRef.current;
    if (current) {
      if (
        !active ||
        current.completed ||
        current.entries[current.entries.length - 1].exerciseId !== active.id
      )
        return;
      const next =
        current.entries.length < SESSION_LENGTH
          ? generator.current!.next(current.category, current.difficulty)
          : undefined;
      const updated = advanceSession(
        current, active.id, next?.exercise.id, next?.exercise.templateId,
      );
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
            if (examLocked) return;
            if (view === "progress" || view === "exam") {
              setView("learn");
              return;
            }
            setActive(null);
            setUnavailable(null);
            updateSession(null);
            resetAnswer();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label={a.home}
        >
          <span className="brand-mark" aria-hidden="true">
            ∑
          </span>
          <span>
            math<span className="brand-accent">tutor</span>
            <small>{a.tagline}</small>
          </span>
        </a>
        <LanguagePicker />
      </header>

      <nav className="view-navigation" aria-label={copy.progress.navigation}>
        <button type="button" disabled={examLocked} aria-current={view === "learn" ? "page" : undefined} onClick={() => setView("learn")}>
          {copy.progress.learn}
        </button>
        <button type="button" disabled={examLocked} aria-current={view === "progress" ? "page" : undefined} onClick={() => setView("progress")}>
          {copy.progress.title}
        </button>
        <button type="button" disabled={sessionNumber > 0} aria-current={view === "exam" ? "page" : undefined}
          onClick={() => setView("exam")}>{examCopy[locale].navigation}</button>
      </nav>
      {progress.issue && <p className="storage-notice" role="status">{copy.progress.issues[progress.issue]}</p>}

      <main>
        <div hidden={view !== "learn"}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-line" /> {a.eyebrow}
            </span>
            <h1 id="hero-title">
              {a.hero1}
              <br />
              <em>{a.hero2}</em>
              <br />
              {a.hero3}
            </h1>
            <p>{a.heroText}</p>
            <button
              className="primary-button"
              type="button"
              onClick={startExercises}
            >
              {ui.start} <span aria-hidden="true">↗</span>
            </button>
            <div className="hero-meta">
              <span>
                {allTemplates.length} {a.families}
              </span>
              <span>{a.basicStudy}</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-grid" />
            <span className="art-spark art-spark-one">✳</span>
            <span className="art-spark art-spark-two">✦</span>
            <div className="art-card">
              <span className="art-label">{a.smallSteps}</span>
              <span className="art-equation">
                2x <span>+</span> 3 <span>=</span> 11
              </span>
              <span className="art-answer">
                x = <strong>4</strong>
                <span className="art-check">✓</span>
              </span>
            </div>
            <div className="art-bottom">
              {a.understanding} <span>›</span> {a.confidence}
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
              <span className="eyebrow">{a.learnSteps}</span>
              <h2 id="practice-title" tabIndex={-1}>
                {a.chooseTopic}
                <span className="period">.</span>
              </h2>
            </div>
            <p>{a.chooseDescription}</p>
          </div>
          <div className="catalog-search" role="search" aria-label={a.searchLabel}>
            <label htmlFor="catalog-search-input">{a.searchLabel}</label>
            <div className="catalog-search-controls">
              <input
                id="catalog-search-input"
                type="search"
                value={searchQuery}
                placeholder={a.searchPlaceholder}
                disabled={sessionNumber > 0}
                aria-controls="catalog-search-results"
                aria-describedby={[
                  sessionNumber > 0 ? "catalog-search-locked" : null,
                  searchCompetency ? "catalog-search-competency" : null,
                ].filter(Boolean).join(" ") || undefined}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              {searchQuery && (
                <button type="button" disabled={sessionNumber > 0}
                  onClick={() => {
                    setSearchQuery("");
                    document.getElementById("catalog-search-input")?.focus();
                  }}>
                  {a.searchClear}
                </button>
              )}
            </div>
            {sessionNumber > 0 && <p id="catalog-search-locked" className="input-help">{a.searchLocked}</p>}
            {searchCompetency && (
              <p id="catalog-search-competency" className="input-help" role="status">
                {a.searchCompetencyScope(searchCompetency.code, searchCompetency.coverage)}
              </p>
            )}
            <div id="catalog-search-results">
              {searchQuery.trim() && (
                <>
                  <p className="catalog-search-count" role="status">
                    {searchResults.length ? a.searchCount(searchResults.length) : a.searchEmpty}
                  </p>
                  {searchResults.length > 0 && (
                    <ul className="catalog-search-list" aria-label={a.searchResults}>
                      {searchResults.map((template) => (
                        <li key={template.id}>
                          <button type="button" disabled={sessionNumber > 0}
                            onClick={() => openSearchResult(template)}
                            aria-label={a.searchOpen(
                              familyTitle(template, locale),
                              categoryTitle(template.category, locale),
                              template.supportedDifficulties.map((level) => difficultyLabels[level]).join(", "),
                            )}>
                            <strong>{familyTitle(template, locale)}</strong>
                            <span>{categoryTitle(template.category, locale)}</span>
                            <small>{a.availableLevels}: {template.supportedDifficulties.map((level) => difficultyLabels[level]).join(", ")}</small>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="study-groups" role="group" aria-label={a.groups}>
            <button
              type="button"
              disabled={sessionNumber > 0}
              aria-pressed={!studying}
              onClick={() => {
                setSearchLevelChange(null);
                setSelectedCategory("order");
                newExercise("order");
              }}
            >
              {a.basic}
            </button>
            <button
              type="button"
              disabled={sessionNumber > 0}
              aria-pressed={studying}
              onClick={() => {
                setSearchLevelChange(null);
                setSelectedCategory("quadratics");
                newExercise("quadratics");
              }}
            >
              {a.study}
            </button>
          </div>
          <div
            className="category-picker"
            role="group"
            aria-label={a.categoryLabel}
          >
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={selectedCategory === category.id ? "active" : ""}
                aria-pressed={selectedCategory === category.id}
                disabled={sessionNumber > 0}
                onClick={() => {
                  setSearchLevelChange(null);
                  setSelectedCategory(category.id);
                  newExercise(category.id);
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="practice-controls">
            <div
              className="difficulty-picker"
              role="group"
              aria-label={a.difficultyLabel}
            >
              {difficultyConfig.map(({ id: level, description }) => (
                <button
                  key={level}
                  type="button"
                  title={description[locale]}
                  disabled={
                    sessionNumber > 0 ||
                    !availableDifficulties(selectedCategory).includes(level)
                  }
                  aria-pressed={difficulty === level}
                  onClick={() => {
                    setSearchLevelChange(null);
                    setDifficulty(level);
                    newPracticeExample(level);
                  }}
                >
                  {difficultyLabels[level]}
                </button>
              ))}
            </div>
            {sessionNumber === 0 && (
              <div className="practice-actions">
                <button type="button" onClick={() => newPracticeExample()}>
                  {ui.newExample}
                </button>
                <button type="button" onClick={() => startSession()}>
                  {a.startSession}
                </button>
              </div>
            )}
          </div>
          {sessionNumber > 0 && (
            <p className="session-progress" role="status">
              {a.progress(sessionNumber)}
            </p>
          )}
          {searchLevelChange && sessionNumber === 0 && (
            <p className="search-level-notice" role="status">
              {a.searchLevelChanged(
                difficultyLabels[searchLevelChange.from],
                difficultyLabels[searchLevelChange.to],
              )}
            </p>
          )}
          {repeated && active && (
            <p className="session-progress">{a.repeated}</p>
          )}
          {unavailable && (
            <div className="unavailable" role="status">
              <p>{a.unavailable(difficultyLabels[difficulty])}</p>
              <button type="button" onClick={() => newExercise()}>
                {a.availableTask}
              </button>
            </div>
          )}
          <div className="exercise-layout">
            <div className="exercise-list">
              <div className="exercise-list-heading">
                <h3 id="category-families-title">{a.categoryFamilies(
                  categoryTitle(selectedCategory, locale), visibleTemplates.length,
                )}</h3>
              </div>
              <div className="exercise-list-items" role="region" aria-labelledby="category-families-title" tabIndex={0}>
              {visibleTemplates.map((template, index) => (
                <button
                  type="button"
                  key={template.id}
                  disabled={
                    sessionNumber > 0 ||
                    !template.supportedDifficulties.includes(difficulty)
                  }
                  title={
                    template.supportedDifficulties.includes(difficulty)
                      ? undefined
                      : `${a.availableLevels}: ${template.supportedDifficulties.map((level) => difficultyLabels[level]).join(", ")}`
                  }
                  className={`exercise-item ${active?.templateId === template.id ? "selected" : ""}`}
                  onClick={() => {
                    setSearchLevelChange(null);
                    newExercise(selectedCategory, difficulty, template.id);
                  }}
                  aria-current={
                    active?.templateId === template.id ? "step" : undefined
                  }
                >
                  <span className="exercise-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="exercise-text">
                    <strong>{familyTitle(template, locale)}</strong>
                    <small>
                      {a.availableLevels}: {template.supportedDifficulties.map((level) => difficultyLabels[level]).join(", ")}
                    </small>
                  </span>
                  <span className="exercise-state" aria-label={ui.open}>
                    →
                  </span>
                </button>
              ))}
              </div>
            </div>
            <div className="exercise-panel">
              {active ? (
                <>
                  <div className="panel-top">
                    <span>
                      {sessionNumber > 0
                        ? `${a.session} ${sessionNumber} / 10`
                        : a.exercise}{" "}
                      · {difficultyLabels[difficulty].toUpperCase()}
                    </span>
                    <span>✳</span>
                  </div>
                  <h3 id="exercise-title" tabIndex={-1}>{active.title}</h3>
                  <p className="panel-intro">{a.intro}</p>
                  <div
                    className={`question${"university" in active ? " university-question" : ""}`}
                    data-exercise-run={run}
                    data-template-id={active.templateId}
                    data-difficulty={active.difficulty}
                    aria-label={`${a.problem}: ${active.question}`}
                    aria-live="polite"
                  >
                    {active.question}
                  </div>
                  {isUniversityTask(active) && (isFunctionGraphProblem(active.university)) && (
                    <FunctionGraphDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && active.university.kind === "function-integrated-jump" && (
                    <IntegratedJumpDisplay problem={active.university} locale={locale}/>
                  )}
                  {isUniversityTask(active) && active.university.kind === "function-integrated-properties" && (
                    <IntegratedGraphDisplay problem={active.university} locale={locale}/>
                  )}
                  {isUniversityTask(active) && active.university.kind === "function-integrated-asymptotes" && (
                    <IntegratedAsymptoteDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && active.university.kind === "function-asymptote-range" && (
                    <AsymptoteRangeDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && (active.university.kind === "function-punctured-symmetry" || active.university.kind === "function-integrated-punctures") && (
                    <PuncturedSymmetryDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && active.university.kind === "function-disconnected-injectivity" && (
                    <GraphGapDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && active.university.kind === "function-disconnected-monotonicity" && (
                    <GraphGapDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && active.university.kind === "function-disconnected-range" && (
                    <GraphGapDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && active.university.kind === "function-disconnected-domain" && (
                    <GraphGapDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && active.university.kind === "derivative-sign-sketch" && (
                    <DerivativeSketchDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && active.university.kind === "determinant" && (
                    <DeterminantDisplay matrix={active.university.matrix} locale={locale} />
                  )}
                  {isUniversityTask(active) && active.university.kind === "determinant-radical-two" && (
                    <RadicalDeterminantDisplay problem={active.university} locale={locale} />
                  )}
                  {isUniversityTask(active) && isLinearAlgebraProblem(active.university) && (
                    <LinearAlgebraDisplay problem={active.university} />
                  )}
                  {"matrices" in active && active.matrices && (
                    <div className="given-matrices">
                      {active.matrices.map((matrix) => (
                        <MatrixDisplay key={matrix.label} {...matrix} />
                      ))}
                    </div>
                  )}
                  {"startingHint" in active && (
                    <p className="starting-hint">
                      <strong>{a.starting}</strong> {active.startingHint}
                    </p>
                  )}
                </>
              ) : null}
              <Scratchpad run={run} active={!!active && view === "learn"} />
              {active ? (
                <>
                  <form onSubmit={submitAnswer}>
                    <AnswerFields
                      spec={getAnswerSpec(active)}
                      value={answer}
                      fractionInput={
                        active.category === "fractions" ||
                        "startingHint" in active
                      }
                      onChange={(value) => {
                        setAnswer(value);
                        setCheckedInput(null);
                        setHintExpanded(false);
                        setStepVisible(false);
                        setStepAnswer("");
                        setCheckedStep(null);
                      }}
                    />
                    <p id="answer-help" className="input-help">
                      {functionZeros ? copy.answers.zeros.help : answerHints[getAnswerSpec(active).kind]}
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
                          {a.answer} {submittedAnswer}
                        </span>
                      )}
                      <p>{result.message}</p>
                      {activeSpec?.kind==="multi-choice"&&checkedInput!==null&&typeof checkedInput!=="string"&&checkedInput.kind==="multi-choice"&&(
                        <ul className="graph-property-field-results" aria-label={locale==="pl"?"Wyniki poszczególnych pól":"Individual field results"}>
                          {activeSpec.fields.map(field=>{
                            const entered=checkedInput.values[field.id]??"";
                            const status=!entered?"missing":entered===field.value?"correct":"incorrect";
                            return <li key={field.id} data-field={field.id} data-field-result={status}>
                              <strong>{field.label}</strong>: {status==="missing"?(locale==="pl"?"Brak odpowiedzi":"Unanswered"):
                                status==="correct"?(locale==="pl"?"Poprawnie":"Correct"):(locale==="pl"?"Niepoprawnie":"Incorrect")}
                            </li>;
                          })}
                        </ul>
                      )}
                      {result.kind === "incorrect" && (
                        <>
                          {result.diagnosis.kind === "hypotheses" ? (
                            <div className="diagnosis">
                              <strong>
                                {result.diagnosis.ambiguous
                                  ? a.ambiguous
                                  : a.possible}
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
                            <strong>{a.firstHint}</strong> {active.hint}
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
                              <strong>{a.nextHint}</strong>{" "}
                              {result.diagnosis.kind === "known"
                                ? result.diagnosis.hint
                                : result.diagnosis.kind === "hypotheses" && !result.diagnosis.ambiguous
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
                                    setCheckedStep(null);
                                  }}
                                  placeholder={a.stepPlaceholder}
                                />
                                <button type="submit" className="check-button">
                                  {a.checkStep}
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
                  {result?.kind === "incorrect" && checkedInput !== null && (
                    <MistakeHelp key={`${active.id}-${run}`} task={active} answer={checkedInput} />
                  )}
                  <SolutionPanel
                    key={run}
                    task={active}
                    inSession={sessionNumber > 0}
                    onReveal={() => {
                      if (sessionRef.current)
                        updateSession(
                          recordSolutionViewed(sessionRef.current, active.id),
                        );
                    }}
                  />
                  {(sessionNumber > 0 || result?.kind === "correct") && (
                    <button
                      key={active.id}
                      type="button"
                      className="next-button"
                      onClick={(event) => {
                        if (event.detail < 2) nextExercise();
                      }}
                    >
                      {sessionNumber === 10
                        ? a.finish
                        : sessionNumber > 0
                          ? ui.next
                          : ui.nextExample}{" "}
                      <span aria-hidden="true">→</span>
                    </button>
                  )}
                  <p className="panel-footnote">{a.footnote}</p>
                </>
              ) : summary && session ? (
                <SessionSummaryPanel
                  available={availableDifficulties(session.category)}
                  summary={summary}
                  difficulty={session.difficulty}
                  onStartSession={startSession}
                  onPractice={() => newExercise()}
                />
              ) : (
                <div className="empty-panel">
                  <span className="empty-symbol" aria-hidden="true">
                    ↗
                  </span>
                  <span className="eyebrow">{a.emptyEyebrow}</span>
                  <h3>
                    {a.ready}
                    <br />
                    <em>{a.firstStep}</em>
                  </h3>
                  <p>{a.emptyDescription}</p>
                  <button type="button" onClick={() => newExercise()}>
                    {a.startFirst} <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        </div>
        <ProgressDashboard
          active={view === "progress"}
          history={progress.history}
          issue={progress.issue}
          onDelete={progress.clear}
          onLearn={() => setView("learn")}
        />
        {view === "exam" && <ExamMode onLockedChange={setExamLocked} />}
      </main>
      <footer>
        <span>
          math<span className="brand-accent">tutor</span>
        </span>
        <p>
          {a.footer} © {new Date().getFullYear()} Math Tutor · MIT
        </p>
      </footer>
    </div>
  );
}
