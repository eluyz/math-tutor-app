import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Locale } from "../locales/types";
import type { FunctionStudyProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";

const nonzero = (v: number) => r(v < 11 ? v - 11 : v - 10);
export const functionStudyFamilies: readonly UniversityFamily[] = [
  { id: "analysis-study-polynomial", category: "derivatives", titles: { pl: "Badanie wielomianu", en: "Polynomial function study" }, supportedDifficulties: ["advanced", "expert"], create: (v, level) => ({ kind: "analysis-study-polynomial", at: r(v - 11, 2), coefficient: nonzero(v), target: level === "advanced" ? "stationary" : "global" }) },
  { id: "analysis-study-rational", category: "derivatives", titles: { pl: "Badanie funkcji wymiernej", en: "Rational function study" }, supportedDifficulties: ["advanced", "expert"], create: (v, level) => ({ kind: "analysis-study-rational", at: r(v - 11, 2), coefficient: nonzero(v), target: level === "advanced" ? "stationary" : "global" }) },
];
export function presentFunctionStudy(p: FunctionStudyProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const work = (action: string, reason: string) => lesson.work(`${t("Badanie: ", "Analysis: ")}${action}`, reason);
  const a = p.at, m = p.coefficient, h = `(x−(${f(a)}))`, positive = m.numerator > 0n;
  const left = sub(a,r(1)), right = add(a,r(1));
  const sign = positive ? "+" : "−", opposite = positive ? "−" : "+";
  const stationaryAnswer: AnswerSpec = { kind: "list", labels: ["x₁","y₁","x₂","y₂"], values: p.kind === "analysis-study-polynomial" ? [left,mul(r(2),m),right,mul(r(-2),m)] : [left,mul(r(-2),m),right,mul(r(2),m)] };
  if (p.kind === "analysis-study-polynomial") {
    const expr = `(${f(m)})(${h}³−3${h})`;
    work("D=R; f(a+t)=m(t³−3t), f(a−t)=−f(a+t)", t("Wielomian jest określony wszędzie i nieparzysty względem środka (a,0).", "A polynomial is defined everywhere and is odd about the center (a,0)."));
    work(`f(x)=0 ⇔ t(t²−3)=0 ⇔ x=${f(a)}−√3, ${f(a)}, ${f(a)}+√3`, t("Rozkład na czynniki daje dokładne miejsca zerowe, bez przybliżania √3.", "Factoring gives exact zeros without approximating √3."));
    work(`x→+∞: f→${positive?"+∞":"−∞"}; x→−∞: f→${positive?"−∞":"+∞"}; f(x)/x→${positive?"+∞":"−∞"}`, t("Składnik sześcienny dominuje; brak asymptoty pionowej i liniowej.", "The cubic term dominates; there is no vertical or linear asymptote."));
    work(`f'=3(${f(m)})(${h}²−1); f'=0 ⇔ x=${f(left)} lub x=${f(right)}`.replace(" lub ",t(" lub "," or ")), t("Różniczkujemy dokładny wielomian i rozwiązujemy różnicę kwadratów.", "Differentiate the exact polynomial and solve a difference of squares."));
    work(`f': (−∞,${f(left)}): ${sign}; (${f(left)},${f(right)}): ${opposite}; (${f(right)},+∞): ${sign}`, t("Znaki pochodnej określają monotoniczność i rodzaj obu ekstremów lokalnych.", "Derivative signs determine monotonicity and the types of both local extrema."));
    work(`f(${f(left)})=${f(mul(r(2),m))}; f(${f(right)})=${f(mul(r(-2),m))}`, t("Podstawiamy oba punkty krytyczne do oryginalnej funkcji.", "Substitute both critical points into the original function."));
    work(`f''=6(${f(m)})${h}; x<${f(a)}: ${opposite}; x>${f(a)}: ${sign}; (${f(a)},0)`, t("Znak drugiej pochodnej zmienia się przy a; tam jest przegięcie, a znak wskazuje wklęsłość lub wypukłość.", "The second derivative changes sign at a; this is an inflection, with concavity set by the sign."));
    if (p.target === "stationary") return lesson.finish(t(`Zbadaj f(x)=${expr}: dziedzinę, zera, symetrię, granice, asymptoty, znaki f' i f'', ekstrema i przegięcie. Wpisz (x₁,y₁,x₂,y₂) punktów stacjonarnych w rosnącej kolejności x.`, `Study f(x)=${expr}: domain, zeros, symmetry, limits, asymptotes, signs of f' and f'', extrema and inflection. Enter (x₁,y₁,x₂,y₂) of stationary points in increasing x order.`), stationaryAnswer, t("Użyj t=x−a, potem oblicz f' i f''.", "Set t=x−a, then compute f' and f''."), t("Punkty stacjonarne mają t=−1 i t=1; o rodzaju decyduje znak f'.", "Stationary points have t=−1 and t=1; f' signs classify them."));
    const start=sub(a,r(3,2)), end=add(a,r(3,2)), maximum=mul(r(2),positive?m:sub(r(0),m)), minimum=sub(r(0),maximum);
    work(`[${f(start)},${f(end)}]: f(${f(start)})=${f(mul(r(9,8),m))}, f(${f(end)})=${f(mul(r(-9,8),m))}`, t("Na domkniętym przedziale porównujemy wartości końców z obiema wartościami stacjonarnymi.", "On a closed interval compare endpoint values with both stationary values."));
    work(`2|${f(m)}|>9|${f(m)}|/8; max=${f(maximum)}, min=${f(minimum)}`, t("Wewnętrzne punkty dają oba ekstrema globalne; sprawdziliśmy końce.", "Interior critical points give both global extremes; the endpoints have been checked."));
    return lesson.finish(t(`Zbadaj f(x)=${expr} i wyznacz globalne max f oraz min f na [${f(start)},${f(end)}]. Sprawdź końce, punkty krytyczne, asymptoty i przegięcie.`, `Study f(x)=${expr} and find global max f and min f on [${f(start)},${f(end)}]. Check endpoints, critical points, asymptotes and inflection.`), {kind:"list",labels:["max f","min f"],values:[maximum,minimum]}, t("Najpierw oblicz f' i wartości w punktach krytycznych.", "First find f' and values at critical points."), t("Porównaj je z wartościami na obu końcach zamkniętego przedziału.", "Compare them with both endpoint values of the closed interval."));
  }
  const expr = `(${f(m)})(${h}+1/${h})`;
  work(`D=R\\{${f(a)}}; f(a+t)=m(t+1/t), f(a−t)=−f(a+t)`, t("Mianownik wyklucza a; wykres jest nieparzysty względem punktu (a,0).", "The denominator excludes a; the graph is odd about (a,0)."));
  work(`f=0 ⇔ t²+1=0 (t≠0): ${t("brak zer rzeczywistych", "no real zeros")}`, t("Równanie t²+1=0 nie ma rozwiązania w R.", "The equation t²+1=0 has no real solution."));
  work(`x→${f(a)}⁻: f→${positive?"−∞":"+∞"}; x→${f(a)}⁺: f→${positive?"+∞":"−∞"}; x=${f(a)}`, t("Znak 1/t zmienia się między stronami; wykluczenie a jest asymptotą pionową.", "The sign of 1/t differs on each side; the excluded a is a vertical asymptote."));
  work(`f(x)−(${f(m)})${h}=(${f(m)})/${h}→0 przy x→±∞`.replace(" przy ",t(" przy "," as ")), t("W obu kierunkach reszta zanika; y=m(x−a) jest asymptotą ukośną, bez poziomej.", "The remainder vanishes in both directions; y=m(x−a) is oblique, not horizontal."));
  work(`f'=(${f(m)})(1−1/${h}²); f'=0 ⇔ x=${f(left)} lub x=${f(right)}`.replace(" lub ",t(" lub "," or ")), t("Pochodna istnieje na dziedzinie; punkt a nie jest punktem krytycznym funkcji.", "The derivative exists on the domain; a is not a critical point of the function."));
  work(`f': (−∞,${f(left)}): ${sign}; (${f(left)},${f(a)}): ${opposite}; (${f(a)},${f(right)}): ${opposite}; (${f(right)},+∞): ${sign}`, t("Rozdzielamy przedziały w biegunie i dwóch punktach stacjonarnych; znak określa monotoniczność.", "Split at the pole and both stationary points; the sign gives monotonicity."));
  work(`f(${f(left)})=${f(mul(r(-2),m))}; f(${f(right)})=${f(mul(r(2),m))}`, t("Obie wartości liczymy z oryginalnej funkcji i rozpoznajemy lokalne ekstrema z tabeli f'.", "Evaluate the original function at both points and classify local extrema from the f' chart."));
  work(`f''=2(${f(m)})/${h}³; x<${f(a)}: ${opposite}; x>${f(a)}: ${sign}; ${t("brak przegięcia", "no inflection")}`, t("Znak drugiej pochodnej zmienia się przez a, ale a nie należy do dziedziny; nie jest punktem przegięcia.", "The second derivative changes sign across a, but a is outside the domain and cannot be an inflection point."));
  if(p.target==="stationary") return lesson.finish(t(`Zbadaj f(x)=${expr}: dziedzinę, zera, symetrię, granice, asymptoty, znaki f' i f'', ekstrema i przegięcia. Wpisz (x₁,y₁,x₂,y₂) stacjonarnych punktów w rosnącej kolejności x.`, `Study f(x)=${expr}: domain, zeros, symmetry, limits, asymptotes, signs of f' and f'', extrema and inflections. Enter (x₁,y₁,x₂,y₂) of stationary points in increasing x order.`),stationaryAnswer,t("Wyklucz biegun a i oblicz f'.","Exclude the pole a and find f'."),t("Punkty stacjonarne są po obu stronach bieguna.","The stationary points lie on opposite sides of the pole."));
  const start=add(a,r(1,2)), end=add(a,r(2)), edge=mul(r(5,2),m), middle=mul(r(2),m);
  const maximum=positive?edge:middle, minimum=positive?middle:edge;
  work(`[${f(start)},${f(end)}]: f(${f(start)})=${f(edge)}, f(${f(right)})=${f(middle)}, f(${f(end)})=${f(edge)}`, t("Zamknięty przedział leży po prawej stronie bieguna; sprawdzamy oba końce i jedyny wewnętrzny punkt stacjonarny.", "The closed interval lies right of the pole; compare both endpoints and the only interior stationary point."));
  work(`max=${f(maximum)}, min=${f(minimum)}`, t("Porównanie trzech dokładnych liczb uwzględnia także ujemne m.", "Comparing three exact values also handles negative m."));
  return lesson.finish(t(`Zbadaj f(x)=${expr} i wyznacz globalne max f oraz min f na [${f(start)},${f(end)}]. Sprawdź końce, biegun, asymptotę, pochodne i przegięcia.`, `Study f(x)=${expr} and find global max f and min f on [${f(start)},${f(end)}]. Check endpoints, pole, asymptote, derivatives and inflections.`),{kind:"list",labels:["max f","min f"],values:[maximum,minimum]},t("Przedział nie zawiera bieguna; oblicz f' i wartości kandydatów.","The interval excludes the pole; find f' and candidate values."),t("Porównaj końce i punkt x=a+1; uwzględnij znak m.","Compare endpoints and x=a+1, accounting for the sign of m."));
}
