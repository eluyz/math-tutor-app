import { MatrixDisplay } from "./MatrixDisplay";
import type { LinearAlgebraProblem } from "./university/schema";

/** Read-only matrices are independent of the legacy 1–3 cell answer-grid limit. */
export function LinearAlgebraDisplay({ problem }: { problem: LinearAlgebraProblem }) {
  if (problem.kind === "linear-rank-given" || problem.kind === "linear-chain-five") return null;
  if (problem.kind === "linear-matrix-practice") return (
    <div className="given-matrices linear-algebra-matrices">
      {problem.matrices.map(m => <MatrixDisplay key={m.label} label={m.label} values={m.values} />)}
    </div>
  );
  if (problem.kind === "linear-matrix-equation") return (
    <div className="given-matrices linear-algebra-matrices">
      <MatrixDisplay label="A" values={problem.left} />
      {problem.mode === "axb" && <MatrixDisplay label="B" values={problem.right} />}
      <MatrixDisplay label={problem.mode === "axb" ? "C" : "B"} values={problem.rhs} />
    </div>
  );
  if (problem.kind === "linear-matrix-pair") return (
    <div className="given-matrices linear-algebra-matrices">
      <MatrixDisplay label="A" values={problem.first} />
      <MatrixDisplay label="B" values={problem.second} />
    </div>
  );
  const augmented = problem.kind === "linear-capelli" || problem.kind === "linear-system" || problem.kind === "linear-rectangular" || problem.kind === "linear-cramer-four" || problem.kind === "linear-cramer-minors" || problem.kind === "linear-cramer-diagnostic";
  return (
    <div className="given-matrices linear-algebra-matrices">
      {augmented ? (
        <MatrixDisplay label="[A|b]" values={problem.matrix.map((row, i) => [...row, problem.rhs[i]])} />
      ) : (
        <>
          <MatrixDisplay label="A" values={problem.matrix} />
          {problem.kind === "linear-application" && <MatrixDisplay label="B" values={problem.rhs} />}
        </>
      )}
    </div>
  );
}
