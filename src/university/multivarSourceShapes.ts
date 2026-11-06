import {rational as r,type Rational} from "../rational";
import type {UniversityFamily} from "./schema";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

export type W01SourceShapeProblem=Readonly<{
 kind:"multivar-source-shape-partial";
 mode:"poly-cubic"|"poly-mixed"|"log-positive"|"root-linear";
 target:"x"|"y"|"xx"|"xy"|"yx"|"yy";
 a:number;b:number;c:number;d:number;
}>;
const modes=["poly-cubic","poly-mixed","log-positive","root-linear"] as const;
const targets=["x","y","xx","xy","yx","yy"] as const;

export const w01SourceShapeFamilies:readonly UniversityFamily[]=[{
 id:"multivar-source-shape-partial",category:"derivatives",
 titles:{pl:"Pochodne cząstkowe — wielomiany, logarytm i pierwiastek",
  en:"Symbolic partials — polynomials, logarithm and square root"},
 supportedDifficulties:["hard"],
 create:(v:number):W01SourceShapeProblem=>{
  const n=Math.floor(v/4);
  return {kind:"multivar-source-shape-partial",mode:modes[v%4],target:targets[n%6],
   a:2+n%3,b:2+(n+1)%3,c:1+(n+2)%3,d:2+(n+3)%3};
 }
}];

export function w01SourceShapeBasis(p:W01SourceShapeProblem):readonly string[]{
 if(p.mode==="poly-cubic")switch(p.target){
  case "x":return ["x²","y"];case "y":return ["x","y"];
  case "xx":return ["x"];case "xy":case "yx":return ["1"];case "yy":return ["1"];
 }
 if(p.mode==="poly-mixed")switch(p.target){
  case "x":return ["x","xy","y²"];case "y":return ["x²","xy"];
  case "xx":return ["1","y"];case "xy":case "yx":return ["x","y"];case "yy":return ["x"];
 }
 if(p.mode==="log-positive")switch(p.target){
  case "x":return ["x/u"];case "y":return ["y/u"];
  case "xx":return ["1/u","x²/u²"];case "xy":case "yx":return ["xy/u²"];
  case "yy":return ["1/u","y²/u²"];
 }
 switch(p.target){
  case "x":return ["x/√u"];case "y":return ["1/√u"];
  case "xx":return ["1/√u","x²/u^(3/2)"];
  case "xy":case "yx":return ["x/u^(3/2)"];
  case "yy":return ["1/u^(3/2)"];
 }
}
export function w01SourceShapeCoefficients(p:W01SourceShapeProblem):readonly Rational[]{
 const {a,b,c,target:t}=p;
 if(p.mode==="poly-cubic")switch(t){
  case "x":return [r(3*a),r(b)];case "y":return [r(b),r(-2*c)];
  case "xx":return [r(6*a)];case "xy":case "yx":return [r(b)];case "yy":return [r(-2*c)];
 }
 if(p.mode==="poly-mixed")switch(t){
  case "x":return [r(2*a),r(-2*b),r(c)];
  case "y":return [r(-b),r(2*c)];
  case "xx":return [r(2*a),r(-2*b)];
  case "xy":case "yx":return [r(-2*b),r(2*c)];
  case "yy":return [r(2*c)];
 }
 if(p.mode==="log-positive")switch(t){
  case "x":return [r(2*a)];case "y":return [r(2*b)];
  case "xx":return [r(2*a),r(-4*a*a)];
  case "xy":case "yx":return [r(-4*a*b)];
  case "yy":return [r(2*b),r(-4*b*b)];
 }
 switch(t){
  case "x":return [r(a)];case "y":return [r(b,2)];
  case "xx":return [r(a),r(-a*a)];
  case "xy":case "yx":return [r(-a*b,2)];
  case "yy":return [r(-b*b,4)];
 }
}

