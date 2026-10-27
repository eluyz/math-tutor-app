import {rational as r,addRational as add,type Rational} from "../rational";
import {formatRational as fmt} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type EdgeLimitProblem=
 | Readonly<{kind:"derivative-vertical-cusp";at:Rational;constant:Rational;coefficient:Rational;linear:Rational;mode:"vertical"|"cusp"}>
 | Readonly<{kind:"limit-oscillatory-heine";at:Rational;constant:Rational;coefficient:Rational;valueAt:Rational;mode:"oscillatory"|"continuous"|"removable"}>;
type Derivative=Extract<EdgeLimitProblem,{kind:"derivative-vertical-cusp"}>;
type Oscillation=Extract<EdgeLimitProblem,{kind:"limit-oscillatory-heine"}>;
const sign=(v:number)=>v%2===0?1:-1;
const denominator=(level:Difficulty)=>level==="hard"?2:level==="advanced"?3:5;
function derivative(v:number,level:Difficulty):Derivative{
 const d=denominator(level);
 return {kind:"derivative-vertical-cusp",at:r(v-11),
  constant:r((v%7-3)*d+1,d),coefficient:r(sign(v)*(v%5+1),d),
  linear:r((v%9-4),d),mode:v%2===0?"vertical":"cusp"};
}
function oscillation(v:number,level:Difficulty):Oscillation{
 const d=denominator(level),mode=(["oscillatory","continuous","removable"] as const)[v%3];
 const constant=r((v%7-3)*d+1,d),coefficient=r(sign(v)*(1+v%6),d);
 return {kind:"limit-oscillatory-heine",at:r(v-11),constant,coefficient,
  valueAt:mode==="removable"?add(constant,r(1+v%4,d)):constant,mode};
}
export const edgeLimitFamilies:readonly UniversityFamily[]=[
 {id:"derivative-vertical-cusp",category:"derivatives",
  titles:{pl:"Styczna pionowa czy ostry wierzchołek?",en:"Vertical tangent or cusp?"},
  supportedDifficulties:["hard","advanced","expert"],create:derivative},
 {id:"limit-oscillatory-heine",category:"function-limits",
  titles:{pl:"Granica oscylacyjna i kryterium Heinego",en:"Oscillatory limits and the Heine criterion"},
  supportedDifficulties:["hard","advanced","expert"],create:oscillation},
];
export function edgeLimitClass(p:EdgeLimitProblem):Derivative["mode"]|Oscillation["mode"]{
 if(p.coefficient.numerator===0n)throw Error("Nonzero oscillation or singular coefficient required");
 return p.mode;
}
function derivativeOptions(locale:Locale){
 const labels=locale==="pl"?
  ["ciągła i różniczkowalna","ciągła, ale ma skończone różne pochodne jednostronne (załamanie)",
   "ciągła, styczna pionowa (obustronnie ta sama nieskończona pochodna)",
   "ciągła, ostrze/cusp (pochodne jednostronne przeciwnych znaków nieskończonych)"]:
  ["continuous and differentiable","continuous with unequal finite one-sided derivatives (corner)",
   "continuous, vertical tangent (same signed infinite one-sided derivatives)",
   "continuous, cusp (opposite signed infinite one-sided derivatives)"];
 return (["smooth","corner","vertical","cusp"] as const).map((value,i)=>({value,label:labels[i]}));
}
function heineOptions(locale:Locale){
 const labels=locale==="pl"?
  ["ciągła w punkcie","nieciągłość usuwalna (granica istnieje)",
   "brak granicy wskutek oscylacji","nieciągłość skokowa (różne skończone granice jednostronne)"]:
  ["continuous at the point","removable discontinuity (limit exists)",
   "limit does not exist because of oscillations","jump discontinuity (different finite one-sided limits)"];
 return (["continuous","removable","oscillatory","jump"] as const).map((value,i)=>({value,label:labels[i]}));
}
function showDerivative(p:Derivative,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,h=fmt(p.at),k=fmt(p.coefficient),b=fmt(p.linear),c=fmt(p.constant);
 const x="(x−("+h+"))";
 const base=p.mode==="vertical"?"∛"+x:"|"+x+"|^(2/3)";
 const expr="f(x)=("+c+")+("+k+")·"+base+"+("+b+")·"+x;
 const signOf=(positive:boolean)=>positive?"+∞":"−∞",positive=p.coefficient.numerator>0n;
 lesson.work("t=x−("+h+"); f("+h+")="+c,
  t("W obu przypadkach pierwiastek i składnik liniowy znikają dla t=0, więc funkcja jest ciągła.",
    "In either case, both the root term and the linear term vanish at t=0, so the function is continuous."));
 const quotient=p.mode==="vertical"?"("+k+")/|t|^(2/3)+("+b+")":"("+k+")·sgn(t)/|t|^(1/3)+("+b+")";
 lesson.work("(f("+h+"+t)−f("+h+"))/t="+quotient,
  t("Zastosuj definicję pochodnej jako granicy ilorazu różnicowego, nie samą regułę potęgową w punkcie.",
    "Use the definition of derivative as a difference quotient, not the power rule at the point."));
 if(p.mode==="vertical"){
  lesson.work("t→0⁻: "+signOf(positive)+"; t→0⁺: "+signOf(positive),
   t("Dla t≠0 mianownik |t|^(2/3) jest dodatni i dąży do zera; współczynnik ma stały znak.",
     "The denominator |t|^(2/3) is positive and tends to zero on both sides; the coefficient has a fixed sign."));
  lesson.work("f′("+h+") "+t("nie jest skończona; styczna pionowa","is not finite; vertical tangent"),
   t("Obie pochodne jednostronne są nieskończone o tym samym znaku. Skończona pochodna nie istnieje.",
     "The one-sided derivatives have the same infinite sign. No finite derivative exists."));
 }else{
  lesson.work("t→0⁻: "+signOf(!positive)+"; t→0⁺: "+signOf(positive),
   t("Iloraz |t|^(2/3)/t ma przeciwne znaki po obu stronach, a jego moduł rośnie bez granic.",
     "The quotient |t|^(2/3)/t changes sign across zero and grows unbounded in magnitude."));
  lesson.work("f′("+h+") "+t("nie istnieje; ostre zakończenie (cusp)","does not exist; cusp"),
   t("Pochodne jednostronne rozbiegają się do przeciwnych nieskończoności, co oznacza ostrze, nie styczną pionową.",
     "The one-sided slopes diverge to opposite infinities: a cusp, not a vertical tangent."));
 }
 return lesson.finish(
  t("Sklasyfikuj punkt x=","Classify the point x=")+h+".\n"+expr,
  {kind:"choice",value:edgeLimitClass(p),options:derivativeOptions(locale)},
  t("Sprawdź ciągłość w punkcie, a potem iloraz (f(h+t)−f(h))/t.",
    "Check continuity at the point, then the difference quotient (f(h+t)−f(h))/t."),
  t("Znak i granice ilorazu po lewej i prawej od zera rozróżniają styczną pionową od ostrza.",
    "Compare the signs and limits of the quotient to distinguish a vertical tangent from a cusp."));
}
function showOscillation(p:Oscillation,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,h=fmt(p.at),c=fmt(p.constant),k=fmt(p.coefficient),v=fmt(p.valueAt);
 const damped=p.mode!=="oscillatory",x="(x−("+h+"))";
 const expr="f(x) = ("+c+")+("+k+")·"+(damped?x+"·":"")+"sin(1/"+x+")";
 lesson.work("f("+h+")="+v+"; "+t("dla x≠h","for x≠h")+": "+expr,
  t("Wartość zadana w punkcie jest osobna od wzoru na funkcję poza punktem.",
    "The assigned value at the point is separate from the formula away from that point."));
 lesson.work("xₙ="+h+"+1/(nπ), yₙ="+h+"+1/(π/2+2nπ), n≥1",
  t("Oba ciągi są różne od h i zbiegają do h, więc nadają się do kryterium Heinego.",
    "Both sequences avoid h and converge to h, so they can be used in Heine's sequential criterion."));
 lesson.work("sin(1/(xₙ−h))=sin(nπ)=0; sin(1/(yₙ−h))=sin(π/2+2nπ)=1",
  t("Dwa podciągi faz dają odpowiednio zero i jeden.",
    "Two sequences of phases yield zero and one, respectively."));
 if(!damped){
  lesson.work("f(xₙ)="+c+"; f(yₙ)="+fmt(add(p.constant,p.coefficient)),
   t("Niezerowa amplituda daje różne granice wartości funkcji w dwóch ciągach zbieżnych do h.",
     "Nonzero amplitude gives two distinct limits along sequences converging to h."));
  lesson.work(t("Granica nie istnieje; funkcja nie jest ciągła","The limit does not exist; the function is not continuous"),
   t("Kryterium Heinego obala istnienie granicy obustronnej, niezależnie od f(h).",
     "Heine's criterion disproves a two-sided limit regardless of f(h)."));
 }else{
  lesson.work("|("+k+")·(x−h)sin(1/(x−h))| ≤ |"+k+"|·|x−h| → 0",
   t("Oszacowanie przez moduł i twierdzenie o trzech funkcjach gwarantują pełną granicę, nie tylko dwa wybrane ciągi.",
     "An absolute-value bound and the squeeze theorem prove the full limit, not just two selected sequences."));
  lesson.work("lim x→"+h+" f(x)="+c+"; f("+h+")="+v,
   p.mode==="continuous"?
    t("Granica i wartość w punkcie są zgodne: funkcja jest ciągła.",
      "The limit equals the value at the point: the function is continuous."):
    t("Granica istnieje, lecz wartość w punkcie jest inna: nieciągłość usuwalna.",
      "The limit exists, but the assigned point value differs: a removable discontinuity."));
 }
 return lesson.finish(
  t("Oceń istnienie granicy i ciągłość w punkcie x=","Classify the limit and continuity at x=")+h+".\n"+expr+" "+t("dla x≠","for x≠")+h+"; f("+h+")="+v+".",
  {kind:"choice",value:edgeLimitClass(p),options:heineOptions(locale)},
  t("Przeanalizuj oscylacje sin(1/(x−h)) i sprawdź, czy są mnożone przez x−h.",
    "Examine the oscillations of sin(1/(x−h)) and whether a factor x−h is present."),
  t("Porównaj dwa ciągi Heinego; gdy jest czynnik x−h, dodatkowo użyj oszacowania |sin|≤1.",
    "Compare two Heine sequences; with a factor x−h, also use the bound |sin|≤1."));
}
export function presentEdgeLimit(p:EdgeLimitProblem,locale:Locale){
 return p.kind==="derivative-vertical-cusp"?showDerivative(p,locale):showOscillation(p,locale);
}
