import {
  rational as r, addRational as add, multiplyRational as mul,
  type Rational,
} from "../rational";
import { formatRational as f } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

export type TrigMode = "sin" | "cos" | "tan";
export type SpecialPhase = "0" | "π" | "π/2" | "3π/2";
export type TrigDerivativeProblem =
  | Readonly<{
    kind: "derivative-trig-chain";
    mode: TrigMode; coefficient: Rational; innerSlope: number; shift: Rational;
  }>
  | Readonly<{
    kind: "derivative-trig-special-point";
    mode: TrigMode; coefficient: Rational; innerSlope: number;
    at: Rational; linearSlope: Rational; phase: SpecialPhase;
  }>;

const sign=(v:number)=>v%2?-1:1;
const index=(d:Difficulty)=>d==="easy"?0:d==="medium"?1:2;
function formulaProblem(v:number,d:Difficulty):TrigDerivativeProblem {
  const n=index(d), den=n===0?1:n===1?2:3;
  return {kind:"derivative-trig-chain",mode:(["sin","cos","tan"] as const)[v%3],
    coefficient:r(sign(v)*(1+(v%5)),den),
    innerSlope:2+((v+2*n)%4),
    shift:add(r(v-11),r(n,7)),
  };
}
function pointProblem(v:number,d:Difficulty):TrigDerivativeProblem {
  const n=index(d),mode=(["sin","cos","tan"] as const)[v%3];
  const phase:SpecialPhase=mode==="cos"?(v%2?"3π/2":"π/2"):(v%2?"π":"0");
  return {kind:"derivative-trig-special-point",mode,
    coefficient:r(sign(v)*(1+(v%5)),n===0?1:n===1?2:3),
    innerSlope:2+((v+n)%4),
    at:add(r(v-11),r(n,7)),
    linearSlope:n===0?r(0):r((v%7)-3,n===1?2:3),
    phase,
  };
}
export const trigDerivativeFamilies:readonly UniversityFamily[]=[
  {id:"derivative-trig-chain",category:"derivatives",
    titles:{pl:"Pochodne sin, cos, tg — reguła łańcuchowa",en:"Sin, cos, tan derivatives — chain rule"},
    supportedDifficulties:["easy","medium","hard"],create:formulaProblem},
  {id:"derivative-trig-special-point",category:"derivatives",
    titles:{pl:"Pochodna trygonometryczna w punkcie",en:"Trigonometric derivative at a special angle"},
    supportedDifficulties:["easy","medium","hard"],create:pointProblem},
];
const name=(mode:TrigMode,locale:Locale)=>mode==="tan"&&locale==="pl"?"tg":mode;
const linear=(k:number,b:Rational)=>"("+k+")x+("+f(b)+")";
const derivativeTrigonometric=(mode:TrigMode,u:string,coefficient:Rational)=>{
  if(mode==="sin")return "("+f(coefficient)+")cos("+u+")";
  if(mode==="cos")return "("+f(mul(coefficient,r(-1)))+")sin("+u+")";
  return "("+f(coefficient)+")/cos²("+u+")";
};
export function derivativeFormula(p:Extract<TrigDerivativeProblem,{kind:"derivative-trig-chain"}>):string {
  return derivativeTrigonometric(p.mode,linear(p.innerSlope,p.shift),mul(p.coefficient,r(p.innerSlope)));
}
export function phaseFactor(p:Extract<TrigDerivativeProblem,{kind:"derivative-trig-special-point"}>):number {
  if(p.mode==="tan")return 1; // cos²(0) = cos²(π) = 1
  if(p.mode==="sin")return p.phase==="0"?1:-1;
  return p.phase==="π/2"?-1:1; // -sin(π/2) = -1; -sin(3π/2) = +1
}
export function pointDerivative(p:Extract<TrigDerivativeProblem,{kind:"derivative-trig-special-point"}>):Rational {
  return add(mul(p.coefficient,r(p.innerSlope*phaseFactor(p))),p.linearSlope);
}
function pickFour(correct:string,wrong:readonly [string,string,string],seed:number) {
  const labels=[correct,...wrong];
  if(new Set(labels).size!==4)throw Error("Non-distinct derivative answer choices");
  const options=labels.map((label,i)=>({value:"trig-answer:"+i,label}));
  const offset=seed%4;
  return {kind:"choice" as const,value:options[0].value,
    options:[...options.slice(offset),...options.slice(0,offset)]};
}
export function presentTrigDerivative(p:TrigDerivativeProblem,locale:Locale) {
  const lesson=teaching(locale),{t}=lesson;
  if(p.kind==="derivative-trig-chain"){
    const u=linear(p.innerSlope,p.shift);
    const expected=derivativeFormula(p);
    const ak=mul(p.coefficient,r(p.innerSlope));
    const signWrong=derivativeTrigonometric(p.mode,u,mul(ak,r(-1)));
    const missingChain=derivativeTrigonometric(p.mode,u,p.coefficient);
    const wrongFunction="("+f(ak)+")"+(p.mode==="cos"?"cos":"sin")+"("+u+")";
    lesson.work("u(x) = "+u+"; u′(x) = "+p.innerSlope,
      t("Najpierw różniczkujemy argument funkcji trygonometrycznej.",
        "Differentiate the inner argument first."));
    const rule=p.mode==="sin"?"(sin u)′=cos(u)·u′":p.mode==="cos"?"(cos u)′=−sin(u)·u′":"(tan u)′=u′/cos²(u)";
    lesson.work(rule,
      t("Stosujemy regułę łańcuchową i pochodną odpowiedniej funkcji trygonometrycznej.",
        "Apply the chain rule and the derivative of the selected trigonometric function."));
    lesson.work("f′(x) = "+expected,
      p.mode==="tan"?
        t("Wzór obowiązuje tylko tam, gdzie cos(u)≠0.",
          "The formula is valid only where cos(u) is nonzero.") :
        t("Mnożymy przez pochodną argumentu i uwzględniamy znak dla cosinusa.",
          "Multiply by the inner derivative and track the minus sign for cosine."));
    return lesson.finish(
      t("Wybierz poprawny wzór na pochodną funkcji.", "Choose the correct derivative formula.")+
      "\nf(x) = ("+f(p.coefficient)+")"+name(p.mode,locale)+"("+u+")",
      pickFour(expected,[signWrong,missingChain,wrongFunction],Math.abs(Number(p.shift.numerator))+p.innerSlope),
      t("Pochodna funkcji złożonej zawiera mnożnik u′(x).",
        "The derivative of a composition includes the factor u′(x)."),
      t("sin→cos, cos→−sin, tg/tan→1/cos². Na końcu pomnóż przez pochodną argumentu.",
        "sin→cos, cos→−sin, tan→1/cos². Multiply by the derivative of the inner argument."));
  }
  const k=p.innerSlope,h=f(p.at),v=f(p.linearSlope),amp=f(p.coefficient);
  const u="("+k+")(x−("+h+"))+"+p.phase;
  const expr="("+amp+")"+name(p.mode,locale)+"("+u+") + ("+v+")(x−("+h+"))";
  const factor=phaseFactor(p),ans=pointDerivative(p),chain=mul(p.coefficient,r(k*factor));
  lesson.work("u("+h+") = "+p.phase+"; u′(x) = "+k,
    t("W punkcie x=h wyrażenie x−h zeruje się, więc argument przyjmuje dokładnie podany kąt.",
      "At x=h, the term x−h vanishes, so the argument equals the stated special angle."));
  lesson.work((p.mode==="sin"?"cos":p.mode==="cos"?"−sin":"1/cos²")+"("+p.phase+") = "+factor,
    t("Korzystamy z dokładnych wartości trygonometrycznych 0, π, π/2 lub 3π/2.",
      "Use exact trigonometric values at 0, π, π/2, or 3π/2."));
  lesson.work("f′("+h+") = ("+amp+")·("+k+")·("+factor+") + ("+v+") = "+f(ans),
    t("Mnożymy przez pochodną argumentu i dodajemy pochodną składnika liniowego.",
      "Multiply by the inner derivative and add the derivative of the linear term."));
  lesson.work(t("Wynik dokładny","Exact value")+": "+f(ans),
    p.mode==="tan"?
      t("tg/tan jest określona w tym punkcie, bo cos(0) i cos(π) są niezerowe.",
        "tan is defined at this point, since cos(0) and cos(π) are nonzero.") :
      t("Nie zaokrąglamy wartości kąta ani wyniku pochodnej.",
        "Do not round the special angle or the derivative."));
  return lesson.finish(
    t("Oblicz dokładną wartość pochodnej w punkcie", "Calculate the exact derivative at")+
    " x = "+h+".\nf(x) = "+expr,
    {kind:"scalar",value:ans},
    t("Policz u(h), a potem wartość pochodnej sin/cos/tg dla tego kąta.",
      "Find u(h), then evaluate the trigonometric derivative at that angle."),
    t("Oblicz a·k·T′(u(h)) + b, gdzie b jest współczynnikiem składnika liniowego.",
      "Compute a·k·T′(u(h)) + b, where b is the coefficient of the linear term."));
}
