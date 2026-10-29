import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import type { GraphNode } from "./functionGraphs";
import { teaching } from "./teaching";

/** Synthetic F05 five-knot polyline with optional holes at +/-h and x=0. */
export type GraphPuncturedSymmetryProblem=Readonly<{
 kind:"function-punctured-symmetry";
 nodes:readonly [GraphNode,GraphNode,GraphNode,GraphNode,GraphNode];
 /** Membership at -L,-h,0,h,L; excluded nodes are drawn as hollow points. */
 included:readonly [boolean,boolean,boolean,boolean,boolean];
}>;
export type Parity="even"|"odd"|"neither";
const n=(x:number,y:number):GraphNode=>({x,y});
export function makeGraphPuncturedSymmetry(v:number,difficulty:Difficulty):GraphPuncturedSymmetryProblem {
 if(!Number.isInteger(v)||v<0||v>=24||
    !["hard","advanced","expert"].includes(difficulty))throw Error("Unsupported graph parity variant");
 const level=difficulty==="hard"?0:difficulty==="advanced"?1:2,mode=v%4;
 const L=5+Math.floor(v/4)+level*2,h=1+(v+level)%3;
 const sign=(v+level)%2===0?1:-1;
 const a=sign*(1+v%4),b=sign*(1+(v+level)%3),c=1+(v+level)%3;
 const outer=(v+level)%2===0;
 const holesIncluded=v%3===0,centerIncluded=!holesIncluded;
 const nodes:GraphPuncturedSymmetryProblem["nodes"]=mode===1
   ? [n(-L,a),n(-h,b),n(0,0),n(h,-b),n(L,-a)]
   : [n(-L,a),n(-h,b),n(0,c),n(h,b),n(L,mode===3?0:a)];
 const included:readonly [boolean,boolean,boolean,boolean,boolean]=mode===2
  ? [outer,false,true,true,outer] // asymmetric puncture: necessarily neither
  : mode===3
    ? [outer,false,true,false,outer] // symmetric domain; heights break both
    : [outer,holesIncluded,centerIncluded,holesIncluded,outer];
 return {kind:"function-punctured-symmetry",
  nodes,included};
}
export function puncturedParity(p:GraphPuncturedSymmetryProblem):Parity {
 const v=p.nodes,s=p.included;
 if(!(v.length===5&&v.every(t=>Number.isSafeInteger(t.x)&&Number.isSafeInteger(t.y))&&
    v[0].x===-v[4].x&&v[1].x===-v[3].x&&v[2].x===0&&
    v[0].x<v[1].x&&v[1].x<0&&0<v[3].x&&v[3].x<v[4].x))
  throw Error("Invalid symmetric-knot geometry");
 if(s[0]!==s[4]||s[1]!==s[3])return "neither";
 // Missing vertices remain *limits* of the adjacent pieces, so their y-heights
 // also constrain even/odd reflection on the rest of the domain.
 const even=v[0].y===v[4].y&&v[1].y===v[3].y;
 const odd=v[0].y===-v[4].y&&v[1].y===-v[3].y&&v[2].y===0;
 if(even)return "even";
 if(odd)return "odd";
 return "neither";
}
export const graphPuncturedSymmetryFamilies:readonly UniversityFamily[]=[{
 id:"function-punctured-symmetry",category:"functions",
 titles:{pl:"Parzystość i nieparzystość z wykresu z dziurami",
   en:"Even and odd symmetry of a graph with holes"},
 supportedDifficulties:["hard","advanced","expert"],create:makeGraphPuncturedSymmetry,
}];
export function presentGraphPuncturedSymmetry(p:GraphPuncturedSymmetryProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const type=puncturedParity(p),s=p.included,v=p.nodes;
 const lbl={
  even:t("parzysta","even"),odd:t("nieparzysta","odd"),
  neither:t("ani parzysta, ani nieparzysta","neither"),
 };
 const domainSymmetric=s[0]===s[4]&&s[1]===s[3];
 lesson.work(t("Dziedzina po odbiciu x → −x","Domain under x → −x")+
   ": "+(domainSymmetric?t("symetryczna","symmetric"):t("niesymetryczna","asymmetric")),
  t("Dla parzystości i nieparzystości każdy dopuszczalny x musi mieć również dopuszczalne −x. Puste punkty również trzeba odbić.",
    "For even/odd symmetry, every allowed x must have an allowed −x. Hollow points must be mirrored too."));
 lesson.work(t("Porównaj wysokości lustrzanych gałęzi","Compare reflected branch heights"),
  t("Na wszystkich istniejących odcinkach: parzysta wymaga f(−x)=f(x), nieparzysta f(−x)=−f(x). Wyłączone wierzchołki nie usuwają ograniczeń wynikających z sąsiednich odcinków.",
    "On every existing segment: even requires f(−x)=f(x), odd requires f(−x)=−f(x). Excluded vertices do not remove the constraints from adjacent segment values."));
 lesson.work(t("Warunek w środku wykresu","Condition at the centre"),
  v[2].y===0
   ? s[2]
     ? t("Wartość f(0)=0 i granica przy 0 są zgodne z symetrią środkową.",
         "The value f(0)=0 and the limit at zero are consistent with odd symmetry.")
     : t("Punkt x=0 jest wyłączony, więc f(0) nie jest określone. Granica przy 0 wynosi 0 i jest zgodna z symetrią środkową.",
         "The point x=0 is excluded, so f(0) is not defined. The limit at zero is 0 and is consistent with odd symmetry.")
   : t("Wysokość środkowego wierzchołka jest różna od zera, więc wykres nie jest symetryczny względem początku układu.",
       "The central vertex has nonzero height, so the graph is not symmetric about the origin."));
 lesson.work(t("Klasyfikacja","Classification")+": "+lbl[type],
  t("Połącz test dziedziny z odbiciem wykresu względem osi y albo początku układu.",
    "Combine the domain test with reflection across the y-axis or through the origin."));
 const opts=(["even","odd","neither"] as const).map(value=>({value,label:lbl[value]}));
 const shift=Math.abs(v[0].x)%3;
 return lesson.finish(
  t("Określ, czy funkcja z pustymi punktami jest parzysta, nieparzysta, czy żadna z nich.",
    "Classify whether the graph with hollow points is even, odd or neither."),
  {kind:"choice",value:type,options:[...opts.slice(shift),...opts.slice(0,shift)]},
  t("Najpierw sprawdź symetrię dziedziny, potem wysokości odpowiadających argumentów ±x.",
    "Check domain symmetry first, then compare heights at opposite arguments ±x."),
  t("Uwaga: brak x=0 nie wyklucza automatycznie nieparzystości. Jeśli tylko jeden z pary ±h jest pusty, dziedzina nie jest symetryczna.",
    "A missing x=0 does not automatically exclude odd symmetry. If only one of ±h is hollow, the domain is asymmetric."));
}
