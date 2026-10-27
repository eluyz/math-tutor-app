import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, equalRational as eq, type Rational} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type DegenerateDiskProblem =
 | Readonly<{kind:"multivar-degenerate-quartic";a:Rational;b:Rational;c:Rational;h:Rational;k:Rational}>
 | Readonly<{kind:"multivar-diagonal-quadratic-disk";a:Rational;b:Rational;c:Rational;h:Rational;k:Rational;radius:Rational}>;

type Quartic=Extract<DegenerateDiskProblem,{kind:"multivar-degenerate-quartic"}>;
type Disk=Extract<DegenerateDiskProblem,{kind:"multivar-diagonal-quadratic-disk"}>;
type Point=readonly [Rational,Rational];
export type ExtremaClass="minimum"|"maximum"|"saddle";
export type BoundedExtremum=Readonly<{point:Point;value:Rational}>;
const den=(level:Difficulty)=>level==="hard"?1:level==="advanced"?2:3;
const sign=(n:number)=>n%2===0?1:-1;
const sq=(n:Rational)=>mul(n,n);
const fourth=(n:Rational)=>sq(sq(n));
const cmp=(x:Rational,y:Rational)=>x.numerator*y.denominator<y.numerator*x.denominator?-1:x.numerator*y.denominator>y.numerator*x.denominator?1:0;
function coefficients(v:number,level:Difficulty){
 const d=den(level);
 return {a:r(sign(v)*(1+v%5),d),b:r(sign(Math.floor(v/2))*(1+(v+2)%5),d),
  c:r(v%11-5,d),h:r(v%8-4,d),k:r(Math.floor(v/8)*3+v%4-4,d)};
}
function quartic(v:number,level:Difficulty):Quartic{
 return {kind:"multivar-degenerate-quartic",...coefficients(v,level)};
}
function disk(v:number,level:Difficulty):Disk{
 return {kind:"multivar-diagonal-quadratic-disk",...coefficients(v,level),
  radius:r(1+v%4,den(level))};
}
export const degenerateDiskFamilies:readonly UniversityFamily[]=[
 {id:"multivar-degenerate-quartic",category:"derivatives",
  titles:{pl:"Ekstrema czwartego stopnia — nierozstrzygający Hessian",en:"Fourth-order extrema with inconclusive Hessian"},
  supportedDifficulties:["hard","advanced","expert"],create:quartic},
 {id:"multivar-diagonal-quadratic-disk",category:"derivatives",
  titles:{pl:"Ekstrema funkcji kwadratowej na kole",en:"Quadratic extrema on a disk"},
  supportedDifficulties:["hard","advanced","expert"],create:disk},
];
function valid(p:Quartic|Disk){
 if(p.a.numerator===0n||p.b.numerator===0n)throw Error("Expected two nonzero coefficients");
 if(p.kind==="multivar-diagonal-quadratic-disk"&&p.radius.numerator<=0n)throw Error("Expected a positive radius");
}
export function quarticClassification(p:Quartic):ExtremaClass{
 valid(p);
 if(p.a.numerator>0n&&p.b.numerator>0n)return "minimum";
 if(p.a.numerator<0n&&p.b.numerator<0n)return "maximum";
 return "saddle";
}
export function quarticValue(p:Quartic,x:Rational,y:Rational):Rational{
 valid(p);
 return add(add(mul(p.a,fourth(sub(x,p.h))),mul(p.b,fourth(sub(y,p.k)))),p.c);
}
export function quadraticDiskValue(p:Disk,x:Rational,y:Rational):Rational{
 valid(p);
 return add(add(mul(p.a,sq(sub(x,p.h))),mul(p.b,sq(sub(y,p.k)))),p.c);
}
function axisExtremum(p:Disk,minimum:boolean):BoundedExtremum{
 const candidates=[r(0),p.a,p.b];
 const coeff=candidates.reduce((best,n)=>minimum?(cmp(n,best)<0?n:best):(cmp(n,best)>0?n:best));
 const point:Point=coeff.numerator===0n?[p.h,p.k]
   : eq(coeff,p.a)?[sub(p.h,p.radius),p.k]
   :[p.h,sub(p.k,p.radius)];
 return {point,value:add(p.c,mul(coeff,sq(p.radius)))};
}
export function quadraticDiskExtrema(p:Disk):Readonly<{min:BoundedExtremum;max:BoundedExtremum}>{
 valid(p);
 return {min:axisExtremum(p,true),max:axisExtremum(p,false)};
}
const coords=(p:DegenerateDiskProblem)=>"("+f(p.h)+", "+f(p.k)+")";
const expression=(p:DegenerateDiskProblem,degree:2|4)=>
 "f(x,y)=("+f(p.a)+")(x−("+f(p.h)+"))"+(degree===4?"⁴":"²")+
 "+("+f(p.b)+")(y−("+f(p.k)+"))"+(degree===4?"⁴":"²")+"+("+f(p.c)+")";
