import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { AnswerSpec } from "../answers";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

/** Synthetic source-method proxy. Never embeds private P20/P21 coordinates. */
export type JumpPoint=Readonly<{x:number;y:number}>;
export type IntegratedJumpProblem=Readonly<{
 kind:"function-integrated-jump";
 topology:"separated"|"overlap";
 left:readonly [JumpPoint,JumpPoint];
 right:readonly [JumpPoint,JumpPoint];
 /** At the shared x=0 the left limit is hollow and the right value is filled. */
}>;
type Interval=Readonly<{lo:number;hi:number;closedLo:boolean;closedHi:boolean}>;
export type JumpField="domain"|"range"|"increasing"|"decreasing"|"injective"|"parity";
export type JumpOracle=Readonly<Record<JumpField,string>>;
const format=(n:number)=>String(n).replace(/-/g,"−");
export const printJumpInterval=(p:Interval)=>(p.closedLo?"[":"(")+format(p.lo)+"; "+format(p.hi)+(p.closedHi?"]":")");
const printUnion=(xs:readonly Interval[])=>xs.length?xs.map(printJumpInterval).join(" ∪ "):"∅";
const inOrder=(l:Interval,r:Interval)=>l.lo<r.lo? [l,r] as const : [r,l] as const;

export function makeIntegratedJump(v:number,difficulty:Difficulty):IntegratedJumpProblem {
 if(!Number.isInteger(v)||v<0||v>=24||!["hard","advanced","expert"].includes(difficulty))
   throw Error("Unsupported integrated jump variant");
 const level=difficulty==="hard"?0:difficulty==="advanced"?1:2;
 const L=5+4*level+Math.floor(v/2);
 const shift=(v+level)%3;
 if(v%2===0) {
  // Jump upward with DISJOINT images; rising left and falling right.
  // It is injective despite being discontinuous.
  return {kind:"function-integrated-jump",topology:"separated",
   left:[{x:-L,y:-6},{x:0,y:-3+shift}],
   right:[{x:0,y:5},{x:L,y:1+shift}]};
 }
 // A single-valued re-assignment at x=0: left limit is absent, right value exists.
 // Both branches rise, but their y-images overlap, so the total graph is non-injective.
 const upper=3+((v+level)%2),rightTop=(Math.floor(v/2)+level)%2===0?5:2;
 return {kind:"function-integrated-jump",topology:"overlap",
  left:[{x:-L,y:-5+shift},{x:0,y:upper}],
  right:[{x:0,y:-1},{x:L,y:rightTop}]};
}
function check(p:IntegratedJumpProblem) {
 const [a,b]=p.left,[c,d]=p.right;
 if(p.kind!=="function-integrated-jump"||p.left.length!==2||p.right.length!==2||
  ![a,b,c,d].every(q=>Number.isSafeInteger(q.x)&&Number.isSafeInteger(q.y))||
  !(a.x<0&&b.x===0&&c.x===0&&d.x>0&&a.x===-d.x)||
  a.y===b.y||c.y===d.y||b.y===c.y)throw Error("Invalid jump graph");
 const separate=Math.max(a.y,b.y)<Math.min(c.y,d.y);
 if((p.topology==="separated")!==separate)throw Error("Topology disagrees with y-images");
}
const intervalFor=(a:JumpPoint,b:JumpPoint,incA:boolean,incB:boolean):Interval=>
 a.y<b.y?{lo:a.y,hi:b.y,closedLo:incA,closedHi:incB}:
 {lo:b.y,hi:a.y,closedLo:incB,closedHi:incA};

