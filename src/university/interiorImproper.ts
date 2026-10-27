import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,type Rational} from "../rational";
import {formatRational as f,type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

type PowerProblem=Readonly<{kind:"integral-improper-interior-power";at:Rational;leftRoot:Rational;rightRoot:Rational;k:Rational;power:"half"|"one"|"two"}>;
type PVProblem=Readonly<{kind:"integral-improper-interior-pv";at:Rational;leftLength:Rational;rightLength:Rational;k:Rational}>;
export type InteriorImproperProblem=PowerProblem|PVProblem;
const denominator=(d:Difficulty)=>d==="hard"?1:d==="advanced"?2:3;
const sign=(v:number)=>v%2===0?1:-1;
const pos=(x:Rational)=>x.numerator>0n;
const equal=(x:Rational,y:Rational)=>x.numerator*y.denominator===y.numerator*x.denominator;
function makePower(v:number,level:Difficulty):PowerProblem{
 const den=denominator(level);
 return {kind:"integral-improper-interior-power",at:r(v-11,den),
  leftRoot:r(1+v%6),rightRoot:r(1+Math.floor(v/6)%4),
  k:r(sign(v)*(1+v%5),den),power:(["half","one","two"] as const)[v%3]};
}
function makePV(v:number,level:Difficulty):PVProblem{
 const den=denominator(level),a=r(1+v%8,den);
 return {kind:"integral-improper-interior-pv",at:r(v-11,den),
  leftLength:a,rightLength:v%2===0?a:add(a,r(1+Math.floor(v/2)%3,den)),
  k:r(sign(v)*(1+v%5),den)};
}
export const interiorImproperFamilies:readonly UniversityFamily[]=[
 {id:"integral-improper-interior-power",category:"integrals",
  titles:{pl:"Całka niewłaściwa z osobliwością wewnątrz przedziału",en:"Improper integral with an interior singularity"},
  supportedDifficulties:["hard","advanced","expert"],create:makePower},
 {id:"integral-improper-interior-pv",category:"integrals",
  titles:{pl:"Wartość główna Cauchy’ego a rozbieżność całki",en:"Cauchy principal value versus improper divergence"},
  supportedDifficulties:["hard","advanced","expert"],create:makePV},
];
export type PVClass="divergent-pv-zero"|"divergent-pv-nonzero";
export function improperInteriorResult(p:InteriorImproperProblem):LimitValue|PVClass{
 if(p.k.numerator===0n)throw Error("Nonzero numerator coefficient required");
 if(p.kind==="integral-improper-interior-pv"){
  if(!pos(p.leftLength)||!pos(p.rightLength))throw Error("Interior offsets must be positive");
  return equal(p.leftLength,p.rightLength)?"divergent-pv-zero":"divergent-pv-nonzero";
 }
 if(!pos(p.leftRoot)||!pos(p.rightRoot))throw Error("Positive distances required");
 if(p.power==="half"){
  return {kind:"finite",value:mul(mul(r(2),p.k),add(p.leftRoot,p.rightRoot))};
 }
 return {kind:p.k.numerator>0n?"positive-infinity":"negative-infinity"};
}
function pvOptions(locale:Locale){
 const pl=[
  "Całka niewłaściwa jest rozbieżna; wartość główna Cauchy’ego wynosi 0",
  "Całka niewłaściwa jest rozbieżna; wartość główna Cauchy’ego jest niezerowa",
  "Całka niewłaściwa jest zbieżna i równa wartości głównej",
  "Całka niewłaściwa i wartość główna Cauchy’ego nie istnieją",
 ];
 const en=[
  "The improper integral diverges; its Cauchy principal value is zero",
  "The improper integral diverges; its Cauchy principal value is nonzero",
  "The improper integral converges and equals its principal value",
  "Neither the improper integral nor the Cauchy principal value exists",
 ];
 return (["divergent-pv-zero","divergent-pv-nonzero","convergent","no-pv"] as const)
  .map((value,i)=>({value,label:(locale==="pl"?pl:en)[i]}));
}
function presentPower(p:PowerProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const left=sub(p.at,mul(p.leftRoot,p.leftRoot)),right=add(p.at,mul(p.rightRoot,p.rightRoot));
 const at=f(p.at),a=f(p.leftRoot),b=f(p.rightRoot),k=f(p.k);
 const power=p.power==="half"?"1/2":p.power==="one"?"1":"2";
 const outcome=improperInteriorResult(p);
 if(typeof outcome==="string")throw Error("Expected limit result");
 const ans=outcome.kind==="finite"?f(outcome.value):outcome.kind==="positive-infinity"?"+∞":"−∞";
 lesson.work("h="+at+"; L="+f(left)+"<h<R="+f(right),
  t("Punkt osobliwy leży wewnątrz przedziału, a nie na jego końcu.",
    "The singularity lies inside the interval, not at either endpoint."));
 lesson.work("I=lim[ε→0⁺]∫_"+f(left)+"^(h−ε) k/|x−h|^"+power+" dx + lim[δ→0⁺]∫_(h+δ)^"+f(right)+" k/|x−h|^"+power+" dx",
  t("Obie całki jednostronne wymagają osobnych granic ε i δ. Nie wolno ich przedwcześnie skracać.",
    "The left and right integrals require independent limits ε and δ. Do not cancel their divergences."));
 if(p.power==="half"){
  lesson.work("u=|x−h|; ∫u^(−1/2)du=2√u",
   t("Po obu stronach osobliwości podstawienie odległości od h daje tę samą dodatnią całkę bazową.",
     "On both sides, substitute distance from h; each side has the same positive base integral."));
  lesson.work("I_left=2("+k+")√(h−L)=2("+k+")("+a+"); I_right=2("+k+")√(R−h)=2("+k+")("+b+")",
   t("Wartości jednostronne są skończone; √(h−L)=a i √(R−h)=b z konstrukcji granic.",
     "Both one-sided integrals are finite; the boundary distances are perfect squares."));
  lesson.work("I=2("+k+")("+a+"+"+b+")="+ans,
   t("Całka niewłaściwa jest zbieżna i ma dokładną wartość wymierną.",
     "The improper integral converges to this exact rational value."));
 }else{
  lesson.work("∫ε^A k/u^"+power+" du "+t("jest rozbieżna dla p≥1","diverges for p≥1"),
   p.power==="one"?
    t("Dla p=1 pierwotna to k ln(u), a ln(ε)→−∞.",
      "For p=1 the antiderivative is k ln(u) and ln(ε)→−∞."):
    t("Dla p=2 pierwotna to −k/u, więc 1/ε→+∞.",
      "For p=2 the antiderivative is −k/u and 1/ε→+∞."));
  lesson.work("I_left→"+ans+"; I_right→"+ans,
   t("Każda jednostronna całka ma rozbieżność zgodną ze znakiem k; suma nie jest skończona.",
     "Each one-sided integral diverges with the sign of k; their sum is not finite."));
 }
 return lesson.finish(
  t("Oblicz całkę niewłaściwą z punktem osobliwym wewnątrz przedziału lub wskaż rozbieżność: ",
    "Evaluate the interior-singularity improper integral or identify divergence: ")+
    "∫_("+f(left)+")^("+f(right)+") ("+k+")/|x−("+at+")|^("+power+") dx",
  {kind:"limit",value:outcome},
  t("Rozdziel całkę w x=h i zbadaj obie granice jednostronne osobno.",
    "Split at x=h and evaluate both one-sided limits separately."),
  t("Dla p=1/2 całka jest zbieżna; dla p≥1 każda strona jest rozbieżna.",
    "For p=1/2 both integrals converge; for p≥1 each side diverges."));
}
function presentPV(p:PVProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const left=sub(p.at,p.leftLength),right=add(p.at,p.rightLength),at=f(p.at);
 const k=f(p.k),a=f(p.leftLength),b=f(p.rightLength),result=improperInteriorResult(p);
 if(typeof result!=="string")throw Error("Expected PV classification");
 lesson.work("L="+f(left)+"<h="+at+"<R="+f(right),
  t("Funkcja k/(x−h) ma biegun wewnątrz przedziału.",
    "The function k/(x−h) has a pole in the interior."));
 lesson.work("I_left=lim[ε→0⁺]k(ln ε−ln("+a+")); I_right=lim[δ→0⁺]k(ln("+b+")−ln δ)",
  t("Jednostronne całki są oddzielnymi granicami, które uciekają do przeciwnych nieskończoności.",
    "The two improper one-sided integrals use independent limits and diverge with opposite signs."));
 lesson.work(t("Całka niewłaściwa jest rozbieżna.","The ordinary improper integral diverges."),
  t("Wyrażenie +∞−∞ nie jest skończoną całką. Nie można utożsamiać go z wartością główną.",
    "Cancelling opposite infinities is not a valid improper integral. The principal value is different."));
 lesson.work("PV=lim[ε→0⁺][∫_L^(h−ε)+∫_(h+ε)^R]k/(x−h)dx",
  t("Wartość główna narzuca wspólną symetryczną odległość ε od osobliwości.",
    "The principal value uses the same symmetric epsilon on both sides of the pole."));
 lesson.work("PV=("+k+")ln("+b+"/"+a+") "+(result==="divergent-pv-zero"?"=0":"≠0"),
  result==="divergent-pv-zero"?
   t("Odległości do obu końców są równe, więc ln(1)=0.",
     "The distances to both endpoints are equal, so ln(1)=0."):
   t("Odległości są różne; dodatni iloraz jest różny od 1, więc logarytm jest niezerowy.",
     "Unequal positive distances make the log-ratio nonzero."));
 return lesson.finish(
  t("Oceń zbieżność zwykłej całki niewłaściwej i jej wartość główną Cauchy’ego: ",
    "Classify the ordinary improper integral and its Cauchy principal value: ")+
  "∫_("+f(left)+")^("+f(right)+") ("+k+")/(x−("+at+")) dx",
  {kind:"choice",value:result,options:pvOptions(locale)},
  t("Zwykłą całkę podziel na dwie niezależne granice; nie używaj wspólnego ε.",
    "Split the ordinary improper integral into independent one-sided limits; do not force a common epsilon."),
  t("Dopiero wartość główna PV używa symetrycznego ε i równa się k ln(b/a).",
    "Only the principal value uses symmetric epsilon and equals k ln(b/a)."));
}
export function presentInteriorImproper(p:InteriorImproperProblem,locale:Locale){
 return p.kind==="integral-improper-interior-power"?presentPower(p,locale):presentPV(p,locale);
}
