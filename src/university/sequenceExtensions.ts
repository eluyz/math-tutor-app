import {
  rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, divideRational as div, type Rational,
} from "../rational";
import { formatRational as f, type AnswerSpec, type LimitValue } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily, SequenceProblem } from "./schema";
import { teaching } from "./teaching";

type Root = Extract<SequenceProblem, { kind:"sequence-radical-ratio" }>;
type Exponential = Extract<SequenceProblem, { kind:"sequence-exponential-ratio" }>;
type Euler = Extract<SequenceProblem, { kind:"sequence-euler-product" }>;
type Term = Exponential["numerator"][number];
const finite=(value:Rational):LimitValue=>({kind:"finite",value});
const textTerm=(term:Term)=>`(${f(term.coefficient)})·(${f(term.base)})ⁿ`;
const textSum=(terms:readonly Term[])=>terms.map(textTerm).join(" + ");
const key=(q:Rational)=>`${q.numerator}/${q.denominator}`;

function createRoot(v:number,level:Difficulty):Root {
  const a=r(2+v%4), e=r(2+Math.floor(v/4)%4);
  const b=r(1+v%3,level==="expert"?2:1), c=r(1+v%5,level==="expert"?2:1);
  const offset=r(1+Math.floor(v/3)%4,level==="advanced"||level==="expert"?2:1);
  const remainder=r(1+(v+2)%6,level==="expert"?3:1);
  const mode=v%4;
  const linear=mode===0?mul(r(-1),a):mode===1?sub(r(-1),a):mode===2?r(1):r(-1);
  const lowerLinear=r(level==="medium"?0:level==="hard"?1:level==="advanced"?2:3,level==="advanced"?2:1);
  return {kind:"sequence-radical-ratio",
    a,b,c,linear,e,offset,remainder,lowerLinear};
}
function createExponential(v:number,level:Difficulty):Exponential {
  const bases=[r(3,2),r(2),r(5,2),r(3),r(4),r(5)];
  const dominant=bases[Math.floor(v/4)],lower=div(dominant,r(2));
  const factor=level==="medium"?1:level==="hard"?2:level==="advanced"?3:4;
  const leading=r(v%5-2||1,factor),small=r(1+v%4,factor);
  const numerator:Term[]=v%4===0
    ?[{coefficient:leading,base:lower},{coefficient:small,base:div(lower,r(2))}]
    :v%4===1
      ?[{coefficient:leading,base:dominant},{coefficient:small,base:lower}]
      :v%4===2
        ?[{coefficient:leading,base:add(dominant,r(level==="advanced"||level==="expert"?1:2))},{coefficient:small,base:lower}]
        :[{coefficient:leading,base:dominant},{coefficient:mul(r(-1),leading),base:dominant},{coefficient:small,base:lower}];
  const denominator:Term[]=[
    {coefficient:r(2+(v%3)),base:dominant},
    {coefficient:r(1+((v+1)%3)),base:lower},
  ];
  return {kind:"sequence-exponential-ratio",numerator,denominator};
}
function createEuler(v:number,level:Difficulty):Euler {
  const first={
    a:r(v%7-3||1,level==="hard"||level==="expert"?2:1),
    b:r(3+(v%4)), // n+b>=4 and a>=-3; positive for every n>=1
    c:r((v+1)%5-2||1,level==="advanced"||level==="expert"?2:1),
    d:r(v%3-1),
  };
  if(level==="medium"||level==="hard")
    return {kind:"sequence-euler-product",factors:[first]};
  const second={
    a:r((v+2)%5-2||1,level==="expert"?2:1),
    b:r(3+((v+2)%4)),
    c:r(v%4-2||1,level==="expert"?3:1),
    d:r((v+1)%4-2),
  };
  return {kind:"sequence-euler-product",factors:[first,second]};
}
export const sequenceExtensionFamilies:readonly UniversityFamily[]=[
  {id:"sequence-radical-ratio",category:"sequence-limits",
   titles:{pl:"Ilorazy pierwiastków i najwyższe potęgi",en:"Radical ratios and dominant powers"},
   supportedDifficulties:["medium","hard","advanced","expert"],create:createRoot},
  {id:"sequence-exponential-ratio",category:"sequence-limits",
   titles:{pl:"Ilorazy potęg i porównanie wzrostu",en:"Exponential ratios and growth comparison"},
   supportedDifficulties:["medium","hard","advanced","expert"],create:createExponential},
  {id:"sequence-euler-product",category:"sequence-limits",
   titles:{pl:"Granica Eulera — przesunięcia i iloczyny",en:"Euler limits — shifts and products"},
   supportedDifficulties:["medium","hard","advanced","expert"],create:createEuler},
];

