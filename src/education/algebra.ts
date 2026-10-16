import { rational as r, addRational, divideRational } from "../rational";
import { formatRational as f } from "../answers";
import { lesson, levelIndex, number as n, signed, polynomial, type EducationTemplate } from "./types";

const coefficients = ["Współczynnik przy x²", "Współczynnik przy x", "Wyraz wolny"];
function quadratic(v: number, d: number) {
  const kind = v % 3, q = d === 2 ? 2 : 1, multiplier = d + 1;
  const root1 = -(Math.floor(v / 3) + 1), root2 = kind === 1 ? root1 : v % 4 + 1;
  const a = multiplier * q * q;
  const b = -multiplier * q * (root1 + root2);
  const c = kind === 2 ? Math.floor(b * b / (4 * a)) + 1 + v : multiplier * root1 * root2;
  const delta = b * b - 4 * a * c;
  return { a, b, c, delta, root1, root2, q, sqrtDelta: multiplier * q * Math.abs(root1 - root2) };
}

export const algebraTemplates: EducationTemplate[] = [
  { id: "algebra-negative-brackets", category: "algebra", title: "Minus przed nawiasem", create: (v, level) => {
    const d = levelIndex(level), a = -(v % 4 + 1) * (d + 1), b = (Math.floor(v / 4) + 1) * (v % 2 ? -1 : 1);
    return lesson({ a, b }, `Rozwiń ${n(a)}(x ${signed(b)}). Podaj współczynnik przy x i wyraz wolny.`,
      { kind: "list", values: [r(a), r(a * b)], labels: coefficients.slice(1) },
      `Mnożnik dotyczy każdego składnika: (${n(a)})·x = ${n(a)}x oraz (${n(a)})·(${n(b)}) = ${n(a * b)}. Wynik: ${n(a)}x ${signed(a * b)}. Przy mnożeniu dwóch minusów otrzymujemy plus.`,
      "Pomnóż każdy składnik nawiasu przez liczbę stojącą przed nawiasem.", "Oddziel obliczenie współczynnika przy x od obliczenia wyrazu wolnego; pilnuj znaków obu iloczynów.");
  } },
  { id: "algebra-monomials", category: "algebra", title: "Jednomiany i wykładniki", create: (v, level) => {
    const d = levelIndex(level), a = v % 4 + 2, b = d === 0 ? 1 : (Math.floor(v / 4) + 1) * (v % 2 ? -1 : 1);
    const p = v % 3 + 1, q = Math.floor(v / 3) % 3 + 1 + d;
    return lesson({ a, b, p, q }, `Pomnóż (${n(a)}x^${p}) · (${n(b)}x^${q}). Podaj współczynnik i wykładnik x.`,
      { kind: "list", values: [r(a * b), r(p + q)], labels: ["Współczynnik", "Wykładnik x"] },
      `Współczynniki mnożymy: (${n(a)})·(${n(b)}) = ${n(a * b)}. Przy tej samej podstawie dodajemy wykładniki: x^${p}·x^${q} = x^(${p}+${q}) = x^${p + q}. Wynik to ${n(a * b)}x^${p + q}. W szczególności x·x = x², więc 2x·x = 2x².`,
      "Rozdziel mnożenie liczb od mnożenia potęg o tej samej podstawie.", "Wykładniki dodajemy, a współczynniki mnożymy — to dwie różne operacje.");
  } },
  { id: "algebra-polynomial-product", category: "algebra", title: "Iloczyn nawiasów z x", create: (v, level) => {
    const d = levelIndex(level), a = v % 3 + 1 + d, b = (Math.floor(v / 3) + 1) * (v % 2 ? -1 : 1), c = (Math.floor(v / 8) + 1 + d) * (d === 2 ? -1 : 1);
    return lesson({ a, b, c }, `Rozwiń (${a}x ${signed(b)})(x ${signed(c)}). Wpisz współczynniki a, b, c wielomianu ax² + bx + c.`,
      { kind: "list", values: [r(a), r(a * c + b), r(b * c)], labels: coefficients },
      `Pomnóż każdy składnik pierwszego nawiasu przez każdy składnik drugiego: ${a}x·x = ${a}x², ${a}x·(${n(c)}) = ${n(a * c)}x, (${n(b)})·x = ${n(b)}x, (${n(b)})·(${n(c)}) = ${n(b * c)}. Połącz jednomiany: ${n(a * c)}x ${signed(b)}x = ${n(a * c + b)}x. Wynik: ${polynomial(a, a * c + b, b * c)}.`,
      "Przygotuj cztery iloczyny. Dopiero potem połącz wyrazy przy tej samej potędze x.", "Współczynnik przy x powstaje z sumy dwóch iloczynów; nie pomijaj żadnego z nich.");
  } },
  { id: "equation-fraction-balance", category: "equations", title: "Przenoszenie ułamka w równaniu", create: (v, level) => {
    const d = levelIndex(level), xN = (v + 1) * (v % 2 ? -1 : 1), xD = d === 2 ? 2 : 1, s = v % 3 + 2, p = d + 1, q = v % 4 + 2;
    const x = r(xN, xD), rhs = addRational(divideRational(x, r(s)), r(p, q));
    return lesson({ xN, xD, s, p, q }, `Rozwiąż x/${s} + ${p}/${q} = ${f(rhs)}. Podaj x.`, { kind: "scalar", value: x },
      `Odejmij ${p}/${q} po obu stronach: x/${s} = ${f(rhs)} − ${p}/${q} = ${f(divideRational(x, r(s)))}. Następnie pomnóż obie strony przez ${s}: x = ${f(x)}. Wykonanie tej samej operacji po obu stronach zachowuje równość.`,
      "Najpierw usuń dodawany ułamek, wykonując tę samą operację po obu stronach.", `Po odjęciu ${p}/${q} pomnóż obie strony przez ${s}.`);
  } },
  ...([1, -1] as const).map((sign): EducationTemplate => ({
    id: sign === 1 ? "quadratic-square-sum" : "quadratic-square-difference", category: "quadratics",
    title: sign === 1 ? "Kwadrat sumy" : "Kwadrat różnicy", create: (v, level) => {
      const a = (v % 4 + 1) * (levelIndex(level) + 1), b = Math.floor(v / 4) + 1;
      return lesson({ a, b, sign }, `Rozwiń (${a}x ${sign === 1 ? "+" : "−"} ${b})². Wpisz współczynniki przy x², x i wyraz wolny.`,
        { kind: "list", values: [r(a * a), r(sign * 2 * a * b), r(b * b)], labels: coefficients },
        `Użyj wzoru (u ${sign === 1 ? "+" : "−"} v)² = u² ${sign === 1 ? "+" : "−"} 2uv + v². Tutaj u = ${a}x i v = ${b}. Kwadrat pierwszego składnika: ${a * a}x². Podwójny iloczyn ze znakiem: ${n(sign * 2 * a * b)}x. Kwadrat drugiego: ${b * b}. Wynik: ${polynomial(a * a, sign * 2 * a * b, b * b)}.`,
        "Przypomnij sobie trzy składniki wzoru: dwa kwadraty i podwójny iloczyn.", "Nie pomijaj 2uv. W kwadracie różnicy ostatni składnik nadal jest dodatni.");
    },
  })),
  { id: "quadratic-difference-squares", category: "quadratics", title: "Różnica kwadratów", create: (v, level) => {
    const a = (v % 4 + 1) * (levelIndex(level) + 1), b = Math.floor(v / 4) + 1;
    const options = [{ value: "product", label: `(${a}x − ${b})(${a}x + ${b})` },
      { value: "minus-square", label: `(${a}x − ${b})²` }, { value: "plus-square", label: `(${a}x + ${b})²` }];
    const shift = v % 3;
    return lesson({ a, b }, `Wybierz rozkład (${a}x)² − ${b}² na czynniki.`,
      { kind: "choice", value: "product", options: [...options.slice(shift), ...options.slice(0, shift)] },
      `u² − v² = (u − v)(u + v). Po podstawieniu u = ${a}x i v = ${b} otrzymasz (${a}x − ${b})(${a}x + ${b}). Wyrazy mieszane znoszą się: +${a * b}x i −${a * b}x. Pozostaje ${a * a}x² − ${b * b}. To nie jest kwadrat różnicy.`,
      "Rozpoznaj dwa kwadraty rozdzielone minusem.", "Sprawdź, czy po wymnożeniu nawiasów wyrazy przy x się znoszą.");
  } },
  { id: "quadratic-discriminant", category: "quadratics", title: "Obliczanie delty", create: (v, level) => {
    const p = quadratic(v, levelIndex(level)), { a, b, c, delta } = p;
    return lesson(p, `Oblicz Δ dla równania ${polynomial(a, b, c)} = 0.`, { kind: "scalar", value: r(delta) },
      `Odczytaj a = ${a}, b = ${n(b)}, c = ${n(c)} ze znakami. Δ = b² − 4ac = (${n(b)})² − 4·(${a})·(${n(c)}) = ${b * b} − (${n(4 * a * c)}) = ${n(delta)}.`,
      "Odczytaj współczynniki wraz ze znakami i zapisz Δ = b² − 4ac.", "Podnosząc ujemne b do kwadratu użyj nawiasów; odejmujesz cały iloczyn 4ac.");
  } },
  { id: "quadratic-delta-sign", category: "quadratics", title: "Znak delty i liczba pierwiastków", create: (v, level) => {
    const p = quadratic(v, levelIndex(level)), { a, b, c, delta } = p;
    return lesson(p, `Ile pierwiastków rzeczywistych ma równanie ${polynomial(a, b, c)} = 0?`,
      { kind: "choice", value: delta > 0 ? "two" : delta === 0 ? "double" : "none", options: [
        { value: "two", label: "Dwa różne pierwiastki rzeczywiste" }, { value: "double", label: "Jeden pierwiastek podwójny" }, { value: "none", label: "Brak pierwiastków rzeczywistych" }] },
      `Δ = (${n(b)})² − 4·(${a})·(${n(c)}) = ${n(delta)}. Dla Δ > 0 są dwa różne pierwiastki, dla Δ = 0 jeden podwójny, a dla Δ < 0 brak pierwiastków rzeczywistych. Tutaj Δ ${delta > 0 ? ">" : delta < 0 ? "<" : "="} 0.`,
      "Oblicz deltę, a następnie porównaj ją z zerem.", "W tym pytaniu nie musisz obliczać wartości pierwiastków — decyduje znak delty.");
  } },
  { id: "quadratic-roots", category: "quadratics", title: "Rozwiązywanie równania kwadratowego", create: (v, level) => {
    const p = quadratic(v, levelIndex(level)), { a, b, c, delta, q, root1, root2, sqrtDelta } = p;
    const roots = delta < 0 ? [] : delta === 0 ? [r(root1, q)] : [r(root1, q), r(root2, q)];
    return lesson(p, `Rozwiąż w liczbach rzeczywistych: ${polynomial(a, b, c)} = 0. Wybierz liczbę pierwiastków i podaj ich wartości, jeśli istnieją.`,
      { kind: "roots", values: roots },
      `Δ = (${n(b)})² − 4·(${a})·(${n(c)}) = ${n(delta)}. ` + (delta < 0 ? "Δ < 0, więc nie ma pierwiastków rzeczywistych." : delta === 0
        ? `Δ = 0, więc x₀ = −b/(2a) = ${n(-b)}/${2 * a} = ${f(roots[0])}. To pierwiastek podwójny.`
        : `√Δ = ${sqrtDelta}. Użyj x = (−b ± √Δ)/(2a): (${n(-b)} − ${sqrtDelta})/${2 * a} = ${f(roots[0])}, (${n(-b)} + ${sqrtDelta})/${2 * a} = ${f(roots[1])}. Oba wyniki spełniają równanie.`),
      "Najpierw oblicz Δ; jej znak rozstrzyga, czy i ile wartości trzeba wyznaczyć.", "Gdy Δ ≥ 0, cały licznik −b ± √Δ dzielimy przez 2a. Gdy Δ < 0, nie szukamy przybliżeń rzeczywistych.");
  } },
];
