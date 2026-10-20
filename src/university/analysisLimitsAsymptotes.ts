import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Locale } from "../locales/types";
import type { AsymptoteProblem, UniversityFamily } from "./schema";
import { teaching } from "./teaching";

const zero = (x: Rational) => x.numerator === 0n;
const key = (x: Rational) => `${x.numerator}/${x.denominator}`;
const nonzero = (v: number) => r(v < 11 ? v - 11 : v - 10);
const family = (id: string, category: "sequence-limits" | "function-limits", pl: string, en: string, levels: UniversityFamily["supportedDifficulties"], create: UniversityFamily["create"]): UniversityFamily => ({ id, category, titles: { pl, en }, supportedDifficulties: levels, create });
export const asymptoteFamilies: readonly UniversityFamily[] = [
  family("analysis-euler-sequence", "sequence-limits", "Granica Eulera ciągu", "Euler limit of a sequence", ["medium", "hard", "advanced", "expert"], (v, d) => ({ kind: "analysis-euler", variable: "sequence", mode: d === "medium" ? "basic" : d === "hard" ? "scaled" : d === "advanced" ? "ratio" : "offset", a: nonzero(v), b: r(v % 3 + 2, d === "expert" ? 2 : 1), c: d === "advanced" || d === "expert" ? (d === "expert" && v % 6 === 0 ? nonzero(v) : sub(nonzero(v), r(v % 3 + 1))) : r(0) })),
  family("analysis-euler-function", "function-limits", "Granica Eulera funkcji", "Euler limit of a function", ["medium", "hard", "advanced", "expert"], (v, d) => ({ kind: "analysis-euler", variable: "function", mode: d === "medium" ? "basic" : d === "hard" ? "scaled" : d === "advanced" ? "ratio" : "offset", a: nonzero(v), b: r(v % 3 + 2, d === "expert" ? 2 : 1), c: d === "advanced" || d === "expert" ? (d === "expert" && v % 6 === 0 ? nonzero(v) : sub(nonzero(v), r(v % 3 + 1))) : r(0) })),
  family("analysis-asymptote-vertical", "function-limits", "Asymptota pionowa lub dziura", "Vertical asymptote or removable hole", ["medium", "hard", "advanced"], (v, d) => ({ kind: "analysis-asymptote-vertical", mode: d === "medium" ? "simple" : d === "hard" ? "double" : v % 3 === 0 ? "hole" : "cancellation", at: r(v - 11), coefficient: r((v % 3 + 1) * (v % 2 ? -1 : 1)) })),
  family("analysis-asymptote-horizontal", "function-limits", "Asymptoty poziome w obu kierunkach", "Horizontal asymptotes in both directions", ["medium", "hard", "advanced"], (v, d) => ({ kind: "analysis-asymptote-horizontal", mode: d === "medium" ? "rational" : d === "hard" ? "radical" : v % 3 === 0 ? "linear" : "radical", a: r(v - 11), b: d === "advanced" ? r(v % 3 + 1, v % 3 + 2) : r(v % 3 + 1), c: nonzero(v) })),
  family("analysis-asymptote-oblique", "function-limits", "Asymptota ukośna i pozioma", "Oblique and horizontal asymptotes", ["advanced", "expert"], (v, d) => ({ kind: "analysis-asymptote-oblique", mode: d === "advanced" ? "rational" : v % 4 === 0 ? "quadratic" : "radical", a: r(v % 3 + 1), b: r(v - 11), c: r(v % 5 - 2), at: r(v % 7 - 3) })),
];

const exponentAnswer = (q: Rational): AnswerSpec => {
  if (zero(q)) return { kind: "scalar", value: r(1) };
  const candidates = [q, add(q, r(1)), sub(q, r(1)), mul(q, r(-1)), r(0)];
  return { kind: "choice", value: `exp:${key(q)}`, options: [...new Map(candidates.map(x => [`exp:${key(x)}`, { value: `exp:${key(x)}`, label: zero(x) ? "1" : `e^(${f(x)})` }])).values()] };
};
type Line = { slope: Rational; intercept: Rational } | null;
const lineKey = (line: Line) => line === null ? "none" : `line:${key(line.slope)}:${key(line.intercept)}`;
const lineText = (line: Line) => line === null ? "∄" : zero(line.slope) ? `y=${f(line.intercept)}` : `y=(${f(line.slope)})x+(${f(line.intercept)})`;
const pairAnswer = (positive: Line, negative: Line): AnswerSpec => {
  const option = (p: Line, n: Line) => ({ value: `plus:${lineKey(p)}|minus:${lineKey(n)}`, label: `+∞: ${lineText(p)}; −∞: ${lineText(n)}` });
  const choices = [option(positive, negative), option(negative, positive), option(null, null), option(positive, null), option(null, negative), option({ slope: r(0), intercept: r(0) }, { slope: r(0), intercept: r(0) })];
  return { kind: "choice", value: choices[0].value, options: [...new Map(choices.map(x => [x.value, x])).values()] };
};
const verticalAnswer = (at: Rational, left: string, right: string): AnswerSpec => ({ kind: "choice", value: left === "none" ? "asymptote-none" : `${left}:${right}`, options: [{ value: "asymptote-none", label: "∄" }, ...[["+∞", "−∞"], ["−∞", "+∞"], ["+∞", "+∞"], ["−∞", "−∞"]].map(([l, rr]) => ({ value: `${l}:${rr}`, label: `x=${f(at)}; lim₋=${l}, lim₊=${rr}` }))] });

