import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { ElementaryAnalysisProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";
import { excludePoints, leftRay, normalize, outside, rightRay, setAnswer, setText, type RealSet } from "./realSets";

const base = (v: number) => v % 2 ? r(1, 2) : r(2);
const pow = (a: Rational, exponent: number): Rational => {
  let value = r(1);
  for (let i = 0; i < Math.abs(exponent); i++) value = mul(value, a);
  return exponent < 0 ? div(r(1), value) : value;
};
const family = (id: string, category: "functions" | "algebra", titles: Record<Locale, string>, levels: readonly Difficulty[], create: UniversityFamily["create"]): UniversityFamily => ({ id, category, titles, supportedDifficulties: levels, create });

export const elementaryAnalysisFamilies: readonly UniversityFamily[] = [
  family("analysis-log-domain", "functions", { pl: "Dziedzina logarytmu", en: "Logarithmic domain" }, ["easy", "medium", "hard"], (v, d) => ({ kind: "analysis-log-domain", mode: d === "easy" ? "linear" : d === "medium" ? "ratio" : "radical", p: r(v - 11, d === "hard" ? 2 : 1), base: base(v) })),
  family("analysis-power-law", "algebra", { pl: "Prawa logarytmów i potęg", en: "Laws of logarithms and powers" }, ["easy", "medium", "hard"], (v, d) => ({ kind: "analysis-power-law", mode: d === "easy" ? "log-power" : d === "medium" ? "power-log" : "combined", base: base(v), exponent: v - 11, argument: r(v + 1, v % 4 + 2) })),
  family("analysis-elementary-equation", "algebra", { pl: "Równania wykładnicze i logarytmiczne", en: "Exponential and logarithmic equations" }, ["easy", "medium", "hard"], (v, d) => ({ kind: "analysis-elementary-equation", mode: d === "easy" ? "exponential" : d === "medium" ? "logarithmic" : "log-product", base: base(v), p: r(v - 11), multiplier: r(v % 3 + 1), shift: r(v % 5 - 2), exponent: d === "hard" ? (v % 2 ? -1 : 1) : v % 3 - 1 })),
  family("analysis-log-inequality", "algebra", { pl: "Nierówności logarytmiczne", en: "Logarithmic inequalities" }, ["medium", "hard"], (v, d) => ({ kind: "analysis-log-inequality", p: r(v - 11), base: base(v), exponent: v % 3 - 1, relation: d === "medium" ? "greater" : "at-most" })),
  family("analysis-absolute", "functions", { pl: "Moduł: równania, dziedzina i nierówności", en: "Absolute value: equations, domain and inequalities" }, ["easy", "medium", "hard", "advanced", "expert"], (v, d) => ({ kind: "analysis-absolute", mode: d === "easy" ? "equation" : d === "medium" ? "domain" : d === "hard" ? "inside" : d === "advanced" ? "sum-inside" : "sum-outside", p: r(v - 11, d === "hard" ? 2 : 1), q: r(v - 11 + 2 + v % 3, d === "hard" ? 2 : 1), radius: r(v % 4 + 1, d === "hard" ? 2 : 1) })),
];

export function presentElementaryAnalysis(problem: ElementaryAnalysisProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const work = (action: string, reason: string) => lesson.work(`${t("Otrzymujemy: ", "We obtain: ")}${action}`, reason);
  if (problem.kind === "analysis-log-domain") {
    const { p, base: a, mode } = problem, boundary = add(p, r(2));
    let domain: RealSet, expression: string;
    if (mode === "linear") {
      expression = `log_${f(a)}(x−${f(p)})`;
      domain = rightRay(p, false);
      work(`x−${f(p)}>0 ⇔ x>${f(p)}`, t("Argument logarytmu musi być ściśle dodatni.", "A logarithm requires a strictly positive argument."));
    } else if (mode === "ratio") {
      expression = `log_${f(a)}((x−${f(p)})/(x−${f(boundary)}))`;
      domain = normalize([...leftRay(p, false), ...rightRay(boundary, false)]);
      work(`(x−${f(p)})/(x−${f(boundary)})>0; x≠${f(boundary)}`, t("Zaznacz zero licznika i biegun mianownika, a następnie sprawdź znak na każdym przedziale.", "Mark the numerator zero and denominator pole, then test the sign on each interval."));
      work(`${f(p)}<${f(boundary)}; x<${f(p)} lub x>${f(boundary)}`.replace(" lub ", t(" lub ", " or ")), t("Iloraz jest dodatni tylko wtedy, gdy licznik i mianownik mają ten sam znak; oba punkty brzegowe są wyłączone.", "The ratio is positive only when numerator and denominator share a sign; both boundary points are excluded."));
    } else {
      expression = `√(x−${f(p)})/log_${f(a)}(x−${f(p)})`;
      domain = excludePoints(rightRay(p, false), [add(p, r(1))]);
      work(`x−${f(p)}≥0; x−${f(p)}>0`, t("Pierwiastek wymaga nieujemnego argumentu, logarytm dodatniego; przecięcie daje ostrą nierówność.", "The square root needs a nonnegative radicand and the logarithm a positive argument; their intersection is strict."));
      work(`log_${f(a)}(x−${f(p)})≠0 ⇔ x≠${f(add(p, r(1)))}`, t("Mianownik nie może być zerem; log_a(1)=0 dla każdej dopuszczalnej podstawy.", "The denominator cannot vanish; log_a(1)=0 for every valid base."));
    }
    work(`D = ${setText(domain)}`, t("Łączymy wszystkie warunki dziedziny, zachowując otwarte końce i wyłączenia.", "Intersect every domain condition, keeping open endpoints and exclusions."));
    return lesson.finish(t(`Wyznacz dziedzinę f(x)=${expression}.`, `Find the domain of f(x)=${expression}.`), setAnswer(domain, p), t("Najpierw zapisz ścisły warunek dla argumentu logarytmu.", "First write the strict condition on the logarithm's argument."), t("Sprawdź osobno mianownik i pierwiastek, a potem przetnij warunki.", "Check denominator and square root separately, then intersect the conditions."));
  }
  if (problem.kind === "analysis-power-law") {
    const { base: a, exponent: k, argument: u, mode } = problem;
    const expression = mode === "log-power" ? `log_${f(a)}(${f(a)}^(${k}))` : mode === "power-log" ? `${f(a)}^(log_${f(a)}(${f(u)}))` : `log_${f(a)}(${f(a)}^(${k}))+${f(a)}^(log_${f(a)}(${f(u)}))`;
    work(`${f(a)}>0; ${f(a)}≠1; ${f(u)}>0`, t("Obie tożsamości wymagają dopuszczalnej podstawy, a druga także dodatniego argumentu logarytmu.", "Both identities require a valid base, and the second also needs a positive logarithm argument."));
    if (mode !== "power-log") work(`log_${f(a)}(${f(a)}^(${k}))=${k}`, t("Logarytm o podstawie a odwraca potęgowanie o tej samej podstawie, także przy ujemnym wykładniku.", "The base-a logarithm reverses exponentiation with the same base, including negative exponents."));
    if (mode !== "log-power") work(`${f(a)}^(log_${f(a)}(${f(u)}))=${f(u)}`, t("Potęgowanie o podstawie a odwraca logarytmowanie tylko dla dodatniego argumentu.", "Base-a exponentiation reverses the logarithm only for a positive argument."));
    const value = mode === "log-power" ? r(k) : mode === "power-log" ? u : add(r(k), u);
    if (mode === "combined") work(`${k}+${f(u)}=${f(value)}`, t("Dodajemy dokładne wartości wymierne, bez przybliżania logarytmu.", "Add exact rational values without approximating the logarithm."));
    return lesson.finish(t(`Oblicz dokładnie ${expression}.`, `Evaluate ${expression} exactly.`), { kind: "scalar", value }, t("Sprawdź warunki na podstawę i argument logarytmu.", "Check the logarithm base and argument conditions."), t("Zastosuj odwrotność funkcji log_a i a^x.", "Use the inverse relation between log_a and a^x."));
  }
  if (problem.kind === "analysis-elementary-equation") {
    const { base: a, p, multiplier: m, shift: b, exponent: k, mode } = problem;
    let expression: string, value: Rational;
    if (mode === "exponential") {
      value = div(sub(r(k), b), m);
      expression = `${f(a)}^(${f(m)}x+${f(b)})=${f(a)}^(${k})`;
      work(`${f(m)}x+${f(b)}=${k}`, t("Funkcja wykładnicza o podstawie a>0, a≠1 jest różnowartościowa.", "Exponential functions with a>0, a≠1 are injective."));
      work(`x=(${k}−${f(b)})/${f(m)}=${f(value)}`, t("Odejmujemy wyraz wolny i dzielimy przez niezerowy współczynnik.", "Subtract the constant and divide by the nonzero coefficient."));
    } else if (mode === "logarithmic") {
      value = add(p, pow(a, k));
      expression = `log_${f(a)}(x−${f(p)})=${k}`;
      work(`x−${f(p)}>0`, t("To warunek dziedziny, który musi spełniać każde rozwiązanie.", "This domain condition must hold for every solution."));
      work(`x−${f(p)}=${f(pow(a, k))}; x=${f(value)}`, t("Podnosimy podstawę a do obu stron; a^k jest dodatnie także dla k<0.", "Exponentiate both sides with base a; a^k remains positive even for k<0."));
    } else {
      const other = sub(p, r(1));
      value = add(p, r(1));
      expression = `log_${f(a)}(x−${f(p)})+log_${f(a)}(x−${f(other)})=${k}`;
      work(`x>${f(p)}; (x−${f(p)})(x−${f(other)})=${f(pow(a, k))}=2`, t("Oba argumenty muszą być dodatnie; dopiero wtedy suma logarytmów jest logarytmem iloczynu.", "Both arguments must be positive before combining the logarithms into one product."));
      work(`y=x−${f(value)}; (y+1)(y+2)=2 ⇔ y(y+3)=0`, t("Przesunięcie zmiennej ujawnia dwa pierwiastki równania kwadratowego.", "A variable shift reveals both roots of the quadratic equation."));
      work(`x=${f(value)} lub x=${f(sub(value, r(3)))}`.replace(" lub ", t(" lub ", " or ")), t("Drugi kandydat nie spełnia x>p; odrzucamy go po sprawdzeniu dziedziny.", "The second candidate violates x>p, so reject it after checking the domain."));
    }
    work(`x=${f(value)}`, t("Wynik spełnia oryginalne równanie i jego dziedzinę.", "The result satisfies both the original equation and its domain."));
    return lesson.finish(t(`Rozwiąż równanie ${expression}.`, `Solve ${expression}.`), { kind: "scalar", value }, t("Ustal dziedzinę logarytmów lub różnowartościowość potęgowania.", "Establish the logarithm domain or injectivity of exponentiation."), t("Po przekształceniu sprawdź każdy kandydat w oryginalnym równaniu.", "Check each candidate in the original equation after rearranging."));
  }
  if (problem.kind === "analysis-log-inequality") {
    const { base: a, p, exponent: k, relation } = problem, threshold = add(p, pow(a, k));
    const increasing = a.numerator > a.denominator;
    const greater = relation === "greater";
    const domain: RealSet = greater
      ? increasing ? rightRay(threshold, false) : [{ lower: p, upper: threshold, lowerClosed: false, upperClosed: false }]
      : increasing ? [{ lower: p, upper: threshold, lowerClosed: false, upperClosed: true }] : rightRay(threshold, true);
    const sign = greater ? ">" : "≤";
    work(`x−${f(p)}>0 ⇔ x>${f(p)}`, t("Logarytm jest określony tylko dla dodatniego argumentu.", "The logarithm is defined only for a positive argument."));
    work(`${f(a)}^(${k})=${f(pow(a, k))}; x=${f(threshold)}`, t("Równość wyznacza punkt brzegowy w dziedzinie.", "Equality gives the boundary point inside the domain."));
    work(increasing
      ? t(`${f(a)}>1 ⇒ log_a jest rosnący`, `${f(a)}>1 ⇒ log_a is increasing`)
      : t(`0<${f(a)}<1 ⇒ log_a jest malejący`, `0<${f(a)}<1 ⇒ log_a is decreasing`), t("Przy podstawie między 0 i 1 kierunek nierówności odwraca się.", "For a base between 0 and 1, the inequality direction reverses."));
    work(`S=${setText(domain)}`, t("Przecinamy wynik nierówności z dziedziną x>p; domknięcie zależy od znaku ≤.", "Intersect the inequality result with x>p; endpoint closure follows from ≤."));
    return lesson.finish(t(`Rozwiąż nierówność log_${f(a)}(x−${f(p)}) ${sign} ${k}.`, `Solve log_${f(a)}(x−${f(p)}) ${sign} ${k}.`), setAnswer(domain, threshold), t("Najpierw zapisz x>p.", "Start with x>p."), t("Sprawdź, czy podstawa jest większa od 1, czy leży między 0 a 1.", "Check whether the base exceeds 1 or lies between 0 and 1."));
  }
  const { p, q: other, radius: h, mode } = problem;
  const low = sub(p, h), high = add(p, h), sumHigh = add(other, h);
  let answer: AnswerSpec, expression: string;
  if (mode === "equation") {
    expression = `|x−${f(p)}|=${f(h)}`;
    answer = { kind: "roots", values: [low, high] };
    work(`x−${f(p)}=${f(h)} lub x−${f(p)}=−${f(h)}`.replace(" lub ", t(" lub ", " or ")), t("Dodatni promień daje dwa różne przypadki równania z modułem.", "A positive radius gives two distinct cases of an absolute-value equation."));
    work(`x=${f(low)} lub x=${f(high)}`.replace(" lub ", t(" lub ", " or ")), t("Oba punkty spełniają pierwotne równanie.", "Both points satisfy the original equation."));
  } else if (mode === "domain") {
    expression = `√(|x−${f(p)}|−${f(h)})`;
    const domain = outside(low, high, true);
    answer = setAnswer(domain, p);
    work(`|x−${f(p)}|−${f(h)}≥0 ⇔ |x−${f(p)}|≥${f(h)}`, t("Zwykły pierwiastek wymaga argumentu nieujemnego.", "An ordinary square root requires a nonnegative radicand."));
    work(`D=${setText(domain)}`, t("Rozbijamy moduł na dwa promienie i zachowujemy oba końce.", "Split the absolute value into two rays and include both endpoints."));
  } else if (mode === "inside") {
    expression = `|x−${f(p)}|<${f(h)}`;
    const domain: RealSet = [{ lower: low, upper: high, lowerClosed: false, upperClosed: false }];
    answer = setAnswer(domain, p);
    work(`−${f(h)}<x−${f(p)}<${f(h)}`, t("Dla dodatniego promienia nierówność ostra z modułem daje podwójną nierówność.", "For a positive radius, a strict absolute-value inequality becomes a double inequality."));
    work(`S=${setText(domain)}`, t("Dodajemy środek p; końce pozostają otwarte.", "Add the center p; endpoints stay open."));
  } else {
    const bound = add(sub(other, p), mul(r(2), h));
    expression = `|x−${f(p)}|+|x−${f(other)}|${mode === "sum-inside" ? "≤" : "≥"}${f(bound)}`;
    const domain: RealSet = mode === "sum-inside" ? [{ lower: low, upper: sumHigh, lowerClosed: true, upperClosed: true }] : outside(low, sumHigh, true);
    answer = setAnswer(domain, p);
    work(`${f(p)}<${f(other)}; x≤${f(p)}: ${f(add(p, other))}−2x; ${f(p)}≤x≤${f(other)}: ${f(sub(other, p))}; x≥${f(other)}: 2x−${f(add(p, other))}`, t("Rozdzielamy trzy obszary według punktów załamania modułów.", "Split at the two absolute-value corners into three regions."));
    work(`${f(bound)}=${f(sub(other, p))}+2·${f(h)}; S=${setText(domain)}`, t("Na środkowym odcinku suma jest stała, a na zewnętrznych zmienia się liniowo; oba końce spełniają nierówność.", "The sum is constant in the middle and linear outside; both boundary points satisfy the inequality."));
  }
  return lesson.finish(t(mode === "domain" ? `Wyznacz dziedzinę f(x)=${expression}.` : `Rozwiąż ${expression}.`, mode === "domain" ? `Find the domain of f(x)=${expression}.` : `Solve ${expression}.`), answer, t("Zaznacz punkty zmiany znaku wyrażeń pod modułem.", "Mark where expressions inside absolute values change sign."), t("Rozwiąż nierówności na każdym przedziale i sprawdź końce.", "Solve within each interval and check endpoints."));
}
