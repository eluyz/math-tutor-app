import {rational as r, multiplyRational as mul, divideRational as div, type Rational} from "../rational";
import {formatRational as f, type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {SequenceProblem,UniversityFamily} from "./schema";
import {teaching} from "./teaching";

type Power=Extract<SequenceProblem,{kind:"sequence-power-exponential"}>;
type Behaviour=Extract<SequenceProblem,{kind:"sequence-monotonic-bounded"}>;
type BehaviourClass="increasing-bounded"|"decreasing-bounded"|"increasing-unbounded"|"decreasing-unbounded"|"neither-bounded";
const isZero=(x:Rational)=>x.numerator===0n;
const sign=(x:Rational)=>x.numerator>0n?1:-1;
const compare=(x:Rational,y:Rational)=>x.numerator*y.denominator-y.numerator*x.denominator;
const finite=(value:Rational):LimitValue=>({kind:"finite",value});
const levelNumber=(level:Difficulty)=>level==="medium"?1:level==="hard"?2:level==="advanced"?3:4;

function powerProblem(v:number,level:Difficulty):Power{
  const tier=levelNumber(level),mode=v%6,base=2+(v%4);
  const lower=mode===0?base-1:mode===1||mode===5?base+1:base;
  const powers:readonly [number,number]=
    mode===0?[3,1]:mode===1?[0,2]:mode===2?[0,2]:mode===3?[2,2]:mode===4?[3,1]:[1,3];
  const coefficient=r((v%2===0?-1:1)*(v+1),tier>=3?2:1);
  const denominatorCoefficient=r(2+(v%5),tier===4?2:1);
  return {kind:"sequence-power-exponential",coefficient,denominatorCoefficient,
    numeratorBase:r(lower),denominatorBase:r(base),
    numeratorDegree:powers[0],denominatorDegree:powers[1]};
}

export function powerExponentialLimit(p:Power):LimitValue{
  if(p.denominatorCoefficient.numerator<=0n||isZero(p.coefficient)||
     p.numeratorBase.numerator<=0n||p.denominatorBase.numerator<=0n||
     !Number.isInteger(p.numeratorDegree)||!Number.isInteger(p.denominatorDegree)||
     p.numeratorDegree<0||p.denominatorDegree<0)
    throw Error("Invalid exponential-polynomial sequence");
  const baseComparison=compare(p.numeratorBase,p.denominatorBase);
  if(baseComparison<0)return finite(r(0));
  const coeff=div(p.coefficient,p.denominatorCoefficient);
  if(baseComparison>0)return {kind:sign(coeff)>0?"positive-infinity":"negative-infinity"};
  const degreeDifference=p.numeratorDegree-p.denominatorDegree;
  if(degreeDifference<0)return finite(r(0));
  if(degreeDifference===0)return finite(coeff);
  return {kind:sign(coeff)>0?"positive-infinity":"negative-infinity"};
}

function behaviourProblem(v:number,level:Difficulty):Behaviour{
  const tier=levelNumber(level),mode=v%5;
  const offset=r(v-11,tier===3?2:1);
  const amplitude=r(1+v%7,tier>=2?2:1);
  const shift=1+((v+tier)%5);
  const slope=mode===1||mode===3?mul(r(-1),amplitude):amplitude;
  return {kind:"sequence-monotonic-bounded",
    mode:mode<=1?"reciprocal":mode<=3?"linear":"alternating",
    offset,amplitude:slope,shift};
}

export function classifySequenceBehaviour(p:Behaviour):BehaviourClass{
  if(!["reciprocal","linear","alternating"].includes(p.mode)||
     !Number.isInteger(p.shift)||p.shift<0||isZero(p.amplitude))
    throw Error("Invalid monotonicity task");
  if(p.mode==="alternating")return "neither-bounded";
  if(p.mode==="linear")return sign(p.amplitude)>0?"increasing-unbounded":"decreasing-unbounded";
  return sign(p.amplitude)>0?"decreasing-bounded":"increasing-bounded";
}
const labels=(locale:Locale)=>{
  const isPl=locale==="pl";
  return [
    ["increasing-bounded",isPl?"Rosnący, ograniczony":"Increasing, bounded"],
    ["decreasing-bounded",isPl?"Malejący, ograniczony":"Decreasing, bounded"],
    ["increasing-unbounded",isPl?"Rosnący, nieograniczony":"Increasing, unbounded"],
    ["decreasing-unbounded",isPl?"Malejący, nieograniczony":"Decreasing, unbounded"],
    ["neither-bounded",isPl?"Niemonotoniczny, ograniczony":"Not monotonic, bounded"],
  ].map(([value,label])=>({value,label}));
};

export function presentSequenceFollowup(p:Power|Behaviour,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  if(p.kind==="sequence-power-exponential"){
    const L=powerExponentialLimit(p),a=p.numeratorBase,b=p.denominatorBase;
    const k=p.numeratorDegree-p.denominatorDegree,base=div(a,b);
    const coeff=div(p.coefficient,p.denominatorCoefficient);
    const expr="(("+f(p.coefficient)+")·n^"+p.numeratorDegree+"·("+f(a)+")ⁿ)/(("+
      f(p.denominatorCoefficient)+")·n^"+p.denominatorDegree+"·("+f(b)+")ⁿ)";
    lesson.work("n≥1, b>0, D(n)="+f(p.denominatorCoefficient)+"·n^"+p.denominatorDegree+"·("+f(b)+")ⁿ>0",
      t("Mianownik jest dodatni dla każdego n≥1, więc iloraz i przekształcenie są poprawne.",
        "The denominator is positive for every n≥1, so the ratio and simplification are valid."));
    lesson.work("aₙ=("+f(coeff)+")·n^("+k+")·("+f(base)+")ⁿ",
      t("Oddzielamy stosunek współczynników, różnicę stopni wielomianów i stosunek dodatnich podstaw.",
        "Separate coefficient ratio, polynomial degree difference and positive base ratio."));
    if(compare(a,b)!==0n)
      lesson.work(compare(a,b)<0?"0<"+f(base)+"<1 ⇒ n^("+k+")·("+f(base)+")ⁿ→0":
        f(base)+">1 ⇒ |n^("+k+")·("+f(base)+")ⁿ|→+∞",
        t("Dowolna dodatnia potęga wykładnicza przeważa nad ustaloną potęgą n. Jeżeli podstawa ilorazu jest mniejsza od 1, wynik dąży do zera.",
          "Exponential growth dominates every fixed polynomial power. A base ratio below one forces the limit to zero."));
    else
      lesson.work("a=b ⇒ ("+f(base)+")ⁿ=1; n^("+k+")→"+
        (k<0?"0":k===0?"1":"+∞"),
        t("Przy równych podstawach porównujemy tylko stopnie potęg n.",
          "When the bases agree, compare only polynomial degrees."));
    lesson.work("lim aₙ = "+(L.kind==="finite"?f(L.value):L.kind==="positive-infinity"?"+∞":"−∞"),
      t("Znak nieskończoności pochodzi od niezerowego współczynnika; przypadek skończony może wynosić zero albo iloraz współczynników.",
        "The sign at infinity comes from the nonzero coefficient; a finite result is zero or a coefficient ratio."));
    return lesson.finish(t("Oblicz granicę ciągu dla n→+∞, n≥1.\naₙ = "+expr,
      "Find the sequence limit as n→+∞, n≥1.\naₙ = "+expr),
      {kind:"limit",value:L},
      t("Porównaj najpierw dodatnie podstawy potęg wykładniczych.",
        "First compare the positive exponential bases."),
      t("Jeśli podstawy są równe, porównaj wykładniki n. Jeśli różne, wykładnicza dominuje nad każdą stałą potęgą n.",
        "Equal bases require comparing polynomial degrees; unequal exponential bases dominate fixed polynomial powers."));
  }
  const kind=classifySequenceBehaviour(p);
  const s=f(p.amplitude),c=f(p.offset),shift=p.shift;
  const formula=p.mode==="linear"?c+" + ("+s+")·n":
    p.mode==="reciprocal"?c+" + ("+s+")/(n+"+shift+")":
    c+" + ("+s+")·(−1)ⁿ/(n+"+shift+")";
  const text=p.mode==="linear"?
    "aₙ₊₁−aₙ="+s:
    p.mode==="reciprocal"?
      "aₙ₊₁−aₙ=−("+s+")/((n+"+shift+")(n+"+(shift+1)+"))":
      "a₁="+c+"−("+s+")/(1+"+shift+"); a₂="+c+"+("+s+")/(2+"+shift+"); a₃="+c+"−("+s+")/(3+"+shift+")";
  lesson.work("n≥1; aₙ="+formula,
    t("Sprawdzamy określoność wszystkich wyrazów i rodzaj ciągu.",
      "Check the domain of every term and identify the sequence form."));
  lesson.work(text,
    p.mode==="alternating"?
      t("Pierwszy wyraz jest poniżej c, drugi powyżej c, a trzeci ponownie poniżej c. Ciąg ma zarówno wzrost, jak i spadek.",
        "The first term is below c, the second above c and the third below c. Both upward and downward steps occur."):
      t("Znak różnicy aₙ₊₁−aₙ jest stały dla wszystkich n≥1, więc wyznacza ścisłą monotoniczność.",
        "The sign of aₙ₊₁−aₙ is constant for n≥1 and proves strict monotonicity."));
  const bound=p.mode==="linear"?
    t("Wyraz liniowy o niezerowym współczynniku rośnie lub maleje bez ograniczenia.",
      "A linear term with nonzero slope grows without bound in one direction."):
    p.mode==="reciprocal"?
      t("Ponieważ 0<1/(n+k)≤1/(1+k), ciąg leży pomiędzy c i c+s/(1+k).",
        "Since 0<1/(n+k)≤1/(1+k), the sequence lies between c and c+s/(1+k)."):
      t("Nierówność |aₙ−c|≤|s|/(1+k) gwarantuje ograniczoność przy n≥1.",
        "The inequality |aₙ−c|≤|s|/(1+k) guarantees boundedness for n≥1.");
  lesson.work(p.mode==="linear"?"Dla n→+∞: |aₙ|→+∞":
    p.mode==="reciprocal"?"0<1/(n+"+shift+")≤1/"+(1+shift):
    "|aₙ−("+c+")|≤|"+s+"|/"+(1+shift),bound);
  return lesson.finish(t("Dla n≥1 sklasyfikuj monotoniczność i ograniczoność ciągu:\naₙ = "+formula,
      "For n≥1 classify monotonicity and boundedness of the sequence:\naₙ = "+formula),
    {kind:"choice",value:kind,options:labels(locale)},
    t("Oblicz aₙ₊₁−aₙ, następnie sprawdź, czy ciąg ma ograniczenie z góry i z dołu.",
      "Compute aₙ₊₁−aₙ and check for both an upper and a lower bound."),
    t("Ograniczoność wymaga dwóch ograniczeń. Naprzemienne znaki zwykle wykluczają monotoniczność.",
      "Boundedness needs both bounds; alternating signs usually rule out monotonicity."));
}
export const sequenceFollowupFamilies:readonly UniversityFamily[]=[
 {id:"sequence-power-exponential",category:"sequence-limits",
  titles:{pl:"Granica: wielomian razy potęga wykładnicza",en:"Limit: polynomial times exponential"},
  supportedDifficulties:["hard","advanced","expert"],create:powerProblem},
 {id:"sequence-monotonic-bounded",category:"sequence-limits",
  titles:{pl:"Monotoniczność i ograniczoność ciągu",en:"Sequence monotonicity and boundedness"},
  supportedDifficulties:["medium","hard","advanced"],create:behaviourProblem},
];
