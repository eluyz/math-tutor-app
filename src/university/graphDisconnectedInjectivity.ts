import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import type { GapNode } from "./graphGaps";
import { teaching } from "./teaching";

/** Synthetic F05 witnesses, not copies of the private six-graph worksheet. */
export type GraphDisconnectedInjectivityProblem = Readonly<{
  kind: "function-disconnected-injectivity";
  left: readonly [GapNode, GapNode, GapNode];
  right: readonly [GapNode, GapNode];
  /** Left outer, left right, right left, right outer inclusion; middle left point is hollow. */
  included: readonly [boolean, boolean, boolean, boolean];
}>;

const patterns: readonly (readonly [readonly [number, number, number], readonly [number, number]])[] = [
  [[-3,-1,1],[2,4]],   // separated ranges, injective
  [[-3,-1,1],[0,3]],   // overlapping ranges, not injective
  [[-3,-3,-3],[1,2]], // horizontal left: not injective
  [[-2,0,2],[2,4]],   // touching ranges: endpoints decide
  [[-2,0,2],[0,1]],   // right range overlaps left despite hole
  [[3,1,-1],[-4,-2]], // separated decreasing/increasing branches
  [[3,1,-1],[0,2]],   // overlapping ranges
  [[-2,0,2],[3,3]],   // horizontal right: not injective
  [[-2,0,2],[3,4]],   // separated ranges
  [[-2,0,2],[-3,-2]], // touching at left endpoint
  [[-3,-1,1],[1,2]],  // touching at left last/right first
  [[3,1,-1],[-3,-2]], // separated images
];
const node = (x:number,y:number):GapNode => ({x,y});
export function makeGraphDisconnectedInjectivity(variant:number,difficulty:Difficulty):GraphDisconnectedInjectivityProblem {
  if (!Number.isInteger(variant)||variant<0||variant>=24||
      !["hard","advanced","expert"].includes(difficulty))
    throw Error("Unsupported disconnected injectivity variant");
  const level=difficulty==="hard"?0:difficulty==="advanced"?1:2;
  const start=variant-11+level*3;
  const [ly,ry]=patterns[(variant+2*level)%patterns.length];
  const shared=variant%4===0 && ly[2]!==ry[0];
  const bx=start+4, cx=shared?bx:start+7;
  const bc=variant%3!==0;
  const cc=shared?!bc:(variant+level)%2===0;
  return {
    kind:"function-disconnected-injectivity",
    left:[node(start,ly[0]),node(start+2,ly[1]),node(bx,ly[2])],
    right:[node(cx,ry[0]),node(cx+4,ry[1])],
    included:[(variant+level)%2===0,bc,cc,(variant+level)%3!==0],
  };
}

function segments(p:GraphDisconnectedInjectivityProblem) {
  const [a,h,b]=p.left,[c,d]=p.right,[ac,bc,cc,dc]=p.included;
  if (!(a.x<h.x&&h.x<b.x&&b.x<=c.x&&c.x<d.x) ||
      ![a,h,b,c,d].every(v=>Number.isSafeInteger(v.x)&&Number.isSafeInteger(v.y)) ||
      (b.x===c.x&&(b.y===c.y||bc===cc)))
    throw Error("Invalid separated-branch graph: shared abscissa must be a single-valued jump");
  return [[a,h,ac,false],[h,b,false,bc],[c,d,cc,dc]] as const;
}

/** Independent of connectivity: count distinct INCLUDED x at one y-height. */
function hitsAtY(p:GraphDisconnectedInjectivityProblem,y:number):number[] {
  const hits:number[]=[];
  for(const [a,b,ac,bc] of segments(p)) {
    const lo=Math.min(a.y,b.y), hi=Math.max(a.y,b.y);
    if(y<lo||y>hi)continue;
    if(a.y===b.y) {
      hits.push(a.x+(b.x-a.x)/3,a.x+2*(b.x-a.x)/3);
      continue;
    }
    const x=a.x+(y-a.y)*(b.x-a.x)/(b.y-a.y);
    if((y===a.y&&!ac)||(y===b.y&&!bc))continue;
    hits.push(x);
  }
  return hits.filter((x,i)=>hits.findIndex(z=>Math.abs(z-x)<1e-9)===i);
}

