import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Locale } from "../locales/types";
import type { AdvancedCalculusProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";
import { compare } from "./realSets";

const parameter = (v: number) => r(v < 11 ? v - 11 : v - 10);
const family = (id: string, category: "function-limits" | "derivatives", pl: string, en: string, levels: UniversityFamily["supportedDifficulties"], create: UniversityFamily["create"]): UniversityFamily => ({ id, category, titles: { pl, en }, supportedDifficulties: levels, create });
export const advancedCalculusFamilies: readonly UniversityFamily[] = [
  family("analysis-lhospital", "function-limits", "Reguła de l’Hospitala", "L’Hôpital’s rule", ["medium", "hard", "advanced", "expert"], (v, level) => ({ kind: "analysis-lhospital", mode: level === "medium" ? "polynomial-one" : level === "hard" ? "polynomial-two" : level === "advanced" ? "exponential-one" : "exponential-two", at: r(v - 11, 2), coefficient: parameter(v) })),
  family("analysis-lhospital-infinity", "function-limits", "Reguła de l’Hospitala przy nieskończoności", "L’Hôpital’s rule at infinity", ["medium", "hard", "advanced", "expert"], (v, level) => ({ kind: "analysis-lhospital-infinity", mode: level === "medium" ? "linear" : level === "hard" ? "quadratic" : level === "advanced" ? "log-linear" : "log-power", coefficient: level === "advanced" || level === "expert" ? r(v+1) : parameter(v), shift: r(v%5-2), power: v%2+2 })),
  family("analysis-log-exp-derivative", "derivatives", "Pochodne logarytmu i funkcji wykładniczej", "Logarithmic and exponential derivatives", ["medium", "hard", "advanced", "expert"], (v, level) => ({ kind: "analysis-log-exp-derivative", mode: level === "medium" ? "log" : level === "hard" ? "exp" : level === "advanced" ? "log-abs" : "product", at: r(v - 11, 2), coefficient: parameter(v), shift: r(v % 3 + 1) })),
  family("analysis-concavity", "derivatives", "Druga pochodna i przegięcia", "Second derivative and inflection points", ["hard", "advanced", "expert"], (v, level) => ({ kind: "analysis-concavity", mode: level === "hard" ? "cubic" : level === "advanced" ? "quartic" : "mixed", at: r(v - 11, 2), coefficient: parameter(v), cubic: r(v % 3 + 1), shift: r(v % 5 - 2) })),
];

const sign = (x: Rational) => x.numerator > 0n ? "+" : "−";
export function presentAdvancedCalculus(p: AdvancedCalculusProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const work = (action: string, reason: string) => lesson.work(`${t("Wyprowadzamy: ", "Derivation: ")}${action}`, reason);
  const offset = (at: Rational) => `(x−(${f(at)}))`;
  if (p.kind === "analysis-lhospital-infinity") {
    const m=p.coefficient, b=p.shift;
    let expr:string, answer:Rational;
    if(p.mode==="linear"){
      expr=`((${f(m)})x+(${f(b)}))/x`; answer=m;
      work(`x→+∞: N→${m.numerator>0n?"+∞":"−∞"}, D→+∞; N'=${f(m)}, D'=1`,t("To iloraz nieskończoności. Funkcje są różniczkowalne dla dużych x, D'≠0 i iloraz pochodnych ma granicę.","This is an infinity quotient. Both functions are differentiable for large x, D'≠0, and the derivative quotient has a limit."));
      work(`lim N'/D'=${f(answer)}`,t("Jedno poprawne użycie reguły daje dokładną granicę.","One valid application yields the exact limit."));
    }else if(p.mode==="quadratic"){
      expr=`((${f(m)})x²+(${f(b)})x)/(x²+1)`; answer=m;
      work(`x→+∞: N→${m.numerator>0n?"+∞":"−∞"}, D→+∞; N'=2(${f(m)})x+(${f(b)}), D'=2x`,t("Iloraz ma postać nieskończoność przez nieskończoność; dla x>0 pochodna mianownika nie zeruje się.","The ratio has infinity-over-infinity form; for x>0 the denominator derivative is nonzero."));
      work(`x→+∞: N'→${m.numerator>0n?"+∞":"−∞"}, D'→+∞; N''=2(${f(m)}), D''=2`,t("Pierwszy iloraz pochodnych nadal ma postać ∞/∞. Ponownie sprawdzamy warunki: D''=2≠0.","The first derivative quotient still has ∞/∞ form. Verify the conditions again: D''=2≠0."));
      work(`lim N''/D''=${f(answer)}`,t("Drugie zastosowanie daje dokładny współczynnik wiodący.","The second application gives the exact leading coefficient."));
    }else if(p.mode==="log-linear"){
      expr=`ln(1+(${f(m)})x)/ln x`; answer=r(1);
      work(`x>1: 1+(${f(m)})x>0; N→+∞, D→+∞; N'=${f(m)}/(1+(${f(m)})x), D'=1/x`,t("Dodatni współczynnik zapewnia dziedzinę. Oba logarytmy rosną bez ograniczeń; D'≠0 dla x>1.","A positive coefficient ensures the domain. Both logarithms diverge; D'≠0 for x>1."));
      work(`N'/D'=(${f(m)})x/(1+(${f(m)})x)→1`,t("Po podzieleniu licznika i mianownika przez x otrzymujemy dokładną granicę 1.","Dividing numerator and denominator by x gives the exact limit 1."));
    }else{
      const k=p.power;expr=`ln(1+(${f(m)})x)/ln(1+x^${k})`;answer=div(r(1),r(k));
      work(`x>1: N→+∞, D→+∞; N'=${f(m)}/(1+(${f(m)})x), D'=${k}x^${k-1}/(1+x^${k})`,t("Oba argumenty logarytmów są dodatnie; pochodna mianownika nie zeruje się dla x>1.","Both logarithm arguments are positive; the denominator derivative is nonzero for x>1."));
      work(`N'/D'=(${f(m)})(1+x^${k})/(${k}x^${k-1}(1+(${f(m)})x))→${f(answer)}`,t("Najwyższe potęgi x^k mają współczynniki m i km, więc dokładna granica wynosi 1/k.","The highest x^k terms have coefficients m and km, so the exact limit is 1/k."));
    }
    return lesson.finish(t(`Oblicz granicę ${expr} przy x→+∞, sprawdzając warunki reguły de l’Hospitala.`, `Find the limit of ${expr} as x→+∞, checking the conditions for L’Hôpital’s rule.`),{kind:"scalar",value:answer},t("Potwierdź rzeczywistą postać ∞/∞ i dziedzinę.","Confirm a genuine ∞/∞ form and the domain."),t("Sprawdź niezerową pochodną mianownika i granicę ilorazu pochodnych.","Check the denominator derivative is nonzero and that the derivative quotient has a limit."));
  }
  if (p.kind === "analysis-lhospital") {
    const m = p.coefficient, h = offset(p.at);
    let expr: string, answer: Rational;
    if (p.mode === "polynomial-one") {
      expr = `((${f(m)})${h}+${h}²)/${h}`; answer = m;
      work(`N(${f(p.at)})=D(${f(p.at)})=0; N'=${f(m)}+2${h}, D'=1`, t("Dla x≠a funkcje są różniczkowalne w otoczeniu a, D' nie znika, a iloraz pochodnych ma granicę; stosujemy regułę do 0/0.", "For x≠a the functions are differentiable near a, D' is nonzero, and the derivative quotient has a limit; apply the rule to 0/0."));
      work(`lim N'/D'=${f(m)}`, t("Po jednym różniczkowaniu podstawiamy a; otrzymujemy dokładny wynik.", "After one differentiation substitute a to obtain the exact result."));
    } else if (p.mode === "polynomial-two") {
      expr = `(${h}²((${f(m)})+${h}))/${h}²`; answer = m;
      work(`N(a)=D(a)=0; N'=2${h}((${f(m)})+${h})+${h}², D'=2${h}`, t("Dla x≠a obie pochodne istnieją i D'≠0; pierwsze użycie reguły pozostawia 0/0.", "For x≠a both derivatives exist and D'≠0; the first application still leaves 0/0."));
      work(`N''=2(${f(m)})+6${h}, D''=2; lim N''/D''=${f(m)}`, t("Ponownie mamy 0/0; D'' jest niezerowe i iloraz drugich pochodnych ma granicę, więc drugie użycie jest uzasadnione.", "The remaining form is 0/0; D'' is nonzero and the second derivative quotient has a limit, justifying a second application."));
    } else if (p.mode === "exponential-one") {
      expr = `(e^((${f(m)})${h})−1)/${h}`; answer = m;
      work(`N(a)=e^0−1=0; D(a)=0; N'=${f(m)}e^((${f(m)})${h}), D'=1`, t("W całym otoczeniu a licznik i mianownik są różniczkowalne, D'≠0; stosujemy regułę tylko po stwierdzeniu 0/0.", "Both functions are differentiable near a and D'≠0; apply the rule only after establishing 0/0."));
      work(`lim N'/D'=${f(m)}e^0=${f(m)}`, t("Ciągłość funkcji wykładniczej daje wynik bez przybliżania liczby e.", "Continuity of the exponential gives the result without approximating e."));
    } else {
      expr = `(e^((${f(m)})${h})−1−(${f(m)})${h})/${h}²`; answer = div(mul(m, m), r(2));
      work(`N(a)=D(a)=0; N'=${f(m)}(e^((${f(m)})${h})−1), D'=2${h}`, t("Dla x≠a pochodna mianownika nie znika, lecz po pierwszym różniczkowaniu granica ma nadal postać 0/0.", "For x≠a the denominator derivative is nonzero, but the first quotient still has 0/0 form."));
      work(`N''=${f(mul(m,m))}e^((${f(m)})${h}), D''=2`, t("Drugi iloraz pochodnych istnieje; D''≠0 i ma granicę przy a, więc drugie użycie reguły jest poprawne.", "The second derivative quotient exists, D''≠0, and has a limit at a, so the second application is valid."));
      work(`lim N''/D''=${f(answer)}`, t("Ponieważ e^0=1, wynik jest dokładnym ułamkiem.", "Since e^0=1, the result is an exact rational."));
    }
    return lesson.finish(t(`Oblicz lim przy x→${f(p.at)} z ${expr} używając, gdy wolno, reguły de l’Hospitala.`, `Compute the limit as x→${f(p.at)} of ${expr}, applying L’Hôpital’s rule only when valid.`), { kind: "scalar", value: answer }, t("Sprawdź 0/0 oraz pochodną mianownika w usuniętym otoczeniu.", "Check 0/0 and the denominator derivative in the punctured neighborhood."), t("Gdy pierwsze pochodne nadal dają 0/0, sprawdź warunki ponownie.", "If the first derivatives still yield 0/0, verify the conditions again."));
  }
  if (p.kind === "analysis-log-exp-derivative") {
    const m = p.coefficient, h = offset(p.at), b = p.shift;
    let expr: string, answer: Rational;
    if (p.mode === "log") {
      expr = `ln(1+(${f(m)})${h})`; answer = m;
      work(`u=1+(${f(m)})${h}>0; u'=${f(m)}; f'=u'/u=${f(m)}/u`, t("Logarytm wymaga u>0; reguła łańcuchowa daje u'/u.", "The logarithm requires u>0; the chain rule gives u'/u."));
      work(`u(${f(p.at)})=1; f'(${f(p.at)})=${f(answer)}`, t("Punkt leży w dziedzinie, więc wolno podstawić.", "The point is in the domain, so substitution is valid."));
    } else if (p.mode === "exp") {
      expr = `e^((${f(m)})${h})`; answer = m;
      work(`u=(${f(m)})${h}; u'=${f(m)}; f'=u'e^u`, t("Funkcja wykładnicza jest określona dla każdego rzeczywistego u; stosujemy regułę łańcuchową.", "The exponential is defined for every real u; apply the chain rule."));
      work(`u(${f(p.at)})=0; f'(${f(p.at)})=${f(m)}e^0=${f(answer)}`, t("Ponieważ e^0=1 dokładnie, wynik jest wymierny.", "Because e^0 is exactly one, the result is rational."));
    } else if (p.mode === "log-abs") {
      expr = `ln|−1+(${f(m)})${h}|`; answer = sub(r(0), m);
      work(`u=−1+(${f(m)})${h}≠0; u'=${f(m)}; f'=u'/u`, t("ln|u| wymaga u≠0, a nie u>0; pochodna po obu stronach zera to u'/u.", "ln|u| requires u≠0 rather than u>0; on both sides of zero its derivative is u'/u."));
      work(`u(${f(p.at)})=−1; f'(${f(p.at)})=${f(answer)}`, t("Ujemny argument u jest dopuszczalny dzięki modułowi; punkt nie jest zerem u.", "The negative u is allowed by the absolute value; the point is not a zero of u."));
    } else {
      expr = `e^((${f(m)})${h})(1+(${f(b)})${h})`; answer = add(m,b);
      work(`u=(${f(m)})${h}, v=1+(${f(b)})${h}; (e^u v)'=e^u(u'v+v')`, t("Łączymy regułę iloczynu i łańcuchową; obie funkcje są określone na R.", "Combine product and chain rules; both factors are defined on R."));
      work(`f'(${f(p.at)})=e^0(${f(m)}+${f(b)})=${f(answer)}`, t("W punkcie u=0 i v=1; dodajemy dokładne współczynniki.", "At the point u=0 and v=1; add the exact coefficients."));
    }
    return lesson.finish(t(`Dla f(x)=${expr} oblicz dokładnie f'(${f(p.at)}).`, `For f(x)=${expr}, find the exact value of f'(${f(p.at)}).`), { kind: "scalar", value: answer }, t("Ustal dziedzinę i funkcję wewnętrzną.", "Check the domain and identify the inner function."), t("Użyj reguły łańcuchowej, a przy iloczynie także reguły iloczynu.", "Use the chain rule and, for a product, the product rule."));
  }
  const m = p.coefficient, a = p.at, h = offset(a), c = p.shift;
  let expr: string, answer: AnswerSpec;
  if (p.mode === "cubic") {
    expr = `(${f(m)})${h}³+(${f(c)})`; answer = { kind: "scalar", value: a };
    work(`f'=3(${f(m)})${h}²; f''=6(${f(m)})${h}`, t("Stosujemy dwukrotnie regułę potęgową; dziedzina to R.", "Apply the power rule twice; the domain is R."));
    work(`f''=0 ⇔ x=${f(a)}; x<${f(a)}: ${m.numerator > 0n ? "−" : "+"}; x>${f(a)}: ${sign(m)}`, t("f'' zmienia znak na x=a, dlatego jest to rzeczywisty punkt przegięcia; na przedziale z f''>0 funkcja jest wypukła.", "f'' changes sign at x=a, so this is a genuine inflection; f''>0 marks a convex interval."));
  } else if (p.mode === "quartic") {
    expr = `(${f(m)})${h}⁴+(${f(c)})`; answer = { kind: "choice", value: "inflection-none", options: [{ value: "inflection-none", label: "∄" }, { value: "inflection-at", label: `x=${f(a)}` }] };
    work(`f'=4(${f(m)})${h}³; f''=12(${f(m)})${h}²`, t("Dwukrotne różniczkowanie daje kwadrat czynnika x−a.", "Differentiating twice yields a squared x−a factor."));
    work(`f''(${f(a)})=0; x<${f(a)}: ${sign(m)}; x>${f(a)}: ${sign(m)}`, t("Znak nie zmienia się przy zerze kwadratowym; punkt stacjonarny f'' nie musi być przegięciem.", "The sign does not change at a squared zero; a zero of f'' need not be an inflection."));
  } else {
    const other = sub(a, div(p.cubic, mul(r(2),m)));
    const lo = compare(a,other)<0 ? a : other, hi = compare(a,other)<0 ? other : a;
    expr = `(${f(m)})${h}⁴+(${f(p.cubic)})${h}³+(${f(c)})`;
    answer = { kind: "roots", values: [lo,hi] };
    work(`f'=4(${f(m)})${h}³+3(${f(p.cubic)})${h}²`, t("Różniczkujemy każdy jednomian, nie pomijając składnika sześciennego.", "Differentiate each monomial, including the cubic term."));
    work(`f''=12(${f(m)})${h}²+6(${f(p.cubic)})${h}=6${h}(2(${f(m)})${h}+(${f(p.cubic)}))`, t("Wyłączamy czynnik liniowy; współczynniki i pierwiastki pozostają dokładne.", "Factor out the linear term; coefficients and roots remain exact."));
    work(`f''=0 ⇔ x=${f(lo)} lub x=${f(hi)}; (−∞,${f(lo)}): ${sign(m)}; (${f(lo)},${f(hi)}): ${m.numerator > 0n ? "−" : "+"}; (${f(hi)},+∞): ${sign(m)}`.replace(" lub ", t(" lub ", " or ")), t("Oba zera są proste i różne, więc przy każdym znak się zmienia. Dodatni f'' oznacza wypukłość, ujemny wklęsłość.", "Both roots are simple and distinct, so the sign changes at each. Positive f'' means convexity, negative f'' concavity."));
  }
  return lesson.finish(t(`Dla f(x)=${expr} wyznacz wszystkie współrzędne x punktów przegięcia.`, `For f(x)=${expr}, find all x-coordinates of inflection points.`), answer, t("Oblicz f'' i wyznacz jej zera.", "Find f'' and its zeros."), t("Sprawdź znak po obu stronach każdego zera; samo f''=0 nie wystarcza.", "Check the sign on both sides of each zero; f''=0 alone is insufficient."));
}
