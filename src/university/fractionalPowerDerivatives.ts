import { rational as r, multiplyRational as mul, subtractRational as sub, type Rational } from "../rational";
import { formatRational as fmt } from "../answers";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching, calculate } from "./teaching";

/** D01: restricted sums of three negative/integer/fractional powers.
 * All source-style radical and reciprocal expressions use x>0, avoiding
 * false negative-base and zero-domain claims. Original worksheet is private.
 */
export type FractionalPowerDerivativeProblem = Readonly<{
  kind: "derivative-fractional-powers";
  mode: 0 | 1 | 2 | 3;
  coefficients: readonly [Rational, Rational, Rational];
}>;

const powers: readonly (readonly [Rational, Rational, Rational])[] = [
  [r(1, 2), r(-1), r(2)],
  [r(3, 2), r(-1, 2), r(1)],
  [r(-2), r(3, 2), r(2)],
  [r(-3, 2), r(-3), r(1, 2)],
];
const powersText = (value: Rational) => "x^(" + fmt(value) + ")";
const modeOf = (variant: number): 0 | 1 | 2 | 3 => (variant % 4) as 0 | 1 | 2 | 3;

function makeProblem(v: number): FractionalPowerDerivativeProblem {
  const a = r((v % 2 ? -1 : 1) * (v + 2), 2 + (v % 3));
  const b = r((v % 3 === 0 ? -1 : 1) * (v + 3), 1 + (v % 4));
  const c = r((v % 5 === 0 ? -1 : 1) * (v + 1), 2 + (v % 2));
  return { kind: "derivative-fractional-powers", mode: modeOf(v), coefficients: [a, b, c] };
}

export const fractionalPowerDerivativeFamilies: readonly UniversityFamily[] = [{
  id: "derivative-fractional-powers",
  category: "derivatives",
  titles: {
    pl: "Pochodne pierwiastków i ujemnych potęg po uproszczeniu",
    en: "Derivatives of radicals and negative powers after simplification",
  },
  supportedDifficulties: ["medium"],
  create: (v) => makeProblem(v),
}];

export function presentFractionalPowerDerivative(p: FractionalPowerDerivativeProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const coefficients = p.coefficients;
  const exponents = powers[p.mode];
  const sourceExpressions = [
    "("+fmt(coefficients[0])+")·√x + ("+fmt(coefficients[1])+")/x + ("+fmt(coefficients[2])+")·x²",
    "("+fmt(coefficients[0])+")·x·√x + ("+fmt(coefficients[1])+")/√x + ("+fmt(coefficients[2])+")·x",
    "("+fmt(coefficients[0])+")/x² + ("+fmt(coefficients[1])+")·√(x³) + ("+fmt(coefficients[2])+")·x²",
    "("+fmt(coefficients[0])+")/√(x³) + ("+fmt(coefficients[1])+")/x³ + ("+fmt(coefficients[2])+")·√x",
  ] as const;
  lesson.work("D = (0, +∞)",
    t("Pracujemy dla x>0. Wszystkie pierwiastki i mianowniki są wtedy określone, a wzór (x^α)′ działa dla użytych wykładników wymiernych.",
      "Work with x>0. Every radical and denominator is defined, and the power rule applies to the selected rational exponents."));
  const expanded = coefficients.map((c,i)=>"("+fmt(c)+")·"+powersText(exponents[i])).join(" + ");
  lesson.work("f(x) = "+expanded,
    t("Korzystamy z √x=x^(1/2), x√x=x^(3/2), √(x³)=x^(3/2) oraz 1/x^a=x^(−a).",
      "Use √x=x^(1/2), x√x=x^(3/2), √(x³)=x^(3/2) and 1/x^a=x^(−a)."));
  const results: Rational[] = [];
  const derivativeExponents: Rational[] = [];
  for (let i = 0; i < 3; i++) {
    const product = calculate("product", coefficients[i], exponents[i]);
    const decreased = calculate("difference", exponents[i], r(1));
    results.push(mul(coefficients[i], exponents[i]));
    derivativeExponents.push(sub(exponents[i], r(1)));
    lesson.work(
      "d/dx[("+fmt(coefficients[i])+")·"+powersText(exponents[i])+"] = ("+fmt(product.result)+")·"+powersText(decreased.result),
      t("Stosujemy regułę (c·x^α)′=c·α·x^(α−1); pomnóż przez α, a następnie odejmij 1 od wykładnika.",
        "Apply (c·x^α)′=c·α·x^(α−1): multiply by α and subtract 1 from the exponent."),
      product, decreased
    );
  }
  lesson.work("f′(x) = "+results.map((c,i)=>"("+fmt(c)+")·"+powersText(derivativeExponents[i])).join(" + "),
    t("Pochodną sumy jest suma pochodnych. Każde pole odpowiedzi dotyczy dokładnie wskazanej potęgi.",
      "Differentiate each summand. Each answer input is the coefficient of its labelled power."));
  const labels = derivativeExponents.map(e => powersText(e));
  return lesson.finish(
    t("Wyznacz współczynniki f′(x) po zapisaniu pierwiastków i ułamków jako potęg, dla x>0.",
      "Enter the coefficients of f′(x) after rewriting radicals and fractions as powers, for x>0.")+
    "\nf(x) = "+sourceExpressions[p.mode],
    {kind:"list",values:results,labels},
    t("Przepisz √x oraz ułamki w postaci x do potęgi wymiernej. Dziedzina: x>0.",
      "Rewrite square roots and reciprocal terms as rational powers of x. Domain: x>0."),
    t("Dla każdego składnika c·x^α pomnóż c przez α, a wykładnik zastąp α−1.",
      "For each c·x^α, multiply c by α and change its exponent to α−1.")
  );
}