/** For straight segments, intersection multiplicity changes only at vertex y-levels.
 * Checking each vertex and one midpoint between consecutive vertex heights is exact. */
export function duplicateDisconnectedHeight(p:GraphDisconnectedInjectivityProblem):number|null {
  segments(p);
  const ys=[...new Set([...p.left,...p.right].map(v=>v.y))].sort((a,b)=>a-b);
  const samples=[...ys,...ys.slice(1).map((y,i)=>(ys[i]+y)/2)];
  for(const y of samples.sort((a,b)=>a-b))
    if(hitsAtY(p,y).length>1)return y;
  return null;
}
export function isDisconnectedGraphInjective(p:GraphDisconnectedInjectivityProblem):boolean {
  return duplicateDisconnectedHeight(p)===null;
}

export const graphDisconnectedInjectivityFamilies:readonly UniversityFamily[]=[{
  id:"function-disconnected-injectivity",category:"functions",
  titles:{
    pl:"Różnowartościowość wykresu z rozłącznymi gałęziami",
    en:"One-to-one test on disconnected graph branches",
  },
  supportedDifficulties:["hard","advanced","expert"],
  create:makeGraphDisconnectedInjectivity,
}];

const fmt=(n:number)=>String(n).replace("-","−");
export function presentGraphDisconnectedInjectivity(p:GraphDisconnectedInjectivityProblem,locale:Locale) {
  const lesson=teaching(locale),{t}=lesson;
  const duplicate=duplicateDisconnectedHeight(p),yes=duplicate===null;
  const correctYes=t("Tak — każda prosta pozioma przecina wykres najwyżej raz.",
    "Yes — every horizontal line meets the graph at most once.");
  const correctNo=t("Nie — istnieje prosta pozioma przecinająca wykres co najmniej dwa razy.",
    "No — some horizontal line meets the graph at least twice.");
  lesson.work(t("Uwzględnij obie gałęzie", "Inspect both branches"),
    t("Wykres nie musi być ciągły, żeby być różnowartościowy. Rozpatruj wszystkie dozwolone argumenty x.",
      "A disconnected graph can still be one-to-one. Examine all permitted x-values."));
  lesson.work(t("Odrzuć puste punkty", "Exclude hollow points"),
    t("Pusty punkt, również przy wspólnej współrzędnej x dwóch gałęzi, nie należy do funkcji.",
      "A hollow point, also at a shared x-coordinate of two branches, is not part of the function."));
  lesson.work(duplicate===null
    ? t("Nie ma dwóch różnych x z tym samym y", "No two distinct x-values have the same y")
    : t("Powtórzona wysokość y = ", "Repeated height y = ")+fmt(duplicate),
    duplicate===null
      ? t("Obrazy wysokości obu gałęzi nie powtarzają dopuszczalnego poziomu. Każda pozioma prosta ma najwyżej jedno przecięcie.",
          "Across both branches, no permissible height is duplicated. Each horizontal line has at most one intersection.")
      : t("Ta pozioma prosta ma co najmniej dwa przecięcia o różnych dozwolonych x. Puste końce nie są liczone.",
          "This horizontal line has at least two intersections at distinct permitted x-values. Hollow endpoints are excluded."));
  lesson.work(t("Wynik testu poziomej prostej", "Horizontal-line verdict")+": "+(yes?correctYes:correctNo),
    t("Rozstrzyga liczba różnych argumentów o tej samej wartości funkcji, a nie sama obecność przerwy.",
      "Distinct arguments with the same output, not disconnectedness itself, determine injectivity."));
  return lesson.finish(
    t("Czy funkcja z dwiema gałęziami jest różnowartościowa? Użyj testu poziomej prostej.",
      "Is this two-branch function one-to-one? Use the horizontal-line test."),
    {kind:"choice",value:yes?"injective":"not-injective",
      options:[{value:"injective",label:correctYes},{value:"not-injective",label:correctNo}]},
    t("Szukaj dwóch pełnych punktów lub fragmentów o tej samej wysokości y.",
      "Look for two included points or sections at the same y-height."),
    t("Przecięcie puste nie liczy się. Przetestuj oba fragmenty i porównaj ich zbiory wysokości.",
      "Hollow intersections do not count. Check both branches and compare their y-images."),
  );
}
