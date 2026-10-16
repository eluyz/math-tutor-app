import type { AnswerInput, AnswerSpec } from "./answers";
import { ui } from "./locales/pl";

type Props = { spec: AnswerSpec; value: AnswerInput; onChange: (value: AnswerInput) => void; fractionInput?: boolean };

export function AnswerFields({ spec, value, onChange, fractionInput }: Props) {
  const check = <button type="submit" className="check-button">{ui.check} <span aria-hidden="true">→</span></button>;
  if (spec.kind === "roots") {
    const input = typeof value !== "string" && value.kind === "roots" ? value : { classification: "", values: [] as string[] };
    return <div className="structured-answer"><fieldset aria-describedby="answer-help"><legend>{ui.answer}</legend>
      <label htmlFor="answer">Liczba pierwiastków rzeczywistych</label>
      <select id="answer" value={input.classification} onChange={(event) => {
        const classification = event.target.value;
        onChange({ kind: "roots", classification, values: Array(classification === "two" ? 2 : classification === "double" ? 1 : 0).fill("") });
      }}>
        <option value="">Wybierz odpowiedź</option><option value="two">Dwa różne pierwiastki</option>
        <option value="double">Jeden pierwiastek podwójny</option><option value="none">Brak pierwiastków rzeczywistych</option>
      </select>
      {input.values.length > 0 && <p>Kolejność wpisanych pierwiastków nie ma znaczenia.</p>}
      {input.values.map((entry, i) => <div className="coefficient-field" key={i}>
        <label htmlFor={`root-${i}`}>Pierwiastek {i + 1}</label>
        <input id={`root-${i}`} type="text" autoComplete="off" value={entry}
          onChange={(event) => onChange({ kind: "roots", classification: input.classification, values: input.values.map((v, j) => i === j ? event.target.value : v) })} />
      </div>)}
    </fieldset>{check}</div>;
  }
  if (spec.kind === "scalar") return <>
    <label htmlFor="answer">{ui.answer}</label>
    <div className="answer-row">
      <input id="answer" type="text" inputMode={fractionInput ? "text" : "decimal"} autoComplete="off"
        aria-describedby="answer-help" value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)} placeholder={ui.answerPlaceholder} />
      {check}
    </div>
  </>;
  if (spec.kind === "choice") return <>
    <label htmlFor="answer">{ui.answer}</label>
    <div className="answer-row">
      <select id="answer" aria-describedby="answer-help" value={typeof value !== "string" && value.kind === "choice" ? value.value : ""}
        onChange={(event) => onChange({ kind: "choice", value: event.target.value })}>
        <option value="">Wybierz odpowiedź</option>
        {spec.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>{check}
    </div>
  </>;
  if (spec.kind === "list") {
    const values = spec.values.map((_, i) => typeof value !== "string" && value.kind === "list" ? value.values[i] ?? "" : "");
    return <div className="structured-answer">
      <fieldset aria-describedby="answer-help"><legend>{ui.answer}</legend>
        {spec.unordered && <p>Kolejność wpisanych pierwiastków nie ma znaczenia.</p>}
        {values.map((entry, index) => <div className="coefficient-field" key={index}>
          <label htmlFor={index === 0 ? "answer" : `answer-${index}`}>{spec.labels[index]}</label>
          <input id={index === 0 ? "answer" : `answer-${index}`} type="text" inputMode="text" autoComplete="off"
            value={entry} onChange={(event) => onChange({ kind: "list", values: values.map((v, i) => i === index ? event.target.value : v) })} />
        </div>)}
      </fieldset>{check}
    </div>;
  }
  const values = spec.values.map((row, i) => row.map((_, j) =>
    typeof value !== "string" && value.kind === "matrix" ? value.values[i]?.[j] ?? "" : ""));
  return <div className="structured-answer">
    <fieldset aria-describedby="answer-help"><legend>{ui.answer}</legend>
      <table className="matrix-grid"><caption>Macierz odpowiedzi — {values.length} × {values[0].length}</caption>
        <thead><tr><th scope="col">W/K</th>{values[0].map((_, j) => <th scope="col" key={j}>Kol. {j + 1}</th>)}</tr></thead>
        <tbody>{values.map((row, i) => <tr key={i}><th scope="row">W. {i + 1}</th>
          {row.map((entry, j) => <td key={j}><input id={i === 0 && j === 0 ? "answer" : `answer-${i}-${j}`}
            aria-label={`Wiersz ${i + 1}, kolumna ${j + 1}`} type="text" inputMode="text" autoComplete="off" value={entry}
            onChange={(event) => onChange({ kind: "matrix", values: values.map((r, a) => r.map((v, b) => a === i && b === j ? event.target.value : v)) })} /></td>)}
        </tr>)}</tbody>
      </table>
    </fieldset>{check}
  </div>;
}