const labels=(locale:Locale)=>locale==="pl"?[
 {value:"minimum",label:"minimum lokalne"},{value:"maximum",label:"maksimum lokalne"},
 {value:"saddle",label:"punkt siodłowy"}
]:[
 {value:"minimum",label:"local minimum"},{value:"maximum",label:"local maximum"},
 {value:"saddle",label:"saddle point"}
];
export function presentDegenerateDisk(p:DegenerateDiskProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,point=coords(p);
 if(p.kind==="multivar-degenerate-quartic"){
  const classification=quarticClassification(p);
  lesson.work("u=x−("+f(p.h)+"); v=y−("+f(p.k)+")",
    t("Przesuń punkt krytyczny do (0,0).", "Translate the critical point to (0,0)."));
  lesson.work("f−("+f(p.c)+")=("+f(p.a)+")u⁴+("+f(p.b)+")v⁴",
    t("Czwarte potęgi są nieujemne, a zerują się równocześnie tylko w punkcie krytycznym.",
      "Fourth powers are nonnegative and vanish simultaneously only at the critical point."));
  lesson.work("f_x=4("+f(p.a)+")u³; f_y=4("+f(p.b)+")v³; ∇f"+point+"=(0,0)",
    t("Obie pochodne pierwszego rzędu znikają w badanym punkcie.",
      "Both first partial derivatives vanish at the target point."));
  lesson.work("f_xx=12("+f(p.a)+")u²; f_xy=0; f_yy=12("+f(p.b)+")v²",
    t("W punkcie krytycznym cały Hessian jest zerowy.",
      "At the critical point the whole Hessian matrix is zero."));
  lesson.work("D=f_xx f_yy−f_xy²=0",
    t("Test Hessiana nie rozstrzyga, ale nie oznacza to braku ekstremum.",
      "The Hessian test is inconclusive; that does not imply the absence of an extremum."));
  lesson.work("v=0: f−c=("+f(p.a)+")u⁴; u=0: f−c=("+f(p.b)+")v⁴",
    t("Porównaj znaki wzdłuż dwóch osi; jeśli są zgodne, rozstrzyga znak sumy.",
      "Compare signs along both axes; if they agree, the sum has a fixed sign."));
  lesson.work(t("Rzeczywista klasyfikacja: ","Actual classification: ")+
    (classification==="minimum"?t("ścisłe minimum","strict minimum"):classification==="maximum"?t("ścisłe maksimum","strict maximum"):t("punkt siodłowy","saddle point")),
    t("Jednakowe znaki dają ścisłe ekstremum; przeciwne znaki dają punkt siodłowy.",
      "Equal signs give a strict extremum; opposite signs give a saddle."));
  return lesson.finish(
    t("Określ faktyczny rodzaj punktu krytycznego ","Classify the actual critical point ")+point+
      ".\n"+expression(p,4),
    {kind:"choice",value:classification,options:labels(locale)},
    t("Nie kończ na D=0; sprawdź wyrazy czwartego stopnia.",
      "Do not stop at D=0; examine the fourth-order terms."),
    t("Porównaj znaki a i b oraz zachowanie na osiach przechodzących przez punkt.",
      "Compare the signs of a and b and the behavior on both axes through the point."));
 }
 const extremes=quadraticDiskExtrema(p),R2=sq(p.radius);
 const cp=(pt:Point)=>"("+f(pt[0])+", "+f(pt[1])+")";
 lesson.work("u=x−("+f(p.h)+"); v=y−("+f(p.k)+"); u²+v²≤"+f(R2),
   t("Koło jest domknięte; szukamy wartości globalnych na całej dziedzinie.",
     "The disk is closed; seek global values on the full domain."));
 lesson.work("f−("+f(p.c)+")=("+f(p.a)+")u²+("+f(p.b)+")v²",
   t("Dwa kwadraty są nieujemne i ich suma nie przekracza R².",
     "Both squares are nonnegative and their sum does not exceed R²."));
 lesson.work("m=min(0,a,b); M=max(0,a,b)",
   t("Najmniejszy i największy współczynnik wyznaczają globalne ograniczenia.",
     "The smallest and largest coefficients determine global bounds."));
 lesson.work("f_min=c+R²m="+f(extremes.min.value)+"; f_max=c+R²M="+f(extremes.max.value),
   t("Minimum i maksimum obliczamy dokładnie, bez zaokrągleń.",
     "Calculate both extrema exactly, without rounding."));
 lesson.work(t("Punkt minimum: ","Minimum point: ")+cp(extremes.min.point)+
   t("; punkt maksimum: ","; maximum point: ")+cp(extremes.max.point),
   t("Wartość 0 wybiera środek, współczynnik a oś x, b oś y; na brzegu wybierz ujemny zwrot.",
     "Coefficient 0 chooses the center, a chooses the x-axis, b the y-axis; select the negative axis direction at the boundary."));
 lesson.work(t("Przy remisie wybierz najmniejszy punkt leksykograficznie.","For ties choose the lexicographically smallest point."),
   t("Przy a=b optimum na okręgu ma wiele punktów. Najpierw porównujemy x, potem y.",
     "For a=b an optimal circle has many points. Compare x first, then y."));
 lesson.work("f("+f(extremes.min.point[0])+","+f(extremes.min.point[1])+")="+f(extremes.min.value)+
   "; f("+f(extremes.max.point[0])+","+f(extremes.max.point[1])+")="+f(extremes.max.value),
   t("Podstaw oba punkty do funkcji i sprawdź warunek koła.",
     "Substitute both points into the function and verify the disk constraint."));
 return lesson.finish(
   t("Wyznacz globalne minimum i maksimum oraz wybrane punkty ich osiągania na kole.",
     "Find the global minimum and maximum, with selected attaining points on the disk.")+
   "\n"+expression(p,2)+"\n(x−("+f(p.h)+"))²+(y−("+f(p.k)+"))²≤"+f(R2)+
   "\n"+t("Dla remisów wybierz punkt leksykograficznie najmniejszy.","For ties choose the lexicographically smallest point."),
   {kind:"list",labels:["x_min","y_min","f_min","x_max","y_max","f_max"],values:[
    extremes.min.point[0],extremes.min.point[1],extremes.min.value,
    extremes.max.point[0],extremes.max.point[1],extremes.max.value]},
   t("Użyj m=min(0,a,b), M=max(0,a,b).","Use m=min(0,a,b), M=max(0,a,b)."),
   t("Punkty porównuj ze środkiem i osiami na brzegu koła; sprawdź remisy.",
     "Compare the center with the disk's axis-boundary points; handle ties."));
}
