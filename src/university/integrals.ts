import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { polynomialText, type Polynomial } from "./polynomial";
import { teaching } from "./teaching";

export type IntegralProblem = Readonly<{
  kind: "integral";
  method: "direct" | "table" | "substitution" | "parts" | "recurrence" | "definite";
  mode: "polynomial" | "sin" | "cos" | "exp" | "reciprocal" | "linear-power" | "quadratic-power" | "quadratic-plus" | "exponential-product" | "exponential-trig";
  a: Rational;
  b: Rational;
  k: Rational;
  q: Rational;
  n: number;
  polynomial?: Polynomial;
  lower?: Rational;
  upper?: Rational;
}>;
const signed = (v: number) => v % 2 ? -(1 + v % 5) : 1 + v % 5;
const family = (id: string, pl: string, en: string, supportedDifficulties: readonly Difficulty[], create: UniversityFamily["create"]): UniversityFamily =>
  ({ id, category: "integrals", titles: { pl, en }, supportedDifficulties, create });

function polynomialFor(v: number, level: Difficulty): Polynomial {
  const c = r(v % 7 - 3), a = r(1 + Math.floor(v / 6));
  if (level === "easy") return [c, a];
  if (level === "medium") return [c, r((v % 5) - 2), a];
  if (level === "hard") return [c, r((v % 5) - 2, 2), r((v % 3) - 1), a];
  if (level === "advanced") return [c, r((v % 5) - 2, 3), r((v % 3) - 1, 2), r(1 + v % 4), a];
  return [c, r((v % 5) - 2, 3), r((v % 3) - 1, 2), r(1 + v % 4), r((v % 7) - 3), a];
}
export const integralFamilies: readonly UniversityFamily[] = [
  family("integral-direct", "Całki bezpośrednie wielomianów", "Direct polynomial integrals", ["easy", "medium", "hard"],
    (v, level): IntegralProblem => ({ kind: "integral", method: "direct", mode: "polynomial", a: r(0), b: r(0), k: r(0), q: r(0), n: 0, polynomial: polynomialFor(v, level) })),
  family("integral-table", "Całki tablicowe i trygonometryczne", "Table and trigonometric integrals", ["medium", "hard"],
    (v, level): IntegralProblem => ({ kind: "integral", method: "table", mode: level === "medium" ? (v % 2 ? "sin" : "cos") : (v % 2 ? "exp" : "reciprocal"),
      a: r(signed(v)), b: r(Math.floor(v / 6) - 1), k: r(1 + v % 4), q: r(0), n: 0 })),
  family("integral-substitution", "Podstawienie w całce", "Substitution in integrals", ["medium", "hard", "advanced"],
    (v, level): IntegralProblem => ({ kind: "integral", method: "substitution", mode: level === "medium" ? "linear-power" : level === "hard" ? "quadratic-power" : "quadratic-plus",
      a: r(signed(v)), b: r(v % 7 - 3), k: r(1 + Math.floor(v / 6)), q: r(v % 2 ? -2 : 3, 2), n: 2 + (v % 3) })),
  family("integral-parts", "Całkowanie przez części", "Integration by parts", ["hard", "advanced", "expert"],
    (v, level): IntegralProblem => ({ kind: "integral", method: "parts", mode: "exponential-product", a: r(signed(v)), b: r(0), k: r(1 + Math.floor(v / 6)), q: r(0), n: level === "hard" ? 1 : level === "advanced" ? 2 : 3 })),
  family("integral-recurring", "Całki powracające", "Recurring integrals", ["advanced", "expert"],
    (v, level): IntegralProblem => ({ kind: "integral", method: "recurrence", mode: "exponential-trig", a: r(signed(v)), b: r(1 + Math.floor(v / 8)),
      k: r(level === "advanced" ? 1 : 1 + v % 3), q: r(level === "advanced" ? 0 : v % 2 ? -1 : 2), n: 0 })),
  family("integral-definite", "Całki oznaczone wielomianów", "Definite polynomial integrals", ["easy", "medium", "hard", "advanced", "expert"],
    (v, level): IntegralProblem => ({ kind: "integral", method: "definite", mode: "polynomial", a: r(0), b: r(0), k: r(0), q: r(0), n: 0,
      polynomial: polynomialFor(v, level), lower: level === "advanced" || level === "expert" ? r(-1 - (v % 3), 2) : r(-1 - (v % 3)),
      upper: level === "advanced" || level === "expert" ? r(1 + Math.floor(v / 8), 2) : r(1 + Math.floor(v / 8)) })),
];
const power = (x: Rational, n: number): Rational => Array.from({ length: n }, () => x).reduce(mul, r(1));
export function polynomialPrimitive(coefficients: Polynomial): Rational[] {
  return coefficients.map((c, i) => div(c, r(i + 1)));
}
export function polynomialAt(coefficients: Polynomial, at: Rational): Rational {
  return coefficients.reduce((sum, coefficient, i) => add(sum, mul(coefficient, power(at, i))), r(0));
}
const primitive = (terms: readonly { basis: string; coefficient: Rational }[]): AnswerSpec => ({ kind: "primitive", terms });
const expression = (terms: readonly { basis: string; coefficient: Rational }[]) => terms.map((term) => `(${f(term.coefficient)})·${term.basis}`).join(" + ");
export function presentIntegral(p: IntegralProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const work = (action: string, reasonPl: string, reasonEn: string) => lesson.work(action, t(reasonPl, reasonEn));
  const hint = t("Rozpoznaj metodę całkowania i znajdź funkcję, której pochodna daje podcałkową.", "Choose an integration method and find a function whose derivative is the integrand.");
  const nextHint = t("Sprawdź współczynniki przez różniczkowanie; przy całce nieoznaczonej dodaj +C.", "Check coefficients by differentiation; include +C for an indefinite integral.");
  const a = f(p.a), b = f(p.b), k = f(p.k), n = p.n;
  if (p.method === "direct" || p.method === "definite") {
    const polynomial = p.polynomial!, integrated = polynomialPrimitive(polynomial);
    const terms = integrated.map((coefficient, i) => ({ basis: `x^${i + 1}`, coefficient }));
    const integrand = polynomialText(polynomial);
    const displayIntegrand = p.method === "direct" && polynomial.length === 4
      ? `(${polynomialText([polynomial[0], add(polynomial[1], r(2)), sub(polynomial[2], r(2)), polynomial[3]])}) + (${polynomialText([r(0), r(-2), r(2)])})`
      : integrand;
    if (displayIntegrand !== integrand) work(`${displayIntegrand} = ${integrand}`,
      "Przed całkowaniem łączymy współczynniki przy tych samych potęgach x.",
      "Before integrating, combine coefficients of matching powers of x.");
    work(t("Całkuj każdy jednomian osobno", "Integrate each monomial separately"),
      "Dla c·x^j funkcją pierwotną jest c/(j+1)·x^(j+1); j jest tutaj nieujemne.",
      "For c·x^j an antiderivative is c/(j+1)·x^(j+1); j is nonnegative here.");
    work(`F(x)=${expression(terms)}+C`, "Różniczkując każdy składnik otrzymujemy dokładnie podaną funkcję podcałkową.",
      "Differentiating every term reproduces the given integrand exactly.");
    if (p.method === "direct") return lesson.finish(t(`Oblicz ∫(${displayIntegrand}) dx. Wpisz współczynniki F(x) przy podanych potęgach i dodaj +C.`,
      `Find ∫(${displayIntegrand}) dx. Enter the coefficients of F(x) for the displayed powers and include +C.`), primitive(terms), hint, nextHint);
    const lower = p.lower!, upper = p.upper!;
    // The primitive coefficient of x^(i+1) is stored at index i; no constant term is required.
    const evaluate = (x: Rational) => integrated.reduce((sum, coefficient, i) => add(sum, mul(coefficient, power(x, i + 1))), r(0));
    const hi = evaluate(upper), lo = evaluate(lower), answer = sub(hi, lo);
    work(`F(${f(upper)})=${f(hi)}; F(${f(lower)})=${f(lo)}`,
      "Podstawiamy obie granice do tej samej funkcji pierwotnej, zachowując ich kolejność.",
      "Substitute both bounds into the same antiderivative, preserving their order.");
    work(`F(${f(upper)})−F(${f(lower)})=${f(answer)}`,
      "Twierdzenie Newtona–Leibniza daje dokładną różnicę; stała całkowania znika.",
      "The fundamental theorem gives the exact difference; the integration constant cancels.");
    return lesson.finish(t(`Oblicz dokładnie ∫ od ${f(lower)} do ${f(upper)} z (${integrand}) dx.`,
      `Find the exact value of ∫ from ${f(lower)} to ${f(upper)} of (${integrand}) dx.`), { kind: "scalar", value: answer },
      t("Znajdź funkcję pierwotną F i użyj F(b)−F(a).", "Find an antiderivative F and use F(b)−F(a)."),
      t("Nie dodawaj +C do wyniku liczbowego; oblicz obie wartości dokładnie.", "Do not add +C to the numeric result; compute both values exactly."));
  }
  if (p.method === "table") {
    const inside = `(${a})x+(${b})`, factor = div(p.k, p.a);
    let integrand: string, term: { basis: string; coefficient: Rational }, domain = t("x należy do R.", "x is real.");
    if (p.mode === "sin") { integrand = `(${k})sin(${inside})`; term = { basis: `cos(${inside})`, coefficient: sub(r(0), factor) }; }
    else if (p.mode === "cos") { integrand = `(${k})cos(${inside})`; term = { basis: `sin(${inside})`, coefficient: factor }; }
    else if (p.mode === "exp") { integrand = `(${k})e^(${inside})`; term = { basis: `e^(${inside})`, coefficient: factor }; }
    else { integrand = `(${k})/(${inside})`; term = { basis: `ln|${inside}|`, coefficient: factor }; domain = t(`${inside}≠0; rozważ dowolny jeden spójny przedział dziedziny.`, `${inside}≠0; consider any one connected interval of the domain.`); }
    work(`u=${inside}; u'=${a}; ${domain}`, "Wyznaczamy pochodną argumentu i sprawdzamy dziedzinę przed użyciem wzoru tablicowego.",
      "Find the inner derivative and check the domain before applying the table formula.");
    work(`F(x)=${expression([term])}+C`, "Dzielimy przez niezerowy współczynnik przy x; dla sinusa znak funkcji pierwotnej jest ujemny.",
      "Divide by the nonzero coefficient of x; the sine antiderivative has a negative sign.");
    work(`F'(x)=${integrand}`, "Reguła łańcuchowa przy różniczkowaniu odtwarza współczynnik oraz podcałkową.",
      "The chain rule restores the coefficient and integrand on differentiation.");
    return lesson.finish(t(`Oblicz ∫ ${integrand} dx na dziedzinie ${domain}`, `Find ∫ ${integrand} dx on the domain ${domain}`), primitive([term]), hint, nextHint);
  }
  if (p.method === "substitution") {
    const quadratic = p.mode !== "linear-power";
    const inside = quadratic ? `(${a})x²+(${b})` : `(${a})x+(${b})`;
    const scale = quadratic ? mul(r(2), p.a) : p.a;
    const coefficient = div(p.k, mul(scale, r(n + 1)));
    const terms = [{ basis: `(${inside})^${n + 1}`, coefficient }];
    if (p.mode === "quadratic-plus") terms.push({ basis: "x^2", coefficient: div(p.q, r(2)) });
    const integrand = quadratic ? `(${k})x(${inside})^${n}${p.mode === "quadratic-plus" ? `+(${f(p.q)})x` : ""}` : `(${k})(${inside})^${n}`;
    work(`u=${inside}; du/dx=${quadratic ? `2(${a})x` : a}`,
      "Podstawiamy całe wyrażenie wewnętrzne; jego pochodna wyznacza konieczny współczynnik.",
      "Substitute the whole inner expression; its derivative determines the required coefficient.");
    work(`∫ ${integrand} dx = ${expression(terms)}+C`, "Po wyłączeniu stałej całkujemy u^n jako u^(n+1)/(n+1).",
      "After taking out the constant, integrate u^n as u^(n+1)/(n+1).");
    work(`dF/dx=${integrand}`, "Reguła łańcuchowa usuwa dzielnik i odtwarza także dodatkowy składnik liniowy.",
      "The chain rule cancels the divisor and restores the optional linear term.");
    return lesson.finish(t(`Oblicz ∫ (${integrand}) dx metodą podstawienia.`, `Find ∫ (${integrand}) dx by substitution.`), primitive(terms), hint, nextHint);
  }
  if (p.method === "parts") {
    const terms: { basis: string; coefficient: Rational }[] = [];
    let current = div(p.k, p.a);
    for (let degree = n; degree >= 0; degree--) {
      terms.push({ basis: degree ? `x^${degree}e^((${a})x)` : `e^((${a})x)`, coefficient: current });
      if (degree) current = div(mul(sub(r(0), current), r(degree)), p.a);
    }
    const integrand = `(${k})x^${n}e^((${a})x)`;
    work(`u=x^${n}, dv=(${k})e^((${a})x)dx; du=${n}x^${n - 1}dx, v=(${f(div(p.k, p.a))})e^((${a})x)`,
      "Wybieramy wielomian jako u: różniczkowanie zmniejsza jego stopień, a całkowanie wykładniczej dzieli przez niezerowe a.",
      "Choose the polynomial as u: differentiation lowers its degree, while integrating the exponential divides by nonzero a.");
    work(`∫u dv=uv−∫v du; F(x)=${expression(terms)}+C`,
      "Powtarzamy całkowanie przez części, aż pochodna wielomianu zniknie; znaki współczynników zmieniają się naprzemiennie.",
      "Repeat integration by parts until the polynomial derivative vanishes; coefficient signs alternate.");
    work(`F'(x)=${integrand}`, "W pochodnej każdego składnika z e^(ax) wyrazy niższych stopni skracają się parami.",
      "When differentiating every e^(ax) term, lower-degree terms cancel in pairs.");
    return lesson.finish(t(`Oblicz ∫ ${integrand} dx przez części.`, `Find ∫ ${integrand} dx by parts.`), primitive(terms), hint, nextHint);
  }
  const denominator = add(mul(p.a, p.a), mul(p.b, p.b));
  const sin = div(add(mul(p.a, p.k), mul(p.b, p.q)), denominator);
  const cos = div(sub(mul(p.a, p.q), mul(p.b, p.k)), denominator);
  const terms = [{ basis: `e^((${a})x)sin((${b})x)`, coefficient: sin }, { basis: `e^((${a})x)cos((${b})x)`, coefficient: cos }];
  const integrand = `e^((${a})x)((${k})sin((${b})x)+(${f(p.q)})cos((${b})x))`;
  work(`J=∫e^((${a})x)sin((${b})x)dx; K=∫e^((${a})x)cos((${b})x)dx`,
    "Dwukrotne całkowanie przez części wiąże dwie całki powracające J i K.",
    "Two integrations by parts link the recurring integrals J and K.");
  work(`J=−e^((${a})x)cos((${b})x)/(${b})+(${a})K/(${b}); K=e^((${a})x)sin((${b})x)/(${b})−(${a})J/(${b})`,
    "W każdym kroku b jest niezerowe; podstawiamy drugie równanie do pierwszego.",
    "b is nonzero at every step; substitute the second equation into the first.");
  work(`D=${f(denominator)}>0; F(x)=${expression(terms)}+C`,
    "Rozwiązanie układu dla J i K daje wspólny mianownik a²+b²; jest on ściśle dodatni.",
    "Solving the system for J and K gives denominator a²+b², which is strictly positive.");
  work(`F'(x)=e^((${a})x)((${k})sin((${b})x)+(${f(p.q)})cos((${b})x))`,
    "Po zróżniczkowaniu współczynniki sinusa i cosinusa są dokładnie takie jak w podcałkowej.",
    "Differentiation restores exactly the sine and cosine coefficients in the integrand.");
  return lesson.finish(t(`Oblicz powracającą całkę ∫ ${integrand} dx.`, `Find the recurring integral ∫ ${integrand} dx.`), primitive(terms), hint, nextHint);
}
