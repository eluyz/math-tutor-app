import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

/** Synthetic F05 rational graph: two vertical asymptotes and finite outer fragments. */
export type GraphAsymptoteRangeProblem=Readonly<{
  kind:"function-asymptote-range";
  center:number;
  radius:number;
  shift:number;
  scale:number;
  sign:1|-1;
  mode:"cross"|"lower"|"upper";
}>;
const fmt=(x:number)=>String(x).replace("-","−");
export const asymptotes=(p:GraphAsymptoteRangeProblem)=>
  [p.center-p.radius,p.center+p.radius] as const;
export function makeGraphAsymptoteRange(variant:number,difficulty:Difficulty):GraphAsymptoteRangeProblem {
  if(!Number.isInteger(variant)||variant<0||variant>=24||
    !["hard","advanced","expert"].includes(difficulty))throw Error("Unsupported two-pole graph");
  const level=difficulty==="hard"?0:difficulty==="advanced"?1:2;
  return {
    kind:"function-asymptote-range",
    center:variant-11+2*level, radius:2+level,shift:(variant+level)%5-2,
    scale:1+(variant+2*level)%2,sign:(variant+level)%2===0?1:-1,
    mode:(["cross","lower","upper"] as const)[variant%3],
  };
}
/** Algebraic function on the open middle interval (A,B); outer branches are separate finite lines. */
export function middleValue(p:GraphAsymptoteRangeProblem,x:number):number {
  assertGeometry(p);
  const [a,b]=asymptotes(p);
  if(!(x>a&&x<b))throw Error("x outside the open middle branch");
  const t=x-p.center,denom=(x-a)*(x-b),h=p.radius;
  return p.shift+(p.mode==="cross" ? p.sign*p.scale*h*t/denom :
    p.mode==="lower" ? p.scale*h*h/denom : -p.scale*h*h/denom);
}
function assertGeometry(p:GraphAsymptoteRangeProblem){
  if(![p.center,p.radius,p.shift,p.scale].every(Number.isSafeInteger)||
    p.radius<=0||p.scale<=0||(p.sign!==1&&p.sign!==-1)||
    !["cross","lower","upper"].includes(p.mode))throw Error("Invalid asymptote range geometry");
}
export function outerHeight(p:GraphAsymptoteRangeProblem):number {
  assertGeometry(p);
  return p.mode==="cross"?p.shift:p.mode==="lower"?p.shift-p.scale:p.shift+p.scale;
}
export type RangeType="all"|"lower"|"upper";
export function asymptoticRangeType(p:GraphAsymptoteRangeProblem):RangeType {
  assertGeometry(p);
  return p.mode==="cross"?"all":p.mode==="lower"?"lower":"upper";
}
/** Both outer segments are at f(center), which the middle branch already attains. */
export function asymptoticRange(p:GraphAsymptoteRangeProblem):string {
  const type=asymptoticRangeType(p);
  return type==="all"?"ℝ":type==="lower"?
    "(−∞; "+fmt(p.shift-p.scale)+"]":
    "["+fmt(p.shift+p.scale)+"; +∞)";
}
export const graphAsymptoteRangeFamilies:readonly UniversityFamily[]=[{
  id:"function-asymptote-range",category:"functions",
  titles:{pl:"Zbiór wartości wykresu z dwiema asymptotami",
    en:"Range of a graph with two vertical asymptotes"},
  supportedDifficulties:["hard","advanced","expert"],
  create:makeGraphAsymptoteRange,
}];
export function presentGraphAsymptoteRange(p:GraphAsymptoteRangeProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson,[a,b]=asymptotes(p);
  const result=asymptoticRange(p),type=asymptoticRangeType(p);
  lesson.work(t("Asymptoty pionowe","Vertical asymptotes")+": x = "+fmt(a)+", x = "+fmt(b),
    t("Środkowa gałąź jest ciągła wyłącznie między asymptotami. Nie zawiera punktów na asymptotach.",
      "The middle branch is continuous only between the two asymptotes. Neither pole is in its domain."));
  if(type==="all"){
    lesson.work(t("Granice środkowej gałęzi","Limits of the middle branch")+
      ": "+(p.sign===1?"+∞; −∞":"−∞; +∞"),
      t("Granice jednostronne na końcach środkowego przedziału mają przeciwne znaki nieskończoności.",
        "At the two ends of the middle interval, one-sided limits diverge to opposite infinities."));
    lesson.work(t("Wniosek z ciągłości","Conclusion from continuity")+": ℝ",
      t("Z twierdzenia o wartości pośredniej środkowa gałąź osiąga każdą wartość rzeczywistą.",
        "By the intermediate value theorem, the middle branch attains every real y-value."));
  }else{
    const bound=fmt(outerHeight(p));
    lesson.work(t("Granice środkowej gałęzi","Limits of the middle branch")+
      ": "+(type==="lower"?"−∞; −∞":"+∞; +∞"),
      t("Obie strony dążą do tej samej nieskończoności, dlatego nie można od razu przyjąć całego ℝ.",
        "Both ends diverge with the same sign, so the range is not automatically all of ℝ."));
    lesson.work((type==="lower"?t("Maksimum","Maximum"):t("Minimum","Minimum"))+
      ": f("+fmt(p.center)+") = "+bound,
      t("Mianownik ma postać (x−m)²−h². W środku przedziału funkcja osiąga wskazaną skrajną wartość.",
        "The denominator is (x−m)²−h². At the midpoint the function attains the stated extreme value."));
  }
  lesson.work(t("Fragmenty zewnętrzne","Outer segments")+": y = "+fmt(outerHeight(p)),
    t("Oba skończone odcinki mają wysokość już osiąganą w środku; nie rozszerzają zbioru wartości.",
      "Both finite outer segments use a height already attained by the middle branch; they do not enlarge the range."));
  lesson.work(t("Zbiór wartości całego wykresu","Range of the whole graph")+": "+result,
    t("Uwzględnij nieskończone gałęzie, otwarte asymptoty i skończone odcinki.",
      "Include the unbounded middle branch, excluded poles and finite segments."));
  const labels=["ℝ","(−∞; "+fmt(p.shift-p.scale)+"]",
    "["+fmt(p.shift+p.scale)+"; +∞)","ℝ ∖ {"+fmt(p.shift)+"}"];
  if(new Set(labels).size!==4)throw Error("Duplicate mathematical range choices");
  const choices=labels.map((label,i)=>({label,value:"asymptote-range:"+i}));
  const shift=(p.center+100)%4;
  return lesson.finish(t("Wyznacz zbiór wartości całej funkcji z wykresu. Dwie przerywane linie są asymptotami pionowymi.",
    "Determine the range of the entire function shown. Two dashed lines mark vertical asymptotes."),
    {kind:"choice",value:choices[labels.indexOf(result)].value,
      options:[...choices.slice(shift),...choices.slice(0,shift)]},
    t("Sprawdź, dokąd biegnie środkowa gałąź przy każdej asymptocie.",
      "Inspect the direction of the middle branch at each asymptote."),
    t("Przeciwne nieskończoności i ciągłość dają ℝ. Dwie takie same wymagają sprawdzenia ekstremum.",
      "Opposite infinities plus continuity give ℝ. Same-sign infinities require an extremum check."));
}
