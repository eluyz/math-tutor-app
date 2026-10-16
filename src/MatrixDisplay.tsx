import { formatRational } from "./answers";
import type { Matrix } from "./matrices";

export function MatrixDisplay({ label, values }: { label: string; values: Matrix }) {
  return <table className="given-matrix"><caption>Macierz {label}</caption>
    <thead><tr><th scope="col">W/K</th>{values[0].map((_, j) => <th scope="col" key={j}>Kol. {j + 1}</th>)}</tr></thead>
    <tbody>{values.map((row, i) => <tr key={i}><th scope="row">W. {i + 1}</th>
      {row.map((value, j) => <td key={j}>{formatRational(value)}</td>)}
    </tr>)}</tbody>
  </table>;
}
