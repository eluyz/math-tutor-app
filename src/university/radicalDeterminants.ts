import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import { rational as r } from "../rational";
import { teaching } from "./teaching";
import type { RadicalCoefficient, RadicalDeterminantProblem, UniversityFamily } from "./schema";

const c = (whole: number, root: number): RadicalCoefficient => ({ whole, root });
const plus = (x: RadicalCoefficient, y: RadicalCoefficient): RadicalCoefficient =>
  c(x.whole + y.whole, x.root + y.root);
const timesInt = (x: RadicalCoefficient, n: number): RadicalCoefficient =>
  c(x.whole * n, x.root * n);

/** Exact pair arithmetic in Q(sqrt(d)); no floating point or generic CAS. */
export function radicalProduct(x: RadicalCoefficient, y: RadicalCoefficient, d: number): RadicalCoefficient {
  return c(x.whole * y.whole + d * x.root * y.root,
    x.whole * y.root + x.root * y.whole);
}
export function radicalDeterminant(p: RadicalDeterminantProblem): RadicalCoefficient {
  if (![2, 3, 5, 7].includes(p.radicand) || p.matrix.length !== 2 ||
    p.matrix.some(row => row.length !== 2 || row.some(cell =>
      !cell || !Number.isSafeInteger(cell.whole) || !Number.isSafeInteger(cell.root))))
    throw new Error("Expected an exact bounded radical 2×2 matrix");
  const [[a, b], [c2, d2]] = p.matrix;
  const ad = radicalProduct(a, d2, p.radicand);
  const bc = radicalProduct(b, c2, p.radicand);
  return c(ad.whole - bc.whole, ad.root - bc.root);
}
export function formatRadical(v: RadicalCoefficient, d: number): string {
  const integer = (n: number) => String(n).replace("-", "−");
  if (v.root === 0) return integer(v.whole);
  const rootTerm = (Math.abs(v.root) === 1 ? "" : Math.abs(v.root)) + "√" + d;
  if (v.whole === 0) return (v.root < 0 ? "−" : "") + rootTerm;
  return integer(v.whole) + (v.root < 0 ? " − " : " + ") + rootTerm;
}

export function createRadicalDeterminant(variant: number, difficulty: Difficulty): RadicalDeterminantProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard", "advanced", "expert"].includes(difficulty))
    throw new Error("Unsupported radical determinant variant or level");
  const tier = difficulty === "hard" ? 1 : difficulty === "advanced" ? 2 : 3;
  const radicand = ([2, 3, 5, 7] as const)[(variant + tier) % 4];
  const u = 3 + variant % 8;
  let s = 1 + Math.floor(variant / 8);
  const v = 1 + variant % 3;
  let t = 1 + (variant + 1) % 3;
  // One deliberately singular example teaches that conjugates can cancel to zero.
  if (variant === 0 && tier === 1) { s = u; t = v; }
  const matrix: RadicalCoefficient[][] = [[c(u, v), c(s, t)], [c(s, -t), c(u, -v)]];
  // Row/column additions preserve the determinant, but force cross-product radicals
  // to cancel only when the two expanded products are subtracted.
  if (tier >= 2) {
    const multiple = variant % 2 ? -1 : 2;
    matrix[1] = matrix[1].map((cell, i) => plus(cell, timesInt(matrix[0][i], multiple)));
  }
  if (tier === 3) {
    const multiple = variant % 3 ? 1 : -2;
    for (const row of matrix)
      row[1] = plus(row[1], timesInt(row[0], multiple));
  }
  // Swapping rows changes the sign, including after the preceding additions.
  if (variant % 2) [matrix[0], matrix[1]] = [matrix[1], matrix[0]];
  const p: RadicalDeterminantProblem = {
    kind: "determinant-radical-two", radicand,
    matrix: [[matrix[0][0], matrix[0][1]], [matrix[1][0], matrix[1][1]]],
  };
  const result = radicalDeterminant(p);
  if (result.root !== 0) throw new Error("Construction should have a rational result");
  return p;
}

export const radicalDeterminantFamilies: readonly UniversityFamily[] = [
  {
    id: "determinant-radical-two", category: "determinants",
    titles: {
      pl: "Wyznacznik 2×2 z pierwiastkami",
      en: "2×2 determinant with radicals",
    },
    supportedDifficulties: ["hard", "advanced", "expert"],
    create: createRadicalDeterminant,
  },
];

export function presentRadicalDeterminant(p: RadicalDeterminantProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson, d = p.radicand;
  const [[a, b], [c2, e]] = p.matrix;
  const ad = radicalProduct(a, e, d), bc = radicalProduct(b, c2, d);
  const det = radicalDeterminant(p);
  if (det.root !== 0) throw new Error("Expected a rational determinant result");
  const productText = (x: RadicalCoefficient, y: RadicalCoefficient) =>
    "(" + formatRadical(x, d) + ")(" + formatRadical(y, d) + ")";
  lesson.work(
    "det(A) = a₁₁a₂₂ − a₁₂a₂₁",
    t("Dla macierzy 2×2 mnożymy elementy po przekątnych i odejmujemy. Uważaj na minus przed drugim iloczynem.",
      "For a 2×2 matrix multiply along the diagonals and subtract. Watch the minus sign before the second product."),
  );
  lesson.work(
    "a₁₁a₂₂ = " + productText(a, e) + " = " + formatRadical(ad, d),
    t("Rozwiń oba nawiasy: √d·√d=d. Zbierz oddzielnie wyrazy wymierne i współczynniki przy √d.",
      "Expand both factors: √d·√d=d. Collect rational terms and coefficients of √d separately."),
  );
  lesson.work(
    "a₁₂a₂₁ = " + productText(b, c2) + " = " + formatRadical(bc, d),
    t("Tak samo oblicz drugi iloczyn. Wyrazy z pierwiastkiem mogą występować również przed odejmowaniem.",
      "Expand the second product the same way. Radical terms may remain until the final subtraction."),
  );
  lesson.work(
    "det(A) = (" + formatRadical(ad, d) + ") − (" + formatRadical(bc, d) + ") = " + formatRadical(det, d),
    t("Odejmij także współczynniki przy √d: w tych zadaniach zerują się dokładnie, bez przybliżeń dziesiętnych.",
      "Subtract the coefficients of √d as well: here they cancel exactly, without decimal approximations."),
  );
  return lesson.finish(
    t("Oblicz dokładnie det(A) macierzy 2×2 z pierwiastkami. Odpowiedź jest liczbą wymierną.",
      "Calculate the exact det(A) of the 2×2 radical matrix. The final answer is rational."),
    { kind: "scalar", value: r(det.whole) },
    t("Zastosuj wzór det(A)=ad−bc i najpierw zapisz oba iloczyny w nawiasach.",
      "Use det(A)=ad−bc; first write both products in parentheses."),
    t("Wymnóż nawiasy, zamień (√d)² na d i odejmij osobno wyrazy wymierne oraz wyrazy z √d.",
      "Expand, replace (√d)² by d, then subtract rational and radical terms separately."),
  );
}
