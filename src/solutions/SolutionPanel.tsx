import { useLocale } from "../locales/LocaleProvider";
import { useEffect, useRef, useState } from "react";
import type { GeneratedTask } from "../generators";
import { formatRational as f, type AnswerSpec } from "../answers";
import { MatrixDisplay } from "../MatrixDisplay";
import { solutionFor, calculationText } from "./model";
import "./solutions.css";

function FinalAnswer({ answer }: { answer: AnswerSpec }) {
  const { copy } = useLocale();
  const c = copy.solution;
  const roots =
    answer.kind === "roots" && answer.context === "zeros"
      ? copy.answers.zeros
      : c;
  switch (answer.kind) {
    case "system":
      return (
        <>
          <p className="solution-answer">
            {copy.answers.system[answer.classification]}
          </p>
          {answer.classification === "system-one" && (
            <dl>
              {answer.values.map((value, i) => (
                <div key={i}>
                  <dt>{answer.variables[i]}</dt>
                  <dd>{f(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      );
    case "limit":
      return (
        <p className="solution-answer">
          {answer.value.kind === "finite"
            ? f(answer.value.value)
            : copy.answers.limit[answer.value.kind]}
        </p>
      );
    case "scalar":
      return <p className="solution-answer">{f(answer.value)}</p>;
    case "list":
      return (
        <dl>
          {answer.values.map((value, i) => (
            <div key={i}>
              <dt>{answer.labels[i]}</dt>
              <dd>{f(value)}</dd>
            </div>
          ))}
        </dl>
      );
    case "matrix":
      return <MatrixDisplay label="wynikowa" values={answer.values} />;
    case "choice":
      return (
        <p className="solution-answer">
          {
            answer.options.find((option) => option.value === answer.value)
              ?.label
          }
        </p>
      );
    case "roots":
      return (
        <p className="solution-answer">
          {answer.values.length === 0
            ? roots.none
            : answer.values.length === 1
              ? `${roots.double}: x₀ = ${f(answer.values[0])}`
              : `${roots.two}: x₁ = ${f(answer.values[0])}; x₂ = ${f(answer.values[1])}`}
        </p>
      );
  }
}
export function SolutionPanel({
  task,
  inSession,
  onReveal,
}: {
  task: GeneratedTask;
  inSession: boolean;
  onReveal: () => void;
}) {
  const { copy } = useLocale();
  const c = copy.solution;
  const [opened, setOpened] = useState(false);
  const solution = opened ? solutionFor(task) : null;
  const [visible, setVisible] = useState(0);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (visible)
      panel.current
        ?.querySelectorAll<HTMLElement>("h5")
        .item(visible - 1)
        ?.focus();
  }, [visible]);
  return (
    <section ref={panel} className="solution-panel" aria-label={c.name}>
      {!solution ? (
        <>
          {inSession && <p id="solution-warning">{c.warning}</p>}
          <button
            type="button"
            aria-describedby={inSession ? "solution-warning" : undefined}
            onClick={() => {
              onReveal();
              setOpened(true);
              setVisible(1);
            }}
          >
            {c.show}
          </button>
        </>
      ) : (
        <>
          <h4>{c.name}</h4>
          <p role="status">{c.status(visible, solution.length)}</p>
          <ol>
            {solution.slice(0, visible).map((step, i) => (
              <li
                key={i}
                className={
                  step.kind === "answer" ? "solution-final" : undefined
                }
              >
                <h5 tabIndex={-1}>
                  {c.step(i + 1)} {step.action}
                </h5>
                <p>{step.reason}</p>
                {step.kind === "working" ? (
                  step.calculations.map((calculation, j) => (
                    <p className="solution-calculation" key={j}>
                      {calculationText(calculation)}
                    </p>
                  ))
                ) : (
                  <FinalAnswer answer={step.answer} />
                )}
              </li>
            ))}
          </ol>
          <div className="hint-actions">
            <button
              type="button"
              disabled={visible >= solution.length}
              onClick={() =>
                setVisible((n) => Math.min(n + 1, solution.length))
              }
            >
              {c.next}
            </button>
            <button
              type="button"
              disabled={visible >= solution.length}
              onClick={() => setVisible(solution.length)}
            >
              {c.all}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
