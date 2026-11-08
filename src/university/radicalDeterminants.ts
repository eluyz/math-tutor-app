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
const entryRadicand = (cell: RadicalCoefficient, fallback: RadicalDeterminantProblem["radicand"]) =>
  cell.radicand ?? fallback;
export function radicalDeterminant(p: RadicalDeterminantProblem): RadicalCoefficient {
  if (![2, 3, 5, 7].includes(p.radicand) || p.matrix.length !== 2 ||
    p.matrix.some(row => row.length !== 2 || row.some(cell =>
      !cell || !Number.isSafeInteger(cell.whole) || !Number.isSafeInteger(cell.root) ||
      (cell.radicand !== undefined && ![2, 3, 5, 7].includes(cell.radicand)))))
    throw new Error("Expected an exact bounded radical 2×2 matrix");
  const [[a, b], [c2, d2]] = p.matrix;
  const firstRoot = entryRadicand(a, p.radicand);
  const secondRoot = entryRadicand(b, p.radicand);
  // This bounded source form pairs like radicals in each product. Reject a
  // mixed-radicand product instead of silently losing an irrational term.
  if (firstRoot !== entryRadicand(d2, p.radicand) ||
      secondRoot !== entryRadicand(c2, p.radicand))
    throw new Error("Mixed square roots within one product are unsupported");
  const ad = radicalProduct(a, d2, firstRoot);
  const bc = radicalProduct(b, c2, secondRoot);
  if (firstRoot !== secondRoot && (ad.root !== 0 || bc.root !== 0))
    throw new Error("Uncancelled distinct radicals cannot be reduced to one coefficient");
  return c(ad.whole - bc.whole, firstRoot === secondRoot ? ad.root - bc.root : 0);
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

/** Synthetic source-form extension: two different roots occur in one matrix,
 * but each diagonal product uses matching roots and remains exactly rational.
 * Legacy Q(√d) exercises are generated unchanged. */
export function createMixedRadicalDeterminant(variant: number, difficulty: Difficulty): RadicalDeterminantProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard", "advanced", "expert"].includes(difficulty))
    throw new Error("Unsupported mixed-radical determinant variant or level");
  const tier = difficulty === "hard" ? 1 : difficulty === "advanced" ? 2 : 3;
  const pairs = [[2, 5], [3, 7], [2, 7], [3, 5], [2, 3], [5, 7]] as const;
  let [first, second]: readonly [2 | 3 | 5 | 7, 2 | 3 | 5 | 7] = pairs[(variant + tier) % pairs.length];
  let a = 1 + variant % 5, b = 1 + (variant + tier) % 3;
  let c0 = 2 + Math.floor(variant / 6), t = 1 + (variant + 2 * tier) % 3;
  // One singular case: cancellation is mathematical, not a floating-point artefact.
  if (variant === 0 && tier === 1) {
    first = 2; second = 3; a = 1; b = 1; c0 = 2; t = 1;
  }
  const cell = (whole: number, root: number, radicand: 2 | 3 | 5 | 7): RadicalCoefficient =>
    ({ whole, root, radicand });
  let matrix: RadicalCoefficient[][] = [
    [cell(a, b, first), cell(-c0, t, second)],
    [cell(c0, t, second), cell(a, -b, first)],
  ];
  // Bounded row/column scalings preserve each product's radical pairing.
  if (tier >= 2) {
    const multiple = tier === 2 ? 2 : -2;
    matrix[0] = matrix[0].map(x => cell(multiple * x.whole, multiple * x.root, x.radicand!));
  }
  if (tier === 3) {
    const multiple = variant % 2 ? -1 : 3;
    matrix = matrix.map(row => [cell(multiple * row[0].whole, multiple * row[0].root, row[0].radicand!), row[1]]);
  }
  if (variant % 2 === 1)
    matrix = matrix.map(row => row.map(x => cell(-x.whole, -x.root, x.radicand!)));
  if (variant % 3 === 2)
    matrix = [[matrix[0][0], matrix[1][0]], [matrix[0][1], matrix[1][1]]];
  if (variant % 5 === 4)
    matrix = [[matrix[1][1], matrix[1][0]], [matrix[0][1], matrix[0][0]]];
  const problem: RadicalDeterminantProblem = {
    kind: "determinant-radical-two", radicand: first,
    matrix: [[matrix[0][0], matrix[0][1]], [matrix[1][0], matrix[1][1]]],
  };
  const answer = radicalDeterminant(problem);
  if (answer.root !== 0) throw new Error("Mixed-radical construction must have a rational result");
  return problem;
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
  {
    id: "determinant-radical-mixed-two", category: "determinants",
    titles: {
      pl: "Wyznacznik 2×2 z dwoma różnymi pierwiastkami",
      en: "2×2 determinant with two distinct radicals",
    },
    supportedDifficulties: ["hard", "advanced", "expert"],
    create: createMixedRadicalDeterminant,
  },
];

