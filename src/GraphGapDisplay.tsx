import { useId } from "react";
import type { Locale } from "./locales/types";
import type { GraphGapProblem, GapNode } from "./university/graphGaps";
import type { GraphGapRangeProblem } from "./university/graphGapRange";
import type { GraphMonotonicityIntervalsProblem } from "./university/graphMonotonicityIntervals";
import type { GraphDisconnectedInjectivityProblem } from "./university/graphDisconnectedInjectivity";

const fmt=(n:number)=>String(n).replace("-","−");
export function GraphGapDisplay({problem,locale}:{problem:GraphGapProblem|GraphGapRangeProblem|GraphDisconnectedInjectivityProblem|GraphMonotonicityIntervalsProblem;locale:Locale}) {
  const id=useId().replace(/:/g,"");
  const [a,h,b]=problem.left,[c,d]=problem.right;
  const [ac,bc,cc,dc]=problem.included;
  const xMin=a.x-1,xMax=d.x+1;
  const px=(x:number)=>36+(x-xMin)*333/(xMax-xMin);
  const py=(y:number)=>126-y*19;
  const pl=locale==="pl";
  const point=(v:GapNode)=>"("+fmt(v.x)+", "+fmt(v.y)+")";
  const description=(pl?"Lewa gałąź: ":"Left branch: ")+
    [a,h,b].map(point).join(" → ")+"; "+(pl?"dziura w ":"hole at ")+point(h)+
    ". "+(pl?"Prawa gałąź: ":"Right branch: ")+[c,d].map(point).join(" → ")+
    ". "+(pl?"Końce włączone (kolejno): ":"Included endpoints (in order): ")+
    problem.included.map(x=>x?"1":"0").join(", ")+".";
  const marker=(v:GapNode,included:boolean,name:string)=>
    <circle key={name} data-testid={name} data-x={v.x} data-y={v.y} data-included={included?"true":"false"}
      cx={px(v.x)} cy={py(v.y)} r="5.8" stroke="#087f70" strokeWidth="2.5"
      fill={included?"#087f70":"#ffffff"}/>;
  const line=(p:GapNode,q:GapNode,id:string)=>
    <line key={id} data-testid="graph-gap-segment" x1={px(p.x)} y1={py(p.y)}
      x2={px(q.x)} y2={py(q.y)} stroke="#087f70" strokeWidth="3.5" strokeLinecap="round"/>;
  return <figure className="function-graph" data-graph-kind={problem.kind}>
    <svg role="img" viewBox="0 0 400 260" aria-labelledby={"title-"+id+" desc-"+id} focusable="false">
      <title id={"title-"+id}>{pl?"Wykres funkcji z dziurą i rozdzieloną gałęzią":"Graph with a hole and a disconnected branch"}</title>
      <desc id={"desc-"+id}>{description}</desc>
      <g aria-hidden="true">
        {[-4,-2,0,2,4].map(y=><g key={y}>
          <line x1={20} x2={385} y1={py(y)} y2={py(y)} stroke="currentColor"
            strokeOpacity={y===0?0.6:0.13} strokeWidth={y===0?1.5:1}/>
          <text x="18" y={py(y)+4} textAnchor="end" fontSize="11" fill="currentColor">{y}</text>
        </g>)}
        {xMin<=0&&xMax>=0&&<line x1={px(0)} x2={px(0)} y1={12} y2={225}
          stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5"/>}
        {[...new Set([a.x,h.x,b.x,c.x,d.x])].map(x=><g key={x}>
          <line x1={px(x)} x2={px(x)} y1={16} y2={225}
            stroke="currentColor" strokeOpacity="0.12"/>
          <text x={px(x)} y={244} textAnchor="middle" fontSize="12" fill="currentColor">{x}</text>
        </g>)}
        <text x="384" y={py(0)-8} textAnchor="end" fontSize="12" fill="currentColor">x</text>
        {line(a,h,"left-first")}{line(h,b,"left-second")}{line(c,d,"right")}
        {marker(a,ac,"graph-left")}
        {marker(h,false,"graph-hole")}
        {marker(b,bc,"graph-first-right")}
        {marker(c,cc,"graph-second-left")}
        {marker(d,dc,"graph-right")}
      </g>
    </svg>
    <figcaption>{pl?
      "Dwa rozdzielone fragmenty; puste kółko oznacza punkt wyłączony (także dziurę w środku odcinka).":
      "Two separate branches; a hollow circle marks an excluded point, including an interior hole."}</figcaption>
    <details className="function-graph-text">
      <summary>{pl?"Opis wykresu w tekście":"Graph described in text"}</summary>
      <p>{description}</p>
    </details>
  </figure>;
}