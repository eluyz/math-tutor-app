import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,type Rational} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type FunctionStudyFollowupProblem =
 | Readonly<{kind:"analysis-study-quartic";a:Rational;m:Rational;q:Rational;k:Rational;target:"critical"|"global"}>
 | Readonly<{kind:"analysis-study-rational-shift";a:Rational;m:Rational;q:Rational;k:Rational;target:"critical"|"global"}>;
type Quartic=Extract<FunctionStudyFollowupProblem,{kind:"analysis-study-quartic"}>;
type RationalStudy=Extract<FunctionStudyFollowupProblem,{kind:"analysis-study-rational-shift"}>;
const sq=(x:Rational)=>mul(x,x),fourth=(x:Rational)=>sq(sq(x));
const isPositive=(x:Rational)=>x.numerator>0n;
const sign=(s:boolean)=>s?"+":"−";
const generate=(v:number,d:Difficulty,kind:FunctionStudyFollowupProblem["kind"]):FunctionStudyFollowupProblem=>{
 const denominator=d==="hard"?1:d==="advanced"?2:3;
 return {kind,a:r(v-11,denominator),m:r((v%2===0?1:-1)*(1+v%5),denominator),
  q:r(1+v%4,d==="expert"?3:d==="advanced"?2:1),
  k:r(v%9-4,denominator),target:d==="expert"?"global":"critical"};
};
export const functionStudyFollowupFamilies:readonly UniversityFamily[]=[
 {id:"analysis-study-quartic",category:"derivatives",
  titles:{pl:"Pełne badanie funkcji czwartego stopnia",en:"Complete study of a quartic function"},
  supportedDifficulties:["hard","advanced","expert"],create:(v,d)=>generate(v,d,"analysis-study-quartic")},
 {id:"analysis-study-rational-shift",category:"derivatives",
  titles:{pl:"Badanie funkcji wymiernej z biegunem i asymptotą",en:"Study of a rational function with a pole and asymptote"},
  supportedDifficulties:["hard","advanced","expert"],create:(v,d)=>generate(v,d,"analysis-study-rational-shift")},
];
export function quarticValue(p:Quartic,t:Rational):Rational{
 if(!isPositive(p.q)||p.m.numerator===0n)throw Error("Nondegenerate quartic required");
 return add(mul(p.m,sq(sub(sq(t),sq(p.q)))),p.k);
}
export function rationalStudyValue(p:RationalStudy,t:Rational):Rational{
 if(t.numerator===0n||!isPositive(p.q)||p.m.numerator===0n)throw Error("Pole or degenerate rational function");
 return add(mul(p.m,add(t,div(sq(p.q),t))),p.k);
}
export function criticalPoints(p:FunctionStudyFollowupProblem):readonly Rational[]{
 if(!isPositive(p.q)||p.m.numerator===0n)throw Error("Positive q and nonzero m required");
 const left=sub(p.a,p.q),right=add(p.a,p.q);
 if(p.kind==="analysis-study-quartic")return [left,p.k,p.a,add(p.k,mul(p.m,fourth(p.q))),right,p.k];
 return [left,sub(p.k,mul(r(2),mul(p.m,p.q))),right,add(p.k,mul(r(2),mul(p.m,p.q)))];
}
export function globalExtrema(p:FunctionStudyFollowupProblem):readonly [Rational,Rational]{
 if(!isPositive(p.q)||p.m.numerator===0n)throw Error("Positive q and nonzero m required");
 const edge=p.kind==="analysis-study-quartic"
  ? add(p.k,mul(r(9),mul(p.m,fourth(p.q))))
  : add(p.k,mul(r(5,2),mul(p.m,p.q)));
 const inner=p.kind==="analysis-study-quartic"?p.k:add(p.k,mul(r(2),mul(p.m,p.q)));
 return isPositive(p.m)?[edge,inner]:[inner,edge];
}
export function presentFunctionStudyFollowup(p:FunctionStudyFollowupProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const a=f(p.a),m=f(p.m),q=f(p.q),k=f(p.k),T="(x−("+a+"))";
 const left=sub(p.a,p.q),right=add(p.a,p.q),l=f(left),rr=f(right);
 const positive=isPositive(p.m),up=sign(positive),down=sign(!positive);
 const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
 if(p.kind==="analysis-study-quartic"){
  const expr="("+m+")(("+T+")²−("+q+")²)²+("+k+")",vals=criticalPoints(p);
  work("t=x−("+a+"); f(x)="+expr+"; D=ℝ",
   "Po przesunięciu t=x−a wielomian jest parzysty w t; ma oś symetrii x=a i dziedzinę ℝ.",
   "After t=x−a the polynomial is even in t, with symmetry axis x=a and domain ℝ.");
  work("f′(x)=4("+m+")"+T+"(("+T+")²−("+q+")²)",
   "Reguła łańcuchowa i rozkład na czynniki ujawniają wszystkie zera pochodnej.",
   "The chain rule and factorization expose all derivative zeros.");
  work("f′=0 ⇔ x="+l+", "+a+", "+rr,
   "t=−q,0,q daje trzy różne wartości przy q>0.",
   "t=−q,0,q gives three distinct values because q>0.");
  work("f′: (−∞,"+l+"): "+down+"; ("+l+","+a+"): "+up+"; ("+a+","+rr+"): "+down+"; ("+rr+",+∞): "+up,
   "Tabela znaków f′ określa wzrost i spadek w czterech przedziałach.",
   "The derivative sign chart gives increasing and decreasing intervals.");
  work("f("+l+")="+k+"; f("+a+")="+f(vals[3])+"; f("+rr+")="+k,
   "Wszystkie wartości ekstremalne liczymy przez podstawienie, nie z rysunku.",
   "Compute every stationary value exactly by substitution, not by guessing from a sketch.");
  work("f′′(x)=4("+m+")(3"+T+"²−("+q+")²); x="+a+"±("+q+")/√3",
   "W obu miejscach f′′=0 zmienia się znak: dwa przegięcia, mimo że ich x mogą być niewymierne.",
   "The second derivative changes sign at both roots: two inflections, possibly with irrational x.");
  work("x→±∞: f(x)→"+(positive?"+∞":"−∞")+"; "+t("schemat wykresu: ","graph shape: ")+(positive?"W":"M"),
   "Znak wyrazu najwyższego stopnia i tabela monotoniczności dają jakościowy szkic, bez odgadywania współrzędnych.",
   "The leading coefficient and monotonicity chart determine qualitative shape without guessing coordinates.");
  if(p.target==="critical")return lesson.finish(
   t("Zbadaj funkcję: pochodne, monotoniczność, ekstrema i przegięcia. Zbuduj jakościowy szkic i wpisz (x₁,y₁,x₂,y₂,x₃,y₃) trzech punktów stacjonarnych od lewej do prawej.\nf(x)=",
     "Study derivatives, monotonicity, extrema and inflections. Form a qualitative sketch and enter (x₁,y₁,x₂,y₂,x₃,y₃) for the three stationary points, from left to right.\nf(x)=")+expr,
   {kind:"list",labels:["x₁","y₁","x₂","y₂","x₃","y₃"],values:[...vals]},
   t("Przyjmij t=x−a i rozłóż pochodną na trzy czynniki.",
     "Let t=x−a and factor the derivative into three factors."),
   t("Punkty to t=−q,0,q; podaj także dokładne wartości f.",
     "The critical t values are −q,0,q; also give the exact f values."));
  const start=sub(p.a,mul(r(2),p.q)),end=add(p.a,mul(r(2),p.q)),[maximum,minimum]=globalExtrema(p);
  work("f("+f(start)+")=f("+f(end)+")="+f(quarticValue(p,mul(r(2),p.q)))+"; f("+a+")="+f(vals[3])+"; f("+l+")=f("+rr+")="+k,
   "Na przedziale zamkniętym porównujemy oba końce i trzy punkty krytyczne.",
   "On a closed interval compare both endpoints and all three critical points.");
  work("max f="+f(maximum)+"; min f="+f(minimum),
   "Rachunek jest dokładny także dla ujemnego m.",
   "The comparison is exact even when m is negative.");
  return lesson.finish(
   t("Zbadaj funkcję i oblicz globalne max f oraz min f na [","Study the function and find global max f and min f on [")+f(start)+", "+f(end)+"].\nf(x)="+expr,
   {kind:"list",labels:["max f","min f"],values:[maximum,minimum]},
   t("Sprawdź końce przedziału i trzy miejsca zerowe f′.","Check both endpoints and all three derivative zeros."),
   t("Końce: t=±2q, stacjonarne: t=−q,0,q.","Endpoints: t=±2q; stationary points: t=−q,0,q."));
 }
 const expr="("+m+")("+T+"+("+q+")²/"+T+")+("+k+")",vals=criticalPoints(p);
 work("D=ℝ\\{"+a+"}; t=x−("+a+")≠0; f(x)="+expr,
  "Mianownik wyklucza x=a; wykres ma dwie osobne gałęzie.",
  "The denominator excludes x=a; the graph has two separate branches.");
 work("x→"+a+"⁻: f→"+(positive?"−∞":"+∞")+"; x→"+a+"⁺: f→"+(positive?"+∞":"−∞"),
  "Dominujący składnik mq²/t zmienia znak po obu stronach bieguna.",
  "The dominant mq²/t term changes sign across the pole.");
 work("f(x)−[("+m+")"+T+"+("+k+")]=("+m+")("+q+")²/"+T+"→0",
  "Wynika stąd asymptota ukośna y=m(x−a)+k oraz pionowa x=a.",
  "This gives the oblique asymptote y=m(x−a)+k and vertical asymptote x=a.");
 work("f′(x)=("+m+")(1−("+q+")²/"+T+"²); f′=0 ⇔ x="+l+t(" lub "," or ")+"x="+rr,
  "Reguła sumy daje t²=q², ale biegun x=a pozostaje wykluczony.",
  "The sum rule gives t²=q², while the pole x=a remains excluded.");
 work("f′: (−∞,"+l+"): "+up+"; ("+l+","+a+"): "+down+"; ("+a+","+rr+"): "+down+"; ("+rr+",+∞): "+up,
  "Dzielimy dziedzinę przy obu punktach stacjonarnych i biegunie.",
  "Split the domain at the two stationary points and the pole.");
 work("f("+l+")="+f(vals[1])+"; f("+rr+")="+f(vals[3]),
  "Podstawienie t=−q i t=q daje dokładne wartości lokalnych ekstremów.",
  "Substitute t=−q and t=q for exact local extrema.");
 work("f′′(x)=2("+m+")("+q+")²/"+T+"³; "+t("brak przegięcia","no inflection"),
  "Znak drugiej pochodnej zmienia się jedynie w wykluczonym biegunie; nie jest to przegięcie.",
  "The second derivative changes sign only across the excluded pole, which is not an inflection.");
 work(t("Szkic: dwie gałęzie, biegun x=","Sketch: two branches, pole x=")+a+", "+t("asymptota ukośna y=","oblique asymptote y=")+"("+m+")"+T+"+("+k+")",
  "Granice i asymptoty oraz tabela znaków f′ wyznaczają jakościowy szkic obu gałęzi.",
  "Limits, asymptotes and the derivative sign chart determine the two branches qualitatively.");
 if(p.target==="critical")return lesson.finish(
  t("Zbadaj dziedzinę, asymptoty, monotoniczność, ekstrema i szkic jakościowy. Podaj (x₁,y₁,x₂,y₂) dwóch punktów stacjonarnych.\nf(x)=",
    "Study domain, asymptotes, monotonicity, extrema and qualitative graph shape. Give (x₁,y₁,x₂,y₂) for the two stationary points.\nf(x)=")+expr,
  {kind:"list",labels:["x₁","y₁","x₂","y₂"],values:[...vals]},
  t("Wyklucz x=a, potem oblicz f′ i asymptoty.","Exclude x=a, then compute f′ and asymptotes."),
  t("Rozwiąż t²=q² i oblicz f dla t=±q.","Solve t²=q² and evaluate f at t=±q."));
 const start=add(p.a,mul(r(1,2),p.q)),end=add(p.a,mul(r(2),p.q)),[maximum,minimum]=globalExtrema(p);
 const edge=add(p.k,mul(r(5,2),mul(p.m,p.q)));
 work("f("+f(start)+")=f("+f(end)+")="+f(edge)+"; f("+rr+")="+f(vals[3]),
  "Na przedziale po prawej stronie bieguna porównujemy oba końce i jedyne wewnętrzne ekstremum.",
  "On the interval right of the pole compare both endpoints and the only internal extremum.");
 work("max f="+f(maximum)+"; min f="+f(minimum),
  "Znaki współczynnika m mogą odwrócić maksimum i minimum.",
  "The sign of m can reverse maximum and minimum.");
 return lesson.finish(
  t("Zbadaj funkcję i znajdź globalne max f oraz min f na [","Study the function and find global max f and min f on [")+f(start)+", "+f(end)+"].\nf(x)="+expr,
  {kind:"list",labels:["max f","min f"],values:[maximum,minimum]},
  t("Sprawdź biegun, końce przedziału i punkt x=a+q.","Check the pole, interval endpoints and x=a+q."),
  t("Końce mają t=q/2 i 2q; jedyne wewnętrzne ekstremum jest przy t=q.",
    "Endpoints have t=q/2 and 2q; the only internal extremum occurs at t=q."));
}
