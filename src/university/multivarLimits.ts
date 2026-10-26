import {rational as r,addRational as add,divideRational as div,multiplyRational as mul,type Rational} from "../rational";
import {formatRational as f,type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type MultivarLimitProblem =
 | Readonly<{kind:"multivar-path-limit";atX:Rational;atY:Rational;base:Rational;factor:Rational;curve:Rational;mode:"bounded"|"different-paths"}>
 | Readonly<{kind:"multivar-continuity-point";atX:Rational;atY:Rational;base:Rational;factor:Rational;curve:Rational;mode:"continuous"|"removable"|"different-paths";valueAt:Rational}>;

const same=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;
const sq=(x:Rational)=>mul(x,x);
const denFor=(level:Difficulty)=>level==="medium"?1:level==="hard"?2:3;
function baseData(v:number,level:Difficulty){
 const den=denFor(level);
 return {
  atX:r(v-11,den),atY:r(v%9-4,den),
  base:r(v%7-3,den),factor:r((v%2?-1:1)*(1+v%5),den),
  curve:r(1+(v%4),level==="advanced"?2:1),
 };
}
function makePath(v:number,level:Difficulty):MultivarLimitProblem{
 return {kind:"multivar-path-limit",...baseData(v,level),mode:v%2===0?"bounded":"different-paths"};
}
function makeContinuity(v:number,level:Difficulty):MultivarLimitProblem{
 const data=baseData(v,level), mode=(["continuous","removable","different-paths"] as const)[v%3];
 const valueAt=mode==="removable"?add(data.base,r(1+v%4,denFor(level))):data.base;
 return {kind:"multivar-continuity-point",...data,mode,valueAt};
}
export const multivarLimitFamilies:readonly UniversityFamily[]=[
 {id:"multivar-path-limit",category:"function-limits",
  titles:{pl:"Granice funkcji dwóch zmiennych różnymi drogami",en:"Two-variable limits along different paths"},
  supportedDifficulties:["medium","hard","advanced"],create:makePath},
 {id:"multivar-continuity-point",category:"function-limits",
  titles:{pl:"Ciągłość funkcji dwóch zmiennych w punkcie",en:"Continuity of a two-variable function at a point"},
  supportedDifficulties:["medium","hard","advanced"],create:makeContinuity},
];

type Cont=Extract<MultivarLimitProblem,{kind:"multivar-continuity-point"}>;
export type MultivarContinuityClass="continuous"|"removable"|"nonremovable";
export function continuityAtPoint(p:Cont):MultivarContinuityClass{
 if(p.factor.numerator===0n||p.curve.numerator===0n)throw Error("Expected nonzero coefficient and path multiplier");
 if(p.mode==="different-paths")return "nonremovable";
 return same(p.base,p.valueAt)?"continuous":"removable";
}
export function multivarLimitValue(p:MultivarLimitProblem):LimitValue{
 if(p.factor.numerator===0n||p.curve.numerator===0n)throw Error("Expected nonzero coefficient and path multiplier");
 return p.mode==="different-paths"?{kind:"does-not-exist"}:{kind:"finite",value:p.base};
}
export function secondPathLimit(p:MultivarLimitProblem):Rational{
 if(p.factor.numerator===0n||p.curve.numerator===0n)throw Error("Expected nonzero coefficient and path multiplier");
 return add(p.base,div(mul(p.factor,p.curve),add(r(1),sq(p.curve))));
}
const labels=(locale:Locale)=>[
 {value:"continuous",label:locale==="pl"?"Funkcja jest ciągła w punkcie":"The function is continuous at the point"},
 {value:"removable",label:locale==="pl"?"Nieciągłość usuwalna — granica istnieje, ale f(a,b) jest inne":"Removable discontinuity — the limit exists but differs from f(a,b)"},
 {value:"nonremovable",label:locale==="pl"?"Nieciągłość nieusuwalna — granica nie istnieje":"Nonremovable discontinuity — the limit does not exist"},
];
const coords=(p:MultivarLimitProblem)=>"("+f(p.atX)+", "+f(p.atY)+")";
const representation=(p:MultivarLimitProblem,divergent:boolean)=>
 "u=x−("+f(p.atX)+"), v=y−("+f(p.atY)+"); "+
 "g(x,y)=("+f(p.base)+")+("+f(p.factor)+")"+(divergent?"u²v/(u⁴+v²)":"u²v²/(u²+v²)");
export function presentMultivarLimit(p:MultivarLimitProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,point=coords(p),divergent=p.mode==="different-paths";
 const definition=representation(p,divergent);
 lesson.work("u=x−("+f(p.atX)+"), v=y−("+f(p.atY)+"); (x,y)→"+point+" ⇔ (u,v)→(0,0)",
  t("Przesuwamy badany punkt do (0,0). Wartość funkcji w tym punkcie nie wpływa na jej granicę.",
    "Translate the point to (0,0). The function's value at the point does not affect its limit."));
 lesson.work("u²+v²>0 oraz u⁴+v²>0 dla (u,v)≠(0,0)",
  t("Mianowniki są dodatnie poza usuniętym punktem. Analizujemy tylko punkty z dziedziny.",
    "The denominators are positive away from the puncture. Consider only points in the domain."));
 if(divergent){
  const b=secondPathLimit(p);
  lesson.work("v=0, u→0: g=("+f(p.base)+")",
   t("Najpierw zbliżamy się poziomą prostą y=b. Składnik ułamkowy znika.",
     "First approach along the horizontal line y=b. The fractional part vanishes."));
  lesson.work("v=("+f(p.curve)+")u², u→0, u≠0: u²v/(u⁴+v²)=("+f(p.curve)+")/(1+("+f(p.curve)+")²)",
   t("Po podstawieniu paraboli skracamy u⁴ dla u≠0. Otrzymujemy stałą, niezależną od u.",
     "Along the parabola cancel u⁴ for u≠0. The resulting ratio is independent of u."));
  lesson.work("L₁="+f(p.base)+"; L₂="+f(b)+"; L₁≠L₂",
   t("Dwie drogi prowadzą do różnych granic. Wystarcza to, aby wykazać brak granicy 2D.",
     "The two paths have distinct limits, which proves the two-variable limit does not exist."));
 }else{
  lesson.work("0≤u²v²/(u²+v²)≤(u²+v²)/4",
   t("Z nierówności 4u²v²≤(u²+v²)² otrzymujemy oszacowanie składnika ułamkowego.",
     "Use 4u²v²≤(u²+v²)² to bound the fractional term."));
  lesson.work("|g(x,y)−("+f(p.base)+")|≤|"+f(p.factor)+"|(u²+v²)/4→0",
   t("Nierówność zachodzi dla wszystkich dróg jednocześnie. Twierdzenie o trzech funkcjach daje granicę.",
     "The bound holds for every path simultaneously. The squeeze theorem gives the limit."));
  lesson.work("lim[(x,y)→"+point+"]g(x,y)="+f(p.base),
   t("Granica jest niezależna od sposobu zbliżania się do punktu.",
     "The limit is independent of the approach path."));
 }
 if(p.kind==="multivar-path-limit"){
  return lesson.finish(
   t("Wyznacz granicę 2D (lub stwierdź jej brak) w punkcie ","Find the 2D limit (or identify its nonexistence) at ")+
    point+".\n"+definition+" dla (x,y)≠"+point,
   {kind:"limit",value:multivarLimitValue(p)},
   t("Sprawdź prostą v=0, potem parabolę v=cu² albo oszacowanie wartości bezwzględnej.",
     "Try v=0, then the parabola v=cu² or a uniform absolute-value bound."),
   t("Dwie różne granice drogowe obalają istnienie granicy; oszacowanie działa na wszystkie drogi.",
     "Two distinct path limits disprove existence; a uniform bound covers all paths."));
 }
 const classification=continuityAtPoint(p),L=multivarLimitValue(p);
 if(L.kind==="finite"){
  lesson.work("lim[(x,y)→"+point+"]g(x,y)="+f(L.value)+"; f"+point+"="+f(p.valueAt),
   t("Porównujemy granicę w otoczeniu punktu z osobno przypisaną wartością funkcji.",
     "Compare the punctured-neighborhood limit with the separately assigned function value."));
  if(classification==="removable"){
   lesson.work("f"+point+"≠"+f(L.value)+"; ustawienie f"+point+"="+f(L.value)+" przywraca ciągłość",
    t("Granica istnieje, więc pojedynczą niezgodną wartość można zastąpić granicą.",
      "The limit exists, so redefining the single mismatched value restores continuity."));
  }else{
   lesson.work("f"+point+"="+f(L.value)+"=lim[(x,y)→"+point+"]f(x,y)",
    t("Wartość w punkcie jest równa granicy, więc funkcja jest w nim ciągła.",
      "The value at the point equals the limit, so the function is continuous there."));
  }
 }else{
  lesson.work("lim[(x,y)→"+point+"]g(x,y) nie istnieje / does not exist; f"+point+"="+f(p.valueAt),
   t("Brak granicy nie zależy od wartości dopisanej w pojedynczym punkcie.",
     "A missing limit cannot be repaired by choosing a value at just one point."));
 }
 return lesson.finish(
  t("Sklasyfikuj ciągłość f w punkcie ","Classify continuity of f at ")+point+
  ".\n"+definition+" dla (x,y)≠"+point+"; f"+point+"="+f(p.valueAt),
  {kind:"choice",value:classification,options:labels(locale)},
  t("Ciągłość wymaga istnienia granicy 2D i jej równości z f(a,b).",
    "Continuity requires an existing 2D limit equal to f(a,b)."),
  t("Najpierw ustal granicę na wszystkich drogach, a dopiero później porównaj ją z wartością w punkcie.",
    "Establish the path-independent limit first, then compare it with the value at the point."));
}
