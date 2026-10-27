import {rational as r, addRational as add, divideRational as div, equalRational as eq, type Rational} from "../rational";
import {formatRational as f, type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type PolarContinuityProblem =
 | Readonly<{kind:"multivar-polar-homogeneous-limit";atX:Rational;atY:Rational;base:Rational;factor:Rational;power:1|2}>
 | Readonly<{kind:"multivar-angular-continuity";atX:Rational;atY:Rational;base:Rational;a:Rational;c:Rational;valueAt:Rational;mode:"continuous"|"removable"|"nonremovable"}>;

type Polar=Extract<PolarContinuityProblem,{kind:"multivar-polar-homogeneous-limit"}>;
type Angular=Extract<PolarContinuityProblem,{kind:"multivar-angular-continuity"}>;
export type AngularContinuityClass="continuous"|"removable"|"nonremovable";
const denominator=(level:Difficulty)=>level==="hard"?1:level==="advanced"?2:3;
const sign=(v:number)=>v%2===0?1:-1;
function polar(v:number,level:Difficulty):Polar{
 const d=denominator(level);
 return {kind:"multivar-polar-homogeneous-limit",atX:r(v%7-3,d),atY:r(Math.floor(v/3)-4,d),
   base:r(v%11-5,d),factor:r(sign(Math.floor(v/2))*(1+Math.floor(v/2)%7),d),power:v%2===0?1:2};
}
function angular(v:number,level:Difficulty):Angular{
 const d=denominator(level);
 const mode=(["continuous","removable","nonremovable"] as const)[v%3];
 const a=r(sign(v)*(1+v%6),d);
 const c=mode==="nonremovable"?add(a,r(1+Math.floor(v/3)%4,d)):a;
 const base=r(v%9-4,d),limit=add(base,a);
 const valueAt=mode==="continuous"?limit:mode==="removable"?add(limit,r(1+Math.floor(v/3)%5,d)):r(Math.floor(v/2)-5,d);
 return {kind:"multivar-angular-continuity",atX:r(v%8-3,d),atY:r(Math.floor(v/4)-3,d),
   base,a,c,valueAt,mode};
}
export const polarContinuityFamilies:readonly UniversityFamily[]=[
 {id:"multivar-polar-homogeneous-limit",category:"function-limits",
  titles:{pl:"Granice dwóch zmiennych — współrzędne biegunowe",en:"Two-variable limits with polar coordinates"},
  supportedDifficulties:["hard","advanced","expert"],create:polar},
 {id:"multivar-angular-continuity",category:"function-limits",
  titles:{pl:"Ciągłość dwóch zmiennych — zależność od kierunku",en:"Directional continuity of two-variable functions"},
  supportedDifficulties:["hard","advanced","expert"],create:angular},
];
function validatePolar(p:Polar){
 if(p.factor.numerator===0n || (p.power!==1&&p.power!==2))throw Error("Nonzero factor and power 1 or 2 required");
}
function validateAngular(p:Angular){
 if(p.mode==="nonremovable"&&eq(p.a,p.c))throw Error("Different axis coefficients required");
 if(p.mode!=="nonremovable"&&!eq(p.a,p.c))throw Error("Equal coefficients required for finite limit");
}
export function polarLimitValue(p:Polar):LimitValue{
 validatePolar(p);
 return p.power===1?{kind:"finite",value:p.base}:{kind:"does-not-exist"};
}
export function polarDiagonalPathValue(p:Polar):Rational{
 validatePolar(p);
 if(p.power!==2)throw Error("Diagonal path constant applies only to power 2");
 return add(p.base,div(p.factor,r(4)));
}
export function angularAxisValues(p:Angular):readonly [Rational,Rational]{
 validateAngular(p);
 return [add(p.base,p.a),add(p.base,p.c)];
}
export function angularContinuityClass(p:Angular):AngularContinuityClass{
 validateAngular(p);
 if(!eq(p.a,p.c))return "nonremovable";
 return eq(p.valueAt,add(p.base,p.a))?"continuous":"removable";
}
const target=(p:PolarContinuityProblem)=>"("+f(p.atX)+", "+f(p.atY)+")";
const coordinates=(p:PolarContinuityProblem)=>
 "u=x−("+f(p.atX)+"), v=y−("+f(p.atY)+")";
const polarExpression=(p:Polar)=>
 "g(x,y)=("+f(p.base)+")+("+f(p.factor)+")u²v²/"+(p.power===1?"(u²+v²)":"(u²+v²)²");
const angularExpression=(p:Angular)=>
 "g(x,y)=("+f(p.base)+")+(("+f(p.a)+")u²+("+f(p.c)+")v²)/(u²+v²)";
const options=(locale:Locale)=>locale==="pl"?[
 {value:"continuous",label:"Funkcja jest ciągła w punkcie"},
 {value:"removable",label:"Nieciągłość usuwalna — granica istnieje, ale f(a,b) jest inne"},
 {value:"nonremovable",label:"Nieciągłość nieusuwalna — granica nie istnieje"}
]:[
 {value:"continuous",label:"The function is continuous at the point"},
 {value:"removable",label:"Removable discontinuity — the limit exists but differs from f(a,b)"},
 {value:"nonremovable",label:"Nonremovable discontinuity — the limit does not exist"}
];
export function presentPolarContinuity(p:PolarContinuityProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const at=target(p);
 lesson.work(coordinates(p)+"; (u,v)→(0,0)",
   t("Przenieś badany punkt do początku układu. Rozważamy otoczenie bez samego punktu.",
     "Translate the target to the origin. Work in a punctured neighborhood."));
 lesson.work("u=r cos θ; v=r sin θ; u²+v²=r²; r>0",
   t("We współrzędnych biegunowych r jest odległością od badanego punktu.",
     "In polar coordinates r is the distance from the target point."));
 if(p.kind==="multivar-polar-homogeneous-limit"){
  const value=polarLimitValue(p);
  lesson.work(polarExpression(p)+"; (u,v)≠(0,0)",
    t("Mianownik jest dodatni poza badanym punktem, więc funkcja jest tam określona.",
      "The denominator is positive away from the target, so the punctured expression is defined."));
  if(p.power===1){
   lesson.work("u²v²/(u²+v²)=r² cos²θ sin²θ",
     t("Po podstawieniu otrzymujemy czynnik r², który dąży do zera.",
       "Substitution produces an r² factor that vanishes at the origin."));
   lesson.work("0≤cos²θ sin²θ≤1/4; |g−("+f(p.base)+")|≤|"+f(p.factor)+"|r²/4→0",
     t("To oszacowanie jest jednolite względem kąta: obejmuje wszystkie drogi zbliżania.",
       "The uniform angular bound applies to every path of approach."));
   lesson.work("lim[(x,y)→"+at+"]g(x,y)="+f(p.base),
     t("Twierdzenie o trzech funkcjach potwierdza dokładną, skończoną granicę.",
       "The squeeze theorem establishes the exact finite limit."));
  }else{
   const diagonal=polarDiagonalPathValue(p);
   lesson.work("u²v²/(u²+v²)²=cos²θ sin²θ",
     t("Po skróceniu r⁴ pozostaje zależność od kierunku, a nie od promienia.",
       "After cancelling r⁴ the expression depends on direction, not radius."));
   lesson.work("v=0: g="+f(p.base)+"; v=u≠0: g="+f(diagonal),
     t("Na osi poziomej część ułamkowa wynosi zero; na przekątnej wynosi 1/4.",
       "On the horizontal axis the fraction is zero; on the diagonal it equals 1/4."));
   lesson.work(f(p.base)+" ≠ "+f(diagonal)+" ⇒ "+t("granica nie istnieje","limit does not exist"),
     t("Niezerowy współczynnik daje dwie różne granice drogowe, więc granica 2D nie istnieje.",
       "The nonzero coefficient gives two distinct path limits, so the 2D limit does not exist."));
  }
  return lesson.finish(
   t("Wyznacz granicę funkcji dwóch zmiennych w punkcie ","Find the two-variable limit at ")+at+
    ".\n"+coordinates(p)+"; "+polarExpression(p)+t(" dla "," for ")+"(x,y)≠"+at,
   {kind:"limit",value},
   t("Podstaw u=r cos θ i v=r sin θ.","Substitute u=r cos θ and v=r sin θ."),
   t("Sprawdź, czy po uproszczeniu zostaje czynnik r², czy zależność od kierunku.",
     "Check whether simplification leaves a vanishing r² factor or an angular dependence."));
 }
 const classification=angularContinuityClass(p),[onU,onV]=angularAxisValues(p);
 lesson.work(angularExpression(p)+"; (u,v)≠(0,0); f"+at+"="+f(p.valueAt),
   t("Najpierw badaj granicę wzoru w otoczeniu, dopiero potem wartość przypisaną w punkcie.",
     "Analyze the punctured formula before comparing the assigned point value."));
 lesson.work("v=0: g="+f(onU)+"; u=0: g="+f(onV),
   t("Na osiach mianownik skraca się odpowiednio z u² albo z v².",
     "Along the axes the denominator cancels with u² or v² respectively."));
 if(classification==="nonremovable"){
  lesson.work(f(onU)+" ≠ "+f(onV)+" ⇒ "+t("granica nie istnieje","limit does not exist"),
    t("Różne granice wzdłuż osi wystarczają, by wykazać nieciągłość nieusuwalną.",
      "Distinct axis limits prove a nonremovable discontinuity."));
  lesson.work("f"+at+"="+f(p.valueAt)+t(" nie zmienia granic drogowych"," does not change path limits"),
    t("Zmiana wartości w pojedynczym punkcie nie przywróci granicy.",
      "Redefining one point cannot restore a missing limit."));
 }else{
  lesson.work("a=c="+f(p.a)+" ⇒ (a u²+c v²)/(u²+v²)="+f(p.a),
    t("Przy równych współczynnikach cały iloraz jest stały w otoczeniu.",
      "Equal coefficients make the entire quotient constant off the point."));
  lesson.work("lim[(x,y)→"+at+"]f="+f(onU)+"; f"+at+"="+f(p.valueAt),
    t("Granica jest równa b+a; porównaj ją z wartością funkcji w punkcie.",
      "The limit is b+a; compare it with the assigned function value."));
  lesson.work(classification==="continuous"
    ? "f"+at+"=lim f="+f(onU)
    : "f"+at+"≠lim f; "+t("nowa wartość ","new value ")+f(onU),
    t(classification==="continuous"?"Równość oznacza ciągłość.":"Zmiana jednej wartości usuwa nieciągłość.",
      classification==="continuous"?"Equality establishes continuity.":"Changing one value removes the discontinuity."));
 }
 lesson.work(t("Klasyfikacja: ","Classification: ")+classification,
   t("Klasyfikacja zależy od istnienia granicy oraz jej zgodności z f w punkcie.",
     "Classification depends on both limit existence and agreement with the point value."));
 return lesson.finish(
  t("Sklasyfikuj ciągłość funkcji dwóch zmiennych w punkcie ","Classify continuity at ")+at+
   ".\n"+coordinates(p)+"; "+angularExpression(p)+t(" dla "," for ")+"(x,y)≠"+at+"; f"+at+"="+f(p.valueAt),
  {kind:"choice",value:classification,options:options(locale)},
  t("Porównaj granice wzdłuż u=0 i v=0.","Compare limits along u=0 and v=0."),
  t("Jeśli granice drogowe się zgadzają, sprawdź f w punkcie.","If the path limits agree, check the function value at the point."));
}
