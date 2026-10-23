import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";
import { rational as r } from "../rational";
import { formatRational as format } from "../answers";
import type { GraphNode } from "./functionGraphs";

type Geometry = Readonly<{
  nodes: readonly [GraphNode, GraphNode, GraphNode];
  leftClosed: boolean;
  rightClosed: boolean;
}>;
export type GraphPropertyProblem = Geometry & (
  | Readonly<{kind:"function-graph-monotonicity"; target:"monotonicity"}>
  | Readonly<{kind:"function-graph-extrema"; target:"maximum"|"minimum"}>
  | Readonly<{kind:"function-graph-symmetry"; target:"symmetry"}>
);

const levelIndex = (difficulty:Difficulty) => difficulty==="easy"?0:difficulty==="medium"?1:2;
const node=(x:number,y:number):GraphNode=>({x,y});

function monotonicity(variant:number,difficulty:Difficulty):GraphPropertyProblem {
  const level=levelIndex(difficulty),start=variant-11,step=2+((variant+level)%3);
  const patterns:readonly (readonly [number,number,number])[] =
    level===0?
    [[-2,3,-2],[3,-2,3]] :
    level===1?
    [[-2,2,2],[3,3,-2],[3,-2,3],[-2,3,-2]] :
    [[-3,-1,3],[3,1,-3],[-2,-2,3],[3,-2,-2],[-2,3,3],[3,3,-2]];
  const heights=patterns[variant%patterns.length];
  return {kind:"function-graph-monotonicity",target:"monotonicity",
    nodes:[node(start,heights[0]),node(start+step,heights[1]),node(start+2*step,heights[2])],
    leftClosed:level===0||variant%2===0,rightClosed:level===0||variant%3===0};
}
function extrema(variant:number,difficulty:Difficulty):GraphPropertyProblem {
  const level=levelIndex(difficulty), start=variant-11,step=2+((variant+level)%3);
  const high=variant%2===0,mag=3+variant%2;
  const middle=high?mag:-mag,outer=high?0:0;
  const end=high?-(variant%3):variant%3;
  return {kind:"function-graph-extrema",target:high?"maximum":"minimum",
    nodes:[node(start,outer),node(start+step,middle),node(start+2*step,end)],
    leftClosed:level===0||variant%2===0,rightClosed:level===0||variant%3===0};
}
function symmetry(variant:number,difficulty:Difficulty):GraphPropertyProblem {
  const level=levelIndex(difficulty),h=2+Math.floor(variant/6)+4*level,size=1+(variant%4);
  const mode=variant%3;
  const yLeft=mode===0?size:mode===1?-size:size;
  const yMid=mode===0?(size===4?0:4):mode===1?0:1;
  const yRight=mode===0?size:mode===1?size:-(size===1?2:size);
  const closed=level===0||variant%2===0;
  const leftClosed=closed,rightClosed=mode===2&&level>0?!closed:closed;
  return {kind:"function-graph-symmetry",target:"symmetry",
    nodes:[node(-h,yLeft),node(0,yMid),node(h,yRight)],leftClosed,rightClosed};
}
export const graphPropertyFamilies:readonly UniversityFamily[]=[
  {id:"function-graph-monotonicity",category:"functions",
    titles:{pl:"Monotoniczność z wykresu",en:"Monotonicity from a graph"},
    supportedDifficulties:["easy","medium","hard"],create:monotonicity},
  {id:"function-graph-extrema",category:"functions",
    titles:{pl:"Ekstrema z wykresu",en:"Extrema from a graph"},
    supportedDifficulties:["easy","medium","hard"],create:extrema},
  {id:"function-graph-symmetry",category:"functions",
    titles:{pl:"Symetria wykresu funkcji",en:"Graph symmetry"},
    supportedDifficulties:["easy","medium","hard"],create:symmetry},
];
type Trend="up"|"down"|"flat";
const trend=(a:number,b:number):Trend=>a<b?"up":a>b?"down":"flat";
export function graphTrends(p:GraphPropertyProblem):readonly [Trend,Trend]{
  return [trend(p.nodes[0].y,p.nodes[1].y),trend(p.nodes[1].y,p.nodes[2].y)];
}
export function graphExtremum(p:GraphPropertyProblem):GraphNode {
  const max=p.target==="maximum";
  const best=max?Math.max(...p.nodes.map(n=>n.y)):Math.min(...p.nodes.map(n=>n.y));
  const found=p.nodes.find((n,i)=>n.y===best&&(i===1||i===0&&p.leftClosed||i===2&&p.rightClosed));
  if(!found)throw Error("Extremum is not attained");
  return found;
}
export function graphSymmetry(p:GraphPropertyProblem):"even"|"odd"|"neither"{
  const [left,middle,right]=p.nodes;
  if(left.x!==-right.x||middle.x!==0||p.leftClosed!==p.rightClosed)return "neither";
  if(left.y===right.y)return "even";
  if(middle.y===0&&left.y===-right.y)return "odd";
  return "neither";
}
function choices(correct:string,wrongs:readonly string[],variant:number){
  const values=[...new Set([correct,...wrongs])].slice(0,4);
  if(values.length!==4)throw Error("Four different answer labels required");
  const entries=values.map((label,i)=>({label,value:"graph-property:"+i}));
  const shift=variant%4;
  return {kind:"choice" as const,value:entries[0].value,
    options:[...entries.slice(shift),...entries.slice(0,shift)]};
}
const coordinate=(n:GraphNode)=>"("+format(r(n.x))+"; "+format(r(n.y))+")";
export function presentGraphProperty(p:GraphPropertyProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const prompt=t("Korzystaj z wykresu poniżej.","Use the graph below.");
  if(p.kind==="function-graph-monotonicity"){
    const pair=graphTrends(p);
    const patterns:readonly (readonly [Trend,Trend])[]=[
      ["up","down"],["down","up"],["up","flat"],["flat","down"],
      ["down","flat"],["flat","up"],["up","up"],["down","down"],["flat","flat"]];
    const word=(s:Trend)=>s==="up"?t("rośnie","increases"):s==="down"?t("maleje","decreases"):t("jest stała","is constant");
    const label=(a:readonly [Trend,Trend])=>word(a[0])+", "+t("potem","then")+" "+word(a[1]);
    const answer=label(pair);
    const wrong=patterns.map(label).filter(s=>s!==answer).slice(0,3);
    lesson.work(t("Pierwszy odcinek","First segment")+": "+word(pair[0]),
      t("Porównaj wysokość lewego końca z wysokością środkowego wierzchołka.",
        "Compare the left endpoint height with the middle vertex height."));
    lesson.work(t("Drugi odcinek","Second segment")+": "+word(pair[1]),
      t("Porównaj wysokość środkowego wierzchołka i prawego końca.",
        "Compare the middle vertex and right endpoint heights."));
    lesson.work(t("Odczytana monotoniczność","Monotonicity reading")+": "+answer,
      t("Kierunki ustalamy od lewej do prawej wzdłuż osi x.",
        "Read directions from left to right along the x-axis."));
    return lesson.finish(t("Jak funkcja zachowuje się na kolejnych dwóch odcinkach wykresu?",
      "How does the function behave on the two consecutive graph segments?")+"\n"+prompt,
      choices(answer,wrong,p.nodes[0].x+24),
      t("Prześledź wykres od lewej do prawej.","Follow the line from left to right."),
      t("Oddziel pierwszy odcinek od drugiego; linia wznosi się, opada albo jest pozioma.",
        "Examine both segments separately; each one rises, falls or stays horizontal."));
  }
  if(p.kind==="function-graph-extrema"){
    const maximum=p.target==="maximum",ext=graphExtremum(p),[left,mid,right]=p.nodes;
    const answer=coordinate(ext);
    lesson.work(t("Wysokości na wykresie","Graph heights")+": "+p.nodes.map(n=>format(r(n.y))).join(", "),
      t("Porównaj wysokości wierzchołków oraz sprawdź, czy odpowiedni punkt należy do wykresu.",
        "Compare vertex heights and check that the candidate is included in the graph."));
    lesson.work(t("Ekstremum globalne","Global extremum")+": "+answer,
      t("Środkowy wierzchołek osiąga wymaganą skrajną wysokość.",
        "The middle vertex attains the requested extreme height."));
    lesson.work(t("Odpowiedź","Answer")+": "+answer,
      t("Podaj parę współrzędnych (x; y), nie samą wysokość.",
        "Give the coordinate pair (x; y), not just the height."));
    return lesson.finish((maximum?
      t("W jakim punkcie wykresu funkcja osiąga maksimum globalne?",
        "At which graph point does the function attain its global maximum?"):
      t("W jakim punkcie wykresu funkcja osiąga minimum globalne?",
        "At which graph point does the function attain its global minimum?"))+"\n"+prompt,
      choices(answer,[coordinate(left),coordinate(right),coordinate(node(mid.x,mid.y+(maximum?-1:1)))],left.x+24),
      t("Sprawdź najwyższy lub najniższy punkt na całym wykresie.",
        "Find the highest or lowest point on the entire graph."),
      t("Upewnij się, że punkt jest włączony do wykresu; podaj x oraz y.",
        "Check the point belongs to the graph, then give its x and y coordinates."));
  }
  const classification=graphSymmetry(p);
  const labels={
    even:t("parzysta","even"),
    odd:t("nieparzysta","odd"),
    neither:t("ani parzysta, ani nieparzysta","neither even nor odd"),
  };
  lesson.work(t("Symetria dziedziny","Domain symmetry")+": "+(p.leftClosed===p.rightClosed?"✓":"✗"),
    t("Dla funkcji parzystej i nieparzystej dziedzina musi być symetryczna względem zera.",
      "Even and odd functions must have a domain symmetric about zero."));
  lesson.work("f(−x) "+(p.nodes[0].y===p.nodes[2].y?"= f(x)":"≠ f(x)"),
    t("Porównaj punkty o argumentach przeciwnych i ich wysokości.",
      "Compare graph points at opposite x-coordinates and their heights."));
  lesson.work(t("Klasyfikacja","Classification")+": "+labels[classification],
    t("Parzysta: symetria osi y; nieparzysta: symetria środka (0,0); w innym przypadku żadna.",
      "Even: y-axis symmetry; odd: central symmetry about (0,0); otherwise neither."));
  return lesson.finish(t("Określ parzystość funkcji na podstawie wykresu.",
    "Classify even/odd symmetry using the graph.")+"\n"+prompt,
    choices(labels[classification],
      [labels[classification==="even"?"odd":"even"],
       labels[classification==="neither"?"odd":"neither"],
       t("funkcja jest stała","the function is constant")],p.nodes[0].x+24),
    t("Sprawdź symetrię wokół osi y lub początku układu.",
      "Check symmetry about the y-axis or the origin."),
    t("Uważaj także na końce dziedziny: puste i pełne kółka muszą zachować odpowiednią symetrię.",
      "Also check the domain endpoints: hollow and filled circles must preserve symmetry."));
}
