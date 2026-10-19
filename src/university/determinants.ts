import {
  rational as r,
  addRational as add,
  subtractRational as sub,
  multiplyRational as mul,
  divideRational as div,
  type Rational,
} from "../rational";
import { formatRational as f } from "../answers";
import type { Locale } from "../locales/types";
import { difficulties, type Difficulty } from "../difficulty";
import { calculate } from "./teaching";
import { teaching } from "./teaching";
import type {
  DeterminantProblem,
  DeterminantRowOperation as RowOp,
  SquareDeterminantMatrix as Square,
  UniversityFamily,
} from "./schema";

const zero = (value: Rational) => value.numerator === 0n;
const z = () => r(0);
/** Reject malformed matrices before computing minors; this never changes matrixShape. */
export function validDeterminantMatrix(matrix: Square): number {
  const n = matrix?.length;
  if (
    !Number.isInteger(n) ||
    n < 2 ||
    n > 5 ||
    matrix.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== n ||
        row.some(
          (cell) =>
            !cell ||
            typeof cell.numerator !== "bigint" ||
            typeof cell.denominator !== "bigint" ||
            cell.denominator <= 0n,
        ),
    )
  )
    throw new Error(
      "Expected a square 2×2 through 5×5 rational determinant matrix",
    );
  return n;
}
export function minor(matrix: Square, row: number, column: number): Square {
  const n = validDeterminantMatrix(matrix);
  if (
    !Number.isInteger(row) ||
    !Number.isInteger(column) ||
    row < 0 ||
    column < 0 ||
    row >= n ||
    column >= n
  )
    throw new Error("Invalid minor index");
  return matrix
    .filter((_, i) => i !== row)
    .map((line) => line.filter((_, j) => j !== column));
}
/** Production reference for the displayed Laplace steps, with Sarrus only at size 3. */
export function exactDeterminant(matrix: Square): Rational {
  const n = validDeterminantMatrix(matrix);
  if (n === 2)
    return sub(
      mul(matrix[0][0], matrix[1][1]),
      mul(matrix[0][1], matrix[1][0]),
    );
  if (n === 3) {
    const products = [
      mul(mul(matrix[0][0], matrix[1][1]), matrix[2][2]),
      mul(mul(matrix[0][1], matrix[1][2]), matrix[2][0]),
      mul(mul(matrix[0][2], matrix[1][0]), matrix[2][1]),
      mul(mul(matrix[0][2], matrix[1][1]), matrix[2][0]),
      mul(mul(matrix[0][0], matrix[1][2]), matrix[2][1]),
      mul(mul(matrix[0][1], matrix[1][0]), matrix[2][2]),
    ];
    return sub(
      products.slice(0, 3).reduce(add, z()),
      products.slice(3).reduce(add, z()),
    );
  }
  const axis = sparseAxis(matrix);
  return Array.from({ length: n }, (_, index) =>
    axis.axis === "row"
      ? { row: axis.index, column: index }
      : { row: index, column: axis.index },
  )
    .filter(({ row, column }) => !zero(matrix[row][column]))
    .map(({ row, column }) =>
      mul(
        mul(r((row + column) % 2 ? -1 : 1), matrix[row][column]),
        exactDeterminant(minor(matrix, row, column)),
      ),
    )
    .reduce(add, z());
}
function sparseAxis(matrix: Square): { axis: "row" | "column"; index: number } {
  const n = matrix.length;
  let best = { axis: "row" as "row" | "column", index: 0, count: n + 1 };
  for (const axis of ["row", "column"] as const)
    for (let index = 0; index < n; index++) {
      const count = Array.from({ length: n }, (_, j) =>
        axis === "row" ? matrix[index][j] : matrix[j][index],
      ).filter((v) => !zero(v)).length;
      if (count < best.count) best = { axis, index, count };
    }
  return best;
}
export function applyDeterminantRowOperation(
  matrix: Square,
  operation: RowOp,
): Square {
  const n = validDeterminantMatrix(matrix);
  const output = matrix.map((row) => [...row]);
  const index = (i: number) => {
    if (!Number.isInteger(i) || i < 0 || i >= n)
      throw new Error("Invalid row index");
  };
  if (operation.kind === "swap") {
    index(operation.first);
    index(operation.second);
    if (operation.first === operation.second)
      throw new Error("Rows must differ");
    [output[operation.first], output[operation.second]] = [
      output[operation.second],
      output[operation.first],
    ];
  } else if (operation.kind === "scale") {
    index(operation.row);
    if (zero(operation.factor)) throw new Error("Cannot undo scaling by zero");
    output[operation.row] = output[operation.row].map((v) =>
      mul(v, operation.factor),
    );
  } else {
    index(operation.target);
    index(operation.source);
    if (operation.target === operation.source)
      throw new Error("Rows must differ");
    output[operation.target] = output[operation.target].map((v, j) =>
      add(v, mul(operation.multiple, output[operation.source][j])),
    );
  }
  return output;
}
function inverse(operation: RowOp): RowOp {
  if (operation.kind === "swap") return operation;
  if (operation.kind === "scale")
    return { ...operation, factor: div(r(1), operation.factor) };
  return { ...operation, multiple: sub(z(), operation.multiple) };
}
function transformed(
  base: Square,
  forward: readonly RowOp[],
  method: DeterminantProblem["method"],
): DeterminantProblem {
  const matrix = forward.reduce(applyDeterminantRowOperation, base);
  return {
    kind: "determinant",
    method,
    matrix,
    reductions: [...forward].reverse().map(inverse),
  };
}
function baseFour(v: number): Square {
  const d = [
    r((v % 5) - 2 || 3),
    r((v % 3) + 1, v % 4 === 0 ? 2 : 1),
    r(v % 2 ? -2 : 2),
    r((v % 4) + 1),
  ];
  return [
    [d[0], r(v - 11), r((v % 7) - 3), r(v % 2 ? -1 : 2)],
    [z(), d[1], r((v % 5) - 2), r(1)],
    [z(), z(), d[2], r((v % 3) - 1)],
    [z(), z(), z(), d[3]],
  ];
}
function laplaceFour(v: number, level: Difficulty): DeterminantProblem {
  const count = level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const first = [
    r((v % 5) + 1),
    ...(count >= 2 ? [r(v % 2 ? -2 : 3)] : [z()]),
    ...(count >= 3 ? [r(v % 3 ? -1 : 2)] : [z()]),
    z(),
  ];
  // Keep all other rows dense so Expert cannot bypass its three cofactors
  // by choosing a still sparser row/column.
  const matrix: Square = [
    first,
    [
      r((v % 4) + 1),
      r((v % 3) + 1, v % 4 === 0 ? 2 : 1),
      r((v % 5) - 2 || -3),
      r(-1),
    ],
    [r(v % 2 ? -2 : 2), r((v % 3) + 1), r(v % 2 ? -2 : 2), r((v % 5) - 2 || 3)],
    [r((v % 6) + 1), r((v % 7) - 3 || -2), r((v % 4) + 1), r((v % 5) + 1)],
  ];
  return { kind: "determinant", method: "laplace-four", matrix };
}
function laplaceFive(v: number, level: Difficulty): DeterminantProblem {
  const four = laplaceFour(
    v,
    level === "expert" ? "expert" : "advanced",
  ).matrix;
  const pivot = (v % 4) + 1;
  const five: Square = [
    [r(v % 2 ? -2 : 3), ...Array.from({ length: 4 }, z)],
    ...four.map((row, i) => [r(((v + i) % 5) - 2), ...row]),
  ];
  // Odd variants expand along the first column. Its other entries must be zero.
  if (v % 2)
    return {
      kind: "determinant",
      method: "laplace-five",
      matrix: five.map((_, i) => five.map((row) => row[i])),
    };
  // Vary a harmless entry outside the selected 4×4 minor for distinct examples.
  return {
    kind: "determinant",
    method: "laplace-five",
    matrix: five.map((row, i) =>
      i ? [r(pivot + i - 1), ...row.slice(1)] : row,
    ),
  };
}
function rowOperations(v: number, level: Difficulty): DeterminantProblem {
  const forward: RowOp[] = [
    { kind: "add", target: 3, source: 0, multiple: r(v % 2 ? -1 : 1) },
    { kind: "add", target: 2, source: 3, multiple: r(1) },
    { kind: "add", target: 1, source: 2, multiple: r(1) },
    { kind: "swap", first: 0, second: 3 },
  ];
  if (level === "expert")
    forward.push(
      { kind: "add", target: 0, source: 1, multiple: r(1) },
      { kind: "scale", row: 0, factor: r(v % 2 ? -2 : 2) },
    );
  return transformed(baseFour(v), forward, "row-operations");
}
function properties(v: number, level: Difficulty): DeterminantProblem {
  const base = baseFour(v);
  if (level === "medium") {
    const matrix = base.map((row) => [...row]);
    matrix[2] = matrix[0].map((x) => mul(x, r(v % 2 ? -2 : 2)));
    return {
      kind: "determinant",
      method: "properties",
      matrix,
      dependentRows: [0, 2],
    };
  }
  const forward: RowOp[] = [
    { kind: "add", target: 2, source: 0, multiple: r(v % 2 ? -1 : 2) },
  ];
  if (level === "advanced" || level === "expert")
    forward.push({ kind: "swap", first: 1, second: 3 });
  if (level === "expert")
    forward.push({ kind: "scale", row: 0, factor: r(v % 2 ? -2 : 3) });
  return transformed(base, forward, "properties");
}
export const determinantFamilies: readonly UniversityFamily[] = [
  {
    id: "determinant-laplace-four",
    category: "determinants",
    titles: {
      pl: "Laplace 4×4 z zerami",
      en: "4×4 Laplace expansion with zeros",
    },
    supportedDifficulties: ["hard", "advanced", "expert"],
    create: laplaceFour,
  },
  {
    id: "determinant-row-operations",
    category: "determinants",
    titles: {
      pl: "Wyznacznik 4×4: operacje wierszowe",
      en: "4×4 determinant: row operations",
    },
    supportedDifficulties: ["advanced", "expert"],
    create: rowOperations,
  },
  {
    id: "determinant-laplace-five",
    category: "determinants",
    titles: {
      pl: "Laplace 5×5 i minory 4×4",
      en: "5×5 Laplace and 4×4 minors",
    },
    supportedDifficulties: ["advanced", "expert"],
    create: laplaceFive,
  },
  {
    id: "determinant-properties",
    category: "determinants",
    titles: {
      pl: "Własności wyznacznika 4×4",
      en: "4×4 determinant properties",
    },
    supportedDifficulties: difficulties.filter((level) => level !== "easy"),
    create: properties,
  },
];

