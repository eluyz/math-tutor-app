import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import type { GapNode } from "./graphGaps";
import { teaching } from "./teaching";

/** Bounded synthetic method witness. No private original drawings. */
export type GraphMonotonicityIntervalsProblem=Readonly<{
 kind:"function-disconnected-monotonicity";
 left:readonly [GapNode,GapNode,GapNode];right:readonly [GapNode,GapNode];
 included:readonly [boolean,boolean,boolean,boolean];
}>;
export type XInterval=Readonly<{lo:number;hi:number;closedLo:boolean;closedHi:boolean}>;
type Trend="up"|"down"|"flat";
type Monotonicity={up:readonly XInterval[];down:readonly XInterval[];flat:readonly XInterval[]};
type Segment=Readonly<{trend:Trend;interval:XInterval}>;
const patterns:readonly (readonly [readonly [number,number,number],readonly [number,number]])[]=[
 [[-3,-1,2],[2,4]],[[3,1,-2],[-1,2]],[[-2,2,-1],[3,1]],
 [[2,-2,2],[0,0]],[[0,0,-2],[-3,-1]],[[-2,-2,1],[3,2]],
 [[3,-1,-1],[-3,-3]],[[-2,1,1],[0,-1]],[[1,-2,-2],[-1,2]],
 [[0,2,0],[2,4]],[[1,-1,2],[-2,-4]],[[-1,1,-1],[2,2]],
];
const n=(x:number,y:number):GapNode=>({x,y});
export function makeGraphMonotonicityIntervals(v:number,difficulty:Difficulty):GraphMonotonicityIntervalsProblem{
 if(!Number.isInteger(v)||v<0||v>=24||!["hard","advanced","expert"].includes(difficulty))
  throw Error("Unsupported monotonicity variant");
 const level=difficulty==="hard"?0:difficulty==="advanced"?1:2;
 const start=v-11+3*level,[ly,ry]=patterns[(v+3*level)%patterns.length];
 return {kind:"function-disconnected-monotonicity",
  // Level-specific x spacing prevents identical geometries across difficulty levels
  // while keeping the displayed coordinates in a practical study range.
  left:[n(start,ly[0]),n(start+2+level,ly[1]),n(start+4+2*level,ly[2])],
  right:[n(start+7+2*level,ry[0]),n(start+11+2*level,ry[1])],
  included:[level===0||v%2===0,level===0||v%3!==0,(v+level)%2===0,level===0||(v+level)%3!==0]};
}
export function monotonicitySegments(p:GraphMonotonicityIntervalsProblem):readonly [Segment,Segment,Segment]{
 const [a,h,b]=p.left,[c,d]=p.right,[ac,bc,cc,dc]=p.included;
 if(!(a.x<h.x&&h.x<b.x&&b.x<c.x&&c.x<d.x)||
  ![a,h,b,c,d].every(q=>Number.isSafeInteger(q.x)&&Number.isSafeInteger(q.y)))
  throw Error("Invalid graph");
 const seg=(u:GapNode,v:GapNode,closedLo:boolean,closedHi:boolean):Segment=>({
  trend:u.y<v.y?"up":u.y>v.y?"down":"flat",
  interval:{lo:u.x,hi:v.x,closedLo,closedHi}});
 return [seg(a,h,ac,false),seg(h,b,false,bc),seg(c,d,cc,dc)];
}
export function monotonicitySets(p:GraphMonotonicityIntervalsProblem):Monotonicity{
 const parts=monotonicitySegments(p);
 return {up:parts.filter(q=>q.trend==="up").map(q=>q.interval),
  down:parts.filter(q=>q.trend==="down").map(q=>q.interval),
  flat:parts.filter(q=>q.trend==="flat").map(q=>q.interval)};
}
const fmt=(x:number)=>String(x).replace("-","−");
export const formatXInterval=(i:XInterval)=> (i.closedLo?"[":"(")+fmt(i.lo)+"; "+fmt(i.hi)+(i.closedHi?"]":")");
const fmtSet=(xs:readonly XInterval[])=>xs.length?xs.map(formatXInterval).join(" ∪ "):"∅";
export function formatMonotonicity(s:Monotonicity,locale:Locale){
 return (locale==="pl"?"Rośnie: ":"Increasing: ")+fmtSet(s.up)+"; "+
  (locale==="pl"?"Maleje: ":"Decreasing: ")+fmtSet(s.down)+"; "+
  (locale==="pl"?"Stała: ":"Constant: ")+fmtSet(s.flat);
}
export const graphMonotonicityIntervalsFamilies:readonly UniversityFamily[]=[{
 id:"function-disconnected-monotonicity",category:"functions",
 titles:{pl:"Przedziały monotoniczności wykresu z dziurą",
         en:"Monotonicity intervals of a graph with a hole"},
 supportedDifficulties:["hard","advanced","expert"],create:makeGraphMonotonicityIntervals
}];
export function presentGraphMonotonicityIntervals(p:GraphMonotonicityIntervalsProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,segments=monotonicitySegments(p),s=monotonicitySets(p);
 const word={up:t("rośnie","increases"),down:t("maleje","decreases"),flat:t("stała","constant")};
 segments.forEach((part,i)=>lesson.work(t("Odcinek ","Segment ")+(i+1)+": "+
  formatXInterval(part.interval)+" — "+word[part.trend],
  t("Odczytaj kierunek i sprawdź puste lub pełne końce przedziału.",
    "Read the trend and check whether each endpoint is hollow or filled.")));
 const answer=formatMonotonicity(s,locale);
 lesson.work(t("Maksymalne spójne przedziały","Maximal connected intervals")+": "+answer,
  t("Pusty argument rozdziela przedziały, nawet gdy sąsiednie fragmenty rosną w tym samym kierunku.",
    "A missing argument splits connected intervals even if the adjacent pieces rise in the same direction."));
 const a=[
  answer,
  formatMonotonicity({...s,up:s.down,down:s.up},locale),
  formatMonotonicity({...s,up:s.flat,flat:s.up},locale),
  formatMonotonicity({...s,up:s.up.map((i,j)=>j===0?{...i,closedHi:!i.closedHi}:i),
      down:s.up.length?s.down:s.down.map((i,j)=>j===0?{...i,closedHi:!i.closedHi}:i),
      flat:s.up.length||s.down.length?s.flat:s.flat.map((i,j)=>j===0?{...i,closedHi:!i.closedHi}:i)},locale),
 ];
 if(new Set(a).size!==4)throw Error("Non-unique monotonicity answer options");
 const shift=(p.left[0].x+40)%4,options=a.map((label,i)=>({label,value:"monotonicity:"+i}));
 return lesson.finish(t("Podaj maksymalne spójne przedziały ścisłego wzrostu, ścisłego spadku i stałości funkcji z wykresu.",
    "Find the maximal connected intervals of strict increase, strict decrease and constancy from the graph."),
  {kind:"choice",value:options[0].value,options:[...options.slice(shift),...options.slice(0,shift)]},
  t("Każdy z trzech odcinków sprawdź osobno.","Check each of the three segments separately."),
  t("Nie łącz przedziałów przez dziurę ani przez przerwę między gałęziami.",
    "Do not bridge a hole or a gap between the branches."));
}
