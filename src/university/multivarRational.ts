import {rational as r,type Rational} from "../rational";
import type {UniversityFamily} from "./schema";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";
export type MultivarRationalProblem=Readonly<{
 kind:"multivar-rational-partial";
 mode:"inverse-cubic"|"linear-quotient"|"simple-quotient"|"bilinear-quotient";
 target:"x"|"y"|"xx"|"xy"|"yx"|"yy";
 a:number;b:number;c:number;d:number;
}>;
const modes=["inverse-cubic","linear-quotient","simple-quotient","bilinear-quotient"] as const;
const targets=["x","y","xx","xy","yx","yy"] as const;
export const multivarRationalFamilies:readonly UniversityFamily[]=[{
 id:"multivar-rational-partial",category:"derivatives",
 titles:{pl:"Pochodne cząstkowe funkcji wymiernych dwóch zmiennych",en:"Symbolic partial derivatives of bivariate rational functions"},
 supportedDifficulties:["hard"],
 create:(v:number):MultivarRationalProblem=>{
  const n=Math.floor(v/4);
  return {kind:"multivar-rational-partial",mode:modes[v%4],target:targets[n%6],
   a:2+n%3,b:2+(n+1)%3,c:2+(n+2)%3,d:2+(n+3)%3};
 }
}];
export function multivarRationalBasis(p:MultivarRationalProblem):readonly string[]{
 switch(p.mode){
  case "inverse-cubic":switch(p.target){
   case "x":return ["y","x/y³"];case "y":return ["x","x²/y⁴"];case "xx":return ["1/y³"];
   case "xy":case "yx":return ["1","x/y⁴"];case "yy":return ["x²/y⁵"];
  }
  case "linear-quotient":switch(p.target){
   case "x":return ["y/v²"];case "y":return ["x/v²"];case "xx":return ["y/v³"];
   case "xy":case "yx":return ["x/v³","y/v³"];case "yy":return ["x/v³"];
  }
  case "simple-quotient":switch(p.target){
   case "x":return ["y/x²"];case "y":return ["1/x"];case "xx":return ["y/x³"];
   case "xy":case "yx":return ["1/x²"];case "yy":return ["1"];
  }
  case "bilinear-quotient":switch(p.target){
   case "x":return ["y²/v²"];case "y":return ["x²/v²"];case "xx":return ["y²/v³"];
   case "xy":case "yx":return ["xy/v³"];case "yy":return ["x²/v³"];
  }
 }
}
export function multivarRationalCoefficients(p:MultivarRationalProblem):readonly Rational[]{
 const {a,b,c,d,target:t,mode}=p;
 let values:readonly number[];
 if(mode==="inverse-cubic"){
  switch(t){
   case "x":values=[a,2*b];break;case "y":values=[a,-3*b];break;
   case "xx":values=[2*b];break;case "xy":case "yx":values=[a,-6*b];break;
   case "yy":values=[12*b];break;
  }
 }else if(mode==="linear-quotient"){
  const delta=a*d+b*c;
  switch(t){
   case "x":values=[delta];break;case "y":values=[-delta];break;
   case "xx":values=[-2*c*delta];break;
   case "xy":case "yx":values=[c*delta,-d*delta];break;
   case "yy":values=[2*d*delta];break;
  }
 }else if(mode==="simple-quotient"){
  switch(t){
   case "x":values=[-a];break;case "y":values=[a];break;case "xx":values=[2*a];break;
   case "xy":case "yx":values=[-a];break;case "yy":values=[0];break;
  }
 }else{
  switch(t){
   case "x":values=[-a*c];break;case "y":values=[a*b];break;
   case "xx":values=[2*a*b*c];break;case "xy":case "yx":values=[-2*a*b*c];break;
   case "yy":values=[2*a*b*c];break;
  }
 }
 return values.map(n=>r(n));
}
export function presentMultivarRational(p:MultivarRationalProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const {a,b,c,d}=p;
 const z=p.mode==="inverse-cubic"
  ?{f:`(${a})xy+(${b})x²/y³`,N:`(${a})xy⁴+(${b})x²`,v:"y",m:3,
    Nx:`(${a})y⁴+(${2*b})x`,Ny:`(${4*a})xy³`,vx:"0",vy:"1"}
  :p.mode==="linear-quotient"
  ?{f:`((${a})x−(${b})y)/((${c})x+(${d})y)`,N:`(${a})x−(${b})y`,v:`(${c})x+(${d})y`,
    m:1,Nx:String(a),Ny:String(-b),vx:String(c),vy:String(d)}
  :p.mode==="simple-quotient"
  ?{f:`(${a})y/x`,N:`(${a})y`,v:"x",m:1,Nx:"0",Ny:String(a),vx:"1",vy:"0"}
  :{f:`(${a})xy/((${b})x−(${c})y)`,N:`(${a})xy`,v:`(${b})x−(${c})y`,
    m:1,Nx:`(${a})y`,Ny:`(${a})x`,vx:String(b),vy:String(-c)};
 const basis=multivarRationalBasis(p),values=multivarRationalCoefficients(p);
 lesson.work(`f(x,y)=${z.f}; N=${z.N}; v=${z.v}; m=${z.m}; f=N/v^m`,
  t("Przepisz funkcję jako N/v^m, aby obliczać kolejne pochodne jedną metodą.","Rewrite the function as N/v^m to derive each partial by one method."));
 lesson.work(`D(f)={v≠0}; v=${z.v}; f∈C∞(D(f))`,
  t("Wyklucz wszystkie miejsca zerowe mianownika; na tej dziedzinie funkcja jest gładka.","Exclude all denominator zeros; the function is smooth on the remaining domain."));
 lesson.work(`N_x=${z.Nx}; N_y=${z.Ny}; v_x=${z.vx}; v_y=${z.vy}`,
  t("Różniczkuj licznik i mianownik osobno, traktując drugą zmienną jako stałą.","Differentiate numerator and denominator, keeping the other variable fixed."));
 lesson.work("A_i=N_i v−m N v_i; f_i=A_i/v^(m+1)",
  t("Zastosuj regułę ilorazu dla potęgi mianownika.","Use the quotient rule for a power of the denominator."));
 lesson.work("f_ij=((A_i)_j v−(m+1)A_i v_j)/v^(m+2); f_xy=f_yx",
  t("Różniczkuj ponownie. Pochodne mieszane są równe na całej dziedzinie.","Differentiate again. Mixed partials agree throughout the domain."));
 lesson.work(p.target.length===1
  ?`f_${p.target}=A_${p.target}/v^(${z.m+1})`
  :`f_${p.target}=((A_${p.target[0]})_${p.target[1]} v−(${z.m+1})A_${p.target[0]}v_${p.target[1]})/v^(${z.m+2})`,
  t("Podstaw pochodne do wzoru i uprość licznik.","Substitute the calculated derivatives and simplify the numerator."));
 lesson.work(`f_${p.target}=`+values.map((q,i)=>`(${q.numerator}/${q.denominator})·${basis[i]}`).join(" + "),
  t("Odczytaj współczynniki przy elementach wskazanej bazy funkcji.","Read off the coefficients in the stated function basis."));
 return lesson.finish(t("Wyznacz ","Find ")+`f_${p.target}`+
  t(" jako funkcję. Wpisz współczynniki w bazie: "," as a function. Enter coefficients in this basis: ")+
  basis.join(", ")+`.\nf(x,y)=${z.f}; v=${z.v}; D(f)={v≠0}.`,
  {kind:"list" as const,labels:basis,values},
  t("Sprawdź, gdzie mianownik v nie jest równy zeru.","Check where the denominator v is nonzero."),
  p.target.length===1
   ?t("Zastosuj f_i=(N_i v−m N v_i)/v^(m+1).","Apply f_i=(N_i v−m N v_i)/v^(m+1).")
   :t("Oblicz A_i, a następnie jeszcze raz użyj reguły ilorazu.","Find A_i and apply the quotient rule again."));
}
