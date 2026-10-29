import {useId} from "react";
import type {Locale} from "./locales/types";
import type {GraphPuncturedSymmetryProblem} from "./university/graphPuncturedSymmetry";

const fmt=(x:number)=>String(x).replace("-","−");
export function PuncturedSymmetryDisplay({problem:p,locale}:{problem:GraphPuncturedSymmetryProblem;locale:Locale}){
 const uid=useId().replace(/:/g,"");
 const pts=p.nodes,included=p.included,pl=locale==="pl";
 const L=pts[4].x;
 const px=(x:number)=>40+(x+L+1)*320/(2*L+2),py=(y:number)=>126-y*19;
 const description=(pl?"Łamana przez punkty: ":"Polyline through nodes: ")+
  pts.map((q,i)=>"("+fmt(q.x)+", "+fmt(q.y)+") "+
   (included[i]?(pl?"pełny":"included"):(pl?"pusty":"hollow"))).join("; ")+
  (pl?". Puste punkty są wyłączone z dziedziny.":". Hollow points are excluded from the domain.");
 return <figure className="function-graph" data-graph-kind={p.kind}>
  <svg role="img" viewBox="0 0 400 260" aria-labelledby={"sym-title-"+uid+" sym-desc-"+uid} focusable="false">
   <title id={"sym-title-"+uid}>{pl?"Wykres symetrii z dziurami":"Symmetry graph with excluded points"}</title>
   <desc id={"sym-desc-"+uid}>{description}</desc>
   <g aria-hidden="true">
    {[-4,-2,0,2,4].map(y=><g key={y}>
     <line x1={20} x2={385} y1={py(y)} y2={py(y)} stroke="currentColor"
       strokeOpacity={y===0?0.6:0.13} strokeWidth={y===0?1.5:1}/>
     <text x="18" y={py(y)+4} textAnchor="end" fontSize="11" fill="currentColor">{y}</text>
    </g>)}
    <line x1={px(0)} x2={px(0)} y1={12} y2={225} stroke="currentColor"
      strokeOpacity="0.55" strokeWidth="1.5"/>
    {pts.map((v,i)=><g key={i}>
      <line x1={px(v.x)} x2={px(v.x)} y1={16} y2={225} stroke="currentColor" strokeOpacity="0.12"/>
      <text x={px(v.x)} y={244} textAnchor="middle" fontSize="12" fill="currentColor">{fmt(v.x)}</text>
    </g>)}
    <text x="384" y={py(0)-8} textAnchor="end" fontSize="12" fill="currentColor">x</text>
    {pts.slice(1).map((v,i)=><line key={i} data-testid="punctured-segment"
      x1={px(pts[i].x)} y1={py(pts[i].y)} x2={px(v.x)} y2={py(v.y)}
      stroke="#087f70" strokeWidth="3.5" strokeLinecap="round"/>)}
    {pts.map((v,i)=><circle key={i} data-testid={"punctured-node-"+i}
      data-x={v.x} data-y={v.y} data-included={included[i]?"true":"false"}
      cx={px(v.x)} cy={py(v.y)} r="5.8" stroke="#087f70"
      strokeWidth="2.5" fill={included[i]?"#087f70":"#ffffff"}/>)}
   </g>
  </svg>
  <figcaption>{pl?"Pełne punkty należą do dziedziny; puste są wyłączone.":"Filled nodes belong to the domain; hollow nodes are excluded."}</figcaption>
  <details className="function-graph-text">
   <summary>{pl?"Opis wykresu w tekście":"Graph described in text"}</summary>
   <p>{description}</p>
  </details>
 </figure>;
}