export function presentW01SourceShape(p:W01SourceShapeProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const {a,b,c,d}=p;
 const polynomial=p.mode==="poly-cubic"||p.mode==="poly-mixed";
 const formula=p.mode==="poly-cubic"
  ?`(${a})x³+(${b})xy−(${c})y²`
  :p.mode==="poly-mixed"
  ?`(${a})x²−(${b})x²y+(${c})xy²+(${d})`
  :p.mode==="log-positive"
  ?`ln((${a})x²+(${b})y²+(${d}))`
  :`√((${a})x²+(${b})y+(${d}))`;
 const u=p.mode==="log-positive"
  ?`(${a})x²+(${b})y²+(${d})`
  :`(${a})x²+(${b})y+(${d})`;
 const basis=w01SourceShapeBasis(p),values=w01SourceShapeCoefficients(p);
 const target=`f_${p.target}`;
 lesson.work(`f(x,y)=${formula}`,
  t("Rozpoznaj strukturę funkcji; obliczamy pochodną jako funkcję, a nie jej wartość w punkcie.",
    "Identify the structure; find the derivative as a function, not its value at a point."));
 if(polynomial){
  lesson.work("D(f)=ℝ²; f∈C∞(ℝ²)",
   t("Wielomiany są gładkie w całej płaszczyźnie; pochodne mieszane są równe.",
    "Polynomials are smooth everywhere; their mixed partials agree."));
  const fx=p.mode==="poly-cubic"
   ?`(${3*a})x²+(${b})y`
   :`(${2*a})x−(${2*b})xy+(${c})y²`;
  const fy=p.mode==="poly-cubic"
   ?`(${b})x−(${2*c})y`
   :`−(${b})x²+(${2*c})xy`;
  const fxx=p.mode==="poly-cubic"?`(${6*a})x`:`(${2*a})−(${2*b})y`;
  const fxy=p.mode==="poly-cubic"?String(b):`−(${2*b})x+(${2*c})y`;
  const fyy=p.mode==="poly-cubic"?String(-2*c):`(${2*c})x`;
  lesson.work(`f_x=${fx}; f_y=${fy}`,
   t("Traktuj drugą zmienną jako stałą i różniczkuj każdy wyraz osobno.",
    "Hold the other variable constant and differentiate every monomial separately."));
  lesson.work(`f_xx=${fxx}; f_xy=f_yx=${fxy}; f_yy=${fyy}`,
   t("Różniczkuj ponownie. Dla wielomianu kolejność pochodnych mieszanych nie ma znaczenia.",
    "Differentiate again. Mixed partial order does not matter for a polynomial."));
  const selected=p.target==="x"?fx:p.target==="y"?fy:p.target==="xx"?fxx:
    p.target==="yy"?fyy:fxy;
  lesson.work(`${target}(x,y)=${selected}`,
   t("Wybierz wskazaną pochodną i sprawdź jej znaki oraz potęgi.",
    "Select the requested partial and check signs and exponents."));
  lesson.work(`B=(${basis.join(", ")}); ${target}=ΣᵢcᵢBᵢ`,
   t("Współczynniki podajemy w zadanej bazie funkcji; kolejność ma znaczenie.",
    "Enter the coefficients in the specified function basis, in the given order."));
 }else{
  lesson.work(p.mode==="log-positive"
   ? "D(f)=ℝ²; u>0 ∀(x,y); D(C²)=ℝ²"
   : "D(f)={u≥0}; D(C²)={u>0}",
   p.mode==="log-positive"
    ?t("Dodatnie współczynniki przy x² i y² oraz dodatnia stała zapewniają u>0 wszędzie.",
      "Positive quadratic coefficients and a positive constant ensure u>0 everywhere.")
    :t("Pierwiastek wymaga u≥0. Pochodne drugiego rzędu liczymy na otwartym obszarze u>0.",
      "The square root requires u≥0. Second partials are evaluated on the open region u>0."));
  const ux=`(${2*a})x`,uy=p.mode==="log-positive"?`(${2*b})y`:String(b);
  const uyy=p.mode==="log-positive"?String(2*b):"0";
  lesson.work(`u=${u}; u_x=${ux}; u_y=${uy}; u_xx=${2*a}; u_xy=u_yx=0; u_yy=${uyy}`,
   t("Rozpisz pochodne wewnętrznego argumentu u w obu zmiennych.",
    "Compute both partial derivatives of the inner expression u."));
  lesson.work(p.mode==="log-positive"
   ? "F′(u)=1/u; F″(u)=−1/u²"
   : "F′(u)=1/(2√u); F″(u)=−1/(4u^(3/2))",
   t("Zachowaj pochodne funkcji zewnętrznej i ich właściwe współczynniki.",
    "Retain the outer derivatives and their exact constants."));
  lesson.work("f_i=F′(u)u_i; f_ij=F″(u)u_i u_j+F′(u)u_ij; f_xy=f_yx",
   t("Druga pochodna wymaga reguły łańcuchowej i iloczynu, z uwzględnieniem u_ij.",
    "The second derivative uses both chain and product rules, including u_ij."));
  lesson.work(p.target.length===1
   ?`${target}=F′(u)u_${p.target}`
   :`${target}=F″(u)u_${p.target[0]}u_${p.target[1]}+F′(u)u_${p.target}`,
   t("Podstaw pochodne argumentu do wzoru dla wybranego indeksu.",
    "Substitute the inner derivatives into the formula for the requested indices."));
 }
 lesson.work(`${target}=`+values.map((q,i)=>`(${q.numerator}/${q.denominator})·${basis[i]}`).join(" + "),
  t("Przekształć wynik do podanej bazy i wpisz dokładne współczynniki.",
    "Express the result in the given basis and enter the exact coefficients."));
 return lesson.finish(
  t("Wyznacz ","Find ")+target+t(" jako funkcję. Wpisz współczynniki w bazie: ",
   " as a function. Enter coefficients in this basis: ")+basis.join(", ")+
   `.\nf(x,y)=${formula}`+(polynomial?"":`; u=${u}`)+".",
  {kind:"list" as const,labels:basis,values},
  t("Ustal dziedzinę i policz pierwsze pochodne.",
    "Determine the domain and first derivatives."),
  p.target.length===1
   ?t("Dla pierwszej pochodnej zastosuj właściwą regułę potęgową lub łańcuchową.",
     "For the first partial use the appropriate power or chain rule.")
   :t("Zróżniczkuj ponownie; sprawdź oba składniki i równość pochodnych mieszanych.",
     "Differentiate again; include both terms and check mixed-partial equality."),
 );
}
