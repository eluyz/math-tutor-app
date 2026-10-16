import { describe, expect, it } from "vitest";
import { rational as r } from "./rational";
import { addMatrices, subtractMatrices, scaleMatrix, transposeMatrix, multiplyMatrices, determinant, matrixShape, sarrusProducts } from "./matrices";

const matrix = (rows: number[][]) => rows.map((row) => row.map((v) => r(v)));
// Independent first-row Laplace expansion, not Sarrus.
export function laplace(a: number[][]): number {
  if (a.length === 2) return a[0][0] * a[1][1] - a[0][1] * a[1][0];
  return a[0].reduce((sum, value, j) => sum + (j % 2 ? -1 : 1) * value *
    laplace(a.slice(1).map((row) => row.filter((_, k) => k !== j))), 0);
}

describe("dokładna arytmetyka małych macierzy", () => {
  const a = matrix([[1, -2], [0, 3]]), b = matrix([[4, 2], [-1, 0]]);
  it("dodaje, odejmuje i skaluje bez zmieniania wejścia", () => {
    expect(addMatrices(a, b)).toEqual(matrix([[5, 0], [-1, 3]]));
    expect(subtractMatrices(a, b)).toEqual(matrix([[-3, -4], [1, 3]]));
    expect(scaleMatrix(a, r(-1, 2))).toEqual([[r(-1, 2), r(1)], [r(0), r(-3, 2)]]);
    expect(a).toEqual(matrix([[1, -2], [0, 3]]));
  });
  it("transponuje macierz prostokątną 2×3 i odwraca transpozycję", () => {
    const rectangular = matrix([[1, 2, 3], [4, 5, 6]]);
    expect(transposeMatrix(rectangular)).toEqual(matrix([[1, 4], [2, 5], [3, 6]]));
    expect(transposeMatrix(transposeMatrix(rectangular))).toEqual(rectangular);
  });
  it("mnoży macierze prostokątne: wiersz przez kolumnę", () => {
    expect(multiplyMatrices(matrix([[1, 2, 3], [4, 5, 6]]), matrix([[7, 8], [9, 10], [11, 12]])))
      .toEqual(matrix([[58, 64], [139, 154]]));
    expect(multiplyMatrices([[r(1, 2), r(-1, 3)]], [[r(2)], [r(3)]] )).toEqual([[r(0)]]);
    expect(multiplyMatrices(a, b)).not.toEqual(multiplyMatrices(b, a));
  });
  it("odrzuca niewykonalne operacje i niepoprawne wymiary", () => {
    const bad = [[], [[]], matrix([[1], [2, 3]]), matrix([[1, 2, 3, 4]]), matrix([[1], [2], [3], [4]])];
    for (const value of bad) expect(() => matrixShape(value)).toThrow();
    expect(() => matrixShape([[{ numerator: 1n, denominator: 0n }]])).toThrow();
    expect(() => addMatrices(a, matrix([[1, 2]]))).toThrow();
    expect(() => subtractMatrices(a, matrix([[1], [2]]))).toThrow();
    expect(() => multiplyMatrices(a, matrix([[1, 2, 3]]))).toThrow();
    expect(() => determinant(matrix([[1, 2, 3], [4, 5, 6]]))).toThrow();
    expect(() => determinant(matrix([[1]]))).toThrow();
    expect(() => sarrusProducts(a)).toThrow();
  });
  it("wyznacznik 2×2 uwzględnia minusy, zera i dokładne ułamki", () => {
    expect(determinant(a)).toEqual(r(3));
    expect(determinant(matrix([[0, -2], [-3, 0]]))).toEqual(r(-6));
    expect(determinant([[r(1, 2), r(1, 3)], [r(2, 3), r(3, 4)]])).toEqual(r(11, 72));
  });
  it.each(Array.from({ length: 60 }, (_, index) => index))("Sarrus = niezależny Laplace dla wariantu %i", (seed) => {
    const a = Array.from({ length: 3 }, (_, i) => Array.from({ length: 3 }, (_, j) => ((seed + i * 7 + j * j * 3) % 11) - 5));
    expect(determinant(matrix(a))).toEqual(r(laplace(a)));
  });
  it("Sarrus ma sześć iloczynów, a wyznacznik może być dodatni, ujemny lub zerowy", () => {
    const a = [[1, 2, 3], [0, 1, 4], [5, 6, 0]];
    expect(determinant(matrix(a))).toEqual(r(1));
    expect(determinant(matrix([a[1], a[0], a[2]]))).toEqual(r(-1));
    expect(determinant(matrix([a[0], a[0], a[2]]))).toEqual(r(0));
    expect(sarrusProducts(matrix(a))).toEqual({ positive: [r(0), r(40), r(0)], negative: [r(15), r(24), r(0)] });
  });
});
