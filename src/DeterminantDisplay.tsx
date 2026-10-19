import type { SquareDeterminantMatrix } from "./university/schema";
import { formatRational } from "./answers";

/** Read-only determinant matrix; answer input remains one exact scalar. */
export function DeterminantDisplay({
  matrix,
  locale,
}: {
  matrix: SquareDeterminantMatrix;
  locale: "pl" | "en";
}) {
  return (
    <div className="determinant-scroll">
      <table
        className="determinant-display"
        aria-label={
          locale === "pl"
            ? `Macierz A ${matrix.length}×${matrix.length}`
            : `Matrix A ${matrix.length}×${matrix.length}`
        }
      >
        <caption>
          A ({matrix.length}×{matrix.length})
        </caption>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{formatRational(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