const compact = (matrix: Square) =>
  matrix.map((row) => `[${row.map(f).join(", ")}]`).join("; ");
function sarrusWorking(
  matrix: Square,
  lesson: ReturnType<typeof teaching>,
): Rational {
  const result = exactDeterminant(matrix);
  const term = (a: number, b: number, c: number) =>
    mul(mul(matrix[0][a], matrix[1][b]), matrix[2][c]);
  const positive = [term(0, 1, 2), term(1, 2, 0), term(2, 0, 1)];
  const negative = [term(2, 1, 0), term(0, 2, 1), term(1, 0, 2)];
  lesson.work(
    `3×3 ${compact(matrix)}: (${positive.map(f).join(" + ")}) − (${negative.map(f).join(" + ")}) = ${f(result)}`,
    lesson.t(
      "Sarrus dotyczy wyłącznie tego minora 3×3: trzy przekątne dodatnie minus trzy ujemne.",
      "Sarrus applies only to this 3×3 minor: three positive diagonal products minus three negative ones.",
    ),
    calculate(
      "difference",
      positive.reduce(add, z()),
      negative.reduce(add, z()),
    ),
  );
  return result;
}
function laplaceWorking(
  matrix: Square,
  lesson: ReturnType<typeof teaching>,
): Rational {
  if (matrix.length === 3) return sarrusWorking(matrix, lesson);
  const axis = sparseAxis(matrix),
    n = matrix.length;
  lesson.work(
    `${n}×${n}: ${lesson.t(axis.axis === "row" ? `wiersz ${axis.index + 1}` : `kolumna ${axis.index + 1}`, axis.axis === "row" ? `row ${axis.index + 1}` : `column ${axis.index + 1}`)}; ${compact(matrix)}`,
    lesson.t(
      "Wybieramy wiersz lub kolumnę z najmniejszą liczbą niezerowych elementów. Dowolny wiersz lub kolumna da ten sam wynik.",
      "Choose a row or column with the fewest nonzero entries. Any row or column gives the same determinant.",
    ),
  );
  const terms: Rational[] = [];
  for (let index = 0; index < n; index++) {
    const row = axis.axis === "row" ? axis.index : index;
    const column = axis.axis === "row" ? index : axis.index;
    const value = matrix[row][column];
    if (zero(value)) continue;
    const submatrix = minor(matrix, row, column);
    lesson.work(
      `a${row + 1}${column + 1} = ${f(value)}; M${row + 1}${column + 1} = ${compact(submatrix)}; (−1)^(${row + 1}+${column + 1}) = ${(row + column) % 2 ? "−1" : "+1"}`,
      lesson.t(
        "Usuwamy wskazany wiersz i kolumnę. Znak dopełnienia zależy od sumy ich numerów.",
        "Delete that row and column. The cofactor sign depends on the sum of their one-based indices.",
      ),
    );
    const subdet = laplaceWorking(submatrix, lesson);
    const term = calculate(
      "product",
      r((row + column) % 2 ? -1 : 1),
      value,
      subdet,
    );
    lesson.work(
      `C${row + 1}${column + 1}: ${(row + column) % 2 ? "−" : "+"}(${f(value)})·(${f(subdet)}) = ${f(term.result)}`,
      lesson.t(
        "Mnożymy element przez znak dopełnienia i wyznacznik minora.",
        "Multiply the entry by the cofactor sign and the minor determinant.",
      ),
      term,
    );
    terms.push(term.result);
  }
  const result = terms.reduce(add, z());
  lesson.work(
    `det = ${terms.map((value) => `(${f(value)})`).join(" + ") || "0"} = ${f(result)}`,
    lesson.t(
      "Dodajemy dokładnie wszystkie niezerowe wyrazy rozwinięcia Laplace'a.",
      "Add all nonzero terms of the Laplace expansion exactly.",
    ),
    ...(terms.length > 1 ? [calculate("sum", ...terms)] : []),
  );
  return result;
}
function rowWorking(
  p: DeterminantProblem,
  lesson: ReturnType<typeof teaching>,
): Rational {
  let matrix = p.matrix;
  let factor = r(1);
  for (const op of p.reductions ?? []) {
    matrix = applyDeterminantRowOperation(matrix, op);
    if (op.kind === "swap") factor = mul(factor, r(-1));
    if (op.kind === "scale") factor = div(factor, op.factor);
    const action =
      op.kind === "swap"
        ? `R${op.first + 1} ↔ R${op.second + 1}`
        : op.kind === "scale"
          ? `R${op.row + 1} ← (${f(op.factor)})R${op.row + 1}`
          : `R${op.target + 1} ← R${op.target + 1} + (${f(op.multiple)})R${op.source + 1}`;
    lesson.work(
      `${action}: ${compact(matrix)}; det(A) = (${f(factor)}) det(${lesson.t("bieżącej", "current")})`,
      op.kind === "swap"
        ? lesson.t(
            "Zamiana dwóch wierszy zmienia znak wyznacznika.",
            "Swapping two rows reverses the determinant sign.",
          )
        : op.kind === "scale"
          ? lesson.t(
              "Mnożenie wiersza przez k mnoży wyznacznik przez k; w rachunku wstecznym dzielimy przez k.",
              "Scaling a row by k scales its determinant by k; divide by k when tracing back.",
            )
          : lesson.t(
              "Dodanie wielokrotności innego wiersza nie zmienia wyznacznika.",
              "Adding a multiple of another row does not change the determinant.",
            ),
    );
  }
  for (let i = 0; i < matrix.length; i++)
    for (let j = 0; j < i; j++)
      if (!zero(matrix[i][j]))
        throw new Error("Reduction did not reach upper triangular form");
  const diagonal = matrix.map((row, i) => row[i]);
  const triangular = diagonal.reduce(mul, r(1));
  lesson.work(
    `det(${lesson.t("trójkątnej", "triangular")}) = ${diagonal.map((v) => `(${f(v)})`).join("·")} = ${f(triangular)}`,
    lesson.t(
      "Wyznacznik macierzy trójkątnej jest iloczynem elementów przekątnej.",
      "The determinant of a triangular matrix is the product of its diagonal entries.",
    ),
    calculate("product", ...diagonal),
  );
  const answer = mul(factor, triangular);
  lesson.work(
    `det(A) = (${f(factor)})·(${f(triangular)}) = ${f(answer)}`,
    lesson.t(
      "Uwzględniamy wszystkie zmiany znaku i czynnika z operacji wierszowych.",
      "Apply every sign and scale adjustment from the row operations.",
    ),
    calculate("product", factor, triangular),
  );
  return answer;
}
export function presentDeterminant(p: DeterminantProblem, locale: Locale) {
  const n = validDeterminantMatrix(p.matrix),
    lesson = teaching(locale),
    { t } = lesson;
  if (
    (p.method === "laplace-five") !== (n === 5) ||
    (p.method !== "laplace-five" && n !== 4)
  )
    throw new Error("Determinant family has wrong size");
  const question = `${t("Oblicz dokładnie det(A) dla macierzy A poniżej.", "Calculate the exact det(A) for matrix A below.")} ${p.method === "laplace-five" ? t("Rozwiń 5×5 do minorów 4×4 i 3×3.", "Expand 5×5 into 4×4 and 3×3 minors.") : p.method === "laplace-four" ? t("Wykorzystaj zera i rozwinięcie Laplace'a.", "Use the zeros and Laplace expansion.") : t("Użyj odpowiednich własności wyznacznika i operacji wierszowych.", "Use determinant properties and row operations.")}`;
  let value: Rational;
  if (p.dependentRows) {
    const [source, target] = p.dependentRows;
    const sourceRow = p.matrix[source],
      targetRow = p.matrix[target];
    const pivot = sourceRow.findIndex((x) => !zero(x));
    if (pivot < 0) throw new Error("Expected a nonzero source row");
    const ratio = div(targetRow[pivot], sourceRow[pivot]);
    if (
      !sourceRow.every(
        (x, j) => sub(targetRow[j], mul(ratio, x)).numerator === 0n,
      )
    )
      throw new Error("Rows are not dependent");
    lesson.work(
      `R${target + 1} = (${f(ratio)})R${source + 1}`,
      t(
        "Dwa wiersze są proporcjonalne, więc macierz ma zależne wiersze i det(A)=0.",
        "Two rows are proportional, so the rows are dependent and det(A)=0.",
      ),
    );
    lesson.work(
      `R${target + 1} ← R${target + 1} − (${f(ratio)})R${source + 1} = [0, 0, 0, 0]; det(A) = 0`,
      t(
        "Dodanie wielokrotności innego wiersza zachowuje wyznacznik. Po uzyskaniu zerowego wiersza każdy wyraz rozwinięcia Laplace'a jest zerem.",
        "Adding a multiple of another row preserves the determinant. With a zero row, every term of its Laplace expansion is zero.",
      ),
    );
    value = z();
  } else if (p.reductions) value = rowWorking(p, lesson);
  else value = laplaceWorking(p.matrix, lesson);
  if (
    value.numerator !== exactDeterminant(p.matrix).numerator ||
    value.denominator !== exactDeterminant(p.matrix).denominator
  )
    throw new Error("Determinant explanation does not match exact expansion");
  return lesson.finish(
    question,
    { kind: "scalar", value },
    t(
      "Znajdź wiersz lub kolumnę z zerami albo operację wierszową, która uprości macierz.",
      "Find a row or column with zeros, or a row operation that simplifies the matrix.",
    ),
    t(
      "Przy Laplace'ie użyj znaku (−1)^(i+j); zamiana wierszy zmienia znak, a dodanie wielokrotności innego wiersza zachowuje wyznacznik.",
      "For Laplace use (−1)^(i+j); a row swap changes the sign, while adding a multiple of another row preserves the determinant.",
    ),
  );
}
