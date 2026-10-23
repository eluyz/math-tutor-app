import { rational as r, subtractRational as sub, divideRational as div, type Rational } from "../rational";
import { formatRational as f } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { polynomialText } from "./polynomial";
import { teaching } from "./teaching";

export type FunctionExtensionProblem =
  | Readonly<{ kind: "function-parity"; coefficients: readonly Rational[] }>
  | Readonly<{ kind: "function-affine-inverse"; a: Rational; b: Rational; c: Rational; form: "expanded" | "shifted" | "quotient" }>;

const zero = (x: Rational) => x.numerator === 0n;
const signed = (v: number) => (v % 2 === 0 ? 1 : -1);
function parityProblem(v: number, level: Difficulty): FunctionExtensionProblem {
  const denominator = level === "easy" ? 1 : level === "medium" ? 2 : 3 + v % 3;
  const a = r(signed(v) * (2 + Math.floor(v / 3)), denominator);
  const b = r(1 + (v % 7), denominator);
  const constant = r(v - 10, denominator);
  const high = level === "hard";
  // Every level genuinely mixes even, odd and neither; answers cannot be guessed by difficulty.
  const coefficients = v % 3 === 0
    ? [constant, r(0), b, r(0), ...(high ? [a] : [])]
    : v % 3 === 1
      ? [r(0), b, r(0), a, ...(high ? [r(0), b] : [])]
      : [constant, b, r(0), a, ...(high ? [r(0), b] : [])];
  return { kind: "function-parity", coefficients };
}
function inverseProblem(v: number, level: Difficulty): FunctionExtensionProblem {
  const denominator = level === "hard" ? 2 + v % 3 : 1;
  const a = r(signed(v) * (1 + v % 5), denominator);
  const b = r(v - 11, level === "easy" ? 1 : 2);
  const c = level === "hard" ? r(2 + (v % 4)) : r((v % 7) + 1, 2);
  return { kind: "function-affine-inverse", a, b, c, form: level === "easy" ? "expanded" : level === "medium" ? "shifted" : "quotient" };
}
export const functionExtensionFamilies: readonly UniversityFamily[] = [
  { id: "function-parity", category: "functions",
    titles: { pl: "Parzystość funkcji z wzoru", en: "Even and odd functions" },
    supportedDifficulties: ["easy", "medium", "hard"], create: parityProblem },
  { id: "function-affine-inverse", category: "functions",
    titles: { pl: "Funkcja odwrotna do liniowej", en: "Inverse of an affine function" },
    supportedDifficulties: ["easy", "medium", "hard"], create: inverseProblem },
];

export function presentFunctionExtension(p: FunctionExtensionProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  if (p.kind === "function-parity") {
    const terms = p.coefficients;
    const odd = terms.some((x, i) => i % 2 === 1 && !zero(x));
    const even = terms.some((x, i) => i % 2 === 0 && !zero(x));
    const type = !odd ? "even" : !even ? "odd" : "neither";
    const negativeX = terms.map((x, i) => i % 2 ? sub(r(0), x) : x);
    const negated = terms.map(x => sub(r(0), x));
    lesson.work(`f(−x) = ${polynomialText(negativeX)}`,
      t("Podstawienie −x zmienia znaki tylko przy nieparzystych potęgach.", "Replacing x by −x changes only the odd-power terms."));
    lesson.work(`−f(x) = ${polynomialText(negated)}`,
      t("Porównaj całe wielomiany współczynnik po współczynniku.", "Compare the entire polynomials coefficient by coefficient."));
    lesson.work(type === "even" ? "f(−x)=f(x)" : type === "odd" ? "f(−x)=−f(x)" : "f(−x)≠f(x), f(−x)≠−f(x)",
      t("Równość dla wszystkich rzeczywistych x, nie jeden przykładowy argument, rozstrzyga parzystość.", "The identity for every real x, not a single sampled input, determines parity."));
    return lesson.finish(
      `${t("Określ parzystość funkcji o dziedzinie ℝ.", "Classify the function on ℝ as even, odd or neither.")}\nf(x) = ${polynomialText(terms)}`,
      { kind: "choice", value: type,
        options: [
          { value: "even", label: t("parzysta", "even") },
          { value: "odd", label: t("nieparzysta", "odd") },
          { value: "neither", label: t("ani parzysta, ani nieparzysta", "neither") },
        ] },
      t("Zastąp x przez −x we wszystkich składnikach.", "Replace x with −x in each term."),
      t("Porównaj f(−x) najpierw z f(x), potem z −f(x).", "Compare f(−x) with f(x), then with −f(x).")
    );
  }
  const { a, b, c, form } = p;
  const slope = form === "quotient" ? div(c, a) : div(r(1), a);
  const intercept = form === "expanded" ? div(sub(r(0), b), a)
    : form === "shifted" ? sub(b, div(c, a))
    : div(sub(r(0), b), a);
  const expression = form === "expanded" ? `(${f(a)})x + (${f(b)})`
    : form === "shifted" ? `(${f(a)})(x − (${f(b)})) + (${f(c)})`
    : `((${f(a)})x + (${f(b)}))/(${f(c)})`;
  const equation = form === "expanded" ? `y=(${f(a)})x+(${f(b)})`
    : form === "shifted" ? `y=(${f(a)})(x−(${f(b)}))+(${f(c)})`
    : `y=((${f(a)})x+(${f(b)}))/(${f(c)})`;
  lesson.work(equation, t("Zapisujemy y=f(x) i zamieniamy role x i y.", "Write y=f(x) and exchange x and y."));
  lesson.work(`x=f(y); y=(${f(slope)})x+(${f(intercept)})`,
    t("Izolujemy y, zachowując wszystkie nawiasy i kolejność działań. Współczynnik przy x jest niezerowy.", "Solve for y, keeping brackets and the order of operations. The x coefficient is nonzero."));
  lesson.work(`f⁻¹(x)=(${f(slope)})x+(${f(intercept)})`,
    t("Podstawienie do f daje ponownie x, więc funkcja odwrotna jest poprawna dla całej ℝ.", "Substituting this result back into f returns x, so it is the inverse on all real numbers."));
  return lesson.finish(
    `${t("Podaj współczynniki m, n funkcji odwrotnej f⁻¹(x)=mx+n.", "Enter m and n for the inverse f⁻¹(x)=mx+n.")}\nf(x) = ${expression}`,
    { kind: "list", values: [slope, intercept], labels: ["m", "n"] },
    t("Wpisz y=f(x), zamień x z y i rozwiąż względem y.", "Write y=f(x), exchange x and y, then solve for y."),
    t("W odpowiedzi podaj osobno współczynnik przy x i wyraz wolny.", "Enter the coefficient of x and the constant separately.")
  );
}
