import { rational as r, addRational as add, subtractRational as sub, type Rational } from "../rational";
import { formatRational as f } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";
import { rightRay, leftRay, outside, intersection, excludePoints, setAnswer, setText, type RealSet } from "./realSets";

export type FunctionDomainExtraProblem =
  | Readonly<{kind:"function-tangent-domain"; factor:number; shift:Rational; pole:Rational|null}>
  | Readonly<{kind:"function-mixed-domain"; p:Rational; q:Rational; boundary:Rational; base:Rational; mode:"root-log"|"product-log"|"product-root-log"}>;

const shifts = [r(1,4), r(-1,4), r(1,8), r(3,8)] as const;
function tangent(v:number, difficulty:Difficulty):FunctionDomainExtraProblem {
  const factor = difficulty==="easy" ? v+1 : 1+(v%6);
  const shift = difficulty==="easy" ? r(0) : shifts[Math.floor(v/6)];
  const pole = difficulty==="hard" ? r(v-11,2) : null;
  return {kind:"function-tangent-domain",factor,shift,pole};
}
function mixed(v:number,difficulty:Difficulty):FunctionDomainExtraProblem {
  const p=r(v-11,difficulty==="easy"?1:2);
  const q=add(p,r(1+(v%4),2));
  const boundary=add(p,r(v%5-2,2));
  return {kind:"function-mixed-domain",p,q,boundary,base:difficulty==="hard"&&v%2?r(1,2):r(2),
    mode:difficulty==="easy"?"root-log":difficulty==="medium"?"product-log":"product-root-log"};
}
export const functionDomainExtraFamilies:readonly UniversityFamily[] = [
  {id:"function-tangent-domain",category:"functions",
    titles:{pl:"Dziedzina tangensa i wykluczenia okresowe",en:"Tangent domain and periodic exclusions"},
    supportedDifficulties:["easy","medium","hard"],create:tangent},
  {id:"function-mixed-domain",category:"functions",
    titles:{pl:"Dziedzina: pierwiastek i logarytm",en:"Domain: radicals and logarithms"},
    supportedDifficulties:["easy","medium","hard"],create:mixed},
];

