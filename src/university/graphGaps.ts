import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

export type GapNode = Readonly<{x:number;y:number}>;
export type GraphGapProblem = Readonly<{
  kind: "function-disconnected-domain";
  left: readonly [GapNode,GapNode,GapNode];
  right: readonly [GapNode,GapNode];
  /** Leftmost, first-branch right, second-branch left, rightmost membership. */
  included: readonly [boolean,boolean,boolean,boolean];
}>;
const fmt=(n:number)=>String(n).replace("-","−");
const interval=(a:number,b:number,closedA:boolean,closedB:boolean)=>
  (closedA?"[":"(")+fmt(a)+"; "+fmt(b)+(closedB?"]":")");
export function gapDomain(p:GraphGapProblem):string {
  const [a,h,b]=p.left,[c,d]=p.right,[ac,bc,cc,dc]=p.included;
  if(!(a.x<h.x&&h.x<b.x&&b.x<c.x&&c.x<d.x))
    throw Error("The hole and disconnected branch must be strictly separated");
  return [
    interval(a.x,h.x,ac,false),
    interval(h.x,b.x,false,bc),
    interval(c.x,d.x,cc,dc),
  ].join(" ∪ ");
}
export function makeGraphGap(variant:number,level:Difficulty):GraphGapProblem {
  if(!Number.isInteger(variant)||variant<0||variant>=24||
    !["hard","advanced","expert"].includes(level))
    throw Error("Unsupported graph gap task");
  const tier=level==="hard"?1:level==="advanced"?2:3;
  const start=-11+(variant%6), slope=(variant%3)-1;
  const ly=((variant*3+tier)%5)-2;
  const rightStart=start+4+2+((variant+tier)%2);
  const ry=((variant+2*tier)%5)-2;
  return {
    kind:"function-disconnected-domain",
    left:[{x:start,y:ly},{x:start+2,y:ly+slope},{x:start+4,y:ly+2*slope}],
    right:[{x:rightStart,y:ry},{x:rightStart+4,y:ry+((variant+tier)%3)-1}],
    included:[
      tier===1||variant%2===0,
      tier===1||variant%3!==0,
      (variant+tier)%2===0,
      tier===1||variant%3===0
    ],
  };
}
function choices(correct:string,alts:readonly string[],variant:number) {
  const labels=[correct,...alts];if(new Set(labels).size!==4)throw Error("Need four distinct domain choices");
  const opts=labels.map((label,i)=>({label,value:"gap:"+i})),shift=variant%4;
  return {kind:"choice" as const,value:opts[0].value,
    options:[...opts.slice(shift),...opts.slice(0,shift)]};
}
export function presentGraphGap(p:GraphGapProblem,locale:Locale) {
  const lesson=teaching(locale),{t}=lesson;
  const [a,h,b]=p.left,[c,d]=p.right,[ac,bc,cc,dc]=p.included;
  const correct=gapDomain(p),left=interval(a.x,b.x,ac,bc),right=interval(c.x,d.x,cc,dc);
  lesson.work(t("Lewy fragment","Left branch")+": "+
      interval(a.x,h.x,ac,false)+" ∪ "+interval(h.x,b.x,false,bc),
    t("Puste kółko wewnątrz odcinka oznacza pojedynczą wartość x wykluczoną z dziedziny.",
      "A hollow point inside the branch removes that single x-value from the domain."));
  lesson.work(t("Prawy fragment","Right branch")+": "+right,
    t("Rozdzielona gałąź jest osobnym przedziałem. Nie łączymy jej z lewym fragmentem przez pusty obszar.",
      "The disconnected branch is a separate interval. Do not join it to the left branch across the gap."));
  lesson.work(t("Otwarte i domknięte końce","Open and closed endpoints"),
    t("Pełne punkty należą do dziedziny; puste punkty końcowe i dziura nie należą.",
      "Filled endpoints belong to the domain; hollow endpoints and the hole do not."));
  lesson.work(t("Suma przedziałów","Union of intervals")+": "+correct,
    t("Zapisz trzy odrębne części dziedziny, zachowując kółka i rzeczywistą przerwę między gałęziami.",
      "Write three separate domain pieces, preserving the hollow points and the real gap between branches."));
  return lesson.finish(
    t("Wyznacz dziedzinę funkcji z wykresu: dwie rozdzielone gałęzie i dziura w lewej gałęzi.",
      "Determine the domain from the graph: two disconnected branches and a hole in the left branch."),
    choices(correct,[
      left+" ∪ "+right,
      interval(a.x,d.x,ac,dc),
      interval(a.x,h.x,!ac,false)+" ∪ "+interval(h.x,b.x,false,bc)+" ∪ "+right
    ],a.x+20),
    t("Odczytuj współrzędne x. Zwróć uwagę na pusty punkt wewnątrz lewej gałęzi i przerwę między gałęziami.",
      "Read the x-coordinates. Check the hollow point on the left branch and the gap between branches."),
    t("Rozdziel lewą gałąź na dwie części w miejscu dziury, potem dodaj prawą gałąź jako trzeci przedział.",
      "Split the left branch into two pieces at the hole, then add the right branch as the third interval.")
  );
}
export const graphGapFamilies:readonly UniversityFamily[]=[
  {id:"function-disconnected-domain",category:"functions",
   titles:{pl:"Dziedzina wykresu z luką i dziurą",en:"Domain of a disconnected graph with a hole"},
   supportedDifficulties:["hard","advanced","expert"],
   create:makeGraphGap}
];