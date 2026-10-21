import type { GeneratedTask } from "../generators";
import type { Matrix } from "../matrices";
import { parseAnswer, equalRational, rational, addRational, subtractRational,
  multiplyRational, type Rational } from "../rational";
import { isUniversityTask } from "../university/catalog";
import type { Locale } from "../locales/types";

export type StepProbe = Readonly<{
  code: string;
  question: Record<Locale, string>;
  help: Record<Locale, string>;
  answer: Rational;
}>;

const mul = multiplyRational;
const add = addRational;

function smallDeterminant(matrix: Matrix): Rational {
  if (!matrix.length || matrix.some((row) => row.length !== matrix.length) || matrix.length > 4)
    throw new Error("Unsupported determinant probe");
  if (matrix.length === 1) return matrix[0][0];
  return matrix[0].reduce((sum, term, j) => {
    const minor = matrix.slice(1).map((row) => row.filter((_, col) => col !== j));
    const signed = mul(term, smallDeterminant(minor));
    return j % 2 ? subtractRational(sum, signed) : add(sum, signed);
  }, rational(0));
}

/** Mathematical evidence for a *single* independently answerable intermediate operation. */
export function probeFor(task: GeneratedTask): StepProbe | null {
  const shown = "matrices" in task ? task.matrices : undefined;
  const a = shown?.find((entry) => entry.label === "A")?.values;
  const b = shown?.find((entry) => entry.label === "B")?.values;
  if (task.templateId === "determinant-two" && a?.length === 2 && a[0].length === 2) {
    return {
      code: "DETERMINANT_MAIN_DIAGONAL",
      question: { pl: "Oblicz pierwszy iloczyn ad w det(A) = ad − bc (przekątna główna).",
        en: "Compute the first product ad in det(A) = ad − bc (main diagonal)." },
      help: { pl: "Pomnóż element a₁₁ przez a₂₂, uwzględniając oba znaki.",
        en: "Multiply a₁₁ by a₂₂, including both signs." },
      answer: mul(a[0][0], a[1][1]),
    };
  }
  if (task.templateId === "determinant-sarrus" && a?.length === 3 && a[0].length === 3) {
    return {
      code: "SARRUS_FIRST_POSITIVE_PRODUCT",
      question: { pl: "Oblicz pierwszy dodatni iloczyn Sarrusa: a₁₁ · a₂₂ · a₃₃.",
        en: "Compute the first positive Sarrus product: a₁₁ · a₂₂ · a₃₃." },
      help: { pl: "Pomnóż trzy wskazane elementy wraz z ich znakami.",
        en: "Multiply all three entries, keeping their signs." },
      answer: mul(mul(a[0][0], a[1][1]), a[2][2]),
    };
  }
  if (task.templateId === "matrix-product" && a?.length && b?.length && a[0].length === b.length) {
    return {
      code: "MATRIX_PRODUCT_FIRST_CELL",
      question: { pl: "Oblicz element (AB)₁₁: pierwszy wiersz A razy pierwsza kolumna B.",
        en: "Compute entry (AB)₁₁: the first row of A times the first column of B." },
      help: { pl: "Pomnóż odpowiednie pary elementów i dodaj otrzymane iloczyny. Nie licz BA.",
        en: "Multiply matching entries, then add the products. Do not compute BA." },
      answer: a[0].reduce((total, value, i) => add(total, mul(value, b[i][0])), rational(0)),
    };
  }
  if (isUniversityTask(task) && task.university.kind === "system" &&
    task.university.method === "cramer" && [2, 3].includes(task.university.coefficients.length)) {
    return {
      code: "CRAMER_MAIN_DETERMINANT",
      question: { pl: "Oblicz wyznacznik główny D macierzy współczynników (przed podmianą kolumn).",
        en: "Compute the main determinant D of the coefficient matrix (before replacing any columns)." },
      help: { pl: "D obliczamy z samej macierzy współczynników. Wektor wyrazów wolnych należy do D₁, D₂…",
        en: "D uses only the coefficient matrix. The right-hand side belongs in D₁, D₂, etc." },
      answer: smallDeterminant(task.university.coefficients),
    };
  }
  if (isUniversityTask(task) && task.university.kind === "determinant" &&
    ["laplace-four", "laplace-five"].includes(task.university.method)) {
    const source = task.university.matrix;
    const j = source[0].findIndex((entry) => entry.numerator !== 0n);
    const column = j < 0 ? 0 : j;
    const minor = source.slice(1).map((row) => row.filter((_, k) => k !== column));
    return {
      code: "LAPLACE_MINOR",
      question: { pl: `Oblicz minor M₁,${column + 1}: usuń pierwszy wiersz i kolumnę ${column + 1}, następnie oblicz wyznacznik pozostałej macierzy.`,
        en: `Find minor M₁,${column + 1}: remove the first row and column ${column + 1}, then compute the remaining determinant.` },
      help: { pl: "Minor to wyznacznik macierzy po skreśleniu wskazanego wiersza i kolumny. Znak kofaktora uwzględnia się osobno.",
        en: "The minor is the determinant after deleting the selected row and column. Apply the cofactor sign separately." },
      answer: smallDeterminant(minor),
    };
  }
  return null;
}

export function checkProbe(probe: StepProbe, input: string): "correct" | "incorrect" | "invalid" {
  const parsed = parseAnswer(input);
  if (parsed.kind === "invalid") return "invalid";
  return equalRational(parsed.value, probe.answer) ? "correct" : "incorrect";
}