export function mixedDomain(p:Extract<FunctionDomainExtraProblem,{kind:"function-mixed-domain"}>):RealSet {
  const radicand = p.mode==="root-log" ? rightRay(p.p,true) : outside(p.p,p.q,true);
  if(p.mode!=="product-root-log") {
    const logConditions=excludePoints(rightRay(p.boundary,false),[add(p.boundary,r(1))]);
    return intersection(radicand,logConditions);
  }
  // sqrt(log_a(x-boundary)) in the denominator means log_a(x-boundary)>0.
  const logConditions=p.base.numerator>p.base.denominator
    ? rightRay(add(p.boundary,r(1)),false)
    : intersection(rightRay(p.boundary,false),leftRay(add(p.boundary,r(1)),false));
  return intersection(radicand,logConditions);
}
const tanForbidden=(p:Extract<FunctionDomainExtraProblem,{kind:"function-tangent-domain"}>,offset:Rational,frequency:string,scale:number,includePole:boolean)=>{
  const periodic=`{x = ((${f(offset)} + ${frequency})π)/${scale}, k∈ℤ}`;
  return `ℝ ∖ ${periodic}${includePole&&p.pole!==null?` ∖ {${f(p.pole)}}`:""}`;
};
export function presentFunctionDomainExtra(problem:FunctionDomainExtraProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  if(problem.kind==="function-tangent-domain"){
    const p=problem, origin=sub(r(1,2),p.shift);
    const correct=tanForbidden(p,origin,"k",p.factor,true);
    const wrongZero=tanForbidden(p,sub(r(0),p.shift),"k",p.factor,true);
    const wrongPeriod=tanForbidden(p,origin,"2k",p.factor,true);
    const wrongFactor=tanForbidden(p,origin,"k",2*p.factor,p.pole===null);
    const expression=`tan((${p.factor})x + (${f(p.shift)})π)${p.pole===null?"":`/(x − (${f(p.pole)}))`}`;
    lesson.work(`(${p.factor})x+(${f(p.shift)})π = π/2 + kπ, k∈ℤ`,
      t("Tangens nie istnieje dla nieparzystych wielokrotności π/2. Zera tangensa są dozwolone.",
        "Tangent does not exist at odd multiples of π/2. Its zeros are allowed."));
    lesson.work(`x = ((${f(origin)}+k)π)/${p.factor}, k∈ℤ`,
      t("Odejmujemy przesunięcie i dzielimy przez niezerowy współczynnik x.",
        "Subtract the shift and divide by the nonzero coefficient of x."));
    if(p.pole!==null)lesson.work(`${t("Mianownik", "Denominator")}: x ≠ ${f(p.pole)}`,
      t("Mianownik ułamka musi być niezerowy; to dodatkowe wykluczenie.",
        "The rational denominator must be nonzero; this is an additional exclusion."));
    lesson.work(`D = ${correct}`,
      t("Usuwamy wszystkie okresowo powtarzające się bieguny oraz ewentualne zero mianownika.",
        "Exclude every periodic pole and, where present, the rational denominator zero."));
    return lesson.finish(
      `${t("Wskaż dziedzinę rzeczywistą funkcji, k∈ℤ.","Choose the real domain of the function, k∈ℤ.")}\nf(x)=${expression}`,
      {kind:"choice",value:"tan:correct",options:[
        {value:"tan:correct",label:correct},{value:"tan:zeros",label:wrongZero},
        {value:"tan:period",label:wrongPeriod},{value:"tan:factor",label:wrongFactor}]},
      t("Tangens ma bieguny przy π/2+kπ, nie przy kπ.",
        "Tangent has poles at π/2+kπ, not at kπ."),
      t("Rozwiąż równanie dla x i sprawdź oddzielnie mianownik.",
        "Solve the pole equation for x and check the denominator separately."));
  }
  const p=problem,product=p.mode!=="root-log";
  const root=product?`√((x−(${f(p.p)}))(x−(${f(p.q)})))`:`√(x−(${f(p.p)}))`;
  const log=`log_${f(p.base)}(x−(${f(p.boundary)}))`;
  const expression=`${root}/${p.mode==="product-root-log"?`√(${log})`:log}`;
  const domain=mixedDomain(p);
  lesson.work(`${t("Warunek pierwiastka", "Square-root condition")}: ${product?`(x−(${f(p.p)}))(x−(${f(p.q)})) ≥ 0`:`x−(${f(p.p)}) ≥ 0`}`,
    t("Pierwiastek w liczniku wymaga wyrażenia nieujemnego; sprawdzamy znaki na przedziałach.",
      "A numerator square root requires a nonnegative radicand; check signs on each interval."));
  if(p.mode!=="product-root-log"){
    lesson.work(`${t("Warunek logarytmu", "Logarithm condition")}: x>${f(p.boundary)}, x≠${f(add(p.boundary,r(1)))}`,
      t("Argument logarytmu jest dodatni, a mianownik logarytmiczny nie może wynosić zero (log_a 1=0).",
        "The logarithm argument is positive and the logarithmic denominator cannot be zero (log_a 1=0)."));
  }else{
    lesson.work(`${t("Pierwiastek logarytmu", "Logarithm under the square root")}: ${p.base.numerator>p.base.denominator?`x>${f(add(p.boundary,r(1)))}`:
      `${f(p.boundary)}<x<${f(add(p.boundary,r(1)))}`}`,
      t("Pierwiastek logarytmu w mianowniku wymaga log_a(x−b)>0. Dla podstawy 0<a<1 nierówność odwraca kierunek.",
        "A denominator square root requires log_a(x−b)>0. For a base 0<a<1, the logarithmic inequality reverses direction."));
  }
  lesson.work(`${t("Dziedzina", "Domain")} D = ${setText(domain)}`,
    t("Bierzemy część wspólną warunków. Punkty wykluczone pozostają usunięte nawet na końcach przedziałów.",
      "Intersect all restrictions. Excluded values remain excluded even when they are interval endpoints."));
  return lesson.finish(
    `${t("Wyznacz dziedzinę rzeczywistą.","Find the real domain.")}\nf(x)=${expression}`,
    setAnswer(domain,p.p),
    t("Zapisz osobno warunek pierwiastka, logarytmu i mianownika.",
      "Write the square-root, logarithm and denominator conditions separately."),
    t("Wybierz przecięcie warunków, a nie ich sumę.",
      "Take the intersection of the restrictions, not their union."));
}