export function presentAsymptote(p: AsymptoteProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const work = (action: string, reason: string) => lesson.work(`${t("Wyprowadzamy: ", "Derivation: ")}${action}`, reason);
  if (p.kind === "analysis-euler") {
    const difference = p.mode === "basic" || p.mode === "scaled" ? p.a : sub(p.a, p.c);
    const q = mul(difference, p.mode === "basic" ? r(1) : p.b);
    const expr = p.variable === "sequence"
      ? p.mode === "basic" ? `(1+(${f(p.a)})/n)^n` : p.mode === "scaled" ? `(1+(${f(p.a)})/n)^(${f(p.b)}n)` : `((n+(${f(p.a)}))/(n+(${f(p.c)})))^(${f(p.b)}n${p.mode === "offset" ? "+1" : ""})`
      : p.mode === "basic" ? `(1+(${f(p.a)})x)^(1/x)` : p.mode === "scaled" ? `(1+(${f(p.a)})x)^(${f(p.b)}/x)` : `((1+(${f(p.a)})x)/(1+(${f(p.c)})x))^(${f(p.b)}/x${p.mode === "offset" ? "+1" : ""})`;
    work(p.variable === "sequence" ? t("n→+∞: podstawa jest dodatnia dla dostatecznie dużych n", "n→+∞: the base is positive for all sufficiently large n") : t("x→0: licznik i mianownik podstawy są dodatnie w małym otoczeniu", "x→0: numerator and denominator of the base are positive nearby"), t("Możemy bezpiecznie logarytmować dodatnią podstawę potęgi.", "The positive power base permits taking logarithms."));
    if (p.mode === "ratio" || p.mode === "offset") work(p.variable === "sequence" ? `(n+a)/(n+c)=1+(${f(difference)})/(n+(${f(p.c)}))` : `(1+ax)/(1+cx)=1+(${f(difference)})x/(1+(${f(p.c)})x)`, t("Dokładna tożsamość sprowadza podstawę do 1+t przy t→0.", "An exact identity rewrites the base as 1+t with t→0."));
    if (zero(difference)) {
      work("t=0 ⇒ 1+t=1", t("Równe współczynniki licznika i mianownika dają podstawę równą dokładnie 1 wszędzie, gdzie wyrażenie jest określone.", "Equal numerator and denominator coefficients make the base exactly 1 wherever the expression is defined."));
      work("L=1; ln L=0", t("Każda potęga podstawy 1 jest równa 1; nie dzielimy przez t=0.", "Every power of base 1 equals 1; no division by t=0 is used."));
    } else {
      work(`ln L=lim [E·t·ln(1+t)/t]=${f(q)}`, t("ln(1+t)/t→1; E·t dąży do wskazanego dokładnego iloczynu, a stały dodatek wykładnika zanika.", "ln(1+t)/t→1; E·t approaches the exact coefficient product, while a constant exponent offset vanishes."));
      work(`L=e^(${f(q)})`, t("Wynik zachowujemy symbolicznie, bez przybliżenia e.", "Keep the result symbolic without approximating e."));
    }
    return lesson.finish(t(`Oblicz dokładnie granicę ${expr} przy ${p.variable === "sequence" ? "n→+∞" : "x→0"}.`, `Find the exact limit of ${expr} as ${p.variable === "sequence" ? "n→+∞" : "x→0"}.`), exponentAnswer(q), zero(difference) ? t("Sprawdź, czy licznik i mianownik podstawy są identyczne.", "Check whether the numerator and denominator of the base are identical.") : t("Zapisz dodatnią podstawę jako 1+t, gdzie t→0.", "Write the positive base as 1+t with t→0."), zero(difference) ? t("Jeśli podstawa jest dokładnie równa 1, cała potęga też jest równa 1.", "If the base is exactly 1, the entire power is also 1.") : t("Policz lim E·t i użyj ln(1+t)/t→1.", "Compute lim E·t and use ln(1+t)/t→1."));
  }
  if (p.kind === "analysis-asymptote-vertical") {
    const expr = p.mode === "hole" ? `((x−(${f(p.at)}))(x+(${f(p.coefficient)})))/(x−(${f(p.at)}))` : p.mode === "cancellation" ? `((${f(p.coefficient)})(x−(${f(p.at)})))/(x−(${f(p.at)}))²` : `${f(p.coefficient)}/(x−(${f(p.at)}))${p.mode === "double" ? "²" : ""}`;
    const positive = p.coefficient.numerator > 0n;
    const left = p.mode === "hole" ? "none" : p.mode === "double" ? positive ? "+∞" : "−∞" : positive ? "−∞" : "+∞";
    const right = p.mode === "hole" ? "none" : positive ? "+∞" : "−∞";
    work(`x≠${f(p.at)}`, t("Najpierw wykluczamy zero mianownika z dziedziny.", "First exclude the denominator zero from the domain."));
    work(p.mode === "hole" ? `f(x)=x+(${f(p.coefficient)}) (x≠${f(p.at)}); lim₋f=lim₊f=${f(add(p.at,p.coefficient))}` : p.mode === "cancellation" ? `f(x)=${f(p.coefficient)}/(x−(${f(p.at)})) (x≠${f(p.at)}); lim₋f=${left}; lim₊f=${right}` : `x→${f(p.at)}⁻: f→${left}; x→${f(p.at)}⁺: f→${right}`, p.mode === "hole" ? t("Po skróceniu granica jest skończona: dziura nie jest asymptotą.", "Cancellation gives a finite limit: a hole is not an asymptote.") : p.mode === "double" ? t("Kwadrat mianownika jest dodatni z obu stron; znak wyznacza licznik.", "The squared denominator is positive on both sides; the numerator sets the sign.") : t("Skróć wspólny czynnik poza punktem wykluczonym; pozostały mianownik liniowy zmienia znak.", "Cancel the common factor away from the excluded point; the remaining linear denominator changes sign."));
    work(left === "none" ? t("brak asymptoty pionowej", "no vertical asymptote") : `x=${f(p.at)}`, t("Asymptota pionowa wymaga nieskończonej granicy jednostronnej.", "A vertical asymptote requires an infinite one-sided limit."));
    return lesson.finish(t(`Dla f(x)=${expr} ustal asymptotę pionową w x=${f(p.at)} i obie granice jednostronne.`, `For f(x)=${expr}, determine the vertical asymptote at x=${f(p.at)} and both one-sided limits.`), verticalAnswer(p.at, left, right), t("Sprawdź dziedzinę i granice z lewej oraz prawej.", "Check the domain and both one-sided limits."), t("Skończona granica po skróceniu oznacza dziurę, nie asymptotę.", "A finite limit after cancellation gives a hole, not an asymptote."));
  }
  if (p.kind === "analysis-asymptote-horizontal") {
    let expr: string, plus: Line, minus: Line;
    if (p.mode === "rational") {
      const remainder = sub(p.b, mul(p.a, p.c));
      expr = `((${f(p.a)})x+(${f(p.b)}))/(x+(${f(p.c)}))`;
      plus = minus = { slope: r(0), intercept: p.a };
      work(`f(x)=${f(p.a)}+(${f(remainder)})/(x+(${f(p.c)}))`, t("Dokładne dzielenie oddziela stały iloraz od reszty.", "Exact division separates the constant quotient from the remainder."));
      work(`x→±∞: reszta/(x+c)→0; L₊=L₋=${f(p.a)}`.replace("reszta", t("reszta", "remainder")), t("Mianownik rośnie co do modułu w obu kierunkach.", "The denominator grows in magnitude in both directions."));
    } else if (p.mode === "radical") {
      expr = `(${f(p.a)})+(${f(p.b)})x/√(x²+1)`;
      plus = { slope: r(0), intercept: add(p.a, p.b) }; minus = { slope: r(0), intercept: sub(p.a, p.b) };
      work("√(x²+1)=|x|√(1+1/x²)", t("Wyłączamy |x|, nie x; znak zależy od kierunku.", "Factor out |x|, not x; the sign depends on direction."));
      work(`x→+∞: x/|x|→1, L₊=${f(add(p.a, p.b))}; x→−∞: x/|x|→−1, L₋=${f(sub(p.a, p.b))}`, t("Drugi pierwiastek dąży do 1; granice po dwóch stronach mogą być różne.", "The remaining root tends to 1; the two directional limits may differ."));
    } else {
      expr = `(${f(p.b)})x+(${f(p.a)})`;
      plus = minus = null;
      work(`${f(p.b)}>0; f(x)→+∞ przy x→+∞ i f(x)→−∞ przy x→−∞`.replaceAll(" przy ", t(" przy ", " as ")).replace(" i ", t(" i ", " and ")), t("Niezerowe dodatnie nachylenie wyklucza skończoną granicę w obu kierunkach.", "A positive nonzero slope precludes a finite limit in both directions."));
    }
    work(`+∞: ${lineText(plus)}; −∞: ${lineText(minus)}`, t("Każdy kierunek oceniamy osobno; brak skończonej granicy oznacza brak poziomej asymptoty.", "Evaluate each direction separately; no finite limit means no horizontal asymptote."));
    return lesson.finish(t(`Wyznacz asymptoty poziome f(x)=${expr} przy x→+∞ i x→−∞.`, `Find the horizontal asymptotes of f(x)=${expr} as x→+∞ and x→−∞.`), pairAnswer(plus, minus), t("Policz dwie granice niezależnie.", "Calculate the two limits separately."), t("Dla √(x²+1) użyj |x|√(1+1/x²).", "For √(x²+1), use |x|√(1+1/x²)."));
  }
  let expr: string, plus: Line, minus: Line;
  if (p.mode === "rational") {
    const intercept = add(p.b, mul(p.a, p.at)), remainder = add(p.c, mul(p.at, intercept));
    expr = `((${f(p.a)})x²+(${f(p.b)})x+(${f(p.c)}))/(x−(${f(p.at)}))`;
    plus = minus = { slope: p.a, intercept };
    work(`f(x)=(${f(p.a)})x+(${f(intercept)})+(${f(remainder)})/(x−(${f(p.at)}))`, t("Dzielenie wielomianów daje dokładny liniowy iloraz i stałą resztę.", "Polynomial division gives an exact linear quotient and constant remainder."));
    work(`lim f(x)/x=${f(p.a)}; lim(f(x)−ax)=${f(intercept)}; R/(x−d)→0`, t("Reszta przez liniowy mianownik zanika w obu nieskończonościach.", "The remainder over a linear denominator vanishes in both directions."));
  } else if (p.mode === "radical") {
    expr = `√(x²+1)+x+(${f(p.b)})`;
    plus = { slope: r(2), intercept: p.b }; minus = { slope: r(0), intercept: p.b };
    work("√(x²+1)−|x|=1/(√(x²+1)+|x|)→0", t("Sprzężenie daje dokładną tożsamość i dowodzi zanikania reszty.", "Conjugation gives an exact identity and proves the remainder vanishes."));
    work(`x→+∞: |x|=x ⇒ y=2x+(${f(p.b)}); x→−∞: |x|=−x ⇒ y=${f(p.b)}`, t("Przy −∞ nachylenie wynosi zero, więc otrzymujemy asymptotę poziomą.", "At −∞ the slope is zero, giving a horizontal asymptote."));
  } else {
    expr = `x²+(${f(p.b)})x+(${f(p.c)})`;
    plus = minus = null;
    work(`f(x)/x=x+(${f(p.b)})+(${f(p.c)})/x`, t("Iloraz nie ma skończonej granicy w żadnym kierunku, więc nie ma liniowego współczynnika kierunkowego.", "The quotient lacks a finite limit in either direction, so no linear slope exists."));
  }
  work(`+∞: ${lineText(plus)}; −∞: ${lineText(minus)}`, t("Nachylenie zero oznacza poziomą, nie ukośną asymptotę; brak prostej oznaczamy jawnie.", "A zero slope means horizontal, not oblique; an absent line is stated explicitly."));
  return lesson.finish(t(`Wyznacz asymptoty liniowe f(x)=${expr} przy x→+∞ i x→−∞.`, `Find the linear asymptotes of f(x)=${expr} as x→+∞ and x→−∞.`), pairAnswer(plus, minus), t("Osobno oblicz a=lim f(x)/x dla obu kierunków.", "Compute a=lim f(x)/x separately in both directions."), t("Następnie oblicz b=lim(f(x)−ax); reszta musi dążyć do zera.", "Then compute b=lim(f(x)−ax); the remainder must vanish."));
}
