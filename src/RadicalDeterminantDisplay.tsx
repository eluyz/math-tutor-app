import type { RadicalDeterminantProblem } from "./university/schema";
import { formatRadical } from "./university/radicalDeterminants";

/** Exact radical expressions are displayed as a real two-by-two matrix.
 * Existing rational determinant and input components remain unchanged. */
export function RadicalDeterminantDisplay({
  problem, locale,
}: {
  problem: RadicalDeterminantProblem;
  locale: "pl" | "en";
}) {
  return (
    <div className="determinant-scroll">
      <table
        className="determinant-display determinant-radical"
        aria-label={locale === "pl" ? "Macierz A 2×2 z pierwiastkami" : "Matrix A 2×2 with radicals"}
      >
        <caption>A (2×2)</caption>
        <tbody>
          {problem.matrix.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  data-whole={cell.whole}
                  data-root={cell.root}
                  data-radicand={problem.radicand}
                >
                  {formatRadical(cell, problem.radicand)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
