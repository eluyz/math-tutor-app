import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { AnswerSpec } from "../answers";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

/** PUBLIC original synthetic F05/f method. This does not trace a private worksheet graph. */
export type AsymptoticJumpProblem = Readonly<{
  kind: "function-asymptotic-jump-injective";
  A: number; k: number; B: number; h: number;
}>;
export const asymptoticJumpFields = [
  "domain", "range", "increasing", "decreasing", "injective", "parity",
] as const;
export type AsymptoticJumpField = typeof asymptoticJumpFields[number];
export type AsymptoticJumpOracle = Readonly<Record<AsymptoticJumpField,string>>;
const f = (x:number) => String(x).replace(/-/g,"−");
const interval = (a:string,b:string,ca=false,cb=false) =>
  (ca?"[":"(")+a+"; "+b+(cb?"]":")");

export function checkAsymptoticJump(p:AsymptoticJumpProblem) {
  if(p.kind!=="function-asymptotic-jump-injective"||
     ![p.A,p.k,p.B,p.h].every(Number.isSafeInteger)||
     p.k<=0||p.h<=0||p.B<=p.A)
    throw Error("Invalid synthetic injective asymptotic jump");
  return p;
}
export function makeAsymptoticJump(v:number,difficulty:Difficulty):AsymptoticJumpProblem {
  if(!Number.isInteger(v)||v<0||v>=24||
     !["hard","advanced","expert"].includes(difficulty))
    throw Error("Unsupported F05/f variant or difficulty");
  const tier=difficulty==="hard"?0:difficulty==="advanced"?1:2;
  const A=-5+Math.floor(v/4)+6*tier;
  const k=1+v%3;
  const B=A+k+2+Math.floor(v/3)%2;
  const h=2+Math.floor(v/8)%3;
  return {kind:"function-asymptotic-jump-injective",A,k,B,h};
}
/** Left x<0 strictly decreases; right x>=0 strictly increases. */
export function asymptoticJumpValue(p:AsymptoticJumpProblem,x:number):number {
  checkAsymptoticJump(p);
  if(!Number.isFinite(x))throw Error("Non-finite argument");
  return x<0?p.A-p.k/(1-x):p.B+p.h*x/(1+x);
}
export function asymptoticJumpOracle(p:AsymptoticJumpProblem):AsymptoticJumpOracle{
  checkAsymptoticJump(p);
  return {
    domain:"ℝ",
    range:interval(f(p.A-p.k),f(p.A))+" ∪ "+interval(f(p.B),f(p.B+p.h),true),
    increasing:interval("0","+∞",true),
    decreasing:interval("−∞","0"),
    injective:"yes",
    parity:"neither",
  };
}
const labels:Record<AsymptoticJumpField,readonly [string,string]>={
  domain:["Dziedzina (D)","Domain (D)"],
  range:["Zbiór wartości (W)","Range (W)"],
  increasing:["Ściśle rośnie","Strictly increasing"],
  decreasing:["Ściśle maleje","Strictly decreasing"],
  injective:["Różnowartościowa?","One-to-one?"],
  parity:["Parzystość","Parity"],
};
export function asymptoticJumpAnswer(p:AsymptoticJumpProblem,locale:Locale):AnswerSpec{
  const o=asymptoticJumpOracle(p);
  const yes=locale==="pl"?"Tak":"Yes",no=locale==="pl"?"Nie":"No";
  const even=locale==="pl"?"Parzysta":"Even",odd=locale==="pl"?"Nieparzysta":"Odd";
  const neither=locale==="pl"?"Ani parzysta, ani nieparzysta":"Neither";
  return {kind:"multi-choice",fields:asymptoticJumpFields.map((id,j)=>{
    const correct=id==="injective"?yes:id==="parity"?neither:o[id];
    const alternatives=id==="domain"?[
      interval("−∞","0"),interval("0","+∞",true),"ℝ ∖ {0}","∅",
    ]:id==="range"?[
      interval(f(p.A-p.k),f(p.B+p.h)),
      interval(f(p.A-p.k),f(p.A),true)+" ∪ "+interval(f(p.B),f(p.B+p.h),true,true),
      interval(f(p.A-p.k),f(p.A),false,true)+" ∪ "+interval(f(p.B),f(p.B+p.h),true),
      "ℝ",
    ]:id==="increasing"?[
      interval("0","+∞"),interval("−∞","0"),"ℝ","∅",
    ]:id==="decreasing"?[
      interval("−∞","0",false,true),interval("0","+∞",true),"ℝ","∅",
    ]:id==="injective"?[no]:[even,odd];
    const options=[...new Set([correct,...alternatives])].slice(0,5)
      .map((label,i)=>({label,value:id+":"+i}));
    if(options.length<2)throw Error("Too few answer choices");
    const shift=(j+Math.abs(p.A)+p.h)%options.length;
    return {id,label:labels[id][locale==="pl"?0:1],value:id+":0",
      options:[...options.slice(shift),...options.slice(0,shift)]};
  })};
}
export const asymptoticJumpFamilies:readonly UniversityFamily[]=[{
  id:"function-asymptotic-jump-injective",category:"functions",
  titles:{
    pl:"Sześć własności: różnowartościowy skok i poziome asymptoty",
    en:"Six properties: injective jump and horizontal asymptotes",
  },
  supportedDifficulties:["hard","advanced","expert"],create:makeAsymptoticJump,
}];
export function presentAsymptoticJump(p:AsymptoticJumpProblem,locale:Locale){
  const l=teaching(locale),{t}=l,o=asymptoticJumpOracle(p);
  l.work(t("Dziedzina","Domain")+": "+o.domain,
    t("Lewy wzór obowiązuje dla x<0, prawy dla x≥0. Przy x=0 istnieje pełny punkt prawej gałęzi.",
      "The left formula is defined for x<0, the right for x≥0. The right branch includes the value at x=0."));
  l.work(t("Zbiór wartości","Range")+": "+o.range,
    t("Lewa malejąca gałąź ma oba końce wysokości otwarte. Prawa osiąga swój dolny punkt, lecz tylko zbliża się do górnej asymptoty. Obrazy są rozłączne.",
      "The decreasing left branch has two open image endpoints. The right branch attains its lower value but only approaches its upper asymptote. The images are disjoint."));
  l.work(t("Ścisły wzrost","Strict increase")+": "+o.increasing,
    t("Dla x≥0 pochodna prawego wzoru jest dodatnia, więc włącz x=0.",
      "For x≥0 the right-hand derivative is positive, so include x=0."));
  l.work(t("Ścisły spadek","Strict decrease")+": "+o.decreasing,
    t("Dla x<0 pochodna lewego wzoru jest ujemna. Nie dołączaj x=0, gdzie występuje skok.",
      "For x<0 the left-hand derivative is negative. Exclude x=0, where the jump occurs."));
  l.work(t("Różnowartościowość","Injectivity")+": "+t("tak","yes"),
    t("Każda gałąź jest ściśle monotoniczna, a ich zbiory wartości są rozłączne; pozioma prosta przecina wykres co najwyżej raz.",
      "Each branch is strictly monotone and their images do not overlap; a horizontal line meets the graph at most once."));
  l.work(t("Parzystość","Parity")+": "+t("żadna","neither"),
    t("Funkcja jest różnowartościowa i nie jest stała, więc nie może być parzysta: f(−x)≠f(x) dla pewnych x>0. Nie może być nieparzysta: gdy f(0)≠0 łamie konieczny warunek, a gdy f(0)=0, niezerowa granica lewostronna przy zerowej prawostronnej również przeczy nieparzystości.",
      "The nonconstant injective graph cannot be even: f(−x) differs from f(x) for some x>0. It is not odd either: if f(0)≠0 the necessary condition fails; if f(0)=0, its nonzero left limit and zero right limit contradict odd symmetry."));
  return l.finish(
    t("Z jednego wykresu o dwóch krzywych gałęziach i skoku odczytaj sześć własności. Puste kółko pokazuje granicę lewą, pełne wartość f(0).",
      "Read six properties from one curved two-branch graph with a jump. The hollow circle marks the left limit and the filled one marks f(0)."),
    asymptoticJumpAnswer(p,locale),
    t("Najpierw rozstrzygnij, które wysokości asymptot są faktycznie osiągane.",
      "First check whether the horizontal asymptote heights are attained."),
    t("Lewy fragment maleje, prawy rośnie. Oba obrazy nie stykają się, więc skok nie wyklucza różnowartościowości.",
      "The left side decreases, the right side increases. Their images are disjoint, so the jump does not rule out injectivity."));
}
