import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul,
  divideRational as div, equalRational, type Rational } from "../rational";
import { formatRational as f } from "../answers";
import type { Locale } from "../locales/types";
import type { Difficulty } from "../difficulty";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";
import type { ExactMatrix } from "./linearAlgebraMath";

type Pair = Extract<LinearAlgebraProblem, { kind: "linear-matrix-pair" }>;
const compact = (m: ExactMatrix) => `[${m.map((row) => `[${row.map(f).join(", ")}]`).join("; ")}]`;
const lin = (a: Rational, left: ExactMatrix, b: Rational, right: ExactMatrix) =>
  left.map((row, i) => row.map((value, j) => add(mul(a, value), mul(b, right[i][j]))));

/** Two independent matrix equations with exactly one solution (2×2 X and Y). */
export function createMatrixPair(variant: number, level: Difficulty): Pair {
  const [a,b,c,d] = level === "medium" ? [r(1),r(1),r(1),r(-1)]
    : level === "hard" ? [r(2),r(1),r(-1),r(1)]
    : level === "advanced" ? [r(1),r(-2),r(3),r(1)]
    : [r(2),r(-1),r(1),r(2)];
  const x: ExactMatrix = [
    [r(variant - 11, level === "expert" ? 2 : 1), r(variant % 5 - 2)],
    [r((variant * 3) % 7 - 3), r((variant + 4) % 5 - 2)]
  ];
  const y: ExactMatrix = [
    [r((variant + 2) % 7 - 3), r(variant - 8, level === "expert" ? 2 : 1)],
    [r((variant + 5) % 5 - 2), r((variant * 2) % 7 - 3)]
  ];
  return { kind: "linear-matrix-pair", coefficients: [a,b,c,d],
    first: lin(a,x,b,y), second: lin(c,x,d,y) };
}

export const matrixPairFamilies: readonly UniversityFamily[] = [{
  id: "matrix-coupled-equations", category: "matrices",
  titles: { pl: "Układ dwóch równań macierzowych (X i Y)",
    en: "Two coupled matrix equations (X and Y)" },
  supportedDifficulties: ["medium","hard","advanced","expert"],
  create: createMatrixPair,
}];

export function presentMatrixPair(p: Pair, locale: Locale) {
  const lesson = teaching(locale), {t} = lesson;
  const [a,b,c,d] = p.coefficients;
  const denominator = sub(mul(a,d),mul(b,c));
  if (denominator.numerator === 0n) throw Error("Singular coupled matrix equations");
  const x = p.first.map((row,i) => row.map((v,j) =>
    div(sub(mul(d,v),mul(b,p.second[i][j])),denominator)));
  const y = p.first.map((row,i) => row.map((v,j) =>
    div(sub(mul(a,p.second[i][j]),mul(c,v)),denominator)));
  const eq1 = lin(a,x,b,y), eq2 = lin(c,x,d,y);
  if (!eq1.every((row,i) => row.every((v,j) => equalRational(v,p.first[i][j]))) ||
      !eq2.every((row,i) => row.every((v,j) => equalRational(v,p.second[i][j]))))
    throw Error("Coupled equations do not reconstruct A and B");
  const lhs1 = `(${f(a)})X + (${f(b)})Y = A`;
  const lhs2 = `(${f(c)})X + (${f(d)})Y = B`;
  lesson.work(`${lhs1}; ${lhs2}`,t("Każda z czterech komórek macierzy daje zwykły układ dwóch równań skalarnych.",
    "Each matrix cell forms an ordinary system of two scalar equations."));
  lesson.work(`D = (${f(a)})·(${f(d)}) − (${f(b)})·(${f(c)}) = ${f(denominator)}`,
    t("Sprawdzamy, że wyznacznik układu współczynników jest niezerowy — X i Y są jednoznaczne.",
      "A nonzero coefficient determinant guarantees a unique X and Y."));
  lesson.work(`X = ( (${f(d)})A − (${f(b)})B ) / (${f(denominator)}) = ${compact(x)}`,
    t("Eliminujemy Y i dzielimy każdy element przez niezerowy wyznacznik.",
      "Eliminate Y and divide each entry by the nonzero determinant."));
  lesson.work(`Y = ( (${f(a)})B − (${f(c)})A ) / (${f(denominator)}) = ${compact(y)}`,
    t("Eliminujemy X; zachowujemy kolejność i znaki współczynników.",
      "Eliminate X; preserve the order and signs of the coefficients."));
  lesson.work(`${lhs1}: ${compact(eq1)} = A; ${lhs2}: ${compact(eq2)} = B`,
    t("Podstawienie potwierdza obydwa równania element po elemencie.",
      "Substitution checks both matrix equations entry by entry."));
  const values = [...x.flat(), ...y.flat()];
  const labels = ["X[1,1]","X[1,2]","X[2,1]","X[2,2]",
    "Y[1,1]","Y[1,2]","Y[2,1]","Y[2,2]"];
  return lesson.finish(
    t(`Rozwiąż układ równań macierzowych (2×2): ${lhs1}, ${lhs2}. Dane: A=${compact(p.first)}, B=${compact(p.second)}. Podaj wszystkie elementy X i Y.`,
      `Solve coupled 2×2 matrix equations: ${lhs1}, ${lhs2}. Given A=${compact(p.first)}, B=${compact(p.second)}. Enter every entry of X and Y.`),
    {kind:"list",values,labels},
    t("Zapisz układ dla pojedynczej komórki i wyeliminuj jedną niewiadomą.",
      "Write the two equations for one matrix entry and eliminate one variable."),
    t("D = ad − bc; X=(dA−bB)/D, Y=(aB−cA)/D. Każda komórka osobno.",
      "D=ad−bc; X=(dA−bB)/D, Y=(aB−cA)/D. Solve every cell.")
  );
}
