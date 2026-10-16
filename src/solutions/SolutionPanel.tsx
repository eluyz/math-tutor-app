import { useEffect, useRef, useState } from "react";
import type { GeneratedTask } from "../generators";
import { formatRational as f, type AnswerSpec } from "../answers";
import { MatrixDisplay } from "../MatrixDisplay";
import { solutionFor, calculationText, type Solution } from "./model";
import "./solutions.css";

function FinalAnswer({ answer }: { answer: AnswerSpec }) {
  switch (answer.kind) {
    case "scalar": return <p className="solution-answer">{f(answer.value)}</p>;
    case "list": return <dl>{answer.values.map((value, i) => <div key={i}><dt>{answer.labels[i]}</dt><dd>{f(value)}</dd></div>)}</dl>;
    case "matrix": return <MatrixDisplay label="wynikowa" values={answer.values} />;
    case "choice": return <p className="solution-answer">{answer.options.find((option) => option.value === answer.value)?.label}</p>;
    case "roots": return <p className="solution-answer">{answer.values.length === 0 ? "Brak pierwiastków rzeczywistych" : answer.values.length === 1
      ? `Jeden pierwiastek podwójny: x₀ = ${f(answer.values[0])}` : `Dwa różne pierwiastki rzeczywiste: x₁ = ${f(answer.values[0])}; x₂ = ${f(answer.values[1])}`}</p>;
  }
}
export function SolutionPanel({ task, inSession, onReveal }: { task: GeneratedTask; inSession: boolean; onReveal: () => void }) {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [visible, setVisible] = useState(0);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => { if (visible) panel.current?.querySelectorAll<HTMLElement>("h5").item(visible - 1)?.focus(); }, [visible]);
  return <section ref={panel} className="solution-panel" aria-label="Rozwiązanie krok po kroku">
    {!solution ? <>
      {inSession && <p id="solution-warning">Po obejrzeniu rozwiązania zadanie nie będzie liczone jako poprawne rozwiązane samodzielnie, jeśli nie było wcześniej sprawdzone.</p>}
      <button type="button" aria-describedby={inSession ? "solution-warning" : undefined} onClick={() => {
        onReveal(); setSolution(solutionFor(task)); setVisible(1);
      }}>Pokaż rozwiązanie</button>
    </> : <>
      <h4>Rozwiązanie krok po kroku</h4>
      <p role="status">Odsłonięto {visible} z {solution.length} kroków.</p>
      <ol>{solution.slice(0, visible).map((step, i) => <li key={i} className={step.kind === "answer" ? "solution-final" : undefined}>
        <h5 tabIndex={-1}>Krok {i + 1}. {step.action}</h5>
        <p>{step.reason}</p>
        {step.kind === "working" ? step.calculations.map((calculation, j) => <p className="solution-calculation" key={j}>{calculationText(calculation)}</p>) : <FinalAnswer answer={step.answer} />}
      </li>)}</ol>
      <div className="hint-actions">
        <button type="button" disabled={visible >= solution.length} onClick={() => setVisible((n) => Math.min(n + 1, solution.length))}>Następny krok</button>
        <button type="button" disabled={visible >= solution.length} onClick={() => setVisible(solution.length)}>Pokaż wszystkie kroki</button>
      </div>
    </>}
  </section>;
}