/** Exact y-image of both segments; an excluded endpoint can be attained by the other branch. */
export function jumpValueIntervals(p:IntegratedJumpProblem):readonly Interval[]{
 check(p);
 const [a,b]=p.left,[c,d]=p.right;
 const [one,two]=inOrder(intervalFor(a,b,true,false),intervalFor(c,d,true,true));
 if(two.lo>one.hi || two.lo===one.hi&&!one.closedHi&&!two.closedLo)return [one,two];
 return [{lo:one.lo,hi:Math.max(one.hi,two.hi),
  closedLo:one.closedLo||(two.lo===one.lo&&two.closedLo),
  closedHi:two.hi>one.hi?two.closedHi:
    two.hi===one.hi?one.closedHi||two.closedHi:one.closedHi}];
}
/** The discontinuity breaks strict monotonicity only when cross-branch order fails. */
export function jumpOracle(p:IntegratedJumpProblem):JumpOracle {
 check(p);
 const [a,b]=p.left,[c,d]=p.right;
 const ascendingLeft=b.y>a.y,ascendingRight=d.y>c.y;
 const monotoneWhole=ascendingLeft===ascendingRight&&
   (ascendingLeft?b.y<=c.y:b.y>=c.y);
 const all:Interval={lo:a.x,hi:d.x,closedLo:true,closedHi:true};
 const left:Interval={lo:a.x,hi:0,closedLo:true,closedHi:false};
 const right:Interval={lo:0,hi:d.x,closedLo:true,closedHi:true};
 const up:Interval[]=[],down:Interval[]=[];
 if(monotoneWhole){(ascendingLeft?up:down).push(all)}
 else{
  (ascendingLeft?up:down).push(left);
  (ascendingRight?up:down).push(right);
 }
 const [lo,hi]=inOrder(intervalFor(a,b,true,false),intervalFor(c,d,true,true));
 // Within each segment there is one x for each y; cross-branch duplicates
 // occur iff the two y-intervals share any included value.
 const intersect=hi.lo<lo.hi || hi.lo===lo.hi&&(hi.closedLo&&lo.closedHi);
 const injective=!intersect;
 // Left x=0 is a hole and right x=0 is filled: no even/odd symmetry can
 // be inferred from an apparent reflection without checking every x.
 const parity:JumpOracle["parity"]="neither";
 return {domain:printJumpInterval(all),range:printUnion(jumpValueIntervals(p)),
  increasing:printUnion(up),decreasing:printUnion(down),
  injective:injective?"yes":"no",parity};
}
const fieldIds:readonly JumpField[]=["domain","range","increasing","decreasing","injective","parity"];
const names:Record<JumpField,readonly [string,string]>={
 domain:["Dziedzina (D)","Domain (D)"],range:["Zbiór wartości (W)","Range (W)"],
 increasing:["Ściśle rośnie","Strictly increasing"],
 decreasing:["Ściśle maleje","Strictly decreasing"],
 injective:["Różnowartościowa?","One-to-one?"],
 parity:["Parzystość","Parity"],
};
const choices=(correct:string,candidates:readonly string[])=>[...new Set([correct,...candidates])].slice(0,5);
export function integratedJumpAnswer(p:IntegratedJumpProblem,locale:Locale):AnswerSpec {
 const o=jumpOracle(p),[a,b]=p.left,[c,d]=p.right;
 const ya=Math.min(a.y,b.y,c.y,d.y),yb=Math.max(a.y,b.y,c.y,d.y);
 const closed=printJumpInterval({lo:ya,hi:yb,closedLo:true,closedHi:true});
 const open=printJumpInterval({lo:ya,hi:yb,closedLo:false,closedHi:false});
 const xClosed=printJumpInterval({lo:a.x,hi:d.x,closedLo:true,closedHi:true});
 const xOpen=printJumpInterval({lo:a.x,hi:d.x,closedLo:false,closedHi:false});
 const xLeft=printJumpInterval({lo:a.x,hi:0,closedLo:true,closedHi:false});
 const xRight=printJumpInterval({lo:0,hi:d.x,closedLo:true,closedHi:true});
 const missingZero=xLeft+" ∪ "+printJumpInterval({lo:0,hi:d.x,closedLo:false,closedHi:true});
 const labels={
  yes:locale==="pl"?"Tak":"Yes",no:locale==="pl"?"Nie":"No",
  even:locale==="pl"?"Parzysta":"Even",odd:locale==="pl"?"Nieparzysta":"Odd",
  neither:locale==="pl"?"Ani parzysta, ani nieparzysta":"Neither",
 };
 return {kind:"multi-choice",fields:fieldIds.map((id,index)=>{
  let opts:{value:string;label:string}[];
  if(id==="injective")opts=(["yes","no"] as const).map((v,k)=>({value:id+":"+k,label:labels[v]}));
  else if(id==="parity")opts=(["even","odd","neither"] as const).map((v,k)=>({value:id+":"+k,label:labels[v]}));
  else{
   const alternatives=id==="domain"?[xOpen,missingZero,"ℝ","∅"]:
    id==="range"?[closed,open,"ℝ","∅",printJumpInterval(intervalFor(a,b,true,true))]:
    ["∅",xClosed,xOpen,xLeft,xRight,missingZero];
   opts=choices(o[id],alternatives).map((label,k)=>({value:id+":"+k,label}));
  }
  const correct=id==="injective"?id+":"+(o.injective==="yes"?0:1):
    id==="parity"?id+":"+(o.parity==="even"?0:o.parity==="odd"?1:2):id+":0";
  const shift=(Math.abs(a.x)+index)%opts.length;
  return {id,label:names[id][locale==="pl"?0:1],value:correct,
    options:[...opts.slice(shift),...opts.slice(0,shift)]};
 })};
}
export const graphIntegratedJumpFamilies:readonly UniversityFamily[]=[{
 id:"function-integrated-jump",category:"functions",
 titles:{pl:"Pięć własności wykresu ze skokiem",en:"Five properties of a jump-discontinuous graph"},
 supportedDifficulties:["hard","advanced","expert"],create:makeIntegratedJump,
}];
export function presentIntegratedJump(p:IntegratedJumpProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,o=jumpOracle(p);
 const yes=o.injective==="yes";
 const pattern=p.topology==="separated"
  ?t("Obrazy obu gałęzi są rozłączne.","The two branches have disjoint value sets.")
  :t("Obrazy gałęzi nakładają się.","The branch images overlap.");
 lesson.work(t("Sprawdź punkt skoku","Check the jump"),
  t("Przy x=0 widoczny jest jeden punkt pusty i drugi pełny. Funkcja ma dokładnie jedną wartość dla każdego dopuszczalnego argumentu.",
    "At x=0 one point is hollow and the other is filled. The function has exactly one value for each permitted input."));
 lesson.work(t("Dziedzina","Domain")+": "+o.domain,
  t("Argument x=0 należy do dziedziny dzięki pełnemu punktowi na prawej gałęzi.",
    "Input x=0 belongs to the domain because of the filled point on the right branch."));
 lesson.work(t("Zbiór wartości","Range")+": "+o.range,
  pattern+" "+t("Sprawdź, czy wysokość pustego końca jest osiągana w innej gałęzi.",
    "Check whether the hollow endpoint height is attained on the other branch."));
 lesson.work(t("Ścisły wzrost","Strict increase")+": "+o.increasing,
  t("Porównaj kierunek odcinków i wszystkie pary argumentów po przeciwnych stronach skoku; nie każda nieciągłość niszczy monotoniczność.",
    "Check both segment directions and pairs across the jump; not every discontinuity destroys monotonicity."));
 lesson.work(t("Ścisły spadek","Strict decrease")+": "+o.decreasing,
  t("Wypisz maksymalne spójne przedziały, uwzględniając dopuszczone końce.",
    "List maximal connected intervals, including permitted endpoints."));
 lesson.work(t("Różnowartościowość","Injectivity")+": "+(yes?t("tak","yes"):t("nie","no")),
  yes?t("Test poziomej prostej daje najwyżej jedno przecięcie mimo skoku.",
    "Each horizontal line intersects at most once despite the jump."):
   t("Istnieje poziom y osiągany przy dwóch różnych argumentach.",
    "Some y-level occurs at two distinct inputs."));
 lesson.work(t("Parzystość","Parity")+": "+t("ani parzysta, ani nieparzysta","neither even nor odd"),
  t("Sprawdź odbicie całych gałęzi względem osi Oy i początku układu. Sama symetryczna dziedzina nie wystarcza.",
    "Reflect entire branches across the y-axis and the origin. A symmetric domain alone is insufficient."));
 return lesson.finish(t("Dla jednego wykresu ze skokiem podaj D, W, przedziały ścisłego wzrostu i spadku, różnowartościowość oraz parzystość. Wypełnij wszystkie sześć pól.",
  "For one discontinuous graph, find D, W, strictly increasing and decreasing intervals, injectivity and parity. Complete all six fields."),
  integratedJumpAnswer(p,locale),
  t("W x=0 porównaj pusty punkt i pełny punkt na różnych wysokościach. Zbadaj każdą gałąź osobno.",
    "At x=0 compare the hollow and filled points at different heights. Inspect each branch separately."),
  t("Pamiętaj: brak ciągłości nie oznacza braku wartości funkcji ani automatycznie braku różnowartościowości.",
    "Remember: discontinuity does not imply a missing function value or automatically rule out injectivity."));
}
