import {
  rational as r, addRational as add, subtractRational as sub,
  equalRational as equal, type Rational,
} from "../rational";
import { formatRational as fmt } from "../answers";
import { multiplyMatrices, subtractMatrices, type Matrix } from "../matrices";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";

export type MatrixCommutatorPractice = Extract<LinearAlgebraProblem, {kind:"linear-matrix-practice"}>;
const matrixText = (a: Matrix): string =>
  "[" + a.map(row => "[" + row.map(fmt).join(", ") + "]").join("; ") + "]";
const same = (a: Matrix, b: Matrix) =>
  a.length === b.length && a.every((row,i) =>
    row.length === b[i]?.length && row.every((v,j)=>equal(v,b[i][j])));

/** P03/3 source-method shape only; original university coefficients are private.
 * This new family does not modify any historical matrix-practice task.
 * Noncommutativity witness: (AB-BA)[0][2]=A[0][0]-A[2][2] != 0.
 */
export function createMatrixCommutatorThree(variant: number, level: Difficulty): MatrixCommutatorPractice {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard","advanced","expert"].includes(level))
    throw new Error("M04 commutator expects variant 0..23 and hard/advanced/expert");
  const tier = level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const first = r(variant + 3, tier >= 2 ? 2 : 1);
  const last = add(first, r(2 + tier));
  const A: Matrix = [
    [first, r(variant % 7 - 3), r(0)],
    [r(variant + 1, tier === 3 ? 2 : 1), r(2 + variant % 6), r(0)],
    [r(2 * variant % 9 - 4), r(3 * variant % 11 - 5), last],
  ];
  const B: Matrix = [
    [r((variant + 2) % 7 - 3), r(variant % 5 + 1), r(1)],
    [r(variant % 4 + 1), r(variant % 9 - 4), r(0)],
    [r(variant % 6 - 2), r((variant + 3) % 7 - 3), r(variant % 5 + 1)],
  ];
  const ab = multiplyMatrices(A,B), ba = multiplyMatrices(B,A);
  if (same(ab,ba) || !equal(sub(ab[0][2],ba[0][2]),sub(first,last)))
    throw new Error("M04 must generate noncommuting 3x3 matrices");
  return {kind:"linear-matrix-practice",mode:"composite",expression:"AB−BA",
    matrices:[{label:"A",values:A},{label:"B",values:B}]};
}
export const matrixCommutatorThreeFamilies: readonly UniversityFamily[] = [{
  id:"matrix-commutator-three",category:"matrices",
  titles:{pl:"Komutator macierzy 3×3: AB−BA",en:"3×3 matrix commutator: AB−BA"},
  supportedDifficulties:["hard","advanced","expert"],
  create:createMatrixCommutatorThree,
}];

export function presentMatrixCommutatorThree(p: MatrixCommutatorPractice, locale: Locale) {
  if (p.expression !== "AB−BA" || p.matrices.length !== 2)
    throw new Error("Expected two matrices for AB−BA");
  const A = p.matrices[0].values, B = p.matrices[1].values;
  if (A.length !== 3 || B.length !== 3 ||
      A.some(row=>row.length!==3) || B.some(row=>row.length!==3))
    throw new Error("M04 commutator must use 3x3 matrices");
  const ab = multiplyMatrices(A,B), ba = multiplyMatrices(B,A);
  const result = subtractMatrices(ab,ba);
  if (same(ab,ba)) throw new Error("M04 commutator example must be nonzero");
  const lesson=teaching(locale), {t}=lesson;
  lesson.work("AB: (AB)ᵢⱼ=∑ₖ aᵢₖbₖⱼ",
    t("Mnożymy wiersze A przez kolumny B, zachowując kolejność czynników.",
      "Multiply rows of A by columns of B, keeping the factor order."));
  lesson.work("AB="+matrixText(ab),
    t("Obliczamy dokładnie dziewięć iloczynów skalarnych.",
      "Compute all nine row-by-column dot products exactly."));
  lesson.work("BA="+matrixText(ba),
    t("Ponownie mnożymy, tym razem wiersze B przez kolumny A; BA zwykle różni się od AB.",
      "Multiply again, now rows of B by columns of A; BA generally differs from AB."));
  lesson.work("AB−BA="+matrixText(result),
    t("Odejmujemy odpowiadające sobie elementy AB i BA; sprawdzamy wszystkie znaki.",
      "Subtract corresponding entries of AB and BA, checking every sign."));
  lesson.work("AB≠BA ⇒ AB−BA≠0",
    t("Nie wolno zamieniać kolejności mnożenia macierzy. Nie zastępuj AB−BA zerem.",
      "Matrix multiplication is not commutative. Do not replace AB−BA by zero."));
  return lesson.finish(
    t("Oblicz AB−BA dla macierzy 3×3: A="+matrixText(A)+", B="+matrixText(B)+". Podaj pełną macierz wynikową.",
      "Compute AB−BA for 3×3 matrices: A="+matrixText(A)+", B="+matrixText(B)+". Enter the entire resulting matrix."),
    {kind:"matrix",values:result},
    t("Zacznij od AB, wykonując iloczyny wiersz razy kolumna.",
      "First calculate AB using row-by-column products."),
    t("Następnie policz BA osobno i odejmij: AB−BA. Nie zakładaj, że AB=BA.",
      "Then compute BA separately and subtract: AB−BA. Do not assume AB=BA."));
}
