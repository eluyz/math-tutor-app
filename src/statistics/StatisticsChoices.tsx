import type { RefObject } from "react";

/** Native radios retain browser arrow/Space behavior and one keyboard tab stop. */
export function StatisticsChoices({ options, value, onChange, answerRef, legend, format, invalid }: {
  options: readonly Readonly<{ id: string; label: string }>[];
  value: string;
  onChange: (value: string) => void;
  answerRef: RefObject<HTMLInputElement | null>;
  legend: string;
  format: string;
  invalid: boolean;
}) {
  return <fieldset className="statistics-choices" role="radiogroup" aria-invalid={invalid} aria-labelledby="statistics-choice-legend"
    aria-describedby="statistics-question statistics-choice-format statistics-feedback">
    <legend id="statistics-choice-legend">{legend}</legend>
    <p id="statistics-choice-format" className="panel-intro">{format}</p>
    <div className="statistics-choice-options">
      {options.map((option,index)=><label key={option.id} className="statistics-choice">
        <input type="radio" name="statistics-choice-answer" value={option.id}
          ref={index===0?answerRef:undefined} checked={value===option.id} autoComplete="off"
          onChange={event=>onChange(event.currentTarget.value)} />
        <span>{option.label}</span>
      </label>)}
    </div>
  </fieldset>;
}