export function presentRadicalDeterminant(p: RadicalDeterminantProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson, d = p.radicand;
  const [[a, b], [c2, e]] = p.matrix;
  const det = radicalDeterminant(p);
  if (det.root !== 0) throw new Error("Expected a rational determinant result");
  const diagonalRoot = entryRadicand(a, d), otherRoot = entryRadicand(b, d);
  const mixed = diagonalRoot !== otherRoot;
  const ad = radicalProduct(a, e, diagonalRoot), bc = radicalProduct(b, c2, otherRoot);
  const productText = (x: RadicalCoefficient, y: RadicalCoefficient) =>
    "(" + formatRadical(x, entryRadicand(x, d)) + ")(" +
    formatRadical(y, entryRadicand(y, d)) + ")";
  lesson.work(
    "det(A) = a₁₁a₂₂ − a₁₂a₂₁",
    t("Dla macierzy 2×2 mnożymy elementy po przekątnych i odejmujemy. Uważaj na minus przed drugim iloczynem.",
      "For a 2×2 matrix multiply along the diagonals and subtract. Watch the minus sign before the second product."),
  );
  lesson.work(
    "a₁₁a₂₂ = " + productText(a, e) + " = " + formatRadical(ad, diagonalRoot),
    t("Rozwiń oba nawiasy: √d·√d=d. Zbierz oddzielnie wyrazy wymierne i współczynniki przy √d.",
      "Expand both factors: √d·√d=d. Collect rational terms and coefficients of √d separately."),
  );
  lesson.work(
    "a₁₂a₂₁ = " + productText(b, c2) + " = " + formatRadical(bc, otherRoot),
    t("Tak samo oblicz drugi iloczyn. Wyrazy z pierwiastkiem mogą występować również przed odejmowaniem.",
      "Expand the second product the same way. Radical terms may remain until the final subtraction."),
  );
  lesson.work(
    "det(A) = (" + formatRadical(ad, diagonalRoot) + ") − (" + formatRadical(bc, otherRoot) + ") = " + formatRadical(det, d),
    t("Odejmij także współczynniki przy √d: w tych zadaniach zerują się dokładnie, bez przybliżeń dziesiętnych.",
      "Subtract the coefficients of √d as well: here they cancel exactly, without decimal approximations."),
  );
  return lesson.finish(
    t(mixed
      ? "Oblicz dokładnie det(A) macierzy 2×2 z dwoma różnymi pierwiastkami. Odpowiedź jest liczbą wymierną."
      : "Oblicz dokładnie det(A) macierzy 2×2 z pierwiastkami. Odpowiedź jest liczbą wymierną.",
      mixed
      ? "Calculate the exact det(A) of the 2×2 matrix with two distinct radicals. The answer is rational."
      : "Calculate the exact det(A) of the 2×2 radical matrix. The final answer is rational."),
    { kind: "scalar", value: r(det.whole) },
    t("Zastosuj wzór det(A)=ad−bc i najpierw zapisz oba iloczyny w nawiasach.",
      "Use det(A)=ad−bc; first write both products in parentheses."),
    t(mixed
      ? "Wymnóż osobno każdą parę nawiasów: (√p)²=p i (√q)²=q. Dopiero potem odejmij otrzymane liczby."
      : "Wymnóż nawiasy, zamień (√d)² na d i odejmij osobno wyrazy wymierne oraz wyrazy z √d.",
      mixed
      ? "Expand each product separately: (√p)²=p and (√q)²=q, then subtract the two rational results."
      : "Expand, replace (√d)² by d, then subtract rational and radical terms separately."),
  );
}
