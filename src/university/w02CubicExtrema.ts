import {rational as r,type Rational} from "../rational";
import type {UniversityFamily} from "./schema";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

export type W02CubicExtremaProblem=Readonly<{
 kind:"multivar-cubic-extrema-full";
 a:number;k:number;s:-1|1;
}>;
const variants=24;
export const w02CubicExtremaFamilies:readonly UniversityFamily[]=[{
 id:"multivar-cubic-extrema-full",category:"derivatives",
 titles:{
  pl:"Ekstrema lokalne funkcji sześciennej — wszystkie punkty stacjonarne",
  en:"Cubic local extrema — all stationary points"
 },
 supportedDifficulties:["hard"],
 create:(v:number):W02CubicExtremaProblem=>{
  if(!Number.isInteger(v)||v<0||v>=variants)throw Error("Invalid W02 variant");
  return {kind:"multivar-cubic-extrema-full",
   s:v%2===0?1:-1,
   a:(Math.floor(v/2)%2===0?1:-1)*(2+Math.floor(v/12)%2),
   k:2+Math.floor(v/4)%3};
 }
}];

export function w02CubicExtremum(p:W02CubicExtremaProblem):Readonly<{
 x:Rational;y:Rational;value:Rational;type:"minimum"|"maximum";
 other:"saddle"; hessianDet:Rational;originDet:Rational;
}>{
 const {a,k,s}=p;
 if(!Number.isInteger(a)||a===0||!Number.isInteger(k)||k<=0||(s!==1&&s!==-1))
  throw Error("Expected nonzero integral cubic factor and positive shift");
 const type=s*a<0?"minimum":"maximum";
 return {x:r(-s*k),y:r(-k),value:r(s*a*k*k*k),type,other:"saddle",
  hessianDet:r(27*a*a*k*k),originDet:r(-9*a*a*k*k)};
}

export function presentW02CubicExtrema(p:W02CubicExtremaProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,{a,k,s}=p;
 const c=3*a*k,sy=s*a,ext=w02CubicExtremum(p);
 const expr=`(${a})x³+(${sy})y³+(${c})xy`;
 const x=-s*k,y=-k,D=27*a*a*k*k,D0=-9*a*a*k*k;
 const hxx=6*a*x,hyy=6*s*a*y;
 const labels=ext.type==="minimum"?["x_min","y_min","f_min"]:["x_max","y_max","f_max"];
 lesson.work(`f(x,y)=${expr}; D(f)=ℝ²; f∈C∞(ℝ²)`,
  t("Jest to wielomian, więc wszystkie pochodne i klasyczny test Hessiana istnieją wszędzie.",
    "This polynomial is smooth; every partial and the Hessian test exist everywhere."));
 lesson.work(`f_x=${3*a}x²+(${c})y; f_y=${3*sy}y²+(${c})x`,
  t("Wyznacz obie pochodne cząstkowe i przyrównaj każdą do zera.",
    "Compute both first partial derivatives and set them equal to zero."));
 lesson.work(`f_x=0 ⇒ y=−x²/${k}`,
  t("Wyraź drugą niewiadomą przez pierwszą; nie dziel przez x, bo stracisz rozwiązanie zerowe.",
    "Isolate the second variable; never divide by x or the origin solution will be lost."));
 lesson.work(`f_y=0 ⇒ x(s x³+k³)=0; s=${s}, k=${k}`,
  t("Podstaw wyrażenie na y i rozłóż równanie na czynniki; x=0 jest osobnym przypadkiem.",
    "Substitute y and factor the equation; x=0 is a separate case."));
 lesson.work(`∇f=0 ⇔ (x,y)∈{(0,0),(${x},${y})}`,
  t("Sprawdź oba punkty w oryginalnych równaniach; innych rozwiązań rzeczywistych nie ma.",
    "Verify both points in the original stationarity equations; no other real solutions remain."));
 lesson.work(`f_xx=6(${a})x; f_xy=f_yx=${c}; f_yy=6(${sy})y`,
  t("Oblicz Hessian jako funkcję x i y przed podstawieniem punktów.",
    "Calculate the Hessian as a function of x and y before evaluating either point."));
 lesson.work(`H(0,0): det=${D0}<0 ⇒ (0,0) ${t("siodło","saddle")}`,
  t("Ujemny wyznacznik Hessiana w zerze wyklucza ekstremum, mimo zerowania gradientu.",
    "The negative Hessian determinant at the origin excludes a local extremum despite zero gradient."));
 lesson.work(`H(${x},${y}): f_xx=${hxx}; f_yy=${hyy}; det=${D}>0 ⇒ ${ext.type}`,
  t("Dodatni wyznacznik i znak f_xx dają ścisłe minimum albo maksimum lokalne.",
    "The positive determinant and the sign of f_xx prove a strict local minimum or maximum."));
 lesson.work(`f(${x},${y})=${s*a*k*k*k}; ${ext.type} (${x},${y})`,
  t("Podstaw jedyny niezerowy punkt stacjonarny do funkcji i podaj wartość ekstremum.",
    "Substitute the unique nonzero stationary point into f and report the extremal value."));
 return lesson.finish(t("Znajdź wszystkie punkty stacjonarne i jedyne ekstremum lokalne funkcji ",
   "Find all stationary points and the unique local extremum of ")+`f(x,y)=${expr}.`+
   t(" Wpisz współrzędne i wartość ekstremum w podanych polach; punkt siodłowy wyklucz.",
     " Enter the extremum coordinates and value in the shown fields; exclude the saddle."),
  {kind:"list" as const,labels,values:[ext.x,ext.y,ext.value]},
  t("Rozwiąż oba równania f_x=f_y=0, nie pomijając rozwiązania x=0.",
    "Solve both equations f_x=f_y=0 without discarding x=0."),
  t("Sprawdź Hessian w obu punktach; jeden z nich jest siodłem, nie ekstremum.",
    "Check the Hessian at both points; one is a saddle, not an extremum."));
}
