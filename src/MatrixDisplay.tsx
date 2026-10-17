import { useLocale } from "./locales/LocaleProvider";
import { formatRational } from "./answers";
import type { Matrix } from "./matrices";

export function MatrixDisplay({
  label,
  values,
}: {
  label: string;
  values: Matrix;
}) {
  const { copy } = useLocale();
  const c = copy.answers;
  return (
    <table className="given-matrix">
      <caption>
        {c.matrixWord} {label === "wynikowa" ? c.resulting : label}
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
            {row.map((value, j) => (
              <td key={j}>{formatRational(value)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
