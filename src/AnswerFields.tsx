import { limitKinds, type AnswerInput, type AnswerSpec } from "./answers";
import { useLocale } from "./locales/LocaleProvider";

type Props = {
  spec: AnswerSpec;
  value: AnswerInput;
  onChange: (value: AnswerInput) => void;
  fractionInput?: boolean;
};

export function AnswerFields({ spec, value, onChange, fractionInput }: Props) {
  const { copy } = useLocale();
  const ui = copy.ui,
    c = copy.answers;
  const check = (
    <button type="submit" className="check-button">
      {ui.check} <span aria-hidden="true">→</span>
    </button>
  );
  if (spec.kind === "limit") {
    const input =
      typeof value !== "string" && value.kind === "limit"
        ? value
        : { classification: "", value: "" };
    return (
      <div className="structured-answer">
        <fieldset aria-describedby="answer-help">
          <legend>{ui.answer}</legend>
          <label htmlFor="answer">{c.limit.classification}</label>
          <select
            id="answer"
            value={input.classification}
            onChange={(event) =>
              onChange({
                kind: "limit",
                classification: event.target.value,
                value: "",
              })
            }
          >
            <option value="">{c.choose}</option>
            {limitKinds.map((kind) => (
              <option key={kind} value={kind}>
                {c.limit[kind]}
              </option>
            ))}
          </select>
          {input.classification === "finite" && (
            <div className="coefficient-field">
              <label htmlFor="limit-value">{c.limit.value}</label>
              <input
                id="limit-value"
                type="text"
                inputMode="text"
                autoComplete="off"
                value={input.value}
                onChange={(event) =>
                  onChange({
                    kind: "limit",
                    classification: "finite",
                    value: event.target.value,
                  })
                }
              />
            </div>
          )}
        </fieldset>
        {check}
      </div>
    );
  }
  if (spec.kind === "roots") {
    const labels = spec.context === "zeros" ? c.zeros : c;
    const input =
      typeof value !== "string" && value.kind === "roots"
        ? value
        : { classification: "", values: [] as string[] };
    return (
      <div className="structured-answer">
        <fieldset aria-describedby="answer-help">
          <legend>{ui.answer}</legend>
          <label htmlFor="answer">
            {spec.context === "zeros" ? c.zeros.count : c.roots}
          </label>
          <select
            id="answer"
            value={input.classification}
            onChange={(event) => {
              const classification = event.target.value;
              onChange({
                kind: "roots",
                classification,
                values: Array(
                  classification === "two"
                    ? 2
                    : classification === "double"
                      ? 1
                      : 0,
                ).fill(""),
              });
            }}
          >
            <option value="">{c.choose}</option>
            <option value="two">{labels.two}</option>
            <option value="double">{labels.double}</option>
            <option value="none">{labels.none}</option>
          </select>
          {input.values.length > 0 && <p>{labels.order}</p>}
          {input.values.map((entry, i) => (
            <div className="coefficient-field" key={i}>
              <label htmlFor={`root-${i}`}>{labels.root(i + 1)}</label>
              <input
                id={`root-${i}`}
                type="text"
                autoComplete="off"
                value={entry}
                onChange={(event) =>
                  onChange({
                    kind: "roots",
                    classification: input.classification,
                    values: input.values.map((v, j) =>
                      i === j ? event.target.value : v,
                    ),
                  })
                }
              />
            </div>
          ))}
        </fieldset>
        {check}
      </div>
    );
  }
  if (spec.kind === "scalar")
    return (
      <>
        <label htmlFor="answer">{ui.answer}</label>
        <div className="answer-row">
          <input
            id="answer"
            type="text"
            inputMode={fractionInput ? "text" : "decimal"}
            autoComplete="off"
            aria-describedby="answer-help"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder={ui.answerPlaceholder}
          />
          {check}
        </div>
      </>
    );
  if (spec.kind === "choice")
    return (
      <>
        <label htmlFor="answer">{ui.answer}</label>
        <div className="answer-row">
          <select
            id="answer"
            aria-describedby="answer-help"
            value={
              typeof value !== "string" && value.kind === "choice"
                ? value.value
                : ""
            }
            onChange={(event) =>
              onChange({ kind: "choice", value: event.target.value })
            }
          >
            <option value="">{c.choose}</option>
            {spec.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {check}
        </div>
      </>
    );
  if (spec.kind === "list") {
    const values = spec.values.map((_, i) =>
      typeof value !== "string" && value.kind === "list"
        ? (value.values[i] ?? "")
        : "",
    );
    return (
      <div className="structured-answer">
        <fieldset aria-describedby="answer-help">
          <legend>{ui.answer}</legend>
          {spec.unordered && <p>{c.order}</p>}
          {values.map((entry, index) => (
            <div className="coefficient-field" key={index}>
              <label htmlFor={index === 0 ? "answer" : `answer-${index}`}>
                {spec.labels[index]}
              </label>
              <input
                id={index === 0 ? "answer" : `answer-${index}`}
                type="text"
                inputMode="text"
                autoComplete="off"
                value={entry}
                onChange={(event) =>
                  onChange({
                    kind: "list",
                    values: values.map((v, i) =>
                      i === index ? event.target.value : v,
                    ),
                  })
                }
              />
            </div>
          ))}
        </fieldset>
        {check}
      </div>
    );
  }
  const values = spec.values.map((row, i) =>
    row.map((_, j) =>
      typeof value !== "string" && value.kind === "matrix"
        ? (value.values[i]?.[j] ?? "")
        : "",
    ),
  );
  return (
    <div className="structured-answer">
      <fieldset aria-describedby="answer-help">
        <legend>{ui.answer}</legend>
        <table className="matrix-grid">
          <caption>
            {c.matrix} — {values.length} × {values[0].length}
          </caption>
          <thead>
            <tr>
              <th scope="col">{c.axes}</th>
              {values[0].map((_, j) => (
                <th scope="col" key={j}>
                  {c.column} {j + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {values.map((row, i) => (
              <tr key={i}>
                <th scope="row">
                  {c.row} {i + 1}
                </th>
                {row.map((entry, j) => (
                  <td key={j}>
                    <input
                      id={i === 0 && j === 0 ? "answer" : `answer-${i}-${j}`}
                      aria-label={c.rowColumn(i + 1, j + 1)}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      value={entry}
                      onChange={(event) =>
                        onChange({
                          kind: "matrix",
                          values: values.map((r, a) =>
                            r.map((v, b) =>
                              a === i && b === j ? event.target.value : v,
                            ),
                          ),
                        })
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>
      {check}
    </div>
  );
}