export function rootRatioLimit(p:Root):LimitValue {
  const numerator=add(p.a,p.linear);
  const denominator=add(p.e,p.lowerLinear);
  if(denominator.numerator<=0n||p.a.numerator<=0n||p.e.numerator<=0n
    ||p.b.numerator<0n||p.offset.numerator<0n||p.c.numerator<=0n||p.remainder.numerator<=0n)
    throw Error("Radical ratio requires positive roots and a positive asymptotic denominator");
  return finite(div(numerator,denominator));
}
function leading(terms:readonly Term[]):Term|null {
  const collected=new Map<string,Term>();
  for(const term of terms){
    if(term.base.numerator<=0n)throw Error("Nonpositive exponential base");
    const k=key(term.base),old=collected.get(k);
    collected.set(k,{base:term.base,coefficient:add(old?.coefficient??r(0),term.coefficient)});
  }
  const values=[...collected.values()].filter(x=>x.coefficient.numerator!==0n);
  if(values.length===0)return null;
  const greater=(a:Rational,b:Rational)=>a.numerator*b.denominator>b.numerator*a.denominator;
  return values.reduce((current,term)=>greater(term.base,current.base)?term:current);
}
export function exponentialRatioLimit(p:Exponential):LimitValue {
  const top=leading(p.numerator),bottom=leading(p.denominator);
  if(!bottom||bottom.coefficient.numerator<=0n)throw Error("Strictly positive denominator required");
  if(!top)return finite(r(0));
  const comparison=top.base.numerator*bottom.base.denominator-
    bottom.base.numerator*top.base.denominator;
  if(comparison<0n)return finite(r(0));
  if(comparison===0n)return finite(div(top.coefficient,bottom.coefficient));
  return {kind:top.coefficient.numerator>0n?"positive-infinity":"negative-infinity"};
}
export function eulerProductExponent(p:Euler):Rational {
  if(p.factors.length<1||p.factors.length>2)throw Error("Expected one or two Euler factors");
  return p.factors.reduce((acc,part)=>{
    if(part.b.numerator<=0n||part.a.numerator<r(-3).numerator ||
      add(add(r(1),part.b),part.a).numerator<=0n)
      throw Error("Euler bases must remain strictly positive for n>=1");
    return add(acc,mul(part.a,part.c));
  },r(0));
}
function eulerAnswer(q:Rational):AnswerSpec {
  if(q.numerator===0n)return {kind:"scalar",value:r(1)};
  const candidates=[q,add(q,r(1)),sub(q,r(1)),mul(q,r(-1)),r(0)];
  const options=[...new Map(candidates.map(x=>{
    const value=`exp:${key(x)}`;
    return [value,{value,label:x.numerator===0n?"1":`e^(${f(x)})`}] as const;
  })).values()];
  return {kind:"choice",value:`exp:${key(q)}`,options};
}
export function presentSequenceExtension(p:Root|Exponential|Euler,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const instruction=t("Oblicz granicę przy n→+∞, n≥1.","Find the limit as n→+∞, n≥1.");
  if(p.kind==="sequence-radical-ratio"){
    const rootA=`√((${f(p.a)}·n + ${f(p.b)})² + ${f(p.c)})`;
    const rootB=`√((${f(p.e)}·n + ${f(p.offset)})² + ${f(p.remainder)})`;
    const expression=`(${rootA} + (${f(p.linear)})·n)/(${rootB} + (${f(p.lowerLinear)})·n)`;
    const value=rootRatioLimit(p);
    const leadingTop=add(p.a,p.linear),leadingBottom=add(p.e,p.lowerLinear);
    lesson.work(t("Warunki: n≥1, obie liczby pod pierwiastkiem są dodatnie.",
      "Domain: n≥1, both radicands are strictly positive."),
      t("Każdy pierwiastek zawiera kwadrat dodatniego wyrażenia i dodatni składnik resztowy; mianownik jest niezerowy.",
        "Each radicand is a square of a positive term plus a positive remainder, and the denominator never vanishes."));
    lesson.work(`√((${f(p.a)}·n+${f(p.b)})²+${f(p.c)})/n = √((${f(p.a)}+${f(p.b)}/n)²+${f(p.c)}/n²)`,
      t("Wyłączamy n² spod pierwiastka: √(n²)=n, ponieważ n jest dodatnie.",
        "Factor n² out of the radical; √(n²)=n because n is positive."));
    lesson.work(`√((${f(p.a)}+${f(p.b)}/n)²+${f(p.c)}/n²) → ${f(p.a)}; √((${f(p.e)}+${f(p.offset)}/n)²+${f(p.remainder)}/n²) → ${f(p.e)}`,
      t("Dzielimy licznik i mianownik przez n. Składniki stałe podzielone przez n i n² dążą do zera.",
        "Divide numerator and denominator by n. Terms divided by n and n² tend to zero."));
    lesson.work(`L=(${f(p.a)}+${f(p.linear)})/(${f(p.e)}+${f(p.lowerLinear)})=${f(div(leadingTop,leadingBottom))}`,
      t("Dodajemy współczynniki przed n, pamiętając o możliwym skróceniu składników w liczniku. Mianownik graniczny jest dodatni.",
        "Add the coefficients of n, allowing leading terms to cancel in the numerator. The limiting denominator is positive."));
    return lesson.finish(`${instruction}\naₙ = ${expression}`,{kind:"limit",value},
      t("Wyłącz n² z obu pierwiastków, a następnie podziel cały ułamek przez n.",
        "Factor n² out of both radicals, then divide the whole quotient by n."),
      t("Pamiętaj o √(n²)=n. Granica jest ilorazem współczynników wiodących po uwzględnieniu znaków.",
        "Use √(n²)=n. The limit is the ratio of the leading coefficients with signs."));
  }
  if(p.kind==="sequence-exponential-ratio"){
    const value=exponentialRatioLimit(p),top=leading(p.numerator),bottom=leading(p.denominator)!;
    lesson.work(t("Mianownik jest dodatni dla każdego n≥1.",
      "The denominator is positive for every n≥1."),
      t("Obie potęgi w mianowniku mają dodatnie podstawy i dodatnie współczynniki. Wolno dzielić przez mianownik.",
        "Both denominator powers have positive bases and positive coefficients. Division is valid."));
    lesson.work(`N(n)=${textSum(p.numerator)}; D(n)=${textSum(p.denominator)}`,
      t("Najpierw grupujemy składniki o dokładnie tej samej podstawie, zanim wybierzemy najszybciej rosnącą potęgę.",
        "First group terms with identical bases, before choosing the fastest-growing power."));
    lesson.work(`N: ${top?textTerm(top):"0"}; D: ${textTerm(bottom)}`,
      t("Składniki dominujące to największe podstawy z niezerowym łącznym współczynnikiem. Równe podstawy mogą się skrócić.",
        "Dominant terms have the largest bases with nonzero combined coefficients. Equal-base terms can cancel."));
    const reason=value.kind==="finite"
      ?t("Jeśli licznik ma mniejszą podstawę, iloraz dąży do zera. Przy równych podstawach zostaje iloraz współczynników.",
        "A smaller numerator base gives zero. Equal dominant bases leave the coefficient ratio.")
      :t("Większa dodatnia podstawa licznika przeważa, a znak nieskończoności wyznacza współczynnik wiodący.",
        "A larger positive numerator base dominates; its leading coefficient determines the sign of infinity.");
    lesson.work(`lim aₙ = ${value.kind==="finite"?f(value.value):value.kind==="positive-infinity"?"+∞":"−∞"}`,reason);
    return lesson.finish(`${instruction}\naₙ = (${textSum(p.numerator)})/(${textSum(p.denominator)})`,
      {kind:"limit",value},
      t("Połącz wyrazy o tych samych podstawach. Sprawdź, która dodatnia podstawa jest największa.",
        "Collect equal-base terms, then find the largest positive base."),
      t("Podziel przez największą potęgę mianownika. Mniejsze podstawy względem niej dążą do zera.",
        "Divide by the dominant denominator power. Smaller relative bases tend to zero."));
  }
  const exponent=eulerProductExponent(p);
  const factors=p.factors.map(part=>`(1+(${f(part.a)})/(n+${f(part.b)}))^((${f(part.c)})·n+${f(part.d)})`);
  lesson.work(t("Sprawdzamy dodatniość wszystkich podstaw.",
    "Verify positivity of all bases."),
    t("Przy n≥1 i podanych przesunięciach każda podstawa 1+a/(n+b) jest dodatnia, więc potęgi i logarytmy są rzeczywiste.",
      "For n≥1, each shifted base 1+a/(n+b) is positive, so real powers and logarithms are defined."));
  for(const [i,part] of p.factors.entries()){
    lesson.work(`F${i+1}: ln(1+(${f(part.a)})/(n+${f(part.b)}))·((${f(part.c)})·n+${f(part.d)}) → ${f(mul(part.a,part.c))}`,
      t("Logarytmujemy czynnik i używamy ln(1+t)/t→1 oraz (cn+d)/(n+b)→c. Stałe przesunięcia nie zmieniają granicy.",
        "Take logarithms and use ln(1+t)/t→1 and (cn+d)/(n+b)→c. Constant shifts do not change the limit."));
  }
  lesson.work(`ln L = ${p.factors.map(part=>f(mul(part.a,part.c))).join(" + ")} = ${f(exponent)}; L=${exponent.numerator===0n?"1":`e^(${f(exponent)})`}`,
    t("Logarytm iloczynu jest sumą logarytmów; po obliczeniu granicy wykładniczej wracamy przez funkcję exp.",
      "The logarithm of a product is the sum of logarithms. Exponentiating the exact limit gives the answer."));
  return lesson.finish(`${instruction}\naₙ = ${factors.join(" · ")}`,
    eulerAnswer(exponent),
    t("Każdy czynnik sprowadź do (1+t) z t→0, następnie przejdź do logarytmu.",
      "Write each factor as (1+t) with t→0, then take logarithms."),
    t("Policz osobno lim ln Fᵢ=aᵢcᵢ i dodaj wykładniki. Nie używaj przybliżenia liczbowego e.",
      "Find lim ln Fᵢ=aᵢcᵢ separately, then add exponents. Do not approximate e numerically."));
}
