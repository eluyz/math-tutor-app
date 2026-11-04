import { rational as r, multiplyRational as mul, subtractRational as sub, type Rational } from "../rational";
import { formatRational as f } from "../answers";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching, calculate } from "./teaching";

/** D01: synthetic higher-index radical sums and radical quotients (x>0). */
export type HigherRootDerivativeProblem=Readonly<{
  kind:"derivative-higher-root-powers";
  mode:"sum"|"quotient";
  coefficients:readonly [Rational,Rational,Rational,Rational];
}>;
const neg=(x:Rational)=>mul(r(-1),x);
export const higherRootPowers=Object.freeze({
  sum:[r(2),r(1,3),r(8,5),r(-1,4)],
  quotient:[r(-1,2),r(-2,3)],
});
function task(v:number):HigherRootDerivativeProblem{
  const coeffs:[Rational,Rational,Rational,Rational]=[
    r((v%2?-1:1)*(v+2),1+v%3),
    r((v%3===0?-1:1)*(v+1),2+v%4),
    r((v%4===0?-1:1)*(v+3),2+v%3),
    r((v%5===0?-1:1)*(v+4),3+v%2),
  ];
  return {kind:"derivative-higher-root-powers",mode:v%2?"quotient":"sum",coefficients:coeffs};
}
export const higherRootDerivativeFamilies:readonly UniversityFamily[]=[{
  id:"derivative-higher-root-powers",category:"derivatives",
  titles:{pl:"Pochodne pierwiastków wyższych stopni i ilorazów",
    en:"Derivatives of higher-index radicals and radical quotients"},
  supportedDifficulties:["hard"],create:v=>task(v),
}];
export function higherRootCoefficients(p:HigherRootDerivativeProblem):readonly Rational[]{
  const powers=higherRootPowers[p.mode];
  const c=p.mode==="sum"?p.coefficients:[p.coefficients[0],neg(p.coefficients[1])];
  return powers.map((exponent,i)=>mul(c[i],exponent));
}
export function presentHigherRootDerivative(p:HigherRootDerivativeProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const cs=p.mode==="sum"?p.coefficients:[p.coefficients[0],neg(p.coefficients[1])];
  const powers=higherRootPowers[p.mode],res=higherRootCoefficients(p);
  const expr=p.mode==="sum"
    ?"("+f(p.coefficients[0])+")·x² + ("+f(p.coefficients[1])+")·∛x + ("+f(p.coefficients[2])+")·x·⁵√(x³) + ("+f(p.coefficients[3])+")/⁴√x"
    :"(("+f(p.coefficients[0])+")·x − ("+f(p.coefficients[1])+")·⁶√(x⁵))/(x·√x)";
  const powerText=(z:Rational)=>"x^("+f(z)+")";
  lesson.work("D = (0,+∞)",
    t("Warunek x>0 zapewnia niezerowy mianownik, pierwiastki parzystego stopnia i możliwość użycia potęg wymiernych.",
      "The domain x>0 ensures nonzero denominators, even-index radicals, and valid rational powers."));
  lesson.work("f(x) = "+cs.map((a,i)=>"("+f(a)+")·"+powerText(powers[i])).join(" + "),
    t(p.mode==="sum"
      ?"Korzystamy z ∛x=x^(1/3), x·⁵√(x³)=x^(8/5) i 1/⁴√x=x^(−1/4)."
      :"Cały iloraz dzielimy przez x^(3/2): x/x^(3/2)=x^(−1/2), ⁶√(x⁵)/x^(3/2)=x^(−2/3).",
      p.mode==="sum"
      ?"Use ∛x=x^(1/3), x·⁵√(x³)=x^(8/5), and 1/⁴√x=x^(−1/4)."
      :"Divide the entire numerator by x^(3/2): x/x^(3/2)=x^(−1/2) and ⁶√(x⁵)/x^(3/2)=x^(−2/3)."));
  const after:Rational[]=[];
  for(let i=0;i<powers.length;i++){
    const p1=calculate("product",cs[i],powers[i]),p2=calculate("difference",powers[i],r(1));
    after.push(sub(powers[i],r(1)));
    lesson.work("d/dx[("+f(cs[i])+")·"+powerText(powers[i])+"] = ("+f(p1.result)+")·"+powerText(p2.result),
      t("Stosujemy (c·x^α)′=c·α·x^(α−1); mnożymy współczynnik przez wykładnik i odejmujemy 1.",
        "Use (c·x^α)′=c·α·x^(α−1): multiply the coefficient by the exponent, then subtract 1."),p1,p2);
  }
  lesson.work("f′(x) = "+res.map((z,i)=>"("+f(z)+")·"+powerText(after[i])).join(" + "),
    t("Dodajemy pochodne składników. Odpowiedzi to dokładne współczynniki przy podpisanych potęgach.",
      "Add the derivatives of each term. Answers are exact coefficients for the labelled powers."));
  return lesson.finish(
    t("Wyznacz pochodną po uproszczeniu potęg i pierwiastków, x>0.",
      "Differentiate after simplifying radicals and powers, x>0.")+"\nf(x) = "+expr,
    {kind:"list",values:res,labels:after.map(powerText)},
    t("Przepisz pierwiastki stopni 3, 4, 5 lub 6 jako potęgi wymierne; uwzględnij mianownik.",
      "Rewrite third-, fourth-, fifth- or sixth-index radicals as rational powers; include the denominator."),
    t("Oblicz c·α i α−1 osobno dla każdego składnika. Iloraz upraszczaj przed różniczkowaniem.",
      "Compute c·α and α−1 for each term. Simplify the quotient before differentiating.")
  );
}
