import {
  rational as r, multiplyRational as mul, divideRational as div,
  type Rational,
} from "../rational";
import {formatRational as f, type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type ImproperIntegralProblem =
  | Readonly<{kind:"integral-improper-infinity";k:Rational;a:Rational;power:1|2|3|4}>
  | Readonly<{kind:"integral-improper-endpoint";k:Rational;root:Rational;power:"half"|"one"|"two"}>;

const pow=(a:Rational,n:number):Rational=>Array.from({length:n},()=>a).reduce(mul,r(1));
const signInfinity=(k:Rational):LimitValue=>({kind:k.numerator>0n?"positive-infinity":"negative-infinity"});
const coefficient=(v:number,level:Difficulty):Rational=>
  r((v%2?-1:1)*(v%5+1),level==="hard"?1:level==="advanced"?2:3);

function makeInfinity(v:number,d:Difficulty):ImproperIntegralProblem{
 const power=(((v+Math.floor(v/4))%4)+1) as 1|2|3|4;
 return {kind:"integral-improper-infinity",k:coefficient(v,d),
   a:r(v+2,d==="hard"?1:d==="advanced"?2:3),power};
}
function makeEndpoint(v:number,d:Difficulty):ImproperIntegralProblem{
 const power=(["half","one","two"] as const)[v%3];
 return {kind:"integral-improper-endpoint",k:coefficient(v,d),
   root:r(2+v,d==="hard"?1:d==="advanced"?2:3),power};
}
export const improperIntegralFamilies:readonly UniversityFamily[]=[
 {id:"integral-improper-infinity",category:"integrals",
  titles:{pl:"Całka niewłaściwa na przedziale nieskończonym",en:"Improper integral over an infinite interval"},
  supportedDifficulties:["hard","advanced","expert"],create:makeInfinity},
 {id:"integral-improper-endpoint",category:"integrals",
  titles:{pl:"Całka niewłaściwa z osobliwością na końcu",en:"Improper integral with an endpoint singularity"},
  supportedDifficulties:["hard","advanced","expert"],create:makeEndpoint},
];

export function improperIntegralValue(p:ImproperIntegralProblem):LimitValue{
 if(p.k.numerator===0n)throw Error("Nonzero integral coefficient required");
 if(p.kind==="integral-improper-infinity"){
  if(p.a.numerator<=0n)throw Error("Shift must be positive");
  return p.power===1?signInfinity(p.k):
    {kind:"finite",value:div(p.k,mul(r(p.power-1),pow(p.a,p.power-1)))};
 }
 if(p.root.numerator<=0n)throw Error("Positive square-root endpoint required");
 return p.power==="half"?{kind:"finite",value:mul(mul(r(2),p.k),p.root)}:signInfinity(p.k);
}
export function presentImproperIntegral(p:ImproperIntegralProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const outcome=improperIntegralValue(p);
 const answerText=outcome.kind==="finite"?f(outcome.value):outcome.kind==="positive-infinity"?"+∞":"−∞";
 if(p.kind==="integral-improper-infinity"){
  const label=p.power===1? "x+("+f(p.a)+")":"(x+("+f(p.a)+"))^"+p.power;
  const expr="∫₀^∞ ("+f(p.k)+")/("+label+") dx";
  lesson.work("a="+f(p.a)+">0; k="+f(p.k)+"≠0; p="+p.power,
    t("Podcałkowa jest określona na całym [0,+∞). Zastępujemy granicę górną przez T i przechodzimy z T do +∞.",
      "The integrand is defined on [0,+∞). Replace the upper bound by T and let T approach +∞."));
  lesson.work("I=lim[T→+∞] ∫₀ᵀ ("+f(p.k)+")/(x+("+f(p.a)+"))^"+p.power+" dx",
    t("Całkę niewłaściwą definiujemy jako granicę całek właściwych.",
      "Define the improper integral as a limit of proper integrals."));
  if(p.power===1){
   lesson.work("F(x)=("+f(p.k)+")ln(x+("+f(p.a)+"))",
     t("Dla potęgi pierwszej stosujemy wzór całkowy z logarytmem.",
       "For exponent one the antiderivative is logarithmic."));
   lesson.work("I(T)=("+f(p.k)+")·[ln(T+("+f(p.a)+"))−ln("+f(p.a)+")]",
     t("Dolny wyraz jest stały, natomiast logarytm przy T→+∞ rośnie bez ograniczeń.",
       "The lower endpoint contributes a constant; the logarithm grows without bound as T→+∞."));
  }else{
   const constant=div(p.k,r(1-p.power));
   lesson.work("F(x)=("+f(constant)+")(x+("+f(p.a)+"))^("+(1-p.power)+")",
     t("Całkujemy potęgę z wykładnikiem różnym od −1. Pochodna funkcji pierwotnej odtwarza podcałkową.",
       "Integrate the power with exponent different from −1. Differentiation recovers the integrand."));
   lesson.work("I(T)=("+f(constant)+")[(T+("+f(p.a)+"))^("+(1-p.power)+")−("+f(p.a)+")^("+(1-p.power)+")]",
     t("Wstawiamy obie granice, zachowując ujemny wykładnik.",
       "Evaluate the two endpoints and preserve the negative exponent."));
  }
  lesson.work("lim[T→+∞] I(T)="+answerText,
    p.power===1?t("Skończona granica nie istnieje: całka jest rozbieżna do nieskończoności zgodnej ze znakiem k.",
      "There is no finite limit: the integral diverges with the sign of k."):
    t("Przy wykładniku większym od 1 wyraz zależny od T zanika; pozostaje dokładna wartość granicy.",
      "For exponent greater than one the T-dependent term vanishes, leaving an exact limit."));
  return lesson.finish(
    t("Oblicz całkę niewłaściwą lub wskaż rozbieżność: ",
      "Evaluate the improper integral or identify divergence: ")+expr,
    {kind:"limit",value:outcome},
    t("Zapisz definicję lim T→∞ i sprawdź, czy p=1.",
      "Write the T→∞ limit definition and check whether p=1."),
    t("Dla p>1 stosuj wzór potęgowy, a dla p=1 logarytm.",
      "Use the power rule for p>1 and a logarithm for p=1."));
 }
 const b=mul(p.root,p.root);
 const denom=p.power==="half"?"√(("+f(b)+")−x)":"(("+f(b)+")−x)"+(p.power==="two"?"²":"");
 const expr="∫₀^("+f(b)+") ("+f(p.k)+")/("+denom+") dx";
 lesson.work("b=("+f(p.root)+")²="+f(b)+">0; 0≤x<b",
   t("Osobliwość występuje przy górnym końcu b, więc całkę trzeba zdefiniować przez granicę od lewej.",
     "The singularity occurs at the upper endpoint b, so define the integral as a one-sided limit."));
 lesson.work("I=lim[T→b⁻]∫₀ᵀ ("+f(p.k)+")/("+denom+") dx",
   t("W całkach niewłaściwych nie można po prostu podstawić osobliwego końca do funkcji pierwotnej.",
     "An improper integral cannot evaluate a singular endpoint directly in the antiderivative."));
 if(p.power==="half"){
  lesson.work("F(x)=−2("+f(p.k)+")√(("+f(b)+")−x)",
    t("Podstawiamy u=b−x, du=−dx. Pierwotna ma postać −2k√(b−x).",
      "Substitute u=b−x and du=−dx. The antiderivative is −2k√(b−x)."));
  lesson.work("I(T)=2("+f(p.k)+")[√("+f(b)+")−√(("+f(b)+")−T)]",
    t("Przy T→b⁻ drugi pierwiastek dąży do zera, a pierwszy jest równy dodatniemu √b.",
      "As T→b from the left, the second root vanishes and the first is the positive √b."));
 }else if(p.power==="one"){
  lesson.work("F(x)=−("+f(p.k)+")ln(("+f(b)+")−x)",
    t("Stosujemy podstawienie u=b−x i funkcję pierwotną z logarytmem.",
      "Substitute u=b−x and integrate with a logarithm."));
  lesson.work("I(T)=("+f(p.k)+")[ln("+f(b)+")−ln(("+f(b)+")−T)]",
    t("Logarytm b−T dąży do −∞, więc wartość całki ucieka z odpowiednim znakiem.",
      "The logarithm of b−T approaches −∞, so the integral diverges with the coefficient's sign."));
 }else{
  lesson.work("F(x)=("+f(p.k)+")/(("+f(b)+")−x)",
    t("Pochodna 1/(b−x) wynosi +1/(b−x)², ponieważ oba znaki z reguły łańcuchowej się znoszą.",
      "The derivative of 1/(b−x) is +1/(b−x)² because the chain-rule signs cancel."));
  lesson.work("I(T)=("+f(p.k)+")[1/(("+f(b)+")−T)−1/("+f(b)+")]",
    t("Wyraz 1/(b−T) rośnie do +∞ przy T→b⁻.",
      "The term 1/(b−T) increases to +∞ as T approaches b from the left."));
 }
 lesson.work("lim[T→b⁻]I(T)="+answerText,
   p.power==="half"?t("Całka jest zbieżna. Ponieważ √b jest wymierne, wynik zachowujemy dokładnie.",
       "The improper integral converges. Since √b is rational, the value is exact."):
     t("Wartość całki jest rozbieżna do nieskończoności zależnej od znaku k.",
       "The integral diverges to the infinity set by the sign of k."));
 return lesson.finish(
   t("Oblicz całkę niewłaściwą przy końcu przedziału lub wskaż rozbieżność: ",
     "Evaluate the improper integral at the singular endpoint or identify divergence: ")+expr,
   {kind:"limit",value:outcome},
   t("Zamień górną granicę b na T<b. Dopiero potem licz granicę T→b⁻.",
     "Replace the upper endpoint b by T<b. Then evaluate the limit as T→b⁻."),
   t("Dla pierwiastka otrzymasz skończone 2k√b; dla potęg 1 i 2 całka jest rozbieżna.",
     "The square-root case gives finite 2k√b; exponents 1 and 2 diverge."));
}
